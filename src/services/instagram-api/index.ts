import { InstagramRequest } from '../instagram-request';


export class InstagramApi {

    static async test(){
        try {
            let res= await InstagramRequest.get('https://www.instagram.com/api/v1/friendships/53711034419/followers/?count=12');
            let data = await res.json()
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }
}
