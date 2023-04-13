import fs from 'fs';
import path from 'path';

class Logs {

    private readonly logsFolder = path.join(__dirname, '../../../logs');
    
    private currentFilePath:string; 

    constructor() {
        this.createLogsFolder();
    }

    save(log: string, showLog = true) {
        if (showLog) console.log(log);
        const preparedLog = this.prepareLog(log);
        const filePath = `${this.logsFolder}/${this.getFileName()}`;
        this.currentFilePath = filePath;
        fs.appendFileSync(filePath, preparedLog);
    }

    getTodaysLog() {
        return this.currentFilePath;
    }

    private prepareLog(log: string): string {
        if (log.indexOf('\n') === 0) return `\n${this.getFormattedTime()}\t${log.replace('\n', '')}\r\n`;
        return `${this.getFormattedTime()}\t${log}\r\n`;
    }

    private getFileName(): string {
        return `log-${this.getFormattedDate()}.txt`;
    }

    private getFormattedDate(): string {
        const date = new Date();
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    }

    private getFormattedTime(): string {
        const date = new Date();
        return `${date.getHours()}:${date.getMinutes()}`;
    }

    private createLogsFolder() {
        if (fs.existsSync(this.logsFolder)) return;
        fs.mkdirSync(this.logsFolder);
    }
}

export const logs = new Logs();
