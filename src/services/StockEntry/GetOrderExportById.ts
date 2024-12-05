import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";
import { ResponseError } from "../../interface/ResponseError";

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
    itemStatus: boolean
    skuCode: string;
    quantity: number;
    locationExport: RetrievedProduct[];
    product: Product;
    unit: Unit;
    sku: SKU;
}

interface RetrievedProduct {
    locationCode: string;
    exportQuantity: number;
    availableQuantity: string;
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


const GetOrderExportById = async (orderExportId: string, navigate: NavigateFunction): Promise<ExportOrder | undefined> => {
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
            const response = await axios.get(`${HOST}/order-export/${orderExportId}`, {
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

export default GetOrderExportById;