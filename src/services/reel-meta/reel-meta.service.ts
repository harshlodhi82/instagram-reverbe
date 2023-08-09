import { Utils } from "../../shared/libs";
import { DESCRIPTIONS } from "./configs/descriptions.config";
import { HASHTAGS } from "./configs/hashtags.config";


export class ReelMetaService {

    private static MAX_HASHTAGS: number = 5;

    static getDescription(): string {
        return Utils.getRandomArrayValue(DESCRIPTIONS);
    }

    static getHashtags(): string {
        const hashtags: string[] = Utils.getRandomArrayValues(HASHTAGS, this.MAX_HASHTAGS);
        const hashtagsString = hashtags.join(' ');
        return hashtagsString;
    }
}