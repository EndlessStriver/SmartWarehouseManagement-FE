import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import StockEntry from "../../interface/Entity/StockEntry";

interface ReceiveItem {
    id: string;
    productId: string;
    quantity: number;
    unit: string;
}

interface UpdateStockEntryByIdTypeDataUpdate {
    receiveBy?: string;
    status?: string;
    description?: string;
    supplierId?: string;
    receiveItems?: ReceiveItem[];
}

const UpdateStockEntryById = async (id: string, data: UpdateStockEntryByIdTypeDataUpdate): Promise<StockEntry | undefined> => {
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
            const response = await axios.put(`${HOST}/receives/${id}`, data, {
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

export default UpdateStockEntryById;