import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from '../../interface/ResponseError';

interface ExportData {
    data: ExportOrder[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
    totalQuantity: number;
}

export interface ExportOrder {
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
    orderExportDetails: ExportDetail[];
}

interface ExportDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    skuCode: string;
    quantity: number;
    itemStatus: boolean;
    locationExport: ExportLocation[];
    product: Product;
    unit: Unit;
    sku: SKU;
}

interface ExportLocation {
    locationCode: string;
    exportQuantity: number;
    availableQuantity: number;
}

interface Product {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    productCode: string;
    img: string;
    export_criteria: string;
}

interface Unit {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    isBaseUnit: boolean;
}

interface SKU {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    skuCode: string;
    batchCode: string;
    weight: string;
    dimension: string;
    description: string;
}



const StatisticalOrderExportAPI = async (navigate: NavigateFunction, from: string, to: string, status: string, limit?: number, offset?: number): Promise<ExportData | undefined> => {
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
            const response = await axios.get(`${HOST}/order-export/status-date?limit=${limit || 10}&offset=${offset || 1}&status=${status}&from=${from}&to=${to}`, {
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

export default StatisticalOrderExportAPI;