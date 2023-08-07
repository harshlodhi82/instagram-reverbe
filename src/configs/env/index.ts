export const envConfigs = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    FIREFOX_KEY_FILE: process.env.FIREFOX_KEY_FILE,
    FIREFOX_COOKIES_FILE: process.env.FIREFOX_COOKIES_FILE,
    USER_NAME: process.env.USER_NAME,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_DATABASE: process.env.DB_DATABASE,
}

Object.keys(envConfigs).forEach((elm: string)=>{
    if((<any>envConfigs)[elm] == null && elm !== 'PORT') {
        throw Error(`${elm} is missing from the env file.`);
    } 
})