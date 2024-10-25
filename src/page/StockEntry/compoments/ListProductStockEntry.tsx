import { CloseButton, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { StockEntryItem } from "../../../services/StockEntry/GetListItemByStockEntryId"
import React from "react"
import GetListItemByStockEntryId from '../../../services/StockEntry/GetListItemByStockEntryId';
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";


interface ListProductStockEntryProps {
    onClose: () => void
    stockEntryId: string
    addProductCheck: (productCheck: any) => void
}

const ListProductStockEntry: React.FC<ListProductStockEntryProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [listItem, setListImte] = React.useState<StockEntryItem[]>([]);

    React.useEffect(() => {
        GetListItemByStockEntryId(props.stockEntryId)
            .then(data => {
                if (data) setListImte(data);
            })
            .catch(err => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message })
            })
    }, [dispatch, props.stockEntryId]);

    return (
        <OverLay>
            <div className="bg-white rounded" style={{ width: "700px" }}>
                <div className="d-flex justify-content-between align-items-center p-3">
                    <h2 className="fw-bold">List Product Stock Entry</h2>
                    <CloseButton onClick={props.onClose} />
                </div>
                <div className="p-3">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                listItem.map((item, index) => (
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
                                                            quantity: 0,
                                                            productStatus: "",
                                                            location: null,
                                                            incidentLog: null
                                                        })
                                                        props.onClose();
                                                    }}
                                                    className="btn btn-primary"
                                                >
                                                    <FontAwesomeIcon icon={faCheck} /> Add
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