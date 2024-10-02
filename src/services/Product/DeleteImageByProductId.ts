import axios from "axios";
import {ResponseError} from "../../interface/ResponseError";

const DeleteImageByProductId = async (productId: string, urlImage: string): Promise<void> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if(!token) throw new Error('Token not found');

        await axios.delete(`${HOST}/product-detail/images/${productId}?url=${urlImage}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default DeleteImageByProductId;