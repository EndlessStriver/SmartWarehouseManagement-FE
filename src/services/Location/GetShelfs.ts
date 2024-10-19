import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import Shelf from "../../interface/Entity/Shelf";
import { ResponseError } from "../../interface/ResponseError";
import Order from "../../enum/Order";

interface GetShelfsResponse {
    data: Shelf[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
}

interface GetShelfsProps {
    limit?: number;
    offset?: number;
    order?: Order;
    orderBy?: string;
}

const GetShelfs = async (data?: GetShelfsProps): Promise<GetShelfsResponse> => {
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

        const response = await axios.get(`${HOST}/shelf?limit=${data?.limit || 10}&offset=${data?.offset || 1}&order=${data?.order || Order.ASC}&orderBy=name`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data.data;
    } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('profile');
                window.location.href = "/session-expired";
            }
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An error occurred during registration.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default GetShelfs;