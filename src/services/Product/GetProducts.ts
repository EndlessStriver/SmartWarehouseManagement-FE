import axios from "axios";
import { Product } from "../../interface/Entity/Product";
import { ResponseError } from "../../interface/ResponseError";
import Order from "../../enum/Order";
import {checkTokenExpired} from "../../util/DecodeJWT";

interface GetProductsResponse {
    data: Product[],
    totalPage: number,
    limit: number,
    offset: number
    totalElementOfPage: number
}

interface GetProductsProps {
    limit?: number,
    offset?: number,
    order?: Order,
    orderBy?: string
}

const GetProducts = async (data?: GetProductsProps): Promise<GetProductsResponse> => {

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

        const response = await axios.get(`${HOST}/products?limit=${data?.limit || 10}&offset=${data?.offset || 1}&order=${data?.order || Order.ASC}&orderBy=name`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if(error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('profile');
                window.location.href = "/session-expired";
            }
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }

}

export default GetProducts;