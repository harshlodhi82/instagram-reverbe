import fs from 'fs';
import fetch from 'node-fetch';
import { extractColors } from 'extract-colors';
import { Utils } from '../../shared/libs';
import { EnumColorType, EnumImageSize, IColorData, IImageSize } from './interfaces/unsplash.interface';


// docs: https://awik.io/generate-random-images-unsplash-without-using-api/
class Unsplash {

    private static readonly SEARCH_API = "https://source.unsplash.com/random/[WIDTH]x[HEIGHT]/?[KEYWORD]";
    private static readonly LIGHT_BRIGHTNESS = 55;
    private static readonly IMAGE_SIZE_CONFIG: Record<EnumImageSize, IImageSize> = {
        [EnumImageSize.P360]: { width: 640, height: 360 },
        [EnumImageSize.P720]: { width: 1280, height: 720 },
        [EnumImageSize.P1080]: { width: 1920, height: 1080 },
    }
    

    static async getRandomWallpaper(keyword: string, imageSize: EnumImageSize): Promise<Buffer> {
        const configs = this.IMAGE_SIZE_CONFIG[imageSize];
        const API = this.getPreparedApi(keyword, configs);
        const response = await fetch(API);
        const imageBuffer = await response.buffer();
        return imageBuffer;
    }

    static async getImageColor(imagePath: string): Promise<string[]> {
        const buffer = fs.readFileSync(imagePath);
        const uint8ClampedArray = new Uint8ClampedArray(buffer);
        const colors = await extractColors({ data: uint8ClampedArray, });
        const hexColors = colors.map(color => color.hex);
        return hexColors;
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


export { Unsplash, EnumImageSize }
