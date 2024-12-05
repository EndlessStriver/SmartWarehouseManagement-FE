import { NavigateFunction } from 'react-router-dom';
import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from '../../interface/ResponseError';

export interface InventoryData {
    data: InventoryTransaction[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
    pending: number;
}

export interface InventoryTransaction {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    transactionType: string;
    note: string;
    transactionDate: string;
    quantity: number;
    inventory: InventoryItem[];
}

interface InventoryItem {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    status: string;
    inventoryDetail: InventoryDetail[];
    shelves: Shelf;
}

interface InventoryDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    quantity: number;
    isIncrease: boolean;
    location: Location;
    products: Product;
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
    quantity: number;
    occupied: boolean;
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

interface Shelf {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    maxColumns: number;
    maxLevels: number;
    currentCapacity: string;
    maxCapacity: string;
    maxWeight: string;
    currentColumnsUsed: number;
    totalColumns: number;
    currentWeight: string;
    typeShelf: string;
}



const GetAllTransactionIventory = async (navigate: NavigateFunction, limit?: number, offset?: number, order?: string): Promise<InventoryData | undefined> => {
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
            const response = await axios.get(`${HOST}/whtransaction/transaction-inventory-check?limit=${limit || 10}&offset=${offset || 1}&order=${order || "DESC"}`, {
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

export default GetAllTransactionIventory;