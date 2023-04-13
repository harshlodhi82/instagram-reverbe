import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';


export class FfmpegApi {

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
}


export enum EnumCodecType {
    Video = 'video',
    Audio = 'audio'
}
