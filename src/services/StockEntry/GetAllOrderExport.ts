import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from '../../interface/ResponseError';

export interface DataResponse {
    data: ExportOrderData[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
}

export interface ExportOrderData {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    status: string;
    exportCode: string;
    exportDate: string;
    description: string;
    exportBy: string;
    totalQuantity: number;
    orderExportDetails: OrderExportDetail[];
}

interface OrderExportDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    skuCode: string;
    quantity: number;
    retrievedProducts: RetrievedProduct[];
}

interface RetrievedProduct {
    locationCode: string;
    quantityTaken: number;
}


const GetAllOrderExport = async (navigate: NavigateFunction, limit?: number, offset?: number): Promise<DataResponse | undefined> => {
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
            const response = await axios.get(`${HOST}/order-export?limit=${limit || 10}&offset=${offset || 1}`, {
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

export default GetAllOrderExport;