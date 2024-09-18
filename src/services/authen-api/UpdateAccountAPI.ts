import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";

interface UpdateUserRequest {
    username: string;
    email: string;
    password?: string;
    fullName: string;
    phoneNumber: string;
    // roleName: string;
}

const UpdateAccountAPI = async (userId: string, userData: Partial<UpdateUserRequest>): Promise<void> => {
    console.log(userData)
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error("Token not found.");
        }

        await axios.put(`${HOST}/account/ad/update/${userId}`, userData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

    } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error) && error.response) {
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default UpdateAccountAPI;