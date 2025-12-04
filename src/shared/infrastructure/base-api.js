import axios from "axios";

const platformApi = import.meta.env.VITE_API_BASE_URL;

export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
        });

        // ✅ AGREGAR: Interceptor para incluir el token JWT en todas las peticiones
        this.#http.interceptors.request.use(
            (config) => {
                // Obtener el token del localStorage
                const token = localStorage.getItem('token');

                // Si existe el token, agregarlo al header Authorization
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // ✅ OPCIONAL: Interceptor para manejar errores de autenticación
        this.#http.interceptors.response.use(
            (response) => response,
            (error) => {
                // Si recibimos 401 Unauthorized, limpiar el token y redirigir al login
                if (error.response?.status === 401) {
                    console.warn('⚠️ Token inválido o expirado. Redirigiendo al login...');
                    localStorage.removeItem('token');
                    window.location.href = '/auth/login';
                }

                return Promise.reject(error);
            }
        );
    }

    get http() {
        return this.#http;
    }
}