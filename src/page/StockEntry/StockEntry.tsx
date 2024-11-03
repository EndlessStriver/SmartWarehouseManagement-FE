import { Button, Table } from "react-bootstrap";
import React from "react";
import Pagination from "../../compoments/Pagination/Pagination";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import PaginationType from "../../interface/Pagination";
import ReceiveHeader from "../../interface/Entity/ReceiveHeader";
import GetStockEntries from "../../services/StockEntry/GetStockEntries";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import FormEditStockEntry from "./compoments/FormEditStockEntry";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck, faEye, faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import RemoveStockEntry from "../../services/StockEntry/RemoveStockEntry";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";
import './css/StockEntry.css';
import HandleStockEntryPage from "./compoments/HandleStockEntryPage";
import { NoData } from "../../compoments/NoData/NoData";
import formatDateVietNam from "../../util/FormartDateVietnam";


const StockEntry: React.FC = () => {
    const dispatch = useDispatchMessage();
    const [reload, setReload] = React.useState<boolean>(false);
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
                if (res) {
                    setStockEntry(res.data);
                    setPagination({
                        totalPage: res.totalPage,
                        limit: res.limit,
                        offset: res.offset,
                        totalElementOfPage: res.totalElementOfPage
                    });
                }
            }).catch((err) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            }).finally(() => {
                setIsLoading(false);
            })
    }, [dispatch, reload]);
    const handleChangePage = (page: number) => {
        setPagination({ ...pagination, offset: page });
    }
    const handleDeleteStockEntry = (id: string) => {
        setLoadingDelete(true);
        RemoveStockEntry(id)
            .then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Xóa phiếu nhập kho thành công" });
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
                return <span className="badge text-bg-warning">{"Đang Chở Xử Lý"}</span>;
            case "COMPLETERECEIVECHECK":
                return <span className="badge text-bg-primary">{"Đã Nhập Kho"}</span>;
            case "CANCELLED":
                return <span className="badge text-bg-danger">{"Đã Hủy"}</span>;
            default:
                return <span className="badge text-bg-primary">{status}</span>;
        }
    }
    const listStockEntry = stockEntry.map((stockEntry, index) => {
        return (
            <tr key={stockEntry.id}>
                <td>{index + 1}</td>
                <td>{stockEntry.receiveCode}</td>
                <td>{stockEntry.receiveBy}</td>
                <td>{formatDateVietNam(stockEntry.create_at)}</td>
                <td>{renderTypeStatus(stockEntry.status)}</td>
                <td>
                    <div className="d-flex flex-row gap-2">
                        {
                            stockEntry.status === "PENDING" &&
                            <>
                                <Button onClick={() => {
                                    setStockEntryId(stockEntry.id);
                                    setShowHandleStockEntry(true);
                                }} variant="info" size="sm">
                                    <FontAwesomeIcon icon={faClipboardCheck} />
                                </Button>
                                <Button onClick={() => {
                                    setStockEntryId(stockEntry.id);
                                    setShowFormEdit(true);
                                }} variant="primary" size="sm">
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                </Button>
                                <Button onClick={() => {
                                    setStockEntryId(stockEntry.id);
                                    setShowModelConfirmDelete(true);
                                }} variant="danger" size="sm">
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </>
                        }
                        {
                            stockEntry.status !== "PENDING" &&
                            <>
                                <Button onClick={() => {
                                    setStockEntryId(stockEntry.id);
                                    setShowHandleStockEntry(true);
                                }} variant="info" size="sm">
                                    <FontAwesomeIcon icon={faEye} />
                                </Button>
                            </>
                        }
                    </div>
                </td>
            </tr>
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
                    <h2 className={"h2 fw-bold"}>Quản Lý Nhập Kho</h2>
                    <p className={"h6"}>Bạn có thể quản lý nhập kho ở đây</p>
                </div>
                <div className="d-flex flex-row gap-3">
                    <Button onClick={() => {
                        setShowFormEdit(true);
                    }} variant="info text-light fw-bold">+ Tạo Mới</Button>
                </div>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã Phiếu Nhập Kho</th>
                        <th>Tạo Bởi</th>
                        <th>Ngày Tạo</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        listStockEntry
                    }
                </tbody>
            </Table>
            {
                stockEntry.length > 0 ?
                    <Pagination
                        currentPage={pagination?.offset}
                        totalPages={pagination?.totalPage}
                        onPageChange={handleChangePage}
                    />
                    : <NoData />
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
                    message="Bạn có chắc chắn muốn xóa phiếu nhập kho này?"
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
            {
                ShowHandleStockEntry &&
                <HandleStockEntryPage
                    onClose={() => {
                        setShowHandleStockEntry(false);
                        setStockEntryId("");
                    }}
                    stockEntryId={stockEntryId}
                    reload={() => setReload(!reload)}
                />
            }
        </div>
    );
}

export default StockEntry;