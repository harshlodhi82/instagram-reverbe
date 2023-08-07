import dotenv from 'dotenv';
dotenv.config();

import { envConfigs } from './configs/env';
import express from 'express';
import path from 'path';
import { SchedulerController } from './controllers/scheduler';
import { DatabaseController } from './controllers/database';
import { AddSongController } from './controllers/add-song';


const app = express();
const port = envConfigs.PORT || 8080;
const env = envConfigs.NODE_ENV || 'development';


//** set the middleware */
app.set('views', path.join(__dirname, '../assets/html'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../assets/html')));
app.use(express.urlencoded({ extended: true }));


//** connect to database */
new DatabaseController().run();


//** defined routes */
app.get('/', AddSongController.getAddSongForm);
app.post('/add-song', AddSongController.submitAddSongForm);


//** listen to app */
app.listen(port, () => {
    console.log(`✔\t ENV: ${env} || App is listening on port ${port}`);
    new SchedulerController().run();
});
