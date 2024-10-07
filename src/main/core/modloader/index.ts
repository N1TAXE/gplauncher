import { Launcher } from '../launcher'

export class ModLoader {
    launcher: Launcher;
    constructor(launcher: Launcher) {
        this.launcher = launcher;
        this.launcher.options.overrides = {
            ...this.launcher.options.overrides,
            url: {
                ...this.launcher.options.overrides?.url,
                mavenForge: 'https://files.minecraftforge.net/maven/',
                defaultRepoForge: 'https://libraries.minecraft.net/',
                fallbackMaven: 'https://search.maven.org/remotecontent?filepath=',
            }
        }
    }

    public getLink(): string {
        switch (this.launcher.options.dist.modLoader?.loader) {
            default:
            case 'Forge':
                return `https://maven.minecraftforge.net/net/minecraftforge/forge/${this.launcher.options.version.number}-${this.launcher.options.dist.modLoader?.number}/forge-${this.launcher.options.version.number}-${this.launcher.options.dist.modLoader?.number}-installer.jar`
        }
    }
}

export class ForgeML extends ModLoader {
    constructor(launcher: Launcher) {
        super(launcher)
        this.launcher.options.overrides = {
            ...this.launcher.options.overrides,
            fw: {
                ...this.launcher.options.overrides?.fw,
                baseUrl: 'https://github.com/ZekerZhayard/ForgeWrapper/releases/download/',
                version: '1.6.0',
                sh1: '035a51fe6439792a61507630d89382f621da0f1f',
                size: 28679,
            }
        }
    }
}
