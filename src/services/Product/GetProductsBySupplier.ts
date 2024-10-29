import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";

interface ProductCategory {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    categoryCode: string;
}

interface ProductImage {
    url: string;
    publicId: string;
    isDeleted: boolean;
}

interface ProductSKU {
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

interface ProductDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    quantity: number;
    images: ProductImage[];
    sku: ProductSKU[];
}

export interface ProductUnit {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    isBaseUnit: boolean;
}

export interface Product {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    productCode: string;
    img: string;
    category: ProductCategory;
    productDetails: ProductDetail[];
    units: ProductUnit[];
}

interface PaginatedProductResponse {
    data: Product[];
    totalPage: number,
    limit: number,
    offset: number,
    totalElementOfPage: number
}

interface GetProductBySupplierRequestPage {
    limit?: number;
    offset?: number;
    order?: string;
    orderBy?: string;
}


const GetProductsBySupplier = async (supplierId: string, pageRequest?: GetProductBySupplierRequestPage): Promise<PaginatedProductResponse | undefined> => {
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
            const response = await axios.get(`${HOST}/products/supplier/${supplierId}?limit=${pageRequest?.limit || 5}&offset=${pageRequest?.offset || 1}&order=${pageRequest?.order || "ASC"}&orderBy=${pageRequest?.orderBy || "name"}`, {
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
            const data = error.response.data;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default GetProductsBySupplier;