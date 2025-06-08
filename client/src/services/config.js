import axios from "axios";


const baseURL = import.meta.env.VITE_BASE_URL || "/api";

if(!baseURL){
    throw new error(
        "SERVER_BASEURL is not defined in the environment variables"
    );
}

export const serviceAxiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    },
});

export const serviceAxiosInstanceForFileUpload = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});