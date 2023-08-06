import fs from 'fs';
import { UserService, FbSearchService, ReelService } from '../../services/instagram-api';
import { FfmpegApiService } from '../../services/ffmpeg-api';
import { EnumAudioBitrate, EnumVideoFPS, EnumVideoSize, IFfmpegProgress } from '../../services/ffmpeg-api/ffmpeg-api.interface';
import { Utils } from '../../shared/libs';
import { envConfigs } from '../../configs/env';
import { EnumImageSize, UnsplashService } from '../../services/unsplash';
import { CliProgressService } from '../../services/cli-progress';


export class VideoGeneratorController {
    private static readonly USERNAME = envConfigs.USER_NAME;
    private static readonly CHANNEL_LOGO = `assets/images/logo.svg`;
    private static readonly AUDIO_DURATION = 45;


    static async generateVideo() {

        // prepare video data
        const videoInfo = {
            query: 'Safar',
            caption: 'This is test caption'
            // query: 'love aaj kal'
            // query: 'hari aur main narci'
            // query: 'saiyyan'
        }

        // IMP: call user info instagram API to update the cache 
        await UserService.getUserInfo();

        // search music on instagram
        const searchedAudioData = await FbSearchService.searchMusic(videoInfo.query);

        // verify music and it's time stamps if not valid than DO NOT CONTINUE!
        if (searchedAudioData.items.length === 0 && searchedAudioData.items[0].track.highlight_start_times_in_ms.length === 0) {
            throw new Error("No good formate found for the audio");
        }

        // loop over the time stamps 
        const audioItem = searchedAudioData.items[0];
        for (const highlightTimeMs of audioItem.track.highlight_start_times_in_ms) {

            // get stream url
            console.log("Video process is started!");
            const audioStreamUrl = audioItem.track.progressive_download_url;

            // create 30 sec audio
            const trimmedAudioBar = CliProgressService.createProgress("Creating Trim audio");
            CliProgressService.start(trimmedAudioBar, VideoGeneratorController.AUDIO_DURATION, 0);
            const audioPath: string = await FfmpegApiService.downloadTrimmedAudio({
                audioStreamUrl: audioStreamUrl,
                bitrate: EnumAudioBitrate.Rate192,
                durationSec: VideoGeneratorController.AUDIO_DURATION,
                statTimeSec: Utils.convertMsToSec(highlightTimeMs),
            }, (progress: IFfmpegProgress) => { CliProgressService.update(trimmedAudioBar, VideoGeneratorController.getTrimmedSec(progress.timemark)); });
            CliProgressService.stop(trimmedAudioBar, VideoGeneratorController.AUDIO_DURATION);

            // create audio file  of 30 sec from the timestamp
            const reverbAudioBar = CliProgressService.createProgress("Creating Reverb audio");
            CliProgressService.start(reverbAudioBar, VideoGeneratorController.AUDIO_DURATION, 0);
            const reverbAudioPath: string = await FfmpegApiService.createHdReverbAudio({
                audioPath: audioPath,
                bitrate: EnumAudioBitrate.Rate192,
                metaData: {
                    title: audioItem.track.title,
                    artist: audioItem.track.display_artist,
                    publisher: this.USERNAME,
                    durationSec: VideoGeneratorController.AUDIO_DURATION,
                },
            }, (progress) => { CliProgressService.update(reverbAudioBar, VideoGeneratorController.getTrimmedSec(progress.timemark)); });
            CliProgressService.stop(reverbAudioBar, VideoGeneratorController.AUDIO_DURATION);

            // create video for the audio file
            const reelPaths: IReelPaths | null = await this.createVideo(reverbAudioPath, { title: audioItem.track.title, artist: audioItem.track.display_artist });
            if (reelPaths == null) {
                console.log("Unable to create video");
                continue;
            }
            console.log("Video is created successfully!");

            // upload it in Instagram
            const uploadReelBar = CliProgressService.createProgress("Uploading reel..");
            const maxReelUploadProgress = 100;
            CliProgressService.start(uploadReelBar, maxReelUploadProgress, 0);
            await ReelService.uploadReel(reelPaths.videoPath, reelPaths.thumbnailPath, videoInfo.caption)
            CliProgressService.stop(uploadReelBar, maxReelUploadProgress);
            console.log("Reel is uploaded successfully!");

            // clean tmp folder 
            console.log("Cleaning tmp folder...");

            // wait for random 10-15 random minutes to continue
            console.log("Video process is completed successfully!");
        }
    }


    //** Create Video */
    private static async createVideo(audioPath: string, songInfo: { title: string, artist: string }): Promise<IReelPaths | null> {
        try {

            // create variables
            const wallpaperKeyword = 'dark nature';
            const maxProgress = 100;

            // create progress bar
            const videoBar = CliProgressService.createProgress("Creating video");
            CliProgressService.start(videoBar, maxProgress, 0);

            // generate random image from unsplash
            const imageBuffer = await UnsplashService.getRandomWallpaper(wallpaperKeyword, EnumImageSize.P1080);
            const wallpaperFilePath = `tmp/${Date.now()}.png`;
            fs.writeFileSync(wallpaperFilePath, imageBuffer);
            CliProgressService.update(videoBar, 10);

            // get colors of image and verify 
            const wallpaperColors = await UnsplashService.getImageColor(wallpaperFilePath);
            if (wallpaperColors.length == 0) throw new Error('Unable to extract colors');
            const logoPngPath = await this.generatePngLogo(wallpaperColors);
            CliProgressService.update(videoBar, 20);

            // create thumbnails
            const thumbnailPath: string = await FfmpegApiService.createThumbnail({
                imagePath: wallpaperFilePath,
                imageTitle: 'Hell Tets',
                imageSize: EnumVideoSize.P1080,
                logoPath: logoPngPath,
                logoSize: 300,
                fontColor: UnsplashService.getLightestColor(wallpaperColors)
            }, () => { });
            CliProgressService.update(videoBar, 30);

            // get ffmpeg info and create video
            const audioInfo = await FfmpegApiService.getFfmpegInfo(audioPath);
            CliProgressService.update(videoBar, 70);
            const videoPath: string = await FfmpegApiService.createReel({
                imagePath: wallpaperFilePath,
                audioPath: audioPath,
                circlePath: logoPngPath,
                fontColor: UnsplashService.getLightestColor(wallpaperColors),
                audioWaveColor: UnsplashService.getLightestColor(wallpaperColors),
                videoSize: EnumVideoSize.P1080,
                videoFPS: EnumVideoFPS.FPS90,
                durationSec: audioInfo.format.duration,
                circleSize: 400,
                circleRotateSpeed: 0.5,
                metaData: {
                    artist: songInfo.artist,
                    title: songInfo.title,
                    author: this.USERNAME,
                    track: songInfo.title,
                    description: songInfo.title
                }
            }, (progress: IFfmpegProgress) => {
                // FORMULA =>  progressPercent = current seconds value * required percentage / video duration
                const progressPercent = (VideoGeneratorController.getTrimmedSec(progress.timemark) * 30) / audioInfo.format.duration;
                CliProgressService.update(videoBar, 70 + progressPercent);
            });
            CliProgressService.stop(videoBar, maxProgress);

            // return video path
            const reelPaths: IReelPaths = {
                videoPath: videoPath,
                thumbnailPath: thumbnailPath
            }
            return reelPaths;
        } catch (error) {
            console.log('\n');
            console.error(error);
            return null;
        }
    }


    //** Generate Logo using background image colors */
    private static async generatePngLogo(imageColors: string[]): Promise<string> {
        const logoSvgPath = `tmp/${Date.now()}.svg`;
        const svgString = fs.readFileSync(this.CHANNEL_LOGO, { encoding: 'utf-8' });
        const lightColor = UnsplashService.getLightestColor(imageColors);
        const darkColor = UnsplashService.getDarkestColor(imageColors);
        const preparedSvg = svgString
            .replace(/\[DARK_COLOR\]/g, darkColor)
            .replace(/\[LIGHT_COLOR\]/g, lightColor);
        fs.writeFileSync(logoSvgPath, preparedSvg);
        const logoPngPath = await FfmpegApiService.convertSvgToPng(logoSvgPath);
        fs.unlinkSync(logoSvgPath);
        return logoPngPath;
    }

    private static getTrimmedSec(timemark: string): number {
        return parseInt(timemark.split(':')[2]);
    }
}

interface IReelPaths {
    videoPath: string;
    thumbnailPath: string;
}

