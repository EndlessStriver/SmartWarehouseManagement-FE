import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";

interface IReceiveItem {
    id: string;
    receiveQuantity: number;
    missingQuantity: number;
    damagedQuantity: number;
    status: string;
    notes: string;
    serverity: string;
    actionTaken: string;
}

interface IReceiving {
    receiveDate: string;
    description: string;
    receiveBy: string;
    supplierId: string;
    receiveItems: IReceiveItem[];
}

const UpdateReceiveCheck = async (id: string, data: IReceiving) => {
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
            await axios.put(`${HOST}/receive-check/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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

export default UpdateReceiveCheck;