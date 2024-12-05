import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import Shelf from "../../interface/Entity/Shelf";
import { ResponseError } from "../../interface/ResponseError";
import { NavigateFunction } from "react-router-dom";

export interface GetShelfByCategoryNameResponse {
    data: Shelf[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
}

interface GetShelfByCategoryNameProps {
    categoryName: string;
    typeShelf: string;
    offset?: number;
    limit?: number;
    orderBy?: string;
    order?: "ASC" | "DESC";
}

const GetShelfByCategoryNameAndTypeShelf = async (data: GetShelfByCategoryNameProps, navigate: NavigateFunction): Promise<GetShelfByCategoryNameResponse | undefined> => {
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
            const response = await axios.get(`${HOST}/shelf/category?name=${data.categoryName}&limit=${data?.limit || 10}&offset=${data?.limit || 1}&order=${data.order || "ASC"}&orderBy=${data.orderBy || "name"}&typeShelf=${data.typeShelf}`, {
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

export default GetShelfByCategoryNameAndTypeShelf;