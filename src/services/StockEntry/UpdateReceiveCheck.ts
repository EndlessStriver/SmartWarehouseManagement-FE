import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";
import { ResponseError } from "../../interface/ResponseError";

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

const UpdateReceiveCheck = async (id: string, data: IReceiving, navigate: NavigateFunction) => {
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
            await axios.put(`${HOST}/receive-check/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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

export default UpdateReceiveCheck;