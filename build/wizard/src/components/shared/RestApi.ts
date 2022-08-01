import axios from "axios";

export class RestApi {
    public apiKey?: string;
    baseUrl: string;

    constructor(baseUrl: string, apiKey?: string) {
        this.baseUrl = baseUrl;
        if (apiKey)
            this.apiKey = apiKey;
    }

    async get<R>(path: string, callback: (res: any) => R, errorHandler: (e: any) => R) {
        try {
            return await axios.get(`${this.baseUrl}${path}`, {
                headers: {
                    Accept: "application/json",
                    ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` })
                }
            }).then(res => callback(res));
        } catch (e: any) {
            return errorHandler(e)
        }
    }

    async post(path: string, data: object, callback: (res: any) => void, errorHandler: (e: any) => void) {
        try {
            return await axios.post(`${this.baseUrl}${path}`, data, {
                ...(this.apiKey && { headers: { Authorization: `Bearer ${this.apiKey}` } }),
                ...(data && { data: data })
            }).then(res => callback(res));
        } catch (e: any) {
            errorHandler(e)
        }
    }

    async delete(path: string, data: object, callback: (res: any) => void, errorHandler: (e: any) => void) {
        try {
            return await axios.delete(`${this.baseUrl}${path}`, {
                ...(this.apiKey && { headers: { Authorization: `Bearer ${this.apiKey}` } }),
                ...(data && { data: data })
            }).then(res => callback(res));
        } catch (e: any) {
            errorHandler(e)
        }
    }
}
