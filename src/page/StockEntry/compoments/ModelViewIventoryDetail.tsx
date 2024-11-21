import { Container, Table } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import GetIventoryById, { Transaction } from "../../../services/StockEntry/GetIventoryById";
import React from "react";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import formatDateVietNam from "../../../util/FormartDateVietnam";

interface ModelViewIventoryDetailProps {
    onClose: () => void;
    iventoryId: string;
}

const ModelViewIventoryDetail: React.FC<ModelViewIventoryDetailProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [transaction, setTransaction] = React.useState<Transaction>();

    React.useEffect(() => {
        GetIventoryById(props.iventoryId)
            .then((res) => {
                if (res) {
                    setTransaction(res);
                }
            })
            .catch((err) => {
                console.log(err);
                dispatch({ message: err.message, type: ActionTypeEnum.ERROR })
            })
    }, [props.iventoryId, dispatch])

    const renderTransaction = () => {
        return (
            transaction?.inventory.map((itemParent, index) => (
                <div className="inventory-transaction-details p-4 bg-light rounded shadow mb-3">
                    <div className="d-flex flex-row justify-content-between align-items-center mb-4">
                        <p className={`fw-bold ${itemParent.shelves?.typeShelf === "NORMAL" ? "text-primary" : "text-danger"} mb-0`}>
                            KỆ {itemParent.shelves?.name || "Không xác định"}
                        </p>
                        <p className={`fw-bold ${itemParent.shelves?.typeShelf === "NORMAL" ? "text-primary" : "text-danger"} mb-0`}>
                            {itemParent.shelves?.typeShelf === "NORMAL" ? "Kệ Thường" : "Kệ Lỗi"}
                        </p>
                    </div>
                    <Table striped bordered hover responsive className="mb-0 table-custom">
                        <thead className="table-primary text-center">
                            <tr>
                                <th>Mã Vị Trí</th>
                                <th>Tên Sản Phẩm</th>
                                <th>Số Lượng Thay Đổi</th>
                                <th>Tăng/Giảm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                itemParent.inventoryDetail.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{item.location.locationCode}</td>
                                        <td>{item.products.name}</td>
                                        <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                        <td style={{ textAlign: "center" }}>{item.quantity === 0 ? "------" : (item.isIncrease ? "Tăng" : "Giảm")}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </div>
            ))
        )
    }

    return (
        <OverLay className="disabled-padding bg-light p-4">
            <Container fluid className="h-100 w-100 position-relative shadow p-3 rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex flex-row align-items-center gap-2">
                        <button
                            onClick={() => {
                                props.onClose();
                            }}
                            className="btn fs-3 px-3 text-primary"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h2 className="fw-bold mb-0">
                            Chi Tiết Kiểm Kê
                        </h2>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "300px",
                    }}
                >
                    <p className="fw-bold mb-0 h5">Mã Kiểm Kê: {transaction?.id}</p>
                    <p className="fw-bold mb-0 h5">Ngày Kiểm Kê: {formatDateVietNam(transaction?.transactionDate || "")}</p>
                </div>
                <p className="fw-bold my-3 h5">Ghi Chú: {transaction?.note}</p>
                {renderTransaction()}
            </Container>
        </OverLay >
    )
}

export default ModelViewIventoryDetail;