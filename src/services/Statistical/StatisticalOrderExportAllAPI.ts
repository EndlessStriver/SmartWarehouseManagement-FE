import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";

export interface ExportOrderResponse {
    data: ExportOrder[];
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
    orderExportDetails: OrderExportDetail[];
}

interface OrderExportDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    skuCode: string;
    quantity: number;
    itemStatus: boolean;
    locationExport: LocationExport[];
    product: Product;
    unit: Unit;
    sku: SKU;
}

interface LocationExport {
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


const StatisticalOrderExportALLAPI = async (from: string, to: string, status: string): Promise<ExportOrderResponse | undefined> => {
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
            const response = await axios.get(`${HOST}/order-export/status-date-all?status=${status}&from=${from}&to=${to}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data;
        }
    } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('profile');
                window.location.href = "/session-expired";
            }
            const data = error.response.data
            throw new Error(data.message || "An unexpected error occurred.")
        } else {
            throw new Error("An unexpected error occurred.")
        }
    }
}

export default StatisticalOrderExportALLAPI;