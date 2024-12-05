import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import DataTypeUpdateUserAdmin from "../../interface/PageUser/DataTypeUpdateUserAdmin";
import User from "../../interface/Entity/User";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";

const UpdateAccountAPI = async (userId: string, dataUpdateUser: DataTypeUpdateUserAdmin, navigate: NavigateFunction): Promise<User | undefined> => {
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
            const formData = new FormData();
            Object.keys(dataUpdateUser).forEach(key => {
                const value = dataUpdateUser[key as keyof DataTypeUpdateUserAdmin];
                if (value) {
                    formData.append(key, value);
                }
            });
            const resposne = await axios.put(`${HOST}/account/ad/update/${userId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            })
            return resposne.data.data as User;
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

export default UpdateAccountAPI;
