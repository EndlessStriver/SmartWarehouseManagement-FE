import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";

interface ExportOrder {
    exportCode: string;
    exportDate: string;
    exportBy: string;
    description: string;
    orderExportDetails: OrderExportDetail[];
}

interface OrderExportDetail {
    skuId: string;
    productId: string;
    quantity: number;
    unitId: string;
}

const UpdateOrderExport = async (orderExportId: string, data: ExportOrder): Promise<void> => {
    console.log(data);
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
            await axios.put(`${HOST}/order-export/${orderExportId}`, data, {
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

export default UpdateOrderExport;