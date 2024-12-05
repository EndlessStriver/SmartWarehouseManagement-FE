import axios from "axios";
import { checkTokenExpired } from "../../../util/DecodeJWT";
import { ResponseError } from "../../../interface/ResponseError";
import { NavigateFunction } from "react-router-dom";

interface interfaceData {
    productId: string,
    unitFromName: string,
    toUnitId: string,
    conversionFactor: number,
}

const CreateUnit = async (data: interfaceData, navigate: NavigateFunction): Promise<void> => {
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
            await axios.post(`${HOST}/unit/conversion`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
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

export default CreateUnit;