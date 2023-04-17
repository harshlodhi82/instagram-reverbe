import { FfprobeFormat } from 'fluent-ffmpeg';


/**------------------------------------------------------
 * Enums
 */
export enum EnumVideoSize {
    P360 = '360p',
    P720 = '720p',
    P1080 = '1080p',
}

export enum EnumVideoFPS {
    FPS30 = 30,
    FPS60 = 60,
    FPS90 = 90,
}

export enum EnumAudioBitrate {
    Rate190 = 190,
    Rate192 = 192,
    Rate195 = 195,
}

export enum EnumCodecType {
    Video = 'video',
    Audio = 'audio'
}


/**------------------------------------------------------
 * Interfaces
 */
export interface ICreateHdReverbAudioParams {
    audioPath: string;
    bitrate: EnumAudioBitrate;
    metaData: IAudioMeta;
}

export interface IAudioMeta {
    durationSec: number;
    title: string;
    artist: string;
    publisher: string;
}

export interface IDownloadTrimmedAudioParams {
    audioStreamUrl: string;
    statTimeSec: number;
    durationSec: number;
    bitrate: EnumAudioBitrate;
}

export interface IContentInfo {
    imagePath: string;
    audioPath: string;
    circlePath: string;
    fontColor: string;
    audioWaveColor: string;
    videoSize: EnumVideoSize,
    videoFPS: EnumVideoFPS,
    audioInfo: FfprobeFormat,
    circleSize: number,
    circleRotateSpeed: number,
    metaData: IVideoMeta
}

export interface IImageInfo {
    imagePath: string;
    imageTitle: string;
    imageSize: EnumVideoSize,
    circlePath: string;
    circleSize: number,
    fontColor: string
}

export interface IVideoSize {
    width: number;
    height: number;
}

export interface IVideoEditorConfig {
    fontFile: string,
    headingSize: number,
    headingYOffset: number,
    titleSize: number,
    titleYOffset: number,
    vignetteYOffset: number,
    circleImgYOffset: number,
}

export interface IThumbnailEditorConfig {
    fontFile: string,
    headingText: string,
    headingSize: number,
    headingYOffset: number,
    titleSize: number,
    titleYOffset: number,
    vignetteYOffset: number,
    circleImgYOffset: number,
}

export interface IVideoMeta {
    title: string,
    thumbnailTitle: string,
    description: string,
    categoryId: string,
    playlistId: string | null,
    keywords: string[],
    channelName: string,
    channelLogo: string,
    bgImageKeyword: string,
}
