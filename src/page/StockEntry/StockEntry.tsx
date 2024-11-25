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
import { faClipboardCheck, faEye, faPencilAlt, faRedo, faTrash } from "@fortawesome/free-solid-svg-icons";
import RemoveStockEntry from "../../services/StockEntry/RemoveStockEntry";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";
import './css/StockEntry.css';
import HandleStockEntryPage from "./compoments/HandleStockEntryPage";
import { NoData } from "../../compoments/NoData/NoData";
import formatDateVietNam from "../../util/FormartDateVietnam";
import DatePicker from "react-datepicker";
import FindStockEntry from "../../services/StockEntry/FindStockEntry";
import formatDateForInputNoTime from "../../util/FormartDateInputNoTime";

const StockEntry: React.FC = () => {
    const dispatch = useDispatchMessage();
    const [reload, setReload] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [stockEntry, setStockEntry] = React.useState<ReceiveHeader[]>([]);
    const [stockEntryId, setStockEntryId] = React.useState<string>("");
    // const [showModelConfirmDelete, setShowModelConfirmDelete] = React.useState<boolean>(false);
    const [pagination, setPagination] = React.useState<PaginationType>({
        totalPage: 0,
        limit: 10,
        offset: 1,
        totalElementOfPage: 0
    });
    const [showFormEdit, setShowFormEdit] = React.useState<boolean>(false);
    const [ShowHandleStockEntry, setShowHandleStockEntry] = React.useState<boolean>(false);
    const [loadingDelete, setLoadingDelete] = React.useState<boolean>(false);
    const [isSearch, setIsSearch] = React.useState<boolean>(false);
    const [from, setFrom] = React.useState<Date | null>(null);
    const [to, setTo] = React.useState<Date | null>(null);

    React.useEffect(() => {
        const id = setTimeout(() => {
            if (!isSearch) {
                setIsLoading(true);
                GetStockEntries(pagination.limit, pagination.offset)
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
            } else {
                FindStockEntry(formatDateForInputNoTime(from!.toString()), formatDateForInputNoTime(to!.toString()), pagination.limit, pagination.offset)
                    .then((res) => {
                        if (res) {
                            setStockEntry(res.data.map((item) => {
                                return {
                                    id: item.id,
                                    create_at: item.create_at,
                                    update_at: item.update_at,
                                    isDelete: item.isDeleted,
                                    description: item.description,
                                    receiveCode: item.receiveCode,
                                    receiveBy: item.receiveBy,
                                    receiveDate: item.receiveDate,
                                    status: item.status,
                                    totalAmount: item.totalAmount
                                }
                            }));
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
            }
        }, 500);

        return () => clearTimeout(id);
    }, [dispatch, reload, pagination.limit, pagination.offset]);

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
                                {/* <Button onClick={() => {
                                    setStockEntryId(stockEntry.id);
                                    setShowModelConfirmDelete(true);
                                }} variant="danger" size="sm">
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button> */}
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

    const handleSearch = () => {
        const currentDate = new Date();
        if (from === null) {
            dispatch({ message: "Vui lòng chọn ngày bắt đầu", type: ActionTypeEnum.ERROR });
            return;
        }
        if (to === null) {
            dispatch({ message: "Vui lòng chọn ngày kết thúc", type: ActionTypeEnum.ERROR });
            return;
        }
        if (from && to && from > to) {
            dispatch({ message: "Ngày bắt đầu không thể lớn hơn ngày kết thúc", type: ActionTypeEnum.ERROR });
            return;
        }
        if (from && to && from > currentDate) {
            dispatch({ message: "Ngày bắt đầu không thể lớn hơn ngày hiện tại", type: ActionTypeEnum.ERROR });
            return;
        }
        if (from && to && to > currentDate) {
            dispatch({ message: "Ngày kết thúc không thể lớn hơn ngày hiện tại", type: ActionTypeEnum.ERROR });
            return;
        }
        setIsSearch(true);
        setReload(!reload);
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
            <div className='d-flex flex-row gap-3 justify-content-end align-items-center mb-3'>
                <span className='fw-bold'>Từ ngày</span>
                <div
                    style={{ width: "230px" }}
                >
                    <DatePicker
                        className="p-1"
                        selected={from}
                        onChange={(date) => setFrom(date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Chọn ngày..."
                    />
                </div>
                <span className='fw-bold'>Đến ngày</span>
                <div style={{ width: "230px" }}>
                    <DatePicker
                        className="p-1"
                        selected={to}
                        onChange={(date) => setTo(date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Chọn ngày..."
                    />
                </div>
                <button
                    onClick={() => {
                        handleSearch();
                    }}
                    className='btn btn-primary'
                >
                    Tìm kiếm
                </button>
                <button
                    onClick={() => {
                        setFrom(null);
                        setTo(null);
                        setIsSearch(false);
                        setReload(!reload);
                    }}
                    className='btn btn-primary'
                >
                    <FontAwesomeIcon icon={faRedo} />
                </button>
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
            {/* {
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
            } */}
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