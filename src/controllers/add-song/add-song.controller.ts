import { Request, Response } from 'express';
import { SongsLibrary } from '../database';
import { envConfigs } from '../../configs/env';


export class AddSongController {

    static getAddSongForm(request: Request, response: Response) {
        const message: string = <string>request.query.message || '';
        response.render('add-song', { message: message });
    }

    static async submitAddSongForm(request: Request, response: Response) {
        try {
            const requestData: IRequestData = request.body;

            // verify password
            if(envConfigs.SAVE_SONG_PASSWORD !== requestData.password) {
                throw new Error('Wrong password!');
            }

            // verify song
            const foundSong = await SongsLibrary.findOne({ search: requestData.songSearchQuery }).lean();
            if(foundSong != null) throw new Error('Song is already saved');

            // save song
            const newSong = new SongsLibrary({
                search: requestData.songSearchQuery,
                isPosted: false,
            });
            await newSong.save();

            const message = `Song is saved successfully!`
            response.redirect(`/?message=${message}`);
        } catch (error: Error|any) {
            const message = error?.message || 'unknown error';
            response.redirect(`/?message=${message}`);
        }
    }
}


interface IRequestData {
    songSearchQuery: string;
    password: string;
}
