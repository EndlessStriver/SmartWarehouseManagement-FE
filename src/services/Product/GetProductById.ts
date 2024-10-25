import axios from "axios"
import { Product } from "../../interface/Entity/Product";
import { checkTokenExpired } from "../../util/DecodeJWT";

const GetProductById = async (productId: string): Promise<Product | undefined> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE
        const token = localStorage.getItem('token')

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        } else {
            const response = await axios.get(`${HOST}/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            return response.data.data;
        }
    } catch (error) {
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

export default GetProductById