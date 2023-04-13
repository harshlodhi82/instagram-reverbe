export const envConfigs = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    FIREFOX_KEY_FILE: process.env.FIREFOX_KEY_FILE,
    FIREFOX_COOKIES_FILE: process.env.FIREFOX_COOKIES_FILE,
}

Object.keys(envConfigs).forEach((elm: string)=>{
    if((<any>envConfigs)[elm] == null && elm !== 'PORT') {
        throw Error(`${elm} is missing from the env file.`);
    } 
})