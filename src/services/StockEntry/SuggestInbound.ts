import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";
import { ResponseError } from "../../interface/ResponseError";

export interface Location {
    locationCode: string;
    maxQuantityInbound: number;
    locationId: string;
}

interface SuggestInboundProps {
    skuId: string;
    unitId: string;
    typeShelf: string
    quantity: number;
}

const SuggestInbound = async (data: SuggestInboundProps, navigate: NavigateFunction): Promise<Location[] | undefined> => {
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
            const response = await axios.get(`${HOST}/locations/suggest-inbound?skuId=${data.skuId}&unitId=${data.unitId}&quantity=${data.quantity}&typeShelf=${data.typeShelf}`, {
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
                navigate("/session-expired");
            }
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default SuggestInbound;