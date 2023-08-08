import fs from 'fs';
import mongoose from 'mongoose';
import { UserService, FbSearchService, ReelService } from '../../services/instagram-api';
import { FfmpegApiService } from '../../services/ffmpeg-api';
import { EnumAudioBitrate, EnumVideoFPS, EnumVideoSize, IFfmpegProgress } from '../../services/ffmpeg-api/ffmpeg-api.interface';
import { Utils, logs } from '../../shared/libs';
import { envConfigs } from '../../configs/env';
import { EnumImageSize, UnsplashService } from '../../services/unsplash';
import { CliProgressService } from '../../services/cli-progress';
import { ControllerAbstract } from '../shared';
import { ISongsLibrary, SongsLibrary } from '../database';


export class VideoGeneratorController extends ControllerAbstract {

    private static readonly USERNAME = envConfigs.USER_NAME;
    private static readonly CHANNEL_LOGO = `assets/images/logo.svg`;
    private static readonly TEMP_FOLDER = `temp`;
    private static readonly AUDIO_DURATION = 45;


    async run(): Promise<void> {
        await VideoGeneratorController.generateVideo();
    }


    private static async generateVideo() {

        try {

            // IMP: create temp folder or clean if already exist
            Utils.createFolder(VideoGeneratorController.TEMP_FOLDER);
            Utils.cleanFolder(VideoGeneratorController.TEMP_FOLDER);

            // IMP: call user info instagram API to update the cache 
            await UserService.getUserInfo();

            // get random song from DB which is not posted yet
            const songInfo: ISongsLibrary = await this.getRandomSong();

            // prepare video meta information
            const videoMetaInformation: IVideoMetaInformation = {
                songQuery: songInfo.search,
                caption: 'This is test caption'
                // query: 'love aaj kal'
                // query: 'hari aur main narci'
                // query: 'saiyyan'
            }

            // search music on instagram
            const searchedAudioData = await FbSearchService.searchMusic(videoMetaInformation.songQuery);

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
                    outputPath: `${VideoGeneratorController.TEMP_FOLDER}/${Date.now()}.mp3`,
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
                    outputPath: `${VideoGeneratorController.TEMP_FOLDER}/${Date.now()}.mp3`,
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
                const reelPaths: IReelPaths | null = await this.createVideo(reverbAudioPath, { title: audioItem.track.title, artist: audioItem.track.display_artist, thumbnailUrl: audioItem.track.cover_artwork_uri });
                if (reelPaths == null) {
                    console.log("Unable to create video");
                    Utils.cleanFolder(VideoGeneratorController.TEMP_FOLDER);
                    continue;
                }
                console.log("Video is created successfully!");

                // upload it in Instagram
                const uploadReelBar = CliProgressService.createProgress("Uploading reel..");
                const maxReelUploadProgress = 100;
                CliProgressService.start(uploadReelBar, maxReelUploadProgress, 0);
                await ReelService.uploadReel(reelPaths.videoPath, reelPaths.thumbnailPath, videoMetaInformation.caption)
                CliProgressService.stop(uploadReelBar, maxReelUploadProgress);
                console.log("Reel is uploaded successfully!");

                // clean tmp folder 
                console.log("Cleaning tmp folder...");
                Utils.cleanFolder(VideoGeneratorController.TEMP_FOLDER);

                // wait for random 10-15 random minutes to continue
                console.log("Video process is completed successfully!");
                await Utils.wait(10000);
            }

            // update song as posted in database
            const isSongUpdated = await this.updateSongAsPosted(songInfo._id);
            if (!isSongUpdated) throw new Error(`Unable to update song "${songInfo.search}"("${songInfo._id}") as posted`);

            logs.save(`✔\t Song uploaded as reel successfully, Song query "${songInfo.search}", Song ID "${songInfo._id}"`, true);
        } catch (error) {
            logs.save(`❌\t ${error?.message || error?.toString() || 'unknown error'}`, true);
        }
    }


    //** Create Video */
    private static async createVideo(audioPath: string, songInfo: { title: string, artist: string, thumbnailUrl: string }): Promise<IReelPaths | null> {
        try {

            // create variables
            const wallpaperKeyword = 'dark nature';
            const maxProgress = 100;

            // create progress bar
            const videoBar = CliProgressService.createProgress("Creating video");
            CliProgressService.start(videoBar, maxProgress, 0);

            // generate random image from unsplash
            const imageBuffer = await UnsplashService.getRandomWallpaper(wallpaperKeyword, EnumImageSize.P1080);
            const wallpaperFilePath = `${VideoGeneratorController.TEMP_FOLDER}/${Date.now()}.png`;
            fs.writeFileSync(wallpaperFilePath, imageBuffer);
            CliProgressService.update(videoBar, 10);

            // get colors of image and verify 
            const wallpaperColors = await UnsplashService.getImageColor(wallpaperFilePath);
            if (wallpaperColors.length == 0) throw new Error('Unable to extract colors');
            const logoPngPath = await this.generatePngLogo(wallpaperColors);
            CliProgressService.update(videoBar, 20);

            // create thumbnails
            const thumbnailPath: string = await FfmpegApiService.createThumbnail({
                outputPath: `${VideoGeneratorController.TEMP_FOLDER}/${Date.now()}.png`,
                imageUrl: songInfo.thumbnailUrl,
                imageSize: EnumVideoSize.P1080,
            }, () => { });
            CliProgressService.update(videoBar, 30);

            // get ffmpeg info and create video
            const audioInfo = await FfmpegApiService.getFfmpegInfo(audioPath);
            CliProgressService.update(videoBar, 70);
            const videoPath: string = await FfmpegApiService.createReel({
                outputPath: `${VideoGeneratorController.TEMP_FOLDER}/${Date.now()}.mp4`,
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
        const logoSvgPath = `${VideoGeneratorController.TEMP_FOLDER}/${Date.now()}.svg`;
        const svgString = fs.readFileSync(this.CHANNEL_LOGO, { encoding: 'utf-8' });
        const lightColor = UnsplashService.getLightestColor(imageColors);
        const darkColor = UnsplashService.getDarkestColor(imageColors);
        const preparedSvg = svgString
            .replace(/\[DARK_COLOR\]/g, darkColor)
            .replace(/\[LIGHT_COLOR\]/g, lightColor);
        fs.writeFileSync(logoSvgPath, preparedSvg);
        const logoPngPath = await FfmpegApiService.convertSvgToPng(logoSvgPath, `${VideoGeneratorController.TEMP_FOLDER}/${Date.now()}_svg.png`);
        fs.unlinkSync(logoSvgPath);
        return logoPngPath;
    }

    private static getTrimmedSec(timemark: string): number {
        return parseInt(timemark.split(':')[2]);
    }

    private static async getRandomSong(): Promise<ISongsLibrary> {
        const foundSongs: ISongsLibrary[] = await SongsLibrary.aggregate([
            { $match: { isPosted: false } },
            { $sample: { size: 1 } }
        ]);

        if (foundSongs.length === 0) throw new Error("No song available, Please add some songs into the Database.");
        return foundSongs[0];
    }

    private static async updateSongAsPosted(id: string): Promise<boolean> {
        const updateResponse = await SongsLibrary.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { isPosted: true } });
        return updateResponse.acknowledged;
    }
}


interface IVideoMetaInformation {
    songQuery: string;
    caption: string;
}

interface IReelPaths {
    videoPath: string;
    thumbnailPath: string;
}

