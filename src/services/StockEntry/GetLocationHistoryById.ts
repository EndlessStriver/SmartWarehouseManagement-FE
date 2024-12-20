import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from '../../interface/ResponseError';

interface Location {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    locationCode: string;
    maxCapacity: string;
    currentCapacity: string;
    maxWeight: string;
    currentWeight: string;
    quantity: number;
    occupied: boolean;
}

export interface Transaction {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    transactionType: "INBOUND" | "OUTBOUND" | "PUTAWAY";
    transactionDate: string;
    quantity: number;
    fromLocation: Location | null;
    location: Location[];
    toLocation: Location | null;
}

interface PaginatedResponse {
    data: Transaction[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
}


const GetLocationHistoryById = async (navigate: NavigateFunction, locationId: string, limit?: number, offset?: number, order?: string): Promise<PaginatedResponse | undefined> => {
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
            const response = await axios.get(`${HOST}/whtransaction/transaction-by-location?locationId=${locationId}&limit=${limit || 10}&offset=${offset || 1}&order=${order || "ASC"}`, {
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

export default GetLocationHistoryById;