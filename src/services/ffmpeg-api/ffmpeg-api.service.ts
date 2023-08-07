import sharp from 'sharp';
import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';
import { EnumVideoSize, IThumbnailEditorConfig, IVideoEditorConfig, IResolution, EnumCodecType, IDownloadTrimmedAudioParams, ICreateHdReverbAudioParams, EnumThumbnailSize, ICreateThumbnailParams, ICreateReelParams, IAudioEditorConfig } from './ffmpeg-api.interface';
import { Utils } from '../../shared/libs';


export class FfmpegApiService {

    private static readonly REVERB_AUDIO_FILE: string = `assets/music/reverb/50_IR_White_Noise.wav`;
    private static readonly VIDEO_SIZE_CONFIG: Record<EnumVideoSize, IResolution> = {
        [EnumVideoSize.P360]: { width: 360, height: 640 },
        [EnumVideoSize.P720]: { width: 720, height: 1280 },
        [EnumVideoSize.P1080]: { width: 1080, height: 1920 },
    }
    private static readonly THUMBNAIL_SIZE_CONFIG: Record<EnumThumbnailSize, IResolution> = {
        [EnumThumbnailSize.P360]: { width: 360, height: 360 },
        [EnumThumbnailSize.P720]: { width: 720, height: 720 },
        [EnumThumbnailSize.P1080]: { width: 1080, height: 1080 },
    }
    private static readonly VIDEO_EDITOR_CONFIG: IVideoEditorConfig = {
        fontFile: `assets/fonts/Staatliches-Regular.ttf`,
        usernameSize: 35,
        usernameYOffset: 1150,
        headingText: 'Slowed + Reverb',
        headingSize: 50,
        headingYOffset: 800,
        songTitleSize: 95,
        songTitleYOffset: 650,
        songTitleTextMaxLength: 20,
        artistSize: 50,
        artistYOffset: 520,
        artistTextMaxLength: 30,
        vignetteYOffset: 75,
        circleImgYOffset: 1000,
        audioWaveHeightOffset: 1000,
        audioWavePositionOffset: 700,
    }
    private static readonly THUMBNAIL_EDITOR_CONFIG: IThumbnailEditorConfig = {
        fontFile: `assets/fonts/Staatliches-Regular.ttf`,
        headingText: `Slowed + Reverb`,
        headingSize: 60,
        headingYOffset: 250,
        titleSize: 120,
        titleYOffset: 100,
        vignetteYOffset: 80,
        circleImgYOffset: 250,
    }
    private static readonly AUDIO_EDITOR_CONFIG: IAudioEditorConfig = {
        fadeDurationSec: 1,
        audioCodec: 'libmp3lame',
        slowedAsetrate: 37485,      // 37485 is the 85% of 44100 (original speed)
        // slowedAsetrate: 36603,   // 36603 is the 83% of 44100 (original speed)
        volume: 0.9,
    }


    //** Get ffmpeg info of file */
    static getFfmpegInfo(filePath: string): Promise<FfprobeData> {
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(filePath)
                .ffprobe((error, data) => {
                    if (error) return reject(error);
                    return resolve(data);
                });
        });
    }

    
    //** Convert SVG to PNG */
    static convertSvgToPng(svgPath: string, outputPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            sharp(svgPath).png().toFile(outputPath).then(function (info) {
                resolve(outputPath);
            }).catch(function (error) {
                reject(error);
            });
        });
    }


    //** Create HD thumbnail */
    static createThumbnail(params: ICreateThumbnailParams, progressHandler: (progress: any) => void): Promise<string> {
        return new Promise((resolve, reject) => {
            const imageSizeConfig = this.THUMBNAIL_SIZE_CONFIG[params.imageSize];

            ffmpeg()

                //add image
                .input(params.imageUrl)

                //add complex filters
                .complexFilter([
                    {
                        inputs: '[0]',
                        filter: 'scale',
                        options: { 'w': `${imageSizeConfig.width}`, 'h': `${imageSizeConfig.height}` },
                    },
                ])

                //output image file
                .output(params.outputPath)

                //handlers
                .on('error', (err) => { reject(err); })
                .on('end', () => { resolve(params.outputPath); })
                .on('progress', progressHandler)

                //run
                .run();
        });
    }


    //** Create video */
    static createReel(params: ICreateReelParams, progressHandler: (progress: any) => void): Promise<string> {
        return new Promise((resolve, reject) => {

            // configs
            const videoSizeConfig = this.VIDEO_SIZE_CONFIG[params.videoSize];
            const audioWaveHeight = videoSizeConfig.height + this.VIDEO_EDITOR_CONFIG.audioWaveHeightOffset;
            const audioWavePosition = (videoSizeConfig.height / 2) - this.VIDEO_EDITOR_CONFIG.audioWavePositionOffset;
            const circleCenterX = (videoSizeConfig.width - params.circleSize) / 2;
            const circleCenterY = (videoSizeConfig.height - params.circleSize - this.VIDEO_EDITOR_CONFIG.circleImgYOffset) / 2;
            
            ffmpeg()

                //add image with loop till audio duration
                .input(params.imagePath)
                .loop(params.durationSec) // in Seconds

                .input(params.circlePath)
                .loop(params.durationSec) // in Seconds

                //add audio
                .input(params.audioPath)

                //add complex filters
                .complexFilter([
                     {
                        inputs: '[0]',
                        filter: 'crop',
                        options: { 'w': `${videoSizeConfig.width}`, 'h': `${videoSizeConfig.height}` },
                        outputs: '[bg_crop]'
                    },
                    {
                        inputs: '[bg_crop]',
                        filter: 'scale',
                        options: { 'w': `${videoSizeConfig.width}`, 'h': `${videoSizeConfig.height}` },
                        outputs: '[bg_scale]'
                    },
                    {
                        inputs: '[bg_scale]',
                        filter: 'vignette',
                        options: { 'a': `PI/2.8`, 'x0': `w/2`, 'y0': `${this.VIDEO_EDITOR_CONFIG.vignetteYOffset}` },
                        outputs: '[bg_vignette]'
                    },
                    {
                        inputs: '[1]',
                        filter: 'scale',
                        options: { 'w': `${params.circleSize}`, 'h': `${params.circleSize}` },
                        outputs: '[circle_scale]'
                    },
                    {
                        inputs: '[circle_scale]',
                        filter: 'rotate',
                        options: { 'a': `${params.circleRotateSpeed}*PI*t/2`, 'c': `none` },
                        outputs: '[circle_rotate]'
                    },
                    {
                        inputs: '[bg_vignette][circle_rotate]',
                        filter: 'overlay',
                        options: { 'x': `${circleCenterX}`, 'y': `${circleCenterY}` },
                        outputs: '[bg_with_circle]'
                    },
                    {
                        inputs: '[bg_with_circle]',
                        filter: 'drawtext',
                        options: {
                            'fontfile': `${this.VIDEO_EDITOR_CONFIG.fontFile}`,
                            'text': `@${params.metaData.author}`,
                            'fontcolor': `${params.fontColor}`,
                            'fontsize': `${this.VIDEO_EDITOR_CONFIG.usernameSize}`,
                            'x': `(w-text_w)/2`,
                            'y': `(h-text_h-${this.VIDEO_EDITOR_CONFIG.usernameYOffset})`
                        },
                        outputs: '[final_img_with_username]'
                    },
                    {
                        inputs: '[final_img_with_username]',
                        filter: 'drawtext',
                        options: {
                            'fontfile': `${this.VIDEO_EDITOR_CONFIG.fontFile}`,
                            'text': this.VIDEO_EDITOR_CONFIG.headingText,
                            'fontcolor': `${params.fontColor}`,
                            'fontsize': `${this.VIDEO_EDITOR_CONFIG.headingSize}`,
                            'x': `(w-text_w)/2`,
                            'y': `(h-text_h-${this.VIDEO_EDITOR_CONFIG.headingYOffset})`
                        },
                        outputs: '[final_img_with_heading]'
                    },
                    {
                        inputs: '[final_img_with_heading]',
                        filter: 'drawtext',
                        options: {
                            'fontfile': `${this.VIDEO_EDITOR_CONFIG.fontFile}`,
                            'text': Utils.shortStringLength(params.metaData.title, this.VIDEO_EDITOR_CONFIG.songTitleTextMaxLength),
                            'fontcolor': `${params.fontColor}`,
                            'fontsize': `${this.VIDEO_EDITOR_CONFIG.songTitleSize}`,
                            'x': `(w-text_w)/2`,
                            'y': `(h-text_h-${this.VIDEO_EDITOR_CONFIG.songTitleYOffset})`
                        },
                        outputs: '[final_img_with_song_title]'
                    },
                    {
                        inputs: '[final_img_with_song_title]',
                        filter: 'drawtext',
                        options: {
                            'fontfile': `${this.VIDEO_EDITOR_CONFIG.fontFile}`,
                            'text': Utils.shortStringLength(`by ${params.metaData.artist}`, this.VIDEO_EDITOR_CONFIG.artistTextMaxLength),
                            'fontcolor': `${params.fontColor}`,
                            'fontsize': `${this.VIDEO_EDITOR_CONFIG.artistSize}`,
                            'x': `(w-text_w)/2`,
                            'y': `(h-text_h-${this.VIDEO_EDITOR_CONFIG.artistYOffset})`
                        },
                        outputs: '[final_img_with_song_artist]'
                    },
                    {
                        inputs: '[2]',
                        filter: 'showwaves',
                        options: {
                            's': `${videoSizeConfig.width}x${audioWaveHeight}`,
                            'mode': `line`,
                            'rate': `${params.videoFPS}`,
                            'draw': `full`,
                            'colors': `${params.audioWaveColor}|${params.audioWaveColor}`
                        },
                        outputs: '[audio_waves]'
                    },
                    {
                        inputs: '[audio_waves]',
                        filter: 'geq',
                        options: { 'r': 'r(X,Y)', 'a': '0.6*alpha(X,Y)' },
                        outputs: '[opacity_audio_waves]'
                    },
                    {
                        inputs: '[final_img_with_song_artist][opacity_audio_waves]',
                        filter: 'overlay',
                        options: { 'x': '0', 'y': `${audioWavePosition}` },
                    },
                ])

                //set fps
                .fps(params.videoFPS)

                // add output metadata
                .outputOption('-metadata', `title=${params.metaData.title}`)
                .outputOption('-metadata', `author=${params.metaData.author}`)
                .outputOption('-metadata', `album_artist=${params.metaData.artist}`)
                .outputOption('-metadata', `track=${params.metaData.track}`)
                .outputOption('-metadata', `description=${params.metaData.description}`)

                //output video file
                .output(params.outputPath)

                //handlers
                .on('error', (err) => { reject(err); })
                .on('end', () => { resolve(params.outputPath); })
                .on('progress', progressHandler)

                //run
                .run();
        });
    }


    //** Create HD audio */
    static createHdReverbAudio(params: ICreateHdReverbAudioParams, progressHandler: (progress: any) => void): Promise<string> {
        return new Promise((resolve, reject) => {

            ffmpeg()

                //add audio
                .input(params.audioPath)

                //add reverb audio
                .input(this.REVERB_AUDIO_FILE)

                //enhance audio
                .audioCodec(this.AUDIO_EDITOR_CONFIG.audioCodec)
                .audioBitrate(params.bitrate)

                //add complex filters
                .complexFilter([
                    {
                        inputs: '[0]',
                        filter: 'afade',
                        options: { 'type': 'in', 'start_time': '0', 'duration': this.AUDIO_EDITOR_CONFIG.fadeDurationSec },
                        outputs: '[fade_in]'
                    },
                    {
                        inputs: '[fade_in]',
                        filter: 'afade',
                        options: { 'type': 'out', 'start_time': `${params.metaData.durationSec - this.AUDIO_EDITOR_CONFIG.fadeDurationSec}`, 'duration': this.AUDIO_EDITOR_CONFIG.fadeDurationSec },
                        outputs: '[fade_out]'
                    },
                    {
                        inputs: '[fade_out]',
                        filter: 'asetrate',
                        options: { 'r': `${this.AUDIO_EDITOR_CONFIG.slowedAsetrate}` },      // 37485 is the 85% of 44100 (original speed)
                        outputs: '[slowed]'
                    },
                    {
                        inputs: '[slowed][1]',
                        filter: 'afir',
                        options: { 'dry': '10', 'wet': '10' },
                        outputs: '[reverb]'
                    },
                    {
                        inputs: '[0]',
                        filter: 'afade',
                        options: { 'type': 'in', 'start_time': '0', 'duration': this.AUDIO_EDITOR_CONFIG.fadeDurationSec },
                        outputs: '[fade_in_two]'
                    },
                    {
                        inputs: '[fade_in_two]',
                        filter: 'afade',
                        options: { 'type': 'out', 'start_time': `${params.metaData.durationSec - this.AUDIO_EDITOR_CONFIG.fadeDurationSec}`, 'duration': this.AUDIO_EDITOR_CONFIG.fadeDurationSec },
                        outputs: '[fade_out_two]'
                    },
                    {
                        inputs: '[fade_out_two]',
                        filter: 'asetrate',
                        options: { 'r': `${this.AUDIO_EDITOR_CONFIG.slowedAsetrate}` },      // 37485 is the 85% of 44100 (original speed)
                        outputs: '[slowed_two]'
                    },
                    {
                        inputs: '[slowed_two][reverb]',
                        filter: 'amix',
                        options: { 'inputs': '2', 'weights': '10 4' },
                        outputs: '[mixed]'
                    },
                    {
                        inputs: '[mixed]',
                        filter: 'volume',
                        options: { 'volume': `${this.AUDIO_EDITOR_CONFIG.volume}` },
                        outputs: '[low_volume]'
                    },
                    {
                        inputs: '[low_volume]',
                        filter: 'firequalizer',
                        options: { 'gain_entry': 'entry(0, -5);entry(250,-2.5);entry(1000,0);entry(4000, -2.5);entry(16000,-5)' },
                    },
                ])

                //add output metadata
                .outputOption('-metadata', `title=${params.metaData.title}`)
                .outputOption('-metadata', `artist=${params.metaData.artist}`)
                .outputOption('-metadata', `publisher=${params.metaData.publisher}`)

                //output audio file
                .output(params.outputPath)

                //handlers
                .on('error', (err) => { reject(err); })
                .on('end', () => { resolve(params.outputPath); })
                .on('progress', progressHandler)

                //run
                .run();
        });
    }


    //** Download and Trim Audio From stream url */
    static downloadTrimmedAudio(params: IDownloadTrimmedAudioParams, progressHandler: (progress: any) => void): Promise<string> {
        return new Promise((resolve, reject) => {

            ffmpeg()

                //add audio
                .input(params.audioStreamUrl)

                //enhance audio
                .audioCodec('libmp3lame')
                .audioBitrate(params.bitrate)

                //trim audio
                .setStartTime(params.statTimeSec)
                .setDuration(params.durationSec)

                //output audio file
                .output(params.outputPath)

                //handlers
                .on('error', (err) => { reject(err); })
                .on('end', () => { resolve(params.outputPath); })
                .on('progress', progressHandler)

                //run
                .run();
        });
    }
}
