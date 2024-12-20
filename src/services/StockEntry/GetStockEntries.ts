import { NavigateFunction } from 'react-router-dom';
import { checkTokenExpired } from "../../util/DecodeJWT";
import axios from "axios";
import ReceiveHeader from "../../interface/Entity/ReceiveHeader";
import { ResponseError } from '../../interface/ResponseError';

interface GetStockEntriesResponse {
    data: ReceiveHeader[],
    totalPage: number,
    limit: number,
    offset: number,
    totalElementOfPage: number
}

const GetStockEntries = async (navigate: NavigateFunction, limit?: number, offset?: number): Promise<GetStockEntriesResponse | undefined> => {

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
            const response = await axios.get(`${HOST}/receives?limit=${limit || 10}&offset=${offset || 1}&order=DESC&orderBy=create_at`, {
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

export default GetStockEntries;