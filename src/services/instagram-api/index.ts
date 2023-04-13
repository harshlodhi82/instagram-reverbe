import { IUserInfo } from "./interfaces/user-info.interface";
import { ReelService } from "./reel.service";
import { UserService } from "./user.service";


export class InstagramApi {
    /**
     * Take reference from instagram python lib
     * https://vscode.dev/github/adw0rd/instagrapi
     */

    private static userInfoDB: Map<'userInfo', IUserInfo> = new Map(); 

    static async test(){
        try {
            const path = 'tmp/test.mp4'; //TODO
            const pic_path = 'tmp/grogu.jpg'; //TODO

            console.log('Start uploading reel >>>>>>>>>>');

            await UserService.getUserInfo();
            await ReelService.uploadReel(path, pic_path, 'this is test by bot army');

            console.log('Reel uploaded >>>>>>>>>>>>>>>>>');
        } catch (error) {
            console.log(error);
        }
    }
}


export * from './reel.service';
export * from './user.service';
