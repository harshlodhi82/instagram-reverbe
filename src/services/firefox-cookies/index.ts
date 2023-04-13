import sqlite3 from 'sqlite3';
import { envConfigs } from '../../configs/env';


export class FireFoxCookies {

    // private static readonly FIREFOX_KEY_FILE = envConfigs.FIREFOX_KEY_FILE;
    private static readonly FIREFOX_COOKIES_FILE = envConfigs.FIREFOX_COOKIES_FILE;
    private static readonly INSTAGRAM_HOST = 'instagram.com';


    //** Get Instagram Cookies */
    static async getInstagramCookies(): Promise<{ [key: string]: string } >{

        //0 - prepare DB
        const db = new sqlite3.Database(this.FIREFOX_COOKIES_FILE, sqlite3.OPEN_READONLY);

        //1 - fetch cookies
        return new Promise((resolve, reject) => {
            db.all(`SELECT name, value, host FROM moz_cookies where host like '%${this.INSTAGRAM_HOST}'`, (err: Error, rows: ICookiesItems[]) => {
                if (err) return reject(err);
        
                //a. prepare cookies object
                const obj: { [key: string]: string } = {};
                rows.forEach((row: ICookiesItems) => {
                    obj[row.name] = row.value
                });
        
                //b. close the database connection
                db.close();

                //c. resolve cookies object
                resolve(obj)
            });
        });

    }

    /*
    private getEncryptionKey(): Promise<Buffer> {

        // connect to the key database using sqlite3
        const db = new sqlite3.Database(this.FIREFOX_KEY_FILE, sqlite3.OPEN_READONLY);

        // query for the encryption key
        return new Promise((resolve, reject) => {
            db.get('SELECT item1, item2 FROM metadata WHERE id = "password"', (err: Error, row: IKeyItems) => {
                try {
                    if (err) return reject(err);
                    
                    // extract the encryption key from the encrypted data using FFX
                    const encrypted = Buffer.from(row.item1, 'hex');
                    const key = Buffer.alloc(32);
                    const decipher = crypto.createDecipheriv('aes-256-ctr', key, encrypted.subarray(3, 19));
                    const decrypted = decipher.update(encrypted.subarray(19));
                    const finalDecrypted = Buffer.concat([decrypted, decipher.final()]);

                    // hash the key using SHA-256 to obtain the final encryption key
                    const finalKey = crypto.createHash('sha256').update(finalDecrypted).digest();

                    // close the database connection
                    db.close();

                    // resolve the key
                    resolve(finalKey)
                } catch (error) {
                    reject(error);
                }

            });
        })

    }
    */
}

/*
interface IKeyItems {
    item1: any;
    item2: any;
}
*/

interface ICookiesItems {
    name: string,
    value: string,
    host: string
}
