import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";
import { ResponseError } from "../../interface/ResponseError";

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
    totalQuantity: number;
    unitId: string;
    itemStatus: boolean;
    locationExport: LocationExport[];
}

interface LocationExport {
    locationCode: string;
    quantity: number;
}


const UpdateOrderExport = async (orderExportId: string, data: ExportOrder, navigate: NavigateFunction): Promise<void> => {
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
            await axios.put(`${HOST}/order-export/${orderExportId}`, data, {
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

export default UpdateOrderExport;