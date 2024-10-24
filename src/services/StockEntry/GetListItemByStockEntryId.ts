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
    unit: string;
}

export interface StockEntryItem {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    quantity: number;
    price: string;
    totalAmount: string;
    product: Product;
}

const GetListItemByStockEntryId = async (stockEntryId: string): Promise<StockEntryItem[]> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        }

        const response = await axios.get(`${HOST}/receives/${stockEntryId}/items`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.data;

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

export default GetListItemByStockEntryId