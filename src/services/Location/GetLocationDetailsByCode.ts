import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from "../../interface/ResponseError";

export interface LocationDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    locationCode: string;
    maxCapacity: string;
    currentCapacity: string;
    maxWeight: string;
    currentWeight: string;
    occupied: boolean;
    quantity: number;
    skus: SKU;
}

interface SKU {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    skuCode: string;
    batchCode: string;
    weight: string;
    dimension: string;
    description: string;
    productDetails: ProductDetail[];
}

interface ProductDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    quantity: number;
    images: Image[];
    product: Product;
    sku: SKU;
}

interface Image {
    url: string;
    publicId: string;
    isDeleted: boolean;
}

interface Product {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    productCode: string;
    unit: string;
    img: string;
}

const GetLocationDetailsByCode = async (locationCode: string): Promise<LocationDetail | undefined> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        } else {
            const response = await axios.get(`${HOST}/locations/code?locationCode=${locationCode}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
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
            throw new Error(data.message || "An error occurred during registration.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default GetLocationDetailsByCode;