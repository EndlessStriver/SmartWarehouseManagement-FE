import React from "react";
import { Badge, Button, Table } from "react-bootstrap";
import { NoData } from "../../compoments/NoData/NoData";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import FormEditExportProduct from "./compoments/FormEditExportProduct";
import GetAllOrderExport, { ExportOrderData } from "../../services/StockEntry/GetAllOrderExport";
import PaginationType from "../../interface/Pagination";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import Pagination from "../../compoments/Pagination/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck, faEdit, faEye, faRedo } from "@fortawesome/free-solid-svg-icons";
import ModelConfirmOrderExport from "./compoments/ModelConfirmOrderExport";
import DatePicker from "react-datepicker";
import FindOrderExport from "../../services/StockEntry/FindOrderExport";
import { useNavigate } from "react-router-dom";
import formatDateTimeVietNamHaveTime from "../../util/FormartDateVietnameHaveTime";
import GetProfile from "../../util/GetProfile";

const ExportProduct: React.FC = () => {

    const user = GetProfile();
    const navigate = useNavigate();
    const dispatch = useDispatchMessage();
    const [showFormEditExportProduct, setShowFormEditExportProduct] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [exportProduct, setExportProduct] = React.useState<ExportOrderData[]>([]);
    const [pagination, setPagination] = React.useState<PaginationType>({
        limit: 10,
        offset: 1,
        totalPage: 0,
        totalElementOfPage: 0
    });
    const [showModelConfirmOrderExport, setShowModelConfirmOrderExport] = React.useState<boolean>(false);
    const [exportOrderId, setExportOrderId] = React.useState<string>("");
    const [reload, setReload] = React.useState<boolean>(false);
    const [isSearch, setIsSearch] = React.useState<boolean>(false);
    const [from, setFrom] = React.useState<Date | null>(null);
    const [to, setTo] = React.useState<Date | null>(null);

    React.useEffect(() => {
        if (!isSearch) {
            GetAllOrderExport(navigate, pagination.limit, pagination.offset)
                .then((response) => {
                    if (response) {
                        setExportProduct(response.data);
                        setPagination({
                            limit: response.limit,
                            offset: response.offset,
                            totalPage: response.totalPage,
                            totalElementOfPage: response.totalElementOfPage
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                })
                .finally(() => {
                    setIsLoading(false);
                })
        } else {
            FindOrderExport(navigate, from!.toDateString(), to!.toDateString(), pagination.limit, pagination.offset)
                .then((response) => {
                    if (response) {
                        setExportProduct(response.data);
                        setPagination({
                            limit: response.limit,
                            offset: response.offset,
                            totalPage: response.totalPage,
                            totalElementOfPage: response.totalElementOfPage
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                })
                .finally(() => {
                    setIsLoading(false);
                })
        }
    }, [dispatch, pagination.limit, pagination.offset, reload]);

    const handleChangePage = (page: number) => {
        setPagination({
            ...pagination,
            offset: page
        });
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
                    <h2 className={"h2 fw-bold"}>Quản Lý Xuất Kho</h2>
                    <p className={"h6"}>Bạn có thể quản lý việc xuất kho ở đây</p>
                </div>
                {
                    user !== null && (user.role.name === "admin" || user.role.name === "warehouse_manager") &&
                    <div className="d-flex flex-row gap-3">
                        <Button onClick={() => {
                            setShowFormEditExportProduct(true);
                        }} variant="info text-light fw-bold">+ Tạo Mới</Button>
                    </div>
                }
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
                        <th>Mã Phiếu Xuất Kho</th>
                        <th>Tạo Bởi</th>
                        <th>Ngày Tạo</th>
                        <th>Trạng Thái</th>
                        {
                            user !== null && (user.role.name === "admin" || user.role.name === "warehouse_manager") &&
                            <th>Hành Động</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        exportProduct.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.exportCode}</td>
                                    <td>{item.exportBy}</td>
                                    <td>{formatDateTimeVietNamHaveTime(item.create_at)}</td>
                                    <td>
                                        {
                                            item.status === "PENDING" ? <Badge bg="warning" text="dark">Chờ xử lý</Badge> : (item.status === "EXPORTED" ? <Badge bg="primary">Đã xuất kho</Badge> : <Badge bg="danger">Đã hủy</Badge>)
                                        }
                                    </td>
                                    {
                                        user !== null && (user.role.name === "admin" || user.role.name === "warehouse_manager") &&
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setExportOrderId(item.id);
                                                        setShowModelConfirmOrderExport(true);
                                                    }}
                                                    className="btn btn-info"
                                                >
                                                    {item.status === "PENDING" ? <FontAwesomeIcon icon={faClipboardCheck} /> : <FontAwesomeIcon icon={faEye} />}
                                                </button>
                                                {
                                                    item.status === "PENDING" &&
                                                    <button
                                                        onClick={() => {
                                                            setExportOrderId(item.id);
                                                            setShowFormEditExportProduct(true);
                                                        }}
                                                        className="btn btn-primary"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                }
                                            </div>
                                        </td>
                                    }
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
            {
                exportProduct.length > 0 &&
                <Pagination
                    currentPage={pagination.offset}
                    totalPages={pagination.totalPage}
                    onPageChange={handleChangePage}
                />
            }
            {
                exportProduct.length === 0 &&
                <NoData />
            }
            {
                isLoading && <SpinnerLoading />
            }
            {
                showFormEditExportProduct &&
                <FormEditExportProduct
                    onClose={() => {
                        setShowFormEditExportProduct(false);
                        setExportOrderId("");
                    }}
                    exportOrderId={exportOrderId}
                    reload={() => {
                        setReload(!reload);
                    }}
                />
            }
            {
                showModelConfirmOrderExport &&
                <ModelConfirmOrderExport
                    onClose={() => {
                        setExportOrderId("");
                        setShowModelConfirmOrderExport(false);
                    }}
                    exportOrderId={exportOrderId}
                    reload={() => {
                        setReload(!reload);
                    }}
                />
            }
        </div>
    )
}

export default ExportProduct;