export type OS = "windows" | "osx" | "linux";

export interface IDownloaderFile {
    link: string;
    name: string;
    dir: string;
}

export type IModLoader = {
    loader: 'Forge' | 'Fabric';
    number: string;
}

export interface IDist {
    version: string;
    modLoader?: IModLoader
    name: string;
    mods: string[];
    shaders: string[];
    resourcepacks: string[];
}

export interface IModTypes {
    slug: string;
    title: string;
    description: string;
    categories: string[];
    client_side: string;
    server_side: string;
    project_type: string;
    downloads: number;
    icon_url: string;
    color: number;
    thread_id: string;
    monetization_status: string;
    project_id: string;
    author: string;
    display_categories: string[];
    versions: string[];
    follows: number;
    date_created: string;
    date_modified: string;
    latest_version: string;
    license: string;
    gallery: string[];
    featured_gallery: string;
}

export interface IOverrides {
    /**
     * The amount of launch arguments specified in the version file before it adds the default again
     */
    minArgs?: number;
    minecraftJar?: string;
    versionJson?: string;
    versionName?: string;
    /**
     * Folder, where the game process generates folders like saves and resource packs.
     */
    gameDirectory?: string;
    /**
     * Folder, where the Minecraft jar and version json are located.
     */
    directory?: string;
    natives?: string;
    assetRoot?: string;
    assetIndex?: string;
    libraryRoot?: string;
    /**
     * Working directory of the java process.
     */
    cwd?: string;
    /**
     * Whether or not the client is detached from the parent / launcher.
     */
    detached?: boolean;
    /**
     * List of classes.
     * All class paths are required if you use this.
     */
    classes?: Array<string>;
    /**
     * Max sockets for downloadAsync.
     */
    maxSockets?: number;
    /**
     * Urls to the Minecraft and Forge resource servers
     *
     * This is for launcher developers located in countries that have the Minecraft and Forge resource servers
     * blocked for what ever reason. They obviously need to mirror the formatting of the original JSONs / file structures.
     */
    url?: {
        /**
         * List of versions.
         */
        meta?: string;
        /**
         * Minecraft resources.
         */
        resource?: string;
        /**
         * Forge resources.
         */
        mavenForge?: string;
        /**
         * for Forge only, you need to redefine the library url in the version json.
         */
        defaultRepoForge?: string;
        /**
         *
         */
        fallbackMaven?: string;
        /**
         * for Forge only, you need to redefine the library url in the version json.
         */
    };
    fw?: {
        baseUrl?: string;
        version?: string;
        sh1?: string;
        size?: number;
    };
    logj4ConfigurationFile?: string;
    /**
     * Overwrites game lang settings
     */
    gameLang?: string;
}

export interface IVersion {
    id: string;
    type: string;
    url: string;
    time: string;
    releaseTime: string;
}

export interface IDownload {
    sha1: string;
    size: number;
    url: string;
}

export interface IManifestVersion {
    id: string;
    arguments: {
        game: [];
        jvm: any;
    };
    assetIndex: {
        id: string;
        sha1: string;
        size: number;
        totalSize: number;
        url: string;
    };
    assets: string;
    complianceLevel: number;
    downloads: {
        client: IDownload,
        client_mappings: IDownload
        server: IDownload
        server_mappings: IDownload
    };
    javaVersion: {
        component: string;
        majorVersion: number;
    };
    libraries: {
        downloads: {
            classifiers: any;
            artifact: {
                path: string;
                sha1: string;
                size: number;
                url: string;
            }
        }
        name: string;
        rules: {
            action: string;
            os: {
                name: string;
            }
        }[]
    }[];
    logging: {
        client: {
            argument: string;
            file: IDownload;
            type: string;
        }
    };
    mainClass: string;
    minimumLauncherVersion: number;
    releaseTime: string;
    time: string;
    type: string;
    minecraftArguments?: any;
}

export interface IManifest {
    latest: {
        release: string;
        snapshot: string;
    },
    versions: IVersion[],
    current?: IManifestVersion
}

export interface ILauncherOptions {
    launchArguments?: string;
    mcPath?: string;
    manifest?: IManifest;
    /**
     * Path or URL to the client package zip file.
     */
    clientPackage?: string;
    /**
     * if true MCLC will remove the client package zip file after its finished extracting.
     */
    removePackage?: boolean;
    /**
     * Path where you want the launcher to work in.
     * This will usually be your .minecraft folder
     */
    root: string;
    /**
     * OS override for minecraft natives
     *
     * @default will autodetect
     */
    os?: OS;
    /**
     * Array of custom Minecraft arguments.
     */
    customLaunchArgs?: Array<string>;
    /**
     * Array of custom Java arguments
     */
    customArgs?: Array<string>;
    /**
     * Array of game argument feature flags
     */
    features?: Array<string>;
    /**
     * minecraft version info
     */
    version: {
        /**
         * Actual version.
         *
         * @example '1.16.4'
         */
        number: string;
        /**
         * type of release, usually `release` or `snapshot`
         */
        type: 'release' | 'snapshot' | string;
        /**
         * 	The name of the folder, jar file, and version json in the version folder.
         *
         * ` MCLC will look in the `versions` folder for this name
         * @example '1.16.4-fabric'
         */
        custom?: string;
        directory?: string;
    };
    memory: {
        /**
         * Min amount of memory being used by Minecraft.
         */
        max: string;
        /**
         * Max amount of memory being used by Minecraft.
         */
        min: string;
    };
    /**
     * Path to the JRE executable file, will default to java if not entered.
     */
    javaPath?: string;
    proxy?: {
        /**
         * Host url to the proxy, don't include the port.
         */
        host: string;
        /**
         *  Username for the proxy.
         *
         * @default 8080
         */
        port?: string;
        /**
         * Username for the proxy.
         */
        username?: string;
        /**
         * Password for the proxy.
         */
        password?: string;
    };
    /**
     * Timeout on download requests.
     */
    timeout?: number;
    window?: {

        /**
         * Width of the Minecraft Client
         */
        width?: number;
        /**
         * Height of the Minecraft Client
         */
        height?: number;
        /**
         * Fullscreen the Minecraft Client.
         */
        fullscreen?: boolean;
    };


    /**
     * Allows the game to be launched directly into a world
     */
    quickPlay?: {
        /**
         * The type of world you want to join.
         * Note, that versions prior to 1.20 only support "legacy"
         */
        type: 'singleplayer' | 'multiplayer' | 'realms' | 'legacy';
        /**
         * Represents the world you want to join
         *
         * For singleplayer this should be the folder name of the world
         * For multiplayer this should be the IP address of the server
         * For realms this should be the Realms ID
         * legacy follows multiplayer format
         */
        identifier: string;
        /**
         * The specified path for logging (relative to the run directory)
         */
        path?: string;
    };
    /**
     * Json object redefining paths for better customization
     */
    overrides?: IOverrides;

    authorization: Promise<IUser> | IUser;
    /**
     * Path of json cache.
     */
    cache?: string;
    /**
     * Instance Dist Path
     */
    dist: IDist;
}

export interface IUser {
    access_token: string;
    client_token: string;
    uuid: string;
    name: string;
    user_properties: Partial<any>;
    meta?: {
        type: "mojang" | "msa",
        demo?: boolean
        xuid?: string;
        clientId?: string;
    };
}

export interface IProfile {
    id: number;
    name: string;
}

export interface IAuthenticator {
    /**
     * @param username email if using a password, else the username
     * @param password password for mojang account
     */
    getAuth(username: string, password?: string): Promise<IUser>;
    /**
     *
     * @param access_token Token being checked if it can be used to login with (online mode)
     * @param client_token Client token being checked to see if there was a change of client (online mode)
     */
    validate(
        access_token: string,
        client_token: string
    ): Promise<boolean | Partial<any>>;
    /**
     *
     * @param access_token Token being checked if it can be used to login with (online mode)
     * @param client_token Client token being checked to see if there was a change of client (online mode)
     */
    refreshAuth(
        access_token: string,
        client_token: string,
    ): Promise<IUser>;
    /**
     *
     * @param access_token Token being checked if it can be used to login with (online mode)
     * @param client_token Client token being checked to see if there was a change of client (online mode)
     */
    invalidate(
        access_token: string,
        client_token: string
    ): Promise<boolean | Partial<any>>;
    /**
     * @param username email if using a password, else the username
     * @param password password for mojang account
     */
    signOut(
        username: string,
        password: string
    ): Promise<boolean | Partial<any>>;
    changeApiUrl(url: string): void;
}
