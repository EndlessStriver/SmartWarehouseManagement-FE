import React from "react";
import { Table } from "react-bootstrap";
import GetAllTransactionIventory, { TransactionData } from "../../services/StockEntry/GetAllTransactionIventory";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import formatDateVietNam from "../../util/FormartDateVietnam";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import ModelViewIventoryDetail from "./compoments/ModelViewIventoryDetail";

const Iventory: React.FC = () => {

    const dispatch = useDispatchMessage();
    const [loading, setloading] = React.useState<boolean>(false);
    const [transactionData, setTransactionData] = React.useState<TransactionData[]>([]);
    const [showIventoryDetail, setShowIventoryDetail] = React.useState<boolean>(false);
    const [iventoryId, setIventoryId] = React.useState<string>("");

    React.useEffect(() => {
        setloading(true);
        GetAllTransactionIventory()
            .then((res) => {
                if (res) {
                    setTransactionData(res.data);
                }
            })
            .catch((err) => {
                dispatch({ message: err.message, type: ActionTypeEnum.ERROR })
            })
            .finally(() => {
                setloading(false);
            })
    }, [dispatch])

    return (
        <div className={"w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Kiểm Kê Kho</h2>
                    <p className={"h6"}>Bạn có thể tra cứu thông tin kiểm kê kho ở đây</p>
                </div>
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
        </div>
    )
}

export default Iventory;