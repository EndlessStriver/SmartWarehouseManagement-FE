import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { DataResponse } from "./GetAllOrderExport";
import { ResponseError } from '../../interface/ResponseError';

const FindOrderExport = async (navigate: NavigateFunction, from: string, to: string, limit?: number, offset?: number): Promise<DataResponse | undefined> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            navigate("/login");
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            navigate("/session-expired");
        } else {
            const response = await axios.get(`${HOST}/order-export/date?limit=${limit || 10}&offset=${offset || 1}&from=${from}&to=${to}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data;
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('profile');
                navigate("/session-expired");
            }
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default FindOrderExport;