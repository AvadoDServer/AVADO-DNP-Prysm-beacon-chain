import axios from "axios";

export class RestApi {
    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async get<R>(path: string, callback: (res: any) => R, errorHandler: (e: any) => R) {
        try {
            return await axios.get(`${this.baseUrl}${path}`, {
                headers: {
                    Accept: "application/json"
                }
            }).then(res => callback(res)).catch(e => errorHandler(e));
        } catch (e: any) {
            return errorHandler(e)
        }
    }

    async post(path: string, data: object, callback: (res: any) => void, errorHandler: (e: any) => void) {
        try {
            return await axios.post(`${this.baseUrl}${path}`, data, {
                ...(data && { data: data })
            }).then(res => callback(res)).catch(e => errorHandler(e));
        } catch (e: any) {
            errorHandler(e)
        }
    }

    async delete(path: string, data: object, callback: (res: any) => void, errorHandler: (e: any) => void) {
        try {
            return await axios.delete(`${this.baseUrl}${path}`, {
                ...(data && { data: data })
            }).then(res => callback(res)).catch(e => errorHandler(e));
        } catch (e: any) {
            errorHandler(e)
        }
    }
}
