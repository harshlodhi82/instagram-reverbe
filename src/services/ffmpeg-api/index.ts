import sharp from 'sharp';
import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';
import { EnumVideoSize, IAudioContentInfo, IContentInfo, IImageInfo, IThumbnailEditorConfig, IVideoEditorConfig, IVideoSize, EnumCodecType } from './interfaces/ffmpeg-api.interface';


class FfmpegApi {

    private static readonly TMP_PATH: string = 'tmp';
    private static readonly REVERB_AUDIO_FILE: string = `assets/music/reverb/50_IR_White_Noise.wav`;
    private static readonly VIDEO_SIZE_CONFIG: Record<EnumVideoSize, IVideoSize> = {
        [EnumVideoSize.P360]: { width: 640, height: 360 },
        [EnumVideoSize.P720]: { width: 1280, height: 720 },
        [EnumVideoSize.P1080]: { width: 1920, height: 1080 },
    }
    private static readonly VIDEO_EDITOR_CONFIG: IVideoEditorConfig = {
        fontFile: `assets/fonts/Staatliches-Regular.ttf`,
        headingSize: 40,
        headingYOffset: 250,
        titleSize: 80,
        titleYOffset: 125,
        vignetteYOffset: 75,
        circleImgYOffset: 250,
    }
    private static readonly THUMBNAIL_EDITOR_CONFIG: IThumbnailEditorConfig = {
        fontFile: `assets/fonts/Staatliches-Regular.ttf`,
        headingText: `Slow + Reverb`,
        headingSize: 60,
        headingYOffset: 250,
        titleSize: 120,
        titleYOffset: 100,
        vignetteYOffset: 80,
        circleImgYOffset: 250,
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
    static convertSvgToPng(svgPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const outputFilePath = `tmp/${Date.now()}_svg.png`;
            sharp(svgPath).png().toFile(outputFilePath).then(function (info) {
                resolve(outputFilePath);
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    //** Create HD thumbnail */
    static createThumbnail(imageInfo: IImageInfo, progressHandler: (progress: any) => void): Promise<string> {
        return new Promise((resolve, reject) => {
            const outputVideoFilePath = `tmp/${Date.now()}.png`;
            const imageSizeConfig = this.VIDEO_SIZE_CONFIG[imageInfo.imageSize];
            const circleCenterX = (imageSizeConfig.width - imageInfo.circleSize) / 2;
            const circleCenterY = (imageSizeConfig.height - imageInfo.circleSize - this.THUMBNAIL_EDITOR_CONFIG.circleImgYOffset) / 2;

            ffmpeg()

                //add audio
                .input(imageInfo.imagePath)

                .input(imageInfo.circlePath)

                //add complex filters
                .complexFilter([
                    {
                        inputs: '[0]',
                        filter: 'crop',
                        options: { 'out_h': 'in_w/16*9' },
                        outputs: '[img_crop]'
                    },
                    {
                        inputs: '[img_crop]',
                        filter: 'scale',
                        options: { 'w': `${imageSizeConfig.width}`, 'h': `${imageSizeConfig.height}` },
                        outputs: '[img_scale]'
                    },
                    {
                        inputs: '[img_scale]',
                        filter: 'vignette',
                        options: { 'a': `PI/2.8`, 'x0': 'w/2', 'y0': `${this.THUMBNAIL_EDITOR_CONFIG.vignetteYOffset}` },
                        outputs: '[img_vignette]'
                    },
                    {
                        inputs: '[1]',
                        filter: 'scale',
                        options: { 'w': `${imageInfo.circleSize}`, 'h': `${imageInfo.circleSize}` },
                        outputs: '[circle_scale]'
                    },
                    {
                        inputs: '[img_vignette][circle_scale]',
                        filter: 'overlay',
                        options: { 'x': `${circleCenterX}`, 'y': `${circleCenterY}` },
                        outputs: '[final_img]'
                    },
                    {
                        inputs: '[final_img]',
                        filter: 'drawtext',
                        options: {
                            'fontfile': `${this.THUMBNAIL_EDITOR_CONFIG.fontFile}`,
                            'text': this.THUMBNAIL_EDITOR_CONFIG.headingText,
                            'fontcolor': `${imageInfo.fontColor}`,
                            'fontsize': `${this.THUMBNAIL_EDITOR_CONFIG.headingSize}`,
                            'x': `(w-text_w)/2`,
                            'y': `(h-text_h-${this.THUMBNAIL_EDITOR_CONFIG.headingYOffset})`
                        },
                        outputs: '[final_img_with_heading]'
                    },
                    {
                        inputs: '[final_img_with_heading]',
                        filter: 'drawtext',
                        options: {
                            'fontfile': `${this.THUMBNAIL_EDITOR_CONFIG.fontFile}`,
                            'text': imageInfo.imageTitle,
                            'fontcolor': `${imageInfo.fontColor}`,
                            'fontsize': `${this.THUMBNAIL_EDITOR_CONFIG.titleSize}`,
                            'x': `(w-text_w)/2`,
                            'y': `(h-text_h-${this.THUMBNAIL_EDITOR_CONFIG.titleYOffset})`
                        },
                    },
                ])

                //output video file
                .output(outputVideoFilePath)

                //handlers
                .on('error', (err) => { reject(err); })
                .on('end', () => { resolve(outputVideoFilePath); })
                .on('progress', progressHandler)

                //run
                .run();
        });
    }

    //** Create video */
    static createVideo(contentInfo: IContentInfo, progressHandler: (progress: any) => void): Promise<string> {
        return new Promise((resolve, reject) => {

            // configs
            const outputVideoFilePath = `tmp/${Date.now()}.mp4`;
            const videoSizeConfig = this.VIDEO_SIZE_CONFIG[contentInfo.videoSize];
            const audioWavePosition = videoSizeConfig.height / 2;
            const circleCenterX = (videoSizeConfig.width - contentInfo.circleSize) / 2;
            const circleCenterY = (videoSizeConfig.height - contentInfo.circleSize - this.VIDEO_EDITOR_CONFIG.circleImgYOffset) / 2;

            ffmpeg()

                //add image with loop till audio duration
                .input(contentInfo.imagePath)
                .loop(contentInfo.audioInfo.duration) // in Seconds

                .input(contentInfo.circlePath)
                .loop(contentInfo.audioInfo.duration) // in Seconds

                //add audio
                .input(contentInfo.audioPath)

                //add complex filters
                .complexFilter([
                    {
                        inputs: '[0]',
                        filter: 'crop',
                        options: { 'out_h': 'in_w/16*9' },
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
                        options: { 'w': `${contentInfo.circleSize}`, 'h': `${contentInfo.circleSize}` },
                        outputs: '[circle_scale]'
                    },
                    {
                        inputs: '[circle_scale]',
                        filter: 'rotate',
                        options: { 'a': `${contentInfo.circleRotateSpeed}*PI*t/2`, 'c': `none` },
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
                            'text': contentInfo.metaData.channelName,
                            'fontcolor': `${contentInfo.fontColor}`,
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
                            'text': contentInfo.metaData.thumbnailTitle,
                            'fontcolor': `${contentInfo.fontColor}`,
                            'fontsize': `${this.VIDEO_EDITOR_CONFIG.titleSize}`,
                            'x': `(w-text_w)/2`,
                            'y': `(h-text_h-${this.VIDEO_EDITOR_CONFIG.titleYOffset})`
                        },
                        outputs: '[final_img_with_title]'
                    },
                    {
                        inputs: '[2]',
                        filter: 'showwaves',
                        options: {
                            's': `${videoSizeConfig.width}x${videoSizeConfig.height}`,
                            'mode': `line`,
                            'rate': `${contentInfo.videoFPS}`,
                            'draw': `full`,
                            'colors': `${contentInfo.audioWaveColor}|${contentInfo.audioWaveColor}`
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
                        inputs: '[final_img_with_title][opacity_audio_waves]',
                        filter: 'overlay',
                        options: { 'x': '0', 'y': `${audioWavePosition}` },
                    },
                ])

                //set fps
                .fps(contentInfo.videoFPS)

                // add output metadata
                .outputOption('-metadata', `title=${contentInfo.metaData.title}`)
                .outputOption('-metadata', `author=${contentInfo.metaData.channelName}`)
                .outputOption('-metadata', `album_artist=${contentInfo.metaData.channelName}`)
                .outputOption('-metadata', `track=${contentInfo.metaData.title}`)
                .outputOption('-metadata', `description=${contentInfo.metaData.title}`)

                //output video file
                .output(outputVideoFilePath)

                //handlers
                .on('error', (err) => { reject(err); })
                .on('end', () => { resolve(outputVideoFilePath); })
                .on('progress', progressHandler)

                //run
                .run();
        });
    }

    //** Create HD audio */
    static createHdAudio(audioInfo: IAudioContentInfo, progressHandler: (progress: any) => void): Promise<string> {
        return new Promise((resolve, reject) => {
            const outputVideoFilePath = `tmp/${Date.now()}.mp3`;

            ffmpeg()

                //add audio
                .input(audioInfo.audioPath)

                //add reverb audio
                .input(this.REVERB_AUDIO_FILE)

                // enhance audio
                .audioCodec('libmp3lame')
                .audioBitrate(audioInfo.bitrate)

                //add complex filters
                .complexFilter([
                    {
                        inputs: '[0]',
                        filter: 'asetrate',
                        options: { 'r': '37485' },      // 37485 is the 85% of 44100 (original speed)
                        // options: { 'r': '36603' },   // 36603 is the 83% of 44100 (original speed)
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
                        filter: 'asetrate',
                        options: { 'r': '37485' },      // 37485 is the 85% of 44100 (original speed)
                        // options: { 'r': '36603' },   // 36603 is the 83% of 44100 (original speed)
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
                        options: { 'volume': '0.8' },
                        outputs: '[low_volume]'
                    },
                    {
                        inputs: '[low_volume]',
                        filter: 'firequalizer',
                        options: { 'gain_entry': 'entry(0, -5);entry(250,-2.5);entry(1000,0);entry(4000, -2.5);entry(16000,-5)' },
                    },
                ])

                //add output metadata
                .outputOption('-metadata', `title=${audioInfo.metaData.title}`)
                .outputOption('-metadata', `artist=${audioInfo.metaData.channelName}`)
                .outputOption('-metadata', `publisher=${audioInfo.metaData.channelName}`)

                //output audio file
                .output(outputVideoFilePath)

                //handlers
                .on('error', (err) => { reject(err); })
                .on('end', () => { resolve(outputVideoFilePath); })
                .on('progress', progressHandler)

                //run
                .run();
        });
    }
}

export { EnumCodecType, FfmpegApi }
