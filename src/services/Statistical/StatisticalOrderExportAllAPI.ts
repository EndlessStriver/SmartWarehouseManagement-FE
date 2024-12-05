import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ExportOrder } from "./StatisticalOrderExportAPI";
import { NavigateFunction } from "react-router-dom";

export interface ExportOrderResponse {
    data: ExportOrder[];
    totalQuantity: number;
}


const StatisticalOrderExportALLAPI = async (from: string, to: string, status: string, navigate: NavigateFunction): Promise<ExportOrderResponse | undefined> => {
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