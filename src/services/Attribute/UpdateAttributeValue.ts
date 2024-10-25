import axios from "axios";
import { ResponseError } from "../../interface/ResponseError";
import returnNameAttribute from "../../util/ReturnNameAttribute";
import Attribute from "../../interface/Attribute";
import { checkTokenExpired } from "../../util/DecodeJWT";

const UpdateAttributeValue = async (id: number, attributeValueId: string, data: Attribute): Promise<void> => {

    const customData: Attribute = {
        ...data
    };

    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        } else {
            if (returnNameAttribute(id) === "") throw new Error("Attribute is not found")

            switch (returnNameAttribute(id)) {
                case "materials":
                    customData.materialCode = customData.sizeCode;
                    delete customData.sizeCode;
                    break;
                case "colors":
                    customData.colorCode = customData.sizeCode;
                    delete customData.sizeCode;
                    break;
                case "brands":
                    customData.brandCode = customData.sizeCode;
                    delete customData.sizeCode;
                    break;
                case "categories":
                    customData.categoryCode = customData.sizeCode;
                    delete customData.sizeCode;
                    break;
                default:
                    break;
            }

            const response = await axios.put(`${HOST}/${returnNameAttribute(id)}/${attributeValueId}`, customData, {
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

export default UpdateAttributeValue;
