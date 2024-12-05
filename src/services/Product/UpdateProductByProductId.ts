import axios from "axios";
import DataTypeUpdateProductAdmin from "../../interface/PageProduct/DataTypeUpdateProductAdmin";
import { Product } from "../../interface/Entity/Product";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";

const UpdateProductByProductId = async (productId: string, dataUpdate: DataTypeUpdateProductAdmin, navigate: NavigateFunction): Promise<Product | undefined> => {
    console.log(dataUpdate);
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
            const response = await axios.put(`${HOST}/products/${productId}`, dataUpdate, {
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
                window.location.href = "/session-expired";
            }
            const data = error.response.data;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default UpdateProductByProductId;