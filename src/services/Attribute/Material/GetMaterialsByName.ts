import axios from "axios";
import { ResponseError } from "../../../interface/ResponseError";
import { checkTokenExpired } from "../../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";

interface Material {
    id: string;
    name: string;
    description: string;
}

const GetMaterialsByName = async (name: string, navigate: NavigateFunction): Promise<Material[] | undefined> => {
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
            const response = await axios.get(`${HOST}/materials/name?name=${name}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
    return undefined;
}

export default GetMaterialsByName;