import { Badge, CloseButton, Col, Row, Tab, Table } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import React from "react";
import GetReceiveCheckByStockEntryId, { IReceiving } from "../../../services/StockEntry/GetReceiveCheckByStockEntryId";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";

interface ViewReceiveCheckProps {
    onClose: () => void;
    stockEntryId: string;
}

interface StatusBadgeProps {
    status: 'MISSING' | 'NORMAL' | 'DAMAGED' | 'SURPLUS';
}

const ViewReceiveCheck: React.FC<ViewReceiveCheckProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [iReceiving, setIReceiving] = React.useState<IReceiving>();

    React.useEffect(() => {
        GetReceiveCheckByStockEntryId(props.stockEntryId)
            .then((res) => {
                setIReceiving(res)
            })
            .catch((error) => {
                console.error(error)
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            })
    }, [dispatch, props.stockEntryId]);

    const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
        const getBadgeVariant = (status: StatusBadgeProps['status']): string => {
            switch (status) {
                case 'MISSING':
                    return 'danger';
                case 'NORMAL':
                    return 'success';
                case 'DAMAGED':
                    return 'warning';
                case 'SURPLUS':
                    return 'info';
                default:
                    return 'secondary';
            }
        };

        return (
            <Badge pill bg={getBadgeVariant(status)}>
                {status}
            </Badge>
        );
    };

    return (
        <OverLay>
            <div className="position-relative bg-light rounded p-4" style={{ width: "1000px" }}>
                <CloseButton
                    onClick={() => props.onClose()}
                    className="position-absolute"
                    style={{ top: "15px", right: "15px" }}
                />
                <h3 className="text-start fw-semibold">Check Stock Entry</h3>
                <h6>
                    <span className="fw-bold">Check ID: </span>
                    {iReceiving?.id}
                </h6>
                <Row className="mb-3">
                    <Col>
                        <h6>
                            <span className="fw-bold">Receive By: </span>
                            {iReceiving?.receiveBy}
                        </h6>
                    </Col>
                    <Col>
                        <h6>
                            <span className="fw-bold">Receive Date: </span>
                            {iReceiving?.receiveDate}
                        </h6>
                    </Col>
                </Row>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Location</th>
                            <th>Quantity</th>
                            <th>Item Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            iReceiving?.checkItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.product.name}</td>
                                    <td>{item.sku.skuCode}</td>
                                    <td style={{ textAlign: "center" }}>{item.locations[0]?.locationCode || "-------"}</td>
                                    <td style={{ textAlign: "center" }}>{item.receiveQuantity}</td>
                                    <td style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                        <StatusBadge status={item.itemStatus as StatusBadgeProps['status']} />
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>
        </OverLay>
    );
}

export default ViewReceiveCheck;