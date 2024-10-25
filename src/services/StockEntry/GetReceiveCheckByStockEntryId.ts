import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";

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

interface Sku {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    skuCode: string;
    batchCode: string;
    weight: string;
    dimension: string;
    description: string;
}

interface Location {
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
}

interface CheckItem {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    expectQuantity: number;
    receiveQuantity: number;
    price: string;
    totalAmount: string;
    itemStatus: string;
    location: string;
    product: Product;
    sku: Sku;
    locations: Location[];
}

export interface IReceiving {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    receiveDate: string;
    receiveBy: string;
    expectTotalAmount: string;
    totalAmount: string;
    totalExpectQuantity: number;
    totalReceiveQuantity: number;
    checkItems: CheckItem[];
}

const GetReceiveCheckByStockEntryId = async (stockEntryId: string): Promise<IReceiving> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        }

        const response = await axios.get(`${HOST}/receive-check/receive/${stockEntryId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.data;

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

export default GetReceiveCheckByStockEntryId;