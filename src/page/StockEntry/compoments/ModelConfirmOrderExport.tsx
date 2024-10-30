import { CloseButton, Col, Row, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import React from "react"
import ConfirmOrderExport from "../../../services/StockEntry/ConfirmOrderExport"
import ActionTypeEnum from "../../../enum/ActionTypeEnum"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import DeleteOrderExport from "../../../services/StockEntry/DeleteOrderExport"
import SpinnerLoadingOverLayer from "../../../compoments/Loading/SpinnerLoadingOverLay"
import GetOrderExportById, { ExportOrder } from "../../../services/StockEntry/GetOrderExportById"

interface ModelConfirmOrderExportProps {
    onClose: () => void
    exportOrderId: string
}

const ModelConfirmOrderExport: React.FC<ModelConfirmOrderExportProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [orderExport, setOrderExport] = React.useState<ExportOrder>();

    React.useEffect(() => {
        GetOrderExportById(props.exportOrderId)
            .then((response) => {
                setOrderExport(response);
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            })
            .finally(() => {
                setIsLoading(false);
            })
    }, [dispatch, props.exportOrderId]);

    const handleConfirmOrderExport = () => {
        setIsLoading(true);
        ConfirmOrderExport(props.exportOrderId)
            .then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Xác nhận đơn hàng xuất kho thành công" });
                props.onClose();
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            })
            .finally(() => {
                setIsLoading(false);
            })
    }

    const handleCancel = () => {
        setIsLoading(true);
        DeleteOrderExport(props.exportOrderId)
            .then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Hủy đơn hàng xuất kho thành công" });
                props.onClose();
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            })
            .finally(() => {
                setIsLoading(false);
            })
    }

    return (
        <OverLay>
            <div className="position-relative bg-light rounded p-3" style={{ width: "800px" }}>
                <CloseButton onClick={() => props.onClose()} className="position-absolute" style={{ top: "15px", right: "15px" }} />
                <h3 className="text-center">Xác Nhận Đơn Hàng Xuất Kho</h3>
                <Row>
                    <Col>
                        <p>Mã Phiếu Xuất Kho: <span className="fw-bold">{orderExport?.exportCode}</span></p>
                    </Col>
                    <Col>
                        <p>Ngày tạo: <span className="fw-bold">{orderExport?.exportDate}</span></p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p>Người tạo: <span className="fw-bold">{orderExport?.exportBy}</span></p>
                    </Col>
                    <Col>
                        <p>Tổng số lượng sản phẩm: <span className="fw-bold">{orderExport?.totalQuantity} sản phẩm</span></p>
                    </Col>
                </Row>
                <p>Mô tả: <span className="fw-bold">{orderExport?.description}</span></p>
                <h5>Danh Sách Đơn Hàng Xuất Kho</h5>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mã Sản Phẩm</th>
                            <th>Tên Sản Phẩm</th>
                            <th>Số Lượng</th>
                            <th>Đơn Vị</th>
                            <th>Vị Trí</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            orderExport?.orderExportDetails.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.product.productCode}</td>
                                        <td>{item.product.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.unit.name}</td>
                                        <td>{item.retrievedProducts[0].locationCode}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
                {
                    orderExport?.status === "PENDING" &&
                    <div className="d-flex justify-content-end gap-2">
                        <button
                            disabled={isLoading}
                            className="btn btn-primary"
                            onClick={handleConfirmOrderExport}
                        >
                            {isLoading ? "Đang xử lý..." : "Xác nhận"}
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={handleCancel}
                            className="btn btn-danger"
                        >
                            {isLoading ? "Đang xử lý..." : "Hủy"}
                        </button>
                    </div>

                }
            </div>
            {
                isLoading && <SpinnerLoadingOverLayer />
            }
        </OverLay>
    )
}

export default ModelConfirmOrderExport