import dotenv from 'dotenv';
dotenv.config();

import { envConfigs } from './configs/env';
import express from 'express';
import { InstagramApi } from './services/instagram-api';


const app = express();
const port = envConfigs.PORT || 8080;
const env = envConfigs.NODE_ENV || 'development';

InstagramApi.test();


//** listen to app */
app.listen(port, () => {
    console.log(`✔\t ENV: ${env} || App is listening on port ${port}`);
});
