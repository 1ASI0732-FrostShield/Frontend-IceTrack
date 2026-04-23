import axios from "axios";
import { useAuthStore } from "@/iam/application/auth.store.js";

const platformApi = import.meta.env.VITE_API_BASE_URL;
export class BaseApi {
    #http;
    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.#http.interceptors.request.use(config => {
            const authStore = useAuthStore();
            const token = authStore.token;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, error => {
            return Promise.reject(error);
        });
    }
    get http() {
        return this.#http;
    }
}