import { IUserInfo } from "./interfaces/user-info.interface";
import { UserService } from "./user.service";
import { FbSearchService } from "./fbsearch.service";


/**
 * Take reference from instagram python lib
 * https://vscode.dev/github/adw0rd/instagrapi
 */
export class InstagramApiService {


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





