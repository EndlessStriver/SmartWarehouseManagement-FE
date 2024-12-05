import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";

interface Location {
    locationCode: string;
    availableQuantity: number;
}

interface SuggestInboundProps {
    skuId: string;
    unitId: string;
    typeShelf: string
    quantity: number;
}

const SuggestExportLocations = async (data: SuggestInboundProps, navigate: NavigateFunction): Promise<Location[] | undefined> => {
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
            const response = await axios.get(`${HOST}/locations/suggest-export-all?skuId=${data.skuId}&unitId=${data.unitId}&quantity=${data.quantity}&typeShelf=${data.typeShelf}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
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
            const data = error.response.data
            throw new Error(data.message || "An unexpected error occurred.")
        } else {
            throw new Error("An unexpected error occurred.")
        }
    }
}

export default SuggestExportLocations;