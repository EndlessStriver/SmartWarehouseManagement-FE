import React from "react";
import { Badge, Button, Table } from "react-bootstrap";
import GetAllTransactionIventory, { InventoryTransaction } from "../../services/StockEntry/GetAllTransactionIventory";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import formatDateVietNam from "../../util/FormartDateVietnam";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faRedo, faTrash } from "@fortawesome/free-solid-svg-icons";
import ModelViewIventoryDetail from "./compoments/ModelViewIventoryDetail";
import DatePicker from "react-datepicker";
import FindIventory from "../../services/StockEntry/FindIventory";
import Pagination from "../../compoments/Pagination/Pagination";
import FormEditIventory from "./compoments/FormEditIventory";
import { NoData } from "../../compoments/NoData/NoData";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";
import CancelIventory from "../../services/StockEntry/CancelIventory";
import { useNavigate } from "react-router-dom";
import formatDateTimeVietNamHaveTime from "../../util/FormartDateVietnameHaveTime";

const Iventory: React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useDispatchMessage();
    const [loading, setloading] = React.useState<boolean>(false);
    const [transactionData, setTransactionData] = React.useState<InventoryTransaction[]>([]);
    const [showIventoryDetail, setShowIventoryDetail] = React.useState<boolean>(false);
    const [iventoryId, setIventoryId] = React.useState<string>("");
    const [pagination, setPagination] = React.useState({ limit: 10, offset: 1, totalPage: 1 });
    const [isSearch, setIsSearch] = React.useState<boolean>(false);
    const [from, setFrom] = React.useState<Date | null>(null);
    const [to, setTo] = React.useState<Date | null>(null);
    const [isGetData, setIsGetData] = React.useState<boolean>(false);
    const [reaload, setReaload] = React.useState<boolean>(false);

    const [showFormEdit, setShowFormEdit] = React.useState<boolean>(false);
    const [showModelCancel, setShowModelCancel] = React.useState<boolean>(false);
    const [loadingCancel, setLoadingCancel] = React.useState<boolean>(false);

    React.useEffect(() => {
        const id = setTimeout(() => {
            setloading(true);
            if (!isSearch) {
                GetAllTransactionIventory(navigate)
                    .then((res) => {
                        if (res) {
                            console.log(res);
                            setTransactionData(res.data);
                            setPagination({ limit: res.limit, offset: res.offset, totalPage: res.totalPage });
                        }
                    })
                    .catch((err) => {
                        dispatch({ message: err.message, type: ActionTypeEnum.ERROR })
                    })
                    .finally(() => {
                        setloading(false);
                    })
            } else {
                FindIventory(navigate, from!.toDateString(), to!.toDateString(), pagination.limit, pagination.offset)
                    .then((res) => {
                        if (res) {
                            setTransactionData(res.data);
                            setPagination({ limit: res.limit, offset: res.offset, totalPage: res.totalPage });
                        }
                    })
                    .catch((err) => {
                        dispatch({ message: err.message, type: ActionTypeEnum.ERROR })
                    })
                    .finally(() => {
                        setloading(false);
                    })
            }
        }, 300);

        return () => {
            clearTimeout(id);
        }
    }, [dispatch, isGetData, pagination.limit, pagination.offset, pagination.totalPage, reaload])

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
        setIsGetData(!isGetData);
    }

    const handleCancelIventory = () => {
        setLoadingCancel(true);
        CancelIventory(iventoryId, navigate)
            .then(() => {
                dispatch({ message: "Hủy phiếu kiểm kê thành công", type: ActionTypeEnum.SUCCESS });
                setReaload(!reaload);
                setShowModelCancel(false);
            })
            .catch((err) => {
                dispatch({ message: err.message, type: ActionTypeEnum.ERROR });
            })
            .finally(() => {
                setLoadingCancel(false);
            })
    }

    return (
        <div className={"w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Kiểm Kê Kho</h2>
                    <p className={"h6"}>Bạn có thể tra cứu thông tin kiểm kê kho ở đây</p>
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
                        handleSearch()
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
                        setIsGetData(!isGetData);
                    }}
                    className='btn btn-primary'
                >
                    <FontAwesomeIcon icon={faRedo} />
                </button>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã kiểm kê</th>
                        <th>Ngày kiểm kê</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        transactionData.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.id}</td>
                                <td>{formatDateTimeVietNamHaveTime(item.transactionDate)}</td>
                                <td>{item.inventory[0].status === "PENDING" ? <Badge bg="warning" text="dark">Chờ xử lý</Badge> : (item.inventory[0].status === "COMPLETED" ? <Badge bg="primary">Đã xử lý</Badge> : <Badge bg="danger">Đã hủy</Badge>)}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <button
                                            onClick={() => {
                                                setIventoryId(item.id);
                                                setShowIventoryDetail(true);
                                            }}
                                            className={"btn btn-primary"}
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        {
                                            item.inventory[0].status === "PENDING" &&
                                            <button
                                                onClick={() => {
                                                    setIventoryId(item.id);
                                                    setShowModelCancel(true);
                                                }}
                                                className={"btn btn-danger"}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
            {
                showIventoryDetail && (
                    <ModelViewIventoryDetail
                        onClose={() => {
                            setIventoryId("");
                            setShowIventoryDetail(false);
                        }}
                        iventoryId={iventoryId}
                    />
                )
            }
            {
                transactionData.length > 0 ?
                    <Pagination
                        currentPage={pagination.offset}
                        totalPages={pagination.totalPage}
                        onPageChange={(page) => {
                            setPagination({ ...pagination, offset: page });
                        }}
                    />
                    :
                    <NoData />
            }
            {
                showFormEdit &&
                <FormEditIventory
                    onClose={() => {
                        setShowFormEdit(false);
                    }}
                    reload={() => {
                        setReaload(!reaload);
                    }}
                />
            }
            {
                showModelCancel &&
                <ModelConfirmDelete
                    message="Bạn có chắc chắn muốn hủy phiếu kiểm kê này không?"
                    onClose={() => setShowModelCancel(false)}
                    onConfirm={() => handleCancelIventory()}
                    loading={loadingCancel}
                    lable="Hủy phiếu kiểm kê"
                />
            }
        </div>
    )
}

export default Iventory;