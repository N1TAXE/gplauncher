import { IDownloaderFile } from '../types';
import axios from 'axios';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'node:path';

export class Downloader {
    private client: EventEmitter;
    private urls: IDownloaderFile[];
    private totalSize: number;
    private downloadedSize: number;
    private currentFile: string | null;

    constructor(client: EventEmitter) {
        this.client = client;
        this.urls = [];
        this.totalSize = 0;
        this.downloadedSize = 0;
        this.currentFile = null;
    }

    addUrl(url: string, name: string, dir: string): void {
        this.urls.push({ link: url, name, dir });
        this.getTotalSize(); // Обновляем общий размер
    }

    removeUrl(url: string): void {
        this.urls = this.urls.filter(item => item.link !== url);
        this.getTotalSize(); // Обновляем общий размер после удаления
    }

    async getTotalSize(): Promise<number> {
        this.totalSize = 0;

        await Promise.all(
            this.urls.map(async (url) => {
                const res = await axios.head(url.link);
                const length = res.headers['content-length'];
                this.totalSize += parseInt(length, 10);
            })
        );

        return this.totalSize;
    }

    async startDownloading(): Promise<void> {
        this.downloadedSize = 0;

        for (const file of this.urls) {
            await this.downloadFile(file);
        }
    }

    async downloadFile(file: IDownloaderFile): Promise<void> {
        this.currentFile = file.name;

        const res = await axios({
            method: 'GET',
            url: file.link,
            responseType: 'stream',
        });

        const newFile = fs.createWriteStream(path.join(file.dir, file.name));

        res.data.on('data', (chunk) => {
            this.downloadedSize += chunk.length;

            this.client.emit('download-status', {
                name: this.currentFile,
                current: this.downloadedSize,
                total: this.totalSize
            });
        });

        return new Promise<void>((resolve, reject) => {
            res.data.pipe(newFile);

            newFile.on('finish', () => {
                resolve();
            });

            newFile.on('error', (err) => {
                reject(err);
            });
        });
    }
}
