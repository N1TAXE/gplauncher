import { Launcher } from '../launcher'
import path from 'path'
import Zip from 'adm-zip'
import * as fs from 'fs'
import axios from 'axios'
import { IManifest, IVersion } from '../types'
import { checkSum, getJVM, getOS, parseRule, popString } from '../utils'
import child from 'child_process'

export class MinecraftInstance {
    launcher: Launcher;
    constructor(launcher: Launcher) {
        this.launcher = launcher;
        this.launcher.options.overrides = {
            ...this.launcher.options.overrides,
            url: {
                ...this.launcher.options.overrides?.url,
                meta: 'https://launchermeta.mojang.com',
                resource: 'https://resources.download.minecraft.net'
            }
        }
    }

    async getPackage (): Promise<boolean> {
        if (this.launcher.options.clientPackage?.startsWith('http')) {
            this.launcher.downloader.addUrl(this.launcher.options.clientPackage, 'clientPackage.zip', this.launcher.options.root)
            this.launcher.options.clientPackage = path.join(this.launcher.options.root, 'clientPackage.zip')
        }
        new Zip(this.launcher.options.clientPackage).extractAllTo(this.launcher.options.root, true)
        if (this.launcher.options.removePackage) fs.unlinkSync(this.launcher.options.clientPackage!)

        return this.launcher.emit('package-extract', true)
    }

    async getVersion(): Promise<IManifest> {
        const versionJsonPath = this.launcher.options.overrides?.versionJson || path.join(this.launcher.options.version.directory!, `${this.launcher.options.version.number}.json`);

        try {
            // Проверяем, существует ли локальный кэшированный файл версии
            if (fs.existsSync(versionJsonPath)) {
                fs.readFile(versionJsonPath, (_, data) => {
                    this.launcher.options.manifest!.current = JSON.parse(data.toString());
                    return this.launcher.options.manifest!.current;
                });
            }

            const manifestUrl = `${this.launcher.options.overrides?.url?.meta}/mc/game/version_manifest.json`;
            const cacheDirectory = this.launcher.options.cache ? `${this.launcher.options.cache}/json` : `${this.launcher.options.root}/cache/json`;

            // Получаем манифест версии
            const { data: manifestData } = await axios.get(manifestUrl);

            // Создаем директорию для кэша, если не существует
            fs.mkdirSync(cacheDirectory, { recursive: true });
            this.launcher.emit('debug', '[CORE]: Cache directory created.');

            // Сохраняем манифест в кэш
            fs.writeFileSync(path.join(cacheDirectory, 'version_manifest.json'), manifestData);
            this.launcher.emit('debug', '[CORE]: Cached version_manifest.json');

            // Парсим манифест
            const parsedManifest = JSON.parse(manifestData);
            const desiredVersion = parsedManifest.versions.find((version: IVersion): boolean => version.id === this.launcher.options.version.number);

            if (!desiredVersion) {
                throw new Error(`Failed to find version ${this.launcher.options.version.number} in version_manifest.json`);
            }

            // Получаем данные версии
            const { data: versionData } = await axios.get(desiredVersion.url);

            // Сохраняем данные версии в кэш
            fs.writeFileSync(path.join(cacheDirectory, `${this.launcher.options.version.number}.json`), versionData);
            this.launcher.emit('debug', `[CORE]: Cached ${this.launcher.options.version.number}.json`);

            // Устанавливаем текущую версию
            this.launcher.emit('debug', '[CORE]: Parsed version from version manifest');
            this.launcher.options.manifest!.current = JSON.parse(versionData);
            return this.launcher.options.manifest!;
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            throw this.launcher.emit('error', `Error fetching version: ${e.message}`);
        }
    }

    async getNatives(): Promise<string> {
        const nativeDirectory = path.resolve(
            this.launcher.options.overrides?.natives ||
            path.join(this.launcher.options.root, 'natives', this.launcher.options.manifest!.current!.id)
        );

        if (parseInt(this.launcher.options.manifest!.current!.id.split('.')[1]) >= 19) {
            return this.launcher.options.overrides?.cwd || this.launcher.options.root;
        }

        if (!fs.existsSync(nativeDirectory) || !fs.readdirSync(nativeDirectory).length) {
            fs.mkdirSync(nativeDirectory, { recursive: true });

            const natives = await Promise.all(
                this.launcher.options.manifest!.current!.libraries.map(async (lib) => {
                    if (!lib.downloads || !lib.downloads.classifiers) return null;
                    if (parseRule(lib)) return null;

                    return getOS() === 'osx'
                        ? lib.downloads.classifiers['natives-osx'] || lib.downloads.classifiers['natives-macos']
                        : lib.downloads.classifiers[`natives-${getOS()}`];
                })
            );

            const filteredNatives = natives.filter((native): native is { url: string; path: string; sha1: string } => native !== null);

            this.launcher.emit('progress', {
                type: 'natives',
                task: 0,
                total: filteredNatives.length
            });

            await Promise.all(filteredNatives.map(async (native) => {
                if (!native) return;

                const name = path.basename(native.path);
                this.launcher.downloader.addUrl(native.url, name, nativeDirectory);

                try {
                    new Zip(path.join(nativeDirectory, name)).extractAllTo(nativeDirectory, true);
                } catch (e) {
                    console.warn(e);
                }

                fs.unlinkSync(path.join(nativeDirectory, name));
            }));

            await this.launcher.downloader.startDownloading();

            this.launcher.emit('debug', '[CORE]: Downloaded and extracted natives');
        }

        this.launcher.emit('debug', `[CORE]: Set native path to ${nativeDirectory}`);

        return nativeDirectory;
    }

    async getJar(): Promise<void> {
        try {
            // Определяем имя JAR-файла
            const jarFileName = `${this.launcher.options.version.custom || this.launcher.options.version.number}.jar`;

            // Добавляем URL для загрузки в Downloader
            this.launcher.downloader.addUrl(this.launcher.options.manifest!.current!.downloads.client.url, jarFileName, this.launcher.options.version!.directory!);

            // Запускаем процесс загрузки
            await this.launcher.downloader.startDownloading();

            // Записываем JSON-файл версии
            const versionJsonPath = path.join(this.launcher.options.version!.directory!, `${this.launcher.options.version.number}.json`);
            fs.writeFileSync(versionJsonPath, JSON.stringify(this.launcher.options.manifest, null, 4));

            // Логируем завершение загрузки и записи файла
            this.launcher.emit('debug', '[CORE]: Downloaded version jar and wrote version json');
        } catch (e: any) {
            this.launcher.emit('error', `Error downloading jar: ${e.message}`);
        }
    }

    getMemory (): string[] {
        if (!this.launcher.options.memory) {
            this.launcher.emit('debug', '[CORE]: Memory not set! Setting 1GB as MAX!')
            this.launcher.options.memory = {
                min: "512",
                max: "1023"
            }
        }
        if (!isNaN(Number(this.launcher.options.memory.max)) && !isNaN(Number(this.launcher.options.memory.min))) {
            if (this.launcher.options.memory.max < this.launcher.options.memory.min) {
                this.launcher.emit('debug', '[CORE]: MIN memory is higher then MAX! Resetting!')
                this.launcher.options.memory.max = "1023"
                this.launcher.options.memory.min = "512"
            }
            return [`${this.launcher.options.memory.max}M`, `${this.launcher.options.memory.min}M`]
        } else { return [`${this.launcher.options.memory.max}`, `${this.launcher.options.memory.min}`] }
    }

    async getModifyJson(): Promise<any> {
        try {
            let modifyJson: any = null;

            if (this.launcher.options.version.custom) {
                this.launcher.emit('debug', '[CORE]: Detected custom in options, setting custom version file');
                const customJsonPath = path.join(this.launcher.options.root, 'versions', this.launcher.options.version.custom, `${this.launcher.options.version.custom}.json`);
                modifyJson = JSON.parse(fs.readFileSync(customJsonPath, { encoding: 'utf8' }));
            }

            return modifyJson;
        } catch (e: any) {
            this.launcher.emit('error', `Error in getModifyJson: ${e.message}`);
            throw new Error(`Error in getModifyJson: ${e.message}`);
        }
    }

    async downloadToDirectory(directory: string, libraries: any[]): Promise<any> {
        const libs: string[] = [];

        await Promise.all(libraries.map(async (library) => {
            if (!library || parseRule(library)) return;
            const lib = library.name.split(':');

            let jarPath: string;
            let name: string;

            if (library.downloads?.artifact?.path) {
                name = path.basename(library.downloads.artifact.path);
                jarPath = path.join(directory, popString(library.downloads.artifact.path));
            } else {
                name = `${lib[1]}-${lib[2]}${lib[3] ? `-${lib[3]}` : ''}.jar`;
                jarPath = path.join(directory, `${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}`);
            }

            const downloadLibrary = async (library: any): Promise<void> => {
                const url = library.url
                    ? `${library.url}${lib[0].replace(/\./g, '/')}/${lib[1]}/${lib[2]}/${name}`
                    : library.downloads?.artifact?.url;

                if (url) {
                    this.launcher.downloader.addUrl(url, name, jarPath)
                }
            };

            const filePath = path.join(jarPath, name);
            try {
                 fs.accessSync(filePath);
            } catch {
                // File doesn't exist, download it
                await downloadLibrary(library);
            }

            if (library.downloads?.artifact && !await checkSum(library.downloads.artifact.sha1, filePath)) {
                await downloadLibrary(library);
            }

            libs.push(filePath);
        }));

        await this.launcher.downloader.startDownloading();

        return libs;
    }

    async getClasses (classJson: any): Promise<any> {
        let libs = []

        const libraryDirectory = path.resolve(this.launcher.options.overrides!.libraryRoot || path.join(this.launcher.options.root, 'libraries'))

        if (classJson) {
            if (classJson.mavenFiles) {
                await this.downloadToDirectory(libraryDirectory, classJson.mavenFiles)
            }
            libs = await this.downloadToDirectory(libraryDirectory, classJson.libraries)
        }

        const parsed = this.launcher.options.manifest!.current!.libraries.map(lib => {
            if (lib.downloads && lib.downloads.artifact && !parseRule(lib)) return lib
            return null
        })

        const d = await this.downloadToDirectory(libraryDirectory, parsed)

        libs = libs.concat((d))

        // Temp Quilt support
        if (classJson) libs.sort()

        this.launcher.emit('debug', '[CORE]: Collected class paths')
        return libs
    }

    isLegacy (): boolean {
        return this.launcher.options.manifest!.current!.assets === 'legacy' || this.launcher.options.manifest!.current!.assets === 'pre-1.6'
    }

    async getLaunchOptions (modification: any): Promise<any> {
        const type = Object.assign({}, this.launcher.options.manifest!.current, modification)

        let args = type.minecraftArguments
            ? type.minecraftArguments.split(' ')
            : type.arguments.game
        const assetRoot = path.resolve(this.launcher.options.overrides!.assetRoot || path.join(this.launcher.options.root, 'assets'))
        const assetPath = this.isLegacy()
            ? path.join(this.launcher.options.root, 'resources')
            : path.join(assetRoot)

        const minArgs = this.launcher.options.overrides!.minArgs || this.isLegacy() ? 5 : 11
        if (args.length < minArgs) args = args.concat(this.launcher.options.manifest!.current!.minecraftArguments ? this.launcher.options.manifest!.current!.minecraftArguments.split(' ') : this.launcher.options.manifest!.current!.arguments.game)
        if (this.launcher.options.customLaunchArgs) args = args.concat(this.launcher.options.customLaunchArgs)

        this.launcher.options.authorization = await Promise.resolve(this.launcher.options.authorization)
        this.launcher.options.authorization.meta = this.launcher.options.authorization.meta ? this.launcher.options.authorization.meta : { type: 'mojang' }
        const fields = {
            '${auth_access_token}': this.launcher.options.authorization.access_token,
            '${auth_session}': this.launcher.options.authorization.access_token,
            '${auth_player_name}': this.launcher.options.authorization.name,
            '${auth_uuid}': this.launcher.options.authorization.uuid,
            '${auth_xuid}': this.launcher.options.authorization.meta.xuid || this.launcher.options.authorization.access_token,
            '${user_properties}': this.launcher.options.authorization.user_properties,
            '${user_type}': this.launcher.options.authorization.meta.type,
            '${version_name}': this.launcher.options.version.number || this.launcher.options.overrides!.versionName,
            '${assets_index_name}': this.launcher.options.overrides!.assetIndex || this.launcher.options.version.custom || this.launcher.options.version.number,
            '${game_directory}': this.launcher.options.overrides!.gameDirectory || this.launcher.options.root,
            '${assets_root}': assetPath,
            '${game_assets}': assetPath,
            '${version_type}': this.launcher.options.version.type,
            '${clientid}': this.launcher.options.authorization.meta.clientId || (this.launcher.options.authorization.client_token || this.launcher.options.authorization.access_token),
            '${resolution_width}': this.launcher.options.window ? this.launcher.options.window.width : 856,
            '${resolution_height}': this.launcher.options.window ? this.launcher.options.window.height : 482
        }

        if (this.launcher.options.authorization.meta.demo && (this.launcher.options.features ? !this.launcher.options.features.includes('is_demo_user') : true)) {
            args.push('--demo')
        }

        const replaceArg = (obj, index): void => {
            if (Array.isArray(obj.value)) {
                for (const arg of obj.value) {
                    args.push(arg)
                }
            } else {
                args.push(obj.value)
            }
            delete args[index]
        }

        for (let index = 0; index < args.length; index++) {
            if (typeof args[index] === 'object') {
                if (args[index].rules) {
                    if (!this.launcher.options.features) continue
                    const featureFlags: any = []
                    for (const rule of args[index].rules) {
                        featureFlags.push(...Object.keys(rule.features))
                    }
                    let hasAllRules = true
                    for (const feature of this.launcher.options.features) {
                        if (!featureFlags.includes(feature)) {
                            hasAllRules = false
                        }
                    }
                    if (hasAllRules) replaceArg(args[index], index)
                } else {
                    replaceArg(args[index], index)
                }
            } else {
                if (Object.keys(fields).includes(args[index])) {
                    args[index] = fields[args[index]]
                }
            }
        }
        if (this.launcher.options.window) {
            if (this.launcher.options.window.fullscreen) {
                args.push('--fullscreen')
            } else {
                if (this.launcher.options.window.width) args.push('--width', this.launcher.options.window.width)
                if (this.launcher.options.window.height) args.push('--height', this.launcher.options.window.height)
            }
        }
        if (this.launcher.options.proxy) {
            args.push(
                '--proxyHost',
                this.launcher.options.proxy.host,
                '--proxyPort',
                this.launcher.options.proxy.port || '8080',
                '--proxyUser',
                this.launcher.options.proxy.username,
                '--proxyPass',
                this.launcher.options.proxy.password
            )
        }
        args = args.filter(value => typeof value === 'string' || typeof value === 'number')
        this.launcher.emit('debug', '[CORE]: Set launch options')
        return args
    }

    async getArgs(nativePath: string, versionFile: any, modifyJson: any): Promise<any> {
        const args = []

        let jvm: any = [
            '-XX:-UseAdaptiveSizePolicy',
            '-XX:-OmitStackTraceInFastThrow',
            '-Dfml.ignorePatchDiscrepancies=true',
            '-Dfml.ignoreInvalidMinecraftCertificates=true',
            `-Djava.library.path=${nativePath}`,
            `-Xmx${this.getMemory()[0]}`,
            `-Xms${this.getMemory()[1]}`
        ]
        if (getOS() === 'osx') {
            if (parseInt(versionFile.id.split('.')[1]) > 12) jvm.push(getJVM())
        } else jvm.push(getJVM())

        if (this.launcher.options.customArgs) jvm = jvm.concat(this.launcher.options.customArgs)
        if (this.launcher.options.overrides!.logj4ConfigurationFile) {
            jvm.push(`-Dlog4j.configurationFile=${path.resolve(this.launcher.options.overrides!.logj4ConfigurationFile)}`)
        }
        // https://help.minecraft.net/hc/en-us/articles/4416199399693-Security-Vulnerability-in-Minecraft-Java-Edition
        if (parseInt(versionFile.id.split('.')[1]) === 18 && !parseInt(versionFile.id.split('.')[2])) jvm.push('-Dlog4j2.formatMsgNoLookups=true')
        if (parseInt(versionFile.id.split('.')[1]) === 17) jvm.push('-Dlog4j2.formatMsgNoLookups=true')
        if (parseInt(versionFile.id.split('.')[1]) < 17) {
            if (!jvm.find(arg => arg.includes('Dlog4j.configurationFile'))) {
                const configPath = path.resolve(this.launcher.options.overrides!.cwd || this.launcher.options.root)
                const intVersion = parseInt(versionFile.id.split('.')[1])
                if (intVersion >= 12) {
                    this.launcher.downloader.addUrl('https://launcher.mojang.com/v1/objects/02937d122c86ce73319ef9975b58896fc1b491d1/log4j2_112-116.xml', 'log4j2_112-116.xml', configPath)
                    jvm.push('-Dlog4j.configurationFile=log4j2_112-116.xml')
                } else if (intVersion >= 7) {
                    this.launcher.downloader.addUrl('https://launcher.mojang.com/v1/objects/dd2b723346a8dcd48e7f4d245f6bf09e98db9696/log4j2_17-111.xml', 'log4j2_17-111.xml', configPath)
                    jvm.push('-Dlog4j.configurationFile=log4j2_17-111.xml')
                }
            }
        }

        const classPaths: any = ['-cp']
        const separator = getOS() === 'windows' ? ';' : ':'
        this.launcher.emit('debug', `[CORE]: Using ${separator} to separate class paths`)
        // Handling launch arguments.

        this.launcher.emit('debug', '[CORE]: Attempting to download assets')
        // Forge -> Custom -> Vanilla
        const launchOptions = await this.getLaunchOptions(modifyJson)

        const launchArguments = args.concat(jvm, classPaths, launchOptions)
        this.launcher.emit('arguments', launchArguments)
        this.launcher.emit('debug', `[CORE]: Launching with arguments ${launchArguments.join(' ')}`)
        return this.startMinecraft(launchArguments)
    }

    startMinecraft (launchArguments: any): child.ChildProcessWithoutNullStreams {
        const minecraft = child.spawn(this.launcher.options.javaPath ? this.launcher.options.javaPath : 'java', launchArguments,
            {
                cwd: this.launcher.options.overrides!.cwd || this.launcher.options.root,
                detached: this.launcher.options.overrides!.detached
            })
        minecraft.stdout.on('data', (data) => this.launcher.emit('data', data.toString('utf-8')))
        minecraft.stderr.on('data', (data) => this.launcher.emit('data', data.toString('utf-8')))
        minecraft.on('close', (code) => this.launcher.emit('close', code))
        return minecraft
    }
}
