import axios from "axios";

const platformApi = import.meta.env.VITE_API_BASE_URL;
export class BaseApi {
    #http;
    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
        });
    }
    get http() {
        return this.#http;
    }
}