import uuid4 from "uuid4";
import { InstagramRequest } from "../instagram-request";
import { ISearchMusicResponse } from "./interfaces/fbsearch.interface";


export class FbSearchService {

    //** Search music */
    static async searchMusic(query: string): Promise<ISearchMusicResponse> {
        const API = 'https://i.instagram.com/api/v1/music/audio_global_search/';
        const params = {
            "query": query,
            "browse_session_id": uuid4()
        }
        const response = await InstagramRequest.get(API, { params: params });
        const resData: ISearchMusicResponse = await response.json();
        return resData;
    }
}
