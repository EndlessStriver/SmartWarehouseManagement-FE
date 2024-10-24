import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from "../../interface/ResponseError";

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

interface ItemCheck {
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
    locations: Location[];
}

export interface Incident {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    incidentDate: string;
    reportedBy: string;
    description: string;
    status: string;
    actionTaken: string;
    itemCheck: ItemCheck;
}

interface IncidentDataResponse {
    data: Incident[];
    totalPage: number;
    limit: number;
    offset: number;
    totalElementOfPage: number;
}

interface GetIssueLogsRequest {
    limit?: number;
    offset?: number;
    order?: 'ASC' | 'DESC';
    orderBy?: string;
}

const GetIssueLogs = async (data?: GetIssueLogsRequest): Promise<IncidentDataResponse> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = "/login";
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            window.location.href = "/session-expired";
        }

        const response = await axios.get(`${HOST}/incident-log?limit=${data?.limit || 10}&offset=${data?.offset || 1}&order=${data?.order || "DESC"}&orderBy=${data?.orderBy || "incidentDate"}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data.data;

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

export default GetIssueLogs;