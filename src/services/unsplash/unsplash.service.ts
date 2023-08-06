import fetch from 'node-fetch';
import sharp from 'sharp';
import { Utils } from '../../shared/libs';
import { EnumColorType, EnumImageSize, IColorData, IImageSize } from './unsplash.interface';


// docs: https://awik.io/generate-random-images-unsplash-without-using-api/
export class UnsplashService {

    private static readonly SEARCH_API = "https://source.unsplash.com/random/[WIDTH]x[HEIGHT]/?[KEYWORD]";
    private static readonly LIGHT_BRIGHTNESS = 55;
    private static readonly IMAGE_SIZE_CONFIG: Record<EnumImageSize, IImageSize> = {
        [EnumImageSize.P360]: { width: 360, height: 640 },
        [EnumImageSize.P720]: { width: 720, height: 1280 },
        [EnumImageSize.P1080]: { width: 1080, height: 1920 },
    }


    static async getRandomWallpaper(keyword: string, imageSize: EnumImageSize): Promise<Buffer> {
        const configs = this.IMAGE_SIZE_CONFIG[imageSize];
        const API = this.getPreparedApi(keyword, configs);
        const response = await fetch(API);
        const imageBuffer = await response.buffer();
        return imageBuffer;
    }

    static async getImageColor(imagePath: string): Promise<string[]> {
        const colorsArray: string[] = await new Promise((resolve, reject) => {

            sharp(imagePath).resize({ width: 100, withoutEnlargement: true }).raw().toBuffer((error, imageData, info) => {
                if (error) {
                    reject(error);
                    return;
                }
                const pixels: number = info.width * info.height;
                const colors: string[] = [];
                for (let i = 0; i < pixels; i++) {
                    const offset = i * 4;
                    const r = imageData[offset];
                    const g = imageData[offset + 1];
                    const b = imageData[offset + 2];

                    if (!r || !g || !b) break;

                    let hex = Utils.rgbToHex(r, g, b);
                    colors.push(hex);
                }
                resolve(colors);
                return;
            });
        });

        //find the best colors
        const bestColorCount: number = 2;
        const bestColorsSet: Set<string> = new Set();
        for (const color of colorsArray) {
            const colorCount: number = colorsArray.filter((c) => c === color).length;
            if (colorCount < bestColorCount) continue;
            bestColorsSet.add(color);
        }

        return Array.from(bestColorsSet);
    }

    static getLightestColor(colors: string[]): string {
        const colorsData = this.getColorsData(colors).sort((a, b) => {
            return (a.brightness > b.brightness) ? -1 : 1;
        });
        return colorsData[0].hex;
    }

    static getDarkestColor(colors: string[]): string {
        const colorsData = this.getColorsData(colors).sort((a, b) => {
            return (a.brightness > b.brightness) ? 1 : -1;
        });
        return colorsData[0].hex;
    }

    private static getPreparedApi(keyword: string, configs: IImageSize): string {
        return this.SEARCH_API
            .replace('[KEYWORD]', keyword)
            .replace('[WIDTH]', `${configs.width}`)
            .replace('[HEIGHT]', `${configs.height}`);
    }

    private static getColorsData(colors: string[]): IColorData[] {
        const colorsData: IColorData[] = [];
        for (const color of colors) {
            const brightness = Utils.getColorBrightness(color);
            const type = (brightness > this.LIGHT_BRIGHTNESS) ? EnumColorType.Light : EnumColorType.Dark;
            colorsData.push({
                hex: color,
                brightness: brightness,
                type: type
            })
        }
        return colorsData;
    }
}
