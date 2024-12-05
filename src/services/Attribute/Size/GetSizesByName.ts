import axios from "axios";
import { ResponseError } from "../../../interface/ResponseError";
import { checkTokenExpired } from "../../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";

interface Size {
    id: string;
    name: string;
    description: string;
}

const GetSizesByName = async (name: string, navigate: NavigateFunction): Promise<Size[]> => {

    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/login");
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            navigate("/session-expired");
        }

        const response = await axios.get(`${HOST}/sizes/name?name=${name}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
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

export default GetSizesByName;