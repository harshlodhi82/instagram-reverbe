
export interface IColorData {
    hex: string;
    brightness: number;
    type: EnumColorType;
}

export interface IImageSize {
    width: number;
    height: number;
}

export enum EnumColorType {
    Dark = 'dark',
    Light = 'light',
}

export enum EnumImageSize {
    P360 = '360p',
    P720 = '720p',
    P1080 = '1080p',
}