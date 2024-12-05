import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from '../../interface/ResponseError';

interface Supplier {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    supplierCode: string;
    contactPerson: string;
    location: string;
    status: boolean;
    notes: string;
    website: string;
    taxId: string;
    isActive: boolean;
}

interface Product {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    productCode: string;
    img: string;
    export_criteria: string;
}

interface Unit {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    isBaseUnit: boolean;
}

interface ReceiveItem {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    quantity: number;
    product: Product;
    unit: Unit;
}

interface Receive {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    receiveDate: string;
    receiveBy: string;
    status: string;
    description: string;
    totalAmount: string;
    receiveCode: string;
    totalQuantity: number;
    supplier: Supplier;
    receiveItems: ReceiveItem[];
}

interface ReceiveData {
    data: Receive[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
}


const FindStockEntry = async (navigate: NavigateFunction, from: string, to: string, limit?: number, offset?: number): Promise<ReceiveData | undefined> => {
    console.log(from, to);
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
            const response = await axios.get(`${HOST}/receives/date-paginition?from=${from}&to=${to}&offset=${offset || 1}&limit=${limit || 10}&order=DESC`, {
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

export default FindStockEntry;