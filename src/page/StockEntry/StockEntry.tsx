import { Button } from "react-bootstrap";
import React from "react";
import Pagination from "../../compoments/Pagination/Pagination";
import { NoData } from "../../compoments/NoData/NoData";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import PaginationType from "../../interface/Pagination";
import ReceiveHeader from "../../interface/Entity/ReceiveHeader";
import GetStockEntries from "../../services/StockEntry/GetStockEntries";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import FormEditStockEntry from "./compoments/FormEditStockEntry";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs, faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import RemoveStockEntry from "../../services/StockEntry/RemoveStockEntry";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";
import './css/StockEntry.css';

const StockEntry: React.FC = () => {

    const dispatch = useDispatchMessage();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [stockEntry, setStockEntry] = React.useState<ReceiveHeader[]>([]);
    const [stockEntryId, setStockEntryId] = React.useState<string>("");
    const [showModelConfirmDelete, setShowModelConfirmDelete] = React.useState<boolean>(false);
    const [pagination, setPagination] = React.useState<PaginationType>({
        totalPage: 0,
        limit: 0,
        offset: 0,
        totalElementOfPage: 0
    });
    const [showFormEdit, setShowFormEdit] = React.useState<boolean>(false);
    const [ShowHandleStockEntry, setShowHandleStockEntry] = React.useState<boolean>(false);
    const [loadingDelete, setLoadingDelete] = React.useState<boolean>(false);

    React.useEffect(() => {
        setIsLoading(true);
        GetStockEntries()
            .then((res) => {
                setStockEntry(res.data);
                setPagination({
                    totalPage: res.totalPage,
                    limit: res.limit,
                    offset: res.offset,
                    totalElementOfPage: res.totalElementOfPage
                });
            }).catch((err) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            }).finally(() => {
                setIsLoading(false);
            })
    }, [dispatch]);

    React.useEffect(() => {

    }, [pagination.offset])

    const handleChangePage = (page: number) => {
        setPagination({ ...pagination, offset: page });
    }

    const handleDeleteStockEntry = (id: string) => {
        setLoadingDelete(true);
        RemoveStockEntry(id)
            .then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Delete stock entry successfully" });
                setStockEntry(stockEntry.filter(item => item.id !== id));
                setStockEntryId("");
            }).catch((err) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            }).finally(() => {
                setLoadingDelete(false);
            });
    }

    const renderTypeStatus = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="badge text-bg-warning">{status}</span>;
            case "COMPLETED":
                return <span className="badge text-bg-success">{status}</span>;
            case "CANCELLED":
                return <span className="badge text-bg-danger">{status}</span>;
            default:
                return <span className="badge text-bg-primary">{status}</span>;
        }
    }

    const listStockEntry = stockEntry.map((stockEntry) => {
        return (
            <div className="mb-3 shadow p-3 rounded">
                <div>
                    <h5>{stockEntry.receiveCode} - {stockEntry.receiveBy}</h5>
                    <p><strong>Received Date:</strong> {stockEntry.receiveDate}</p>
                    <p><strong>Status:</strong> {renderTypeStatus(stockEntry.status)}</p>
                    <p><strong>Description:</strong> {stockEntry.description}</p>
                    <p><strong>Total Amount:</strong> {stockEntry.totalAmount}$</p>
                </div>
                <div className="d-flex align-items-center justify-content-start gap-2">
                    <Button
                        onClick={() => {
                            setStockEntryId(stockEntry.id);
                            setShowFormEdit(true);
                        }}
                        variant="primary"
                        className="text-light fw-bold">
                        <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>

                    <Button
                        onClick={() => {
                            setStockEntryId(stockEntry.id);
                            setShowModelConfirmDelete(true);
                        }}
                        variant="danger"
                        className="text-light fw-bold">
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Button
                        onClick={() => {
                            setShowHandleStockEntry(true);
                            setStockEntryId(stockEntry.id);
                        }}
                        variant="success"
                        className="text-light fw-bold">
                        <FontAwesomeIcon icon={faCogs} />
                    </Button>
                </div>
            </div>
        );
    });

    const updateStockEntry = (response: ReceiveHeader[]) => {
        setStockEntry(response);
    }

    const updatePagination = (response: PaginationType) => {
        setPagination(response);
    }

    return (
        <div className={"w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Stock Entry Management</h2>
                    <p className={"h6"}>Manage stock entry and their status</p>
                </div>
                <div className="d-flex flex-row gap-3">
                    <Button onClick={() => {
                        setShowFormEdit(true);
                    }} variant="info text-light fw-bold">+ NEW</Button>
                </div>
            </div>
            <div className="stock-entry-content-container">
                <div className="px-3 d-flex flex-column gap-2">
                    <Button variant="primary" className="w-100">
                        Pending
                    </Button>
                    <Button variant="outline-primary" className="w-100">
                        Success
                    </Button>
                </div>
                <div
                    className="border p-3 rounded"
                    style={{
                        height: "700px",
                        overflowY: "auto",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gridAutoRows: "300px",
                        gap: "20px"
                    }}
                >
                    {listStockEntry}
                </div>
            </div>
            {
                stockEntry.length > 0 && <Pagination currentPage={pagination?.offset} totalPages={pagination?.totalPage}
                    onPageChange={handleChangePage} />
            }
            {
                (stockEntry.length === 0) && !isLoading && <NoData />
            }
            {
                isLoading && <SpinnerLoading />
            }
            {
                showFormEdit &&
                <FormEditStockEntry
                    handleClose={() => {
                        setShowFormEdit(false)
                        setStockEntryId("");
                    }}
                    stockEntryId={stockEntryId}
                    updateStockEntry={updateStockEntry}
                    updatePagination={updatePagination}
                />
            }
            {
                showModelConfirmDelete &&
                <ModelConfirmDelete
                    message="Are you sure want to delete this stock entry?"
                    onClose={() => {
                        setShowModelConfirmDelete(false)
                        setStockEntryId("");
                    }}
                    onConfirm={() => {
                        handleDeleteStockEntry(stockEntryId);
                        setShowModelConfirmDelete(false);
                    }}
                    loading={loadingDelete}
                />
            }
        </div>
    );
}

export default StockEntry;