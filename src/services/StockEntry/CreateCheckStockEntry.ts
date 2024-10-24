import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";

interface ReceiveItem {
    receiveItemId: string;
    receiveQuantity: number;
    itemStatus: 'NORMAL' | 'DAMAGED' | 'MISSING' | 'SURPLUS';
    locationId?: string;
}

export interface Receive {
    receiveId: string;
    receiveDate: string;
    receiveBy: string;
    supplierId: string;
    receiveItems: ReceiveItem[];
}

const CreateCheckStockEntry = async (data: Receive) => {
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

        await axios.post(`${HOST}/receive-check`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
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

export default CreateCheckStockEntry;