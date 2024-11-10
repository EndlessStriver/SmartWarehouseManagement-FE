import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";

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

export interface CheckedProduct {
    product: Product;
    expectQuantity: number;
    receiveQuantity: number;
    unit: Unit | null;
}

interface ProductCheckResponse {
    startDate: string;
    endDate: string;
    checkedProducts: CheckedProduct[];
    totalCheckedProducts: number;
    totalExpectQuantity: number;
    totalReceiveQuantity: number;
    currentPage: number;
    totalPages: number;
    limit: number;
}



const StatisticalStockEntryAPI = async (from: string, to: string, limit?: number, offset?: number): Promise<ProductCheckResponse | undefined> => {
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
            const response = await axios.get(`${HOST}/receive-check/date/pagination?offset=${offset || 1}&limit=${limit || 10}&startDate=${from}&endDate=${to}`, {
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

export default StatisticalStockEntryAPI;