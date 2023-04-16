import { IUserInfo } from "./interfaces/user-info.interface";
import { ReelService } from "./reel.service";
import { UserService } from "./user.service";
import { FbSearchService } from "./fbsearch.service";


export class InstagramApi {


    private static userInfoDB: Map<'userInfo', IUserInfo> = new Map();

    static async test() {
        try {
            const path = 'tmp/test.mp4'; //TODO
            const pic_path = 'tmp/grogu.jpg'; //TODO

            console.log('Start testing >>>>>>>>>>');

            await UserService.getUserInfo();
            await FbSearchService.searchMusic(' star boy')

            console.log('Test done >>>>>>>>>>>>>>>>>');
        } catch (error) {
            console.log(error);
        }
    }
}



/**
 * Take reference from instagram python lib
 * https://vscode.dev/github/adw0rd/instagrapi
 */

export * from './reel.service';
export * from './user.service';
export * from './fbsearch.service';
