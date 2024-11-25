import React from "react";
import { Table } from "react-bootstrap";
import GetAllTransactionIventory, { TransactionData } from "../../services/StockEntry/GetAllTransactionIventory";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import formatDateVietNam from "../../util/FormartDateVietnam";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faRedo } from "@fortawesome/free-solid-svg-icons";
import ModelViewIventoryDetail from "./compoments/ModelViewIventoryDetail";
import DatePicker from "react-datepicker";
import FindIventory from "../../services/StockEntry/FindIventory";
import Pagination from "../../compoments/Pagination/Pagination";

const Iventory: React.FC = () => {

    const dispatch = useDispatchMessage();
    const [loading, setloading] = React.useState<boolean>(false);
    const [transactionData, setTransactionData] = React.useState<TransactionData[]>([]);
    const [showIventoryDetail, setShowIventoryDetail] = React.useState<boolean>(false);
    const [iventoryId, setIventoryId] = React.useState<string>("");
    const [pagination, setPagination] = React.useState({ limit: 10, offset: 1, totalPage: 1 });
    const [isSearch, setIsSearch] = React.useState<boolean>(false);
    const [from, setFrom] = React.useState<Date | null>(null);
    const [to, setTo] = React.useState<Date | null>(null);
    const [isGetData, setIsGetData] = React.useState<boolean>(false);

    React.useEffect(() => {
        const id = setTimeout(() => {
            setloading(true);
            if (!isSearch) {
                GetAllTransactionIventory()
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
            } else {
                FindIventory(from!.toDateString(), to!.toDateString(), pagination.limit, pagination.offset)
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
    }, [dispatch, isGetData, pagination.limit, pagination.offset, pagination.totalPage])

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

    return (
        <div className={"w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Kiểm Kê Kho</h2>
                    <p className={"h6"}>Bạn có thể tra cứu thông tin kiểm kê kho ở đây</p>
                </div>
            </div>
            <div className='d-flex flex-row gap-3 justify-content-end align-items-center mb-3'>
                <span className='fw-bold'>Từ ngày</span>
                <DatePicker
                    className="p-1"
                    selected={from}
                    onChange={(date) => setFrom(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày..."
                />
                <span className='fw-bold'>Đến ngày</span>
                <DatePicker
                    className="p-1"
                    selected={to}
                    onChange={(date) => setTo(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày..."
                />
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
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        transactionData.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.id}</td>
                                <td>{formatDateVietNam(item.transactionDate)}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setIventoryId(item.id);
                                            setShowIventoryDetail(true);
                                        }}
                                        className={"btn btn-primary"}
                                    >
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
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
                transactionData.length > 0 &&
                <Pagination
                    currentPage={pagination.offset}
                    totalPages={pagination.totalPage}
                    onPageChange={(page) => {
                        setPagination({ ...pagination, offset: page });
                    }}
                />
            }
        </div>
    )
}

export default Iventory;