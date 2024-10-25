import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import { checkTokenExpired } from "../../util/DecodeJWT";

const AddImagesProduct = async (productId: string, images: File[]): Promise<void> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        } else {
            const formData = new FormData();
            images.forEach(image => {
                formData.append('image', image);
            });

            await axios.put(`${HOST}/product-detail/images/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.log(error);
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
}

export default AddImagesProduct;