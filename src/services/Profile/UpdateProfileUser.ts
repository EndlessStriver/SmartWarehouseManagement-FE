import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import { Profile } from "../../interface/Profile";
import { checkTokenExpired } from "../../util/DecodeJWT";

interface DataTypeUpdateProfile {
    fullName?: string,
    dateOfBirth?: string
    gender?: string,
    email?: string,
    phoneNumber?: string,
    address?: string,
}

const UpdateProfileUser = async (data: DataTypeUpdateProfile, navigate: NavigateFunction): Promise<Profile | undefined> => {

    console.log(data);

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
            const response = await axios.put(`${HOST}/account/update-account`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        }
    } catch (error) {
        console.error(error);
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

export default UpdateProfileUser;