import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from "../../interface/ResponseError";
import { Incident } from "./GetIssueLogs";

interface HandleIssueLogRequest {
    status: "COMPLETED" | "CANCELLED";
    actionTaken: string;
}

const HandleIssueLog = async (issueLogId: string, data: HandleIssueLogRequest): Promise<Incident> => {

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

        const response = await axios.put(`${HOST}/incident-log/${issueLogId}`, data, {
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

export default HandleIssueLog;