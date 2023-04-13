import { Response, RequestInit, Headers } from 'node-fetch';


/**------------------------------------------------------
 * Enums
 */
enum EnumRequestMethods {
	Get  	= 'get',
	Post 	= 'post',
	Put 	= 'put',
	Delete 	= 'delete',
	Head 	= 'head',
}


/**------------------------------------------------------
 * Interfaces
 */
interface IHttpResponse extends Response {}
interface IHttpError    extends Response {}
interface IHttpOptions {
	headers		?: TypeRequestHeaders,
	redirect	?: TypeRequestRedirect,
	params		?: Record<string, string>,
}


/**------------------------------------------------------
 * Types
 */
type TypeRequestBody 		= RequestInit['body'];
type TypeRequestHeaders		= RequestInit['headers'];
type TypeRequestRedirect	= RequestInit['redirect'];
type TypeResponseHeaders	= Headers;



//** Exports ------------------------------------ */
export {
	EnumRequestMethods, 
	IHttpOptions, IHttpResponse, IHttpError, 
	TypeRequestBody, TypeRequestHeaders, TypeResponseHeaders
};
