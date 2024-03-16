export function formatBytes(bytes, decimals = 2): string {
    if (bytes === 0) {
        return '0';
    } else {
        let k = 1024;
        let dm = decimals < 0 ? 0 : decimals;
        let sizes = ['байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
        let i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}
