import dotenv from 'dotenv';
dotenv.config();

import { envConfigs } from './configs/env';
import express from 'express';


const app = express();
const port = envConfigs.PORT || 8080;
const env = envConfigs.NODE_ENV || 'development';


app.listen(port, () => {
    console.log(`✔\t ENV: ${env} || App is listening on port ${port}`);
});
