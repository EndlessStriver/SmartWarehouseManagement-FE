import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import { checkTokenExpired } from "../../util/DecodeJWT";

export interface Action {
    id: string;
    actionType: string;
    description: string;
    timestamp: string;
}

interface ResponseData {
    data: Action[];
    totalPage: number;
    limit: string;
    offset: string;
    totalElementOfPage: number;
}


const GetLogsUser = async (navigate: NavigateFunction, userId: string, limit?: number, offset?: number): Promise<ResponseData | undefined> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        } else {
            const response = await axios.get(`${HOST}/logs/account/${userId}?limit=${limit || 10}&offset=${offset || 1}&order=ASC`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.data;
        }
    } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('profile');
                window.location.href = "/session-expired";
            }
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default GetLogsUser;