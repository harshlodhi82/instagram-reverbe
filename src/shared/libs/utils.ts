import lodash from 'lodash';


export class Utils {

    static wait(time: number): Promise<void> {
        return new Promise((resolve) => { setTimeout(() => { resolve() }, time) })
    }

    static getUniqueArrayValues = (arr: any[]): any[] => {
        return Array.from(new Set(arr));
    }

    static shuffle = (arr: any[]): any[] => {
        return lodash.shuffle(arr);
    }

    static getRandomNumber = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min) + min);
    }

    static getDayByDate(date: Date): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }

    static getRandomEnumValue = <T>(enumDef: T): string => {
        const values = Object.values(enumDef);
        const ranNumber = this.getRandomNumber(0, values.length);
        return values[ranNumber];
    }

    static arrayToMap<T>(arr: T[]): Map<T, number> {
        return new Map(arr.map(elm => [elm, 1]));
    }

    static convertSecToMs(seconds: number): number {
        return seconds * 1000;
    }

    static cookiesObjectToString(cookieObj: { [key: string]: string }): string {
        let stringValue = '';
        for (const key of Object.keys(cookieObj)) {
            stringValue += `${key}=${cookieObj[key]};`;
        }
        return stringValue;
    }

    static objectToQueryString<T extends object>(queryParameters: T): string {

		//0 - was anything defined
		if(Object.keys(queryParameters).length === 0) return '';

		//1 - construct the query string form the object parameters
		return Object.entries(queryParameters).reduce(
			(queryString: string, [key, val], index: number) => {

				//a. query starting symbol
				const symbol: string = queryString.length === 0 ? '?' : '&';

				//b. all element to query
				queryString += val ? `${symbol}${key}=${val}` : '';
				return queryString;
			},
			''
		);
	}

    static isStringJSON(jsonString: string): boolean {
		try {
			const jsonObj: any = JSON.parse(jsonString);
			return true;
		} catch (error: unknown) {
			return false;
		}
	}

    static objectKeysToLowercase<TInitial extends object>(obj: TInitial): object {
		const preparedObj: object = {};
		for (const key of Object.keys(obj)) {
			(preparedObj as any)[key.toLowerCase().trim()] = (obj as any)[key];
		}
		return preparedObj;
	}

    static mergeObjects<T1 extends object, T2 extends object>(oldObject: T1, newObject: T2): object {
        return lodash.merge(oldObject, newObject);
    }
}


