import fs from 'fs';
import uuid4 from "uuid4";
import { Utils } from "../../shared/libs";
import { EnumCodecType, FfmpegApiService } from "../ffmpeg-api";
import { InstagramRequestService } from "../instagram-request/instagram-request.service";
import { UserService } from './user.service';
import { IUserInfo } from './interfaces/user-info.interface';


export class ReelService {

    //** Upload reel */
    static async uploadReel(videoPath: string, thumbnailPath: string, caption: string) {

        //0 - basic configurations
        const uploadId: string = `${Date.now()}`;
        const uploadName: string = `${uploadId}_0_${Utils.getRandomNumber(1000000000, 9999999999)}`;

        //1 - upload video
        await this.uploadVideo(videoPath, uploadId, uploadName);
        await Utils.wait(5000);

        //2 - upload thumbnail -----------------------
        await this.uploadThumbnail(thumbnailPath, uploadId, uploadName);
        await Utils.wait(5000);

        //3 - configure reel
        await this.configureReel(caption, uploadId);
    }

    //** Upload video */
    private static async uploadVideo(videoPath: string, uploadId: string, uploadName: string): Promise<void> {

        //0 - prepare user info
        const userInfo: IUserInfo = UserService.getUserInfoFromCache();

        //1 - prepare video meta
        const videoFileInfo = await FfmpegApiService.getFfmpegInfo(videoPath);
        const videoInfo = videoFileInfo.streams.find(elm => elm.codec_type === EnumCodecType.Video);
        const videoSize = videoFileInfo.format.size;
        const videoData = fs.readFileSync(videoPath);
        const videoWidth = videoInfo.width;
        const videoHeight = videoInfo.height;
        const durationInMs = videoInfo.duration_ts;
        const videoWaterfallId = uuid4();

        //2 - prepare video params
        const rUploadVideoParams = {
            "is_clips_video": "1",
            "retry_context": '{"num_reupload":0,"num_step_auto_retry":0,"num_step_manual_retry":0}',
            "media_type": "2",
            "xsharing_user_ids": JSON.stringify([userInfo.data.user.id]),
            "upload_id": uploadId,
            "upload_media_duration_ms": `${durationInMs}`,
            "upload_media_width": `${videoWidth}`,
            "upload_media_height": `${videoHeight}`,
        }

        //3 - prepare headers
        const rUploadVideoHeaders = {
            "Accept-Encoding": "gzip",
            "X-Instagram-Rupload-Params": JSON.stringify(rUploadVideoParams),
            "X_FB_VIDEO_WATERFALL_ID": videoWaterfallId,
            "X-Entity-Type": "video/mp4",
            "Offset": "0",
            "X-Entity-Name": uploadName,
            "X-Entity-Length": `${videoSize}`,
            "Content-Type": "application/octet-stream",
            "Content-Length": `${videoSize}`,
        }

        //4 - call the API
        const rUploadVideoApi = `https://i.instagram.com/rupload_igvideo/${uploadName}`;
        const rUploadVideoRes = await InstagramRequestService.post(rUploadVideoApi, videoData, { headers: rUploadVideoHeaders });
        const _rUploadVideoData = await rUploadVideoRes.json();
    }

    //** Upload thumbnail */
    private static async uploadThumbnail(thumbnailPath: string, uploadId: string, uploadName: string): Promise<void> {

        //0 - prepare image meta
        const imageWaterfallId = uuid4();
        const imageFileInfo = await FfmpegApiService.getFfmpegInfo(thumbnailPath);
        const imageInfo = imageFileInfo.streams.find(elm => elm.codec_type === EnumCodecType.Video);
        const imageSize = imageFileInfo.format.size;
        const imageData = fs.readFileSync(thumbnailPath);
        const imageWidth = imageInfo.width;
        const imageHeight = imageInfo.height;

        //1 - prepare image params
        const rUploadImageParams = {
            "media_type": "2",
            "upload_id": uploadId,
            "upload_media_width": `${imageWidth}`,
            "upload_media_height": `${imageHeight}`,
        }

        //2 - prepare image headers
        const rUploadPhotoHeaders = {
            "Accept-Encoding": "gzip",
            "X-Instagram-Rupload-Params": JSON.stringify(rUploadImageParams),
            "X_FB_PHOTO_WATERFALL_ID": imageWaterfallId,
            "X-Entity-Type": "image/jpeg",
            "Offset": "0",
            "X-Entity-Name": uploadName,
            "X-Entity-Length": `${imageSize}`,
            "Content-Type": "image/jpeg",
            "Content-Length": `${imageSize}`,
        }

        //3 - call the API
        const rUploadPhotoApi = `https://i.instagram.com/rupload_igphoto/${uploadName}`;
        const rUploadPhotoRes = await InstagramRequestService.post(rUploadPhotoApi, imageData, { headers: rUploadPhotoHeaders });
        const _rUploadPhotoData = await rUploadPhotoRes.json();
    }

    //** Configure reel */
    private static async configureReel(caption: string, uploadId: string){
        
        //0 - prepare body
        const configureClipBody = {
            source_type: 'library',
            caption: caption,
            upload_id: uploadId,
            disable_comments: 0,
            like_and_view_counts_disabled: 0,
            igtv_share_preview_to_feed: 1,
            is_unified_video: 1,
            video_subtitles_enabled: 0,
            clips_share_preview_to_feed: 1,
            disable_oa_reuse: false,
            clips_uses_original_audio: 1,
            uses_original_audio: 1,
            original_audio: 1,
            audio: 1,
            clips_audio: 1,
            clips_with_audio: 1,
            with_audio: 1,
            enable_audio: 1,
            clips_enable_audio: 1,
            clips_audio_enable: 1,
            audio_enable: 1,
            audio_type: 'original_sounds',
        }

        //1 - create search params
        const searchParams = Utils.objectToSearchParams(configureClipBody);

        //2 - call the API
        const configureClipApi = `https://i.instagram.com/api/v1/media/configure_to_clips/`;
        const configureClipRes = await InstagramRequestService.post(configureClipApi, searchParams, { headers: { 'content-type': 'application/x-www-form-urlencoded' } });
        const _configureClipData = await configureClipRes.json();
    }
}