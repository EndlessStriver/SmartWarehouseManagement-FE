import axios from "axios";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { ResponseError } from "../../interface/ResponseError";
import { Incident } from "./GetIssueLogs";

const GetIssueLogById = async (issueLogId: string): Promise<Incident | undefined> => {
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
            const response = await axios.get(`${HOST}/incident-log/${issueLogId}`, {
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

export default GetIssueLogById;