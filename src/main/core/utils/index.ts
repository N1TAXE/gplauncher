import { OS } from '../types'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import { CONSTS } from '../consts'
import * as tar from 'tar'
import checksum from 'checksum'

export function getOS(): OS {
    switch (process.platform) {
        case 'win32':
            return 'windows'
        case 'darwin':
            return 'osx'
        default:
            return 'linux'
    }
}

export function isJavaInstalled(): boolean {
    try {
        execSync('java -version', { stdio: 'ignore' })
        return true
    } catch (error) {
        return false
    }
}

export async function downloadJava(targetDir: string, mcVersion: number): Promise<void> {
    const filePath = path.join(targetDir, 'openjdk.tar.gz')
    const writer = fs.createWriteStream(filePath)
    let url: string
    if (mcVersion < 1.17) {
        url = CONSTS.JRE.older
    } else {
        url = CONSTS.JRE.newest
    }

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

export async function extractJava(targetDir: string): Promise<void> {
    const filePath = path.join(targetDir, 'openjdk.tar.gz')

    try {
        await tar.x({
            file: filePath,   // Путь к архиву
            cwd: targetDir    // Директория, куда будет распакован архив
        })

        console.log('Java успешно распакован.')
    } catch (error) {
        console.error('Ошибка при распаковке Java:', error)
    }
}

export function createDirectory(directory: string): string {
    fs.mkdirSync(directory, { recursive: true })
    return path.resolve(directory)
}

export function getCorrectVersion(version: string): number {
    const firstDotIndex = version.indexOf('.');

    if (firstDotIndex === -1) {
        return Number(version);
    }

    const lastDotIndex = version.lastIndexOf('.');

    if (firstDotIndex === lastDotIndex) {
        return Number(version);
    }

    // Обрезаем строку до последней точки
    return Number(version.substring(0, lastDotIndex));
}

export function parseRule(lib: any): boolean {
    if (lib.rules) {
        if (lib.rules.length > 1) {
            if (lib.rules[0].action === 'allow' && lib.rules[1].action === 'disallow' && lib.rules[1].os.name === 'osx') {
                return getOS() === 'osx'
            }
            return true
        } else {
            if (lib.rules[0].action === 'allow' && lib.rules[0].os) return lib.rules[0].os.name !== getOS()
        }
    } else {
        return false
    }
    return false
}

export function checkSum(hash, file): Promise<any> {
    return new Promise((resolve) => {
        checksum.file(file, (err, sum) => {
            if (err) {
                return resolve(false)
            }
            return resolve(hash === sum)
        })
    })
}

export function getJVM (): string {
    const opts = {
        windows: '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump',
        osx: '-XstartOnFirstThread',
        linux: '-Xss1M'
    }
    return opts[getOS()]
}

export function cleanUp(array) {
    return [...new Set(Object.values(array).filter(value => value !== null))]
}

export function popString (path) {
    return path.split('/').slice(0, -1).join('/')
}
