import {NavigateFunction} from 'react-router-dom';
import axios from "axios";
import {ResponseError} from "../../interface/ResponseError";
import {Profile} from "../../interface/Profile";

const GetProfileByTokenAPI = async (token: string, navigate: NavigateFunction): Promise<Profile> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const response = await axios.get(`${HOST}/account/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
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

export default GetProfileByTokenAPI;