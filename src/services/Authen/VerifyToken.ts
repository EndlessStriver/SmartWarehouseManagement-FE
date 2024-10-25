import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import { checkTokenExpired } from "../../util/DecodeJWT";

interface VerifyTokenResponse {
    userId: string;
    appType: string;
    role: string;
    timeStamp: string;
    iat: number;
    exp: number;
}

const VerifyToken = async (): Promise<VerifyTokenResponse | undefined> => {
    try {
        const HOST = process.env.REACT_APP_API_HOST;
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        } else {
            const response = await axios.post(`${HOST}/auth/verify-token`, {}, {
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
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default VerifyToken;