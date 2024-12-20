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
    keySearch: string;
    offset?: number;
    limit?: number;
    orderBy?: string;
    order?: "ASC" | "DESC";
}

const GetShelfByNameAndCategoryName = async (data: GetShelfByCategoryNameProps, navigate: NavigateFunction): Promise<GetShelfByCategoryNameResponse | undefined> => {
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
            const response = await axios.get(`${HOST}/shelf/name?name=${data.keySearch}&limit=${data?.limit || 10}&offset=${data?.offset || 1}&order=${data.order || "ASC"}&orderBy=${data.orderBy || "name"}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
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

export default GetShelfByNameAndCategoryName;