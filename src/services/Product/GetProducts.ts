import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import Order from "../../enum/Order";
import { checkTokenExpired } from "../../util/DecodeJWT";

interface Product {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    productCode: string;
    img: string;
}

export interface GetProductsResponse {
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

const GetProducts = async (navigate: NavigateFunction, data?: GetProductsProps): Promise<GetProductsResponse | undefined> => {

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
            const response = await axios.get(`${HOST}/products?limit=${data?.limit || 10}&offset=${data?.offset || 1}&order=${data?.order || Order.ASC}&orderBy=name`, {
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

export default GetProducts;