import { CloseButton } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import React from "react";
import { Incident } from "../../../services/Location/GetIssueLogs";
import GetIssueLogById from "../../../services/Location/GetIssueLogById";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import HandleIssueLog from "../../../services/Location/HandleIssueLog";

interface ModelHandleIssueLogProps {
    onClose: () => void;
    issueLogId: string;
    reload: () => void;
}

const ModelHandleIssueLog: React.FC<ModelHandleIssueLogProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [issueLog, setIssueLog] = React.useState<Incident | null>(null);
    const [actionTaken, setActionTaken] = React.useState<string>("");
    const [status, setStatus] = React.useState<string>("COMPLETED");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        GetIssueLogById(props.issueLogId)
            .then((data) => {
                if (data) {
                    setIssueLog(data);
                    setActionTaken(data.actionTaken || "");
                }
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            })
    }, [dispatch, props.issueLogId])

    const HandleIssueLogFnc = () => {
        setIsLoading(true);
        HandleIssueLog(props.issueLogId, {
            actionTaken: actionTaken,
            status: status as "COMPLETED" | "CANCELLED"
        })
            .then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Issue log handled successfully" })
                props.onClose();
                props.reload();
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            })
            .finally(() => {
                setIsLoading(false);
            })
    }

    return (
        <OverLay>
            <div
                className="bg-light rounded position-relative"
                style={{ width: "700px" }}
            >
                <CloseButton
                    onClick={() => props.onClose()}
                    className="position-absolute"
                    style={{ top: "15px", right: "15px" }}
                />
                <div className="p-4">
                    <h4>Handle Issue Log</h4>
                    <p>
                        <span className="fw-bold">Issue Log ID: </span>
                        {props.issueLogId}
                    </p>
                    <hr />
                    <div>
                        <span className="fw-bold">Description: </span>
                        <p>{issueLog?.description}</p>
                    </div>
                    <div className="mb-3">
                        <span className="fw-bold">Status: </span>
                        <select
                            disabled={issueLog?.status === "COMPLETED" || issueLog?.status === "CANCELLED"}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="form-select"
                        >
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>
                    <div>
                        <span className="fw-bold">Action Taken: </span>
                        <textarea
                            disabled={issueLog?.status === "COMPLETED" || issueLog?.status === "CANCELLED"}
                            className="form-control"
                            rows={3}
                            placeholder="Action taken..."
                            value={actionTaken}
                            onChange={(e) => setActionTaken(e.target.value)}
                        />
                    </div>
                    {
                        issueLog?.status === "PENDING" &&
                        <div className="mt-3">
                            <button
                                onClick={() => HandleIssueLogFnc()}
                                className="form-control btn btn-primary"
                            >
                                {
                                    isLoading ? "Handling..." : "Handle Issue Log"
                                }
                            </button>
                        </div>
                    }
                </div>
            </div>
        </OverLay>
    )
}

export default ModelHandleIssueLog;