import { EventEmitter } from 'events'
import { MinecraftInstance } from '../client'
import { ILauncherOptions } from '../types'
import path from 'path'
import { downloadJava, extractJava, getCorrectVersion, isJavaInstalled } from '../utils'
import { Downloader } from '../downloader'
import * as fs from 'fs'

export class Launcher extends EventEmitter {
    options: ILauncherOptions;
    instance: MinecraftInstance;
    downloader: Downloader;
    constructor(options?: ILauncherOptions) {
        super();
        this.options = options!;
        this.downloader = new Downloader(this);
        this.instance = new MinecraftInstance(this);
    }

    setOptions(options: ILauncherOptions): void {
        this.options = options;
    }

    async installJava(): Promise<void> {
        if (isJavaInstalled()) return;
        const version = getCorrectVersion(this.options.version.number);
        await downloadJava(path.join(this.options.root, 'java'), version);
        await extractJava(path.join(this.options.root, 'java'));
    }

    async launch(): Promise<void> {
        await this.instance.getPackage();

        this.options.version.directory = this.options.overrides?.directory || path.join(this.options.root, 'versions', this.options.version.custom ? this.options.version.custom : this.options.version.number);

        const versionFile = await this.instance.getVersion();

        this.options.mcPath = this.options.overrides?.minecraftJar || (this.options.version.custom
            ? path.join(this.options.root, 'versions', this.options.version.custom, `${this.options.version.custom}.jar`)
            : path.join(this.options.version.directory, `${this.options.version.number}.jar`));

        const nativePath = await this.instance.getNatives();

        if (!fs.existsSync(this.options.mcPath)) {
            this.emit('debug', '[MCLC]: Attempting to download Minecraft version jar')
            await this.instance.getJar()
        }

        const modifyJson = await this.instance.getModifyJson();
        const args = await this.instance.getArgs(nativePath, versionFile, modifyJson);
        this.instance.startMinecraft(args);
    }
}
