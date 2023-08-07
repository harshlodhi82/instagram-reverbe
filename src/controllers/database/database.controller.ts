import mongoose from 'mongoose';
import { logs } from '../../shared/libs';
import { envConfigs } from '../../configs/env';


export class DatabaseController {

    private readonly URL = `mongodb+srv://${envConfigs.DB_USERNAME}:${envConfigs.DB_PASSWORD}@${envConfigs.DB_HOST}/${envConfigs.DB_DATABASE}?retryWrites=true&w=majority`;

    constructor(){
        mongoose.connection.once('open', ()=>{
            logs.save('✔\t Database Connected!', true);
        });

        mongoose.connection.on('error', (error)=>{
            logs.save(`❌\t ${error.message}`, true);
        });
    }

    connect(): Promise<typeof mongoose> {
        return mongoose.connect(this.URL);
    }
}
