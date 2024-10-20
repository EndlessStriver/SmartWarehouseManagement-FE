import { CloseButton, Col, Row, Table } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import StockEntry from "../../../interface/Entity/StockEntry";
import React from "react";
import GetStockEntryById from "../../../services/StockEntry/GetStockEntryById";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";

interface ViewStockEntryProps {
    onClose: () => void
    stockEntryId: string
}

const ViewStockEntry: React.FC<ViewStockEntryProps> = (props) => {

    const [stockEntry, setStockEntry] = React.useState<StockEntry>();
    const dispatch = useDispatchMessage();

    const formattedDate = stockEntry?.receiveDate
    ? new Date(stockEntry.receiveDate).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
      })
    : '';

    React.useEffect(() => {
        GetStockEntryById(props.stockEntryId)
            .then((res) => {
                setStockEntry(res);
            }).catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            })
    }, [props.stockEntryId]);

    return (
        <OverLay>
            <div className="bg-light p-4 rounded position-relative" style={{ width: "800px" }}>
                <CloseButton onClick={() => props.onClose()} className="position-absolute" style={{ top: "15px", right: "15px" }} />
                <h1 className="fw-bold">View Stock Entry</h1>
                <Row>
                    <Col>
                        <p>Create By: {stockEntry?.receiveBy}</p>
                        <p>Supplier Name: {stockEntry?.supplier.name}</p>
                    </Col>
                    <Col>
                        <p>Create Date: {formattedDate}</p>
                        <p>Supplier Phone: {stockEntry?.supplier.phone}</p>
                    </Col>
                    <Row>
                        <p>Supplier Address: {stockEntry?.supplier.address}</p>
                    </Row>
                </Row>
                <h6>List Product Orders</h6>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            stockEntry?.receiveItems.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.product.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price}$</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </div>
        </OverLay>
    )
}

export default ViewStockEntry;