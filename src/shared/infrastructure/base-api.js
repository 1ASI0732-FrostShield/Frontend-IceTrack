import axios from "axios";

const platformApi = import.meta.env.VITE_API_BASE_URL;

export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
        });

        this.#http.interceptors.request.use(config => {
            const token = localStorage.getItem("token"); // token guardado en localStorage
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    get http() {
        return this.#http;
    }
}