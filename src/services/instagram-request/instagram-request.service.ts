import nodeFetch, { RequestInit, HeadersInit } from "node-fetch";
import { EnumRequestMethods, IHttpOptions, IHttpResponse, TypeRequestBody, TypeRequestHeaders, TypeResponseHeaders } from "./ig-request.interface";
import { Utils } from "../../shared/libs";
import { FireFoxCookiesService } from '../firefox-cookies';

export class InstagramRequestService {

	//** Configurations */
	private static USER_AGENTS = `Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0`;
	private static INSTAGRAM_APP_ID = `936619743392459`;

	//** Cookies DB */
	private static cookiesDB: Map<'cookies', { [key: string]: string }> = new Map();

    //** Get Method */
	static get(url: string, options?: IHttpOptions): Promise <IHttpResponse> {
		return this.sendRequest(EnumRequestMethods.Get, url, null, options);
	}

	//** Post Method */
	static post(url: string, body: TypeRequestBody, options?: IHttpOptions): Promise <IHttpResponse> {
		return this.sendRequest(EnumRequestMethods.Post, url, body, options);
	}

	//** Put Method */
	static put(url: string, body: TypeRequestBody, options?: IHttpOptions): Promise <IHttpResponse> {
		return this.sendRequest(EnumRequestMethods.Put, url, body, options);
	}

	//** Head Method */
	static head(url: string, options?: IHttpOptions): Promise <IHttpResponse> {
		return this.sendRequest(EnumRequestMethods.Head, url,  null, options);
	}

	//** Delete Method */
	static delete(url: string, options?: IHttpOptions): Promise <IHttpResponse> {
		return this.sendRequest(EnumRequestMethods.Delete, url,  null, options);
	}

    private static async sendRequest(method: EnumRequestMethods, url: string, body: TypeRequestBody|null, options?: IHttpOptions): Promise<IHttpResponse> {

		try {

			//0 - prepare node-fetch request
			const requestOptions: RequestInit = await this.prepareRequestOptions(method, body, options);

			//1 - add parameters to the url if required, and fetch using options
            if(Object.keys(options?.params || {}).length !== 0) url = `${url}/${Utils.objectToQueryString(options.params)}`;
			const response = await nodeFetch(url, requestOptions);

			//2 - update cookies
			this.setCookiesData(response.headers);

			//3 - verify & return response
			if(!response.ok) return Promise.reject(response);
			return response;

		} catch (error: any) {
			throw error;
		}
	}

    private static async prepareRequestOptions(method: EnumRequestMethods, body: TypeRequestBody|null, options?: IHttpOptions): Promise<RequestInit> {

		//0 - prepare headers
		const preparedHeaders: HeadersInit = await this.prepareHeaders(body, options?.headers);

		//1 - prepare request object
		const request: RequestInit = {
			method	 : method,
			headers	 : preparedHeaders,
			redirect : options?.redirect || 'follow'
		}

		//2 - verify and set body
		if(body != undefined) request['body'] = body;

		//3 - return prepared object
		return request;
	}

    //** Prepare headers */
	private static async prepareHeaders(body?: TypeRequestBody, headers?: TypeRequestHeaders): Promise<HeadersInit> {

		//0 - prepare instagram cookies
		const cookiesObject: { [key: string]: string } = await this.normalizeCookies();
		const cookiesString: string = Utils.cookiesObjectToString(cookiesObject);
		const csrfToken: string = cookiesObject['csrftoken'];

		//1 - prepare default headers
		const defaultHeaders: HeadersInit = {
			'cookie'		: cookiesString,
			'User-Agent'	: this.USER_AGENTS,
			'x-ig-app-id'	: this.INSTAGRAM_APP_ID,
			'x-csrftoken'	: csrfToken
		};

		//2 - set default headers for body (return default header if header is not present)
		if(body && Utils.isStringJSON(body as string)) defaultHeaders['Content-Type'] = `application/json`;
		if(!headers) return defaultHeaders;

		//3 - make keys lowercase of headers & merge and return headers
		const preparedHeaders: HeadersInit = {
			...Utils.objectKeysToLowercase(defaultHeaders),
			...Utils.objectKeysToLowercase(headers),
		}
		return preparedHeaders;
	}

	//** Update cookies DB */
	private static setCookiesData(headers: TypeResponseHeaders) {
		if(!headers.get('set-cookie')) return;

		const cookiesObject: { [key: string]: string } = {};
		headers.get('set-cookie').split("Secure,").forEach(strValue => {
			const cookieStr = strValue.split(';')[0].trim();

			if(cookieStr){
				const cookiesArray = cookieStr.split('=');
				const key 	= cookiesArray[0];
				const value = cookiesArray[1];
				if(key && value) cookiesObject[key] = value;
			}
		});

		const oldCookies = this.cookiesDB.get('cookies')
		const mergedObject = Utils.mergeObjects(oldCookies, cookiesObject);
		this.cookiesDB.set('cookies', mergedObject as { [key: string]: string });
	}

	//** Normalized cookies */
	private static async normalizeCookies(): Promise<{ [key: string]: string }> {
		let cookiesObject: { [key: string]: string } = this.cookiesDB.get('cookies');
		if(cookiesObject) return cookiesObject;

		cookiesObject = await FireFoxCookiesService.getInstagramCookies();
		this.cookiesDB.set('cookies', cookiesObject);
		return cookiesObject;
	}
}

