import fs from 'fs';
import lodash from 'lodash';


export class Utils {

    static wait(time: number): Promise<void> {
        return new Promise((resolve) => { setTimeout(() => { resolve() }, time) })
    }

    static getUniqueArrayValues(arr: any[]): any[] {
        return Array.from(new Set(arr));
    }

    static shuffle<T>(arr: T[]): T[] {
        return lodash.shuffle(arr);
    }

    static getRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }

    static getDayByDate(date: Date): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }

    static getRandomEnumValue<T>(enumDef: T): string {
        const values = Object.values(enumDef);
        const ranNumber = this.getRandomNumber(0, values.length);
        return values[ranNumber];
    }

    static getRandomArrayValue<T>(myArray: T[]): T {
        const ranNumber = this.getRandomNumber(0, myArray.length);
        return myArray[ranNumber];
    }

    static getRandomArrayValues<T>(myArray: T[], amount: number): T[] {
        return this.shuffle(myArray).slice(0, amount);
    }

    static arrayToMap<T>(arr: T[]): Map<T, number> {
        return new Map(arr.map(elm => [elm, 1]));
    }

    static convertSecToMs(seconds: number): number {
        return seconds * 1000;
    }

    static convertMsToSec(miliseconds: number): number {
        return miliseconds / 1000;
    }

    static sampleRateToSec(sampleRate: number, defaultSampleRate: number): number {
        return sampleRate / defaultSampleRate;
    }

    static shortStringLength(str: string, maxLength: number): string {
        let finalString = '';
        for (const char of str) {
            finalString += char;
            if (finalString.length > maxLength) break;
        }
        if (str.length !== finalString.length) {
            finalString = `${finalString.trim()}...`;
        }
        return finalString;
    }

    static cookiesObjectToString(cookieObj: { [key: string]: string }): string {
        let stringValue = '';
        for (const key of Object.keys(cookieObj)) {
            stringValue += `${key}=${cookieObj[key]};`;
        }
        return stringValue;
    }

    static objectToQueryString<T extends object>(queryParameters: T): string {

        //0 - was anything defined
        if (Object.keys(queryParameters).length === 0) return '';

        //1 - construct the query string form the object parameters
        return Object.entries(queryParameters).reduce(
            (queryString: string, [key, val], index: number) => {

                //a. query starting symbol
                const symbol: string = queryString.length === 0 ? '?' : '&';

                //b. all element to query
                queryString += val ? `${symbol}${key}=${val}` : '';
                return queryString;
            },
            ''
        );
    }

    static isStringJSON(jsonString: string): boolean {
        try {
            const jsonObj: any = JSON.parse(jsonString);
            return true;
        } catch (error: unknown) {
            return false;
        }
    }

    static objectKeysToLowercase<TInitial extends object>(obj: TInitial): object {
        const preparedObj: object = {};
        for (const key of Object.keys(obj)) {
            (preparedObj as any)[key.toLowerCase().trim()] = (obj as any)[key];
        }
        return preparedObj;
    }

    static mergeObjects<T1 extends object, T2 extends object>(oldObject: T1, newObject: T2): object {
        return lodash.merge(oldObject, newObject);
    }

    static objectToSearchParams<T extends object>(obj: T): string {
        const pairs = lodash.toPairs(obj);
        const newObj = lodash.fromPairs(pairs);
        const searchParams = new URLSearchParams(newObj)
        return searchParams.toString();
    }

    static getColorBrightness(hexColor: string): number {
        const hex = hexColor.replace('#', '');
        const cr = parseInt(hex.substring(0, 2), 16) || 0;
        const cg = parseInt(hex.substring(2, 2), 16) || 0;
        const cb = parseInt(hex.substring(4, 2), 16) || 0;
        const brightness = ((cr * 299) + (cg * 587) + (cb * 114)) / 1000;
        return brightness;
    }

    static createFolder(folderPath: string) {
        if (fs.existsSync(folderPath)) return;
        fs.mkdirSync(folderPath);
    }

    static cleanFolder(folderPath: string) {
        fs.rmSync(folderPath, { recursive: true });
        this.createFolder(folderPath);
    }

    static rgbToHex(r: number, g: number, b: number): string {
        const hexR = r.toString(16).padStart(2, '0');
        const hexG = g.toString(16).padStart(2, '0');
        const hexB = b.toString(16).padStart(2, '0');
        return `#${hexR}${hexG}${hexB}`;
    }
}


