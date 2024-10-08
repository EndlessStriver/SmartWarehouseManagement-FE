import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import ProductHeader from "../../interface/Entity/ProductHeader";

interface ProductHeaderResponse {
    data: ProductHeader[],
    totalPage: number,
    limit: number,
    offset: number
    totalElementOfPage: number
}

const GetProductsBySupplier = async (supplierId: string): Promise<ProductHeaderResponse> => {
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

        const response = await axios.get(`${HOST}/products/supplier/${supplierId}?limit=10&offset=1&order=ASC&orderBy=name`, {
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
            const data = error.response.data;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default GetProductsBySupplier;