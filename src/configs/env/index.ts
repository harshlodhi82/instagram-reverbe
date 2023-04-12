export const envConfigs = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
}

Object.keys(envConfigs).forEach((elm: string)=>{
    if((<any>envConfigs)[elm] == null && elm !== 'PORT') {
        throw Error(`${elm} is missing from the env file.`);
    } 
})