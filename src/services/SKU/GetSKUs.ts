import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import Order from "../../enum/Order";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { SKU } from "../../interface/Entity/Product";

interface GetSKUsResponse {
    data: SKU[];
    totalPage: number,
    limit: number,
    offset: number,
    totalElementOfPage: number
}

interface GetSKUsProps {
    limit?: number;
    offset?: number;
    order?: Order;
    orderBy?: string;
}

const GetSKUs = async (navigate: NavigateFunction, data?: GetSKUsProps): Promise<GetSKUsResponse | undefined> => {
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
            const response = await axios.get(`${HOST}/sku?limit=${data?.limit || 10}&offset=${data?.offset || 1}&order=${data?.order || Order.ASC}&orderBy=skuCode`, {
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

export default GetSKUs;