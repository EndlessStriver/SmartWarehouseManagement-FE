import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import StockEntry from "../../interface/Entity/StockEntry";
import { NavigateFunction } from "react-router-dom";
import { ResponseError } from "../../interface/ResponseError";

export interface UpdateStockEntryProps {
    receiveDate: string;
    receiveBy: string;
    description: string;
    receiveItems: ReceiveItem[];
}

interface ReceiveItem {
    productId: string;
    quantity: number;
    unitId: string;
    skuId: string;
}

const UpdateStockEntryById = async (id: string, data: UpdateStockEntryProps, navigate: NavigateFunction): Promise<StockEntry | undefined> => {
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
            const response = await axios.put(`${HOST}/receives/${id}`, data, {
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

export default UpdateStockEntryById;