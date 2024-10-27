import { CloseButton, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import StockEntry from "../../../interface/Entity/StockEntry";
import { ProductCheck } from "./HandleStockEntryPage";


interface ListProductStockEntryProps {
    onClose: () => void
    stockEntry: StockEntry;
    addProductCheck: (productCheck: ProductCheck) => void
}

const ListProductStockEntry: React.FC<ListProductStockEntryProps> = (props) => {

    return (
        <OverLay>
            <div className="bg-white rounded" style={{ width: "700px" }}>
                <div className="d-flex justify-content-between align-items-center p-3">
                    <h2 className="fw-bold">Danh sách sản phẩm cần kiểm tra</h2>
                    <CloseButton onClick={props.onClose} />
                </div>
                <div className="p-3">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên sản phẩm</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                props.stockEntry.receiveItems.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.product.name}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        props.addProductCheck({
                                                            id: item.id,
                                                            productName: item.product.name,
                                                            unit: item.unit,
                                                            quantity: item.quantity,
                                                            productStatus: "NORMAL",
                                                            location: null,
                                                        })
                                                        props.onClose();
                                                    }}
                                                    className="btn btn-primary"
                                                >
                                                    <FontAwesomeIcon icon={faCheck} /> Thêm
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </div>
            </div>
        </OverLay>
    )
}

export default ListProductStockEntry