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
import { faClipboardCheck, faEdit, faEye } from "@fortawesome/free-solid-svg-icons";
import ModelConfirmOrderExport from "./compoments/ModelConfirmOrderExport";

const ExportProduct: React.FC = () => {

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

    React.useEffect(() => {
        GetAllOrderExport(pagination.limit, pagination.offset)
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
    }, [dispatch, pagination.limit, pagination.offset]);

    const handleChangePage = (page: number) => {
        setPagination({
            ...pagination,
            offset: page
        });
    }

    return (
        <div className={"w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Quản Lý Xuất Kho</h2>
                    <p className={"h6"}>Bạn có thể quản lý việc xuất kho ở đây</p>
                </div>
                <div className="d-flex flex-row gap-3">
                    <Button onClick={() => {
                        setShowFormEditExportProduct(true);
                    }} variant="info text-light fw-bold">+ Tạo Mới</Button>
                </div>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã Phiếu Xuất Kho</th>
                        <th>Tạo Bởi</th>
                        <th>Ngày Tạo</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
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
                                    <td>{item.exportDate}</td>
                                    <td>
                                        {
                                            item.status === "PENDING" ? <Badge bg="primary">Chờ xử lý</Badge> : (item.status === "EXPORTED" ? <Badge bg="success">Đã xuất kho</Badge> : <Badge bg="danger">Đã hủy</Badge>)
                                        }
                                    </td>
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
                    }}
                    exportOrderId={exportOrderId}
                />
            }
            {
                showModelConfirmOrderExport &&
                <ModelConfirmOrderExport
                    onClose={() => {
                        setShowModelConfirmOrderExport(false);
                    }}
                    exportOrderId={exportOrderId}
                />
            }
        </div>
    )
}

export default ExportProduct;