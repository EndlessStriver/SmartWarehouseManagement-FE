import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from '../../interface/ResponseError';

export interface CreateStockEntryProps {
    receiveDate: string;
    receiveBy: string;
    description: string;
    supplierId: string;
    receiveItems: ReceiveItem[];
}

interface ReceiveItem {
    productId: string;
    quantity: number;
    unitId: string;
    skuId: string;
}

const CreateStockEntry = async (data: CreateStockEntryProps, navigate: NavigateFunction): Promise<void> => {
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
            return await axios.post(`${HOST}/receives`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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

export default CreateStockEntry;