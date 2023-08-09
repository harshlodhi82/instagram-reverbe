import { envConfigs } from "../../configs/env";
import { Utils } from "../../shared/libs";
import { InstagramRequestService } from "../instagram-request/instagram-request.service";
import { IPosCommentResponse, IUserInfo } from "./interfaces/user-info.interface";

export class UserService {

    private static userInfoDB: Map<'userInfo', IUserInfo> = new Map();
    private static username = envConfigs.USER_NAME;

    static getUserInfoFromCache(): IUserInfo {
        const userInfo = this.userInfoDB.get('userInfo');
        if (!userInfo) throw new Error("FATAL_ERROR: User Info is not available in cache, please call getUserInfo 1st.");
        return userInfo;
    }

    static async getUserInfo(): Promise<IUserInfo> {
        try {
            const api = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${this.username}`;
            const response = await InstagramRequestService.get(api);
            const data: IUserInfo = await response.json();
            this.userInfoDB.set('userInfo', data);
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async postComment(postId: string, comment: string): Promise<boolean> {

        // prepare API
        const api = `https://www.instagram.com/api/v1/web/comments/${postId}/add/`;

        // prepare body
        const postCommentBody = {
            comment_text: comment
        }

        // create search params
        const searchParams = Utils.objectToSearchParams(postCommentBody);

        //call the API
        const response = await InstagramRequestService.post(api, searchParams, { headers: { 'content-type': 'application/x-www-form-urlencoded' } });
        const data: IPosCommentResponse = await response.json();

        // verify response
        if (data.status !== "ok") return false;
        return true;
    }
}