import { Badge, Table } from "react-bootstrap"
import GetIssueLogs, { Incident } from "../../services/Location/GetIssueLogs";
import React from "react";
import PaginationType from "../../interface/Pagination";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import { faEye, faWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Pagination from "../../compoments/Pagination/Pagination";
import { NoData } from "../../compoments/NoData/NoData";
import ModelHandleIssueLog from "./compoments/ModelHandleIssueLog";

type StatusType = 'PENDING' | 'COMPLETED' | 'CANCELLED';

interface StatusBadgeProps {
    status: StatusType;
}

const IssueLog: React.FC = () => {

    const dispatch = useDispatchMessage();
    const [reload, setReload] = React.useState<boolean>(false);
    const [issueLogId, setIssueLogId] = React.useState<string>('');
    const [showHandleIssueLog, setShowHandleIssueLog] = React.useState<boolean>(false);
    const [issueLogs, setIssueLogs] = React.useState<Incident[]>([]);
    const [pagination, setPagination] = React.useState<PaginationType>({
        limit: 10,
        offset: 1,
        totalElementOfPage: 0,
        totalPage: 0
    })

    React.useEffect(() => {
        GetIssueLogs()
            .then((res) => {
                setIssueLogs(res.data);
                setPagination({
                    limit: res.limit,
                    offset: res.offset,
                    totalElementOfPage: res.totalElementOfPage,
                    totalPage: res.totalPage
                })
            }).catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message })
            })
    }, [dispatch, reload])

    React.useEffect(() => {
        GetIssueLogs({ offset: pagination.offset })
            .then((res) => {
                setIssueLogs(res.data);
                setPagination({
                    limit: res.limit,
                    offset: res.offset,
                    totalElementOfPage: res.totalElementOfPage,
                    totalPage: res.totalPage
                })
            }).catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message })
            })
    }, [dispatch, pagination.offset])

    const handlePageChange = (page: number) => {

        setPagination({
            ...pagination,
            offset: page
        })
    }

    const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
        let variant: string;

        switch (status) {
            case 'PENDING':
                variant = 'warning';
                break;
            case 'COMPLETED':
                variant = 'success';
                break;
            case 'CANCELLED':
                variant = 'danger';
                break;
            default:
                variant = 'secondary';
                break;
        }

        return <Badge pill bg={variant}>{status}</Badge>;
    };

    return (
        <div className={"w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Issue Log Management</h2>
                    <p className={"h6"}>Manage Issue Log Here</p>
                </div>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Description</th>
                        <th>Action Taken</th>
                        <th>Status</th>
                        <th>Incident Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {issueLogs.map((issue, index) => (
                        <tr key={issue.id}>
                            <td>{index + 1}</td>
                            <td>{issue.description}</td>
                            <td>{issue.actionTaken}</td>
                            <td>
                                <StatusBadge status={issue.status as StatusType} />
                            </td>
                            <td>{issue.incidentDate}</td>
                            <td>
                                <button
                                    onClick={() => {
                                        setIssueLogId(issue.id);
                                        setShowHandleIssueLog(true);
                                    }}
                                    className={"btn btn-primary"}
                                >
                                    {
                                        issue.status === 'PENDING' ?
                                            <FontAwesomeIcon icon={faWrench} />
                                            :
                                            <FontAwesomeIcon icon={faEye} />
                                    }
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {
                issueLogs.length > 0 &&
                <Pagination
                    currentPage={pagination.offset}
                    totalPages={pagination.totalPage}
                    onPageChange={handlePageChange}
                />
            }
            {
                issueLogs.length === 0 &&
                <NoData />
            }
            {
                showHandleIssueLog &&
                <ModelHandleIssueLog
                    onClose={() => {
                        setShowHandleIssueLog(false);
                        setIssueLogId('');
                    }}
                    issueLogId={issueLogId}
                    reload={() => setReload(!reload)}
                />
            }
        </div>
    )
}

export default IssueLog;