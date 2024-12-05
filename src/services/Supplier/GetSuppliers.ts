import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import Supplier from "../../interface/Entity/Supplier";
import Order from "../../enum/Order";
import { checkTokenExpired } from "../../util/DecodeJWT";

interface GetSuppliersResponse {
    data: Supplier[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
}

enum OrderBy {
    Name = "name",
    Address = "address",
    Phone = "phone",
}

interface GetSuppliersProps {
    limit?: number;
    offset?: number;
    order?: Order;
    orderBy?: OrderBy;
}

const GetSuppliers = async (navigate: NavigateFunction, data?: GetSuppliersProps): Promise<GetSuppliersResponse | undefined> => {
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
            const response = await axios.get(`${HOST}/suppliers?limit=${data?.limit || 10}&offset=${data?.offset || 1}&order=${data?.order || Order.ASC}&orderBy=${data?.orderBy || OrderBy.Name}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data.data;
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
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
};

export default GetSuppliers;