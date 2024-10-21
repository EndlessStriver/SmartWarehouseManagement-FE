import { Button, CloseButton, Col, Row, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import GetProfile from "../../../util/GetProfile"
import React from "react"
import ViewStockEntry from "./ViewStockEntry"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faMapMarkerAlt, faTrash } from "@fortawesome/free-solid-svg-icons"
import ListProductStockEntry from "./ListProductStockEntry"
import { NoData } from "../../../compoments/NoData/NoData"

interface HandleStockEntryPageProps {
    onClose: () => void
    stockEntryId: string
}

interface ProductCheck {
    id: string
    productName: string
    quantity: number
    productStatus: string
    location: string
}

const HandleStockEntryPage: React.FC<HandleStockEntryPageProps> = (props) => {

    const dispatch = useDispatchMessage();
    const profile = GetProfile();
    const [showViewStockEntry, setShowViewStockEntry] = React.useState<boolean>(false);
    const [showListProductStockEntry, setShowListProductStockEntry] = React.useState<boolean>(false);
    const [createDate, setCreateDate] = React.useState<string>("");
    const [productChecks, setProductChecks] = React.useState<ProductCheck[]>([]);

    React.useEffect(() => {
        const now = new Date();
        now.setHours(now.getHours() + 7);
        const formattedDate = now.toISOString().slice(0, 16);
        setCreateDate(formattedDate);
    }, []);

    const handleAddProductCheck = (productCheck: ProductCheck) => {
        setProductChecks([...productChecks, productCheck]);
    }

    return (
        <OverLay className="disabled-padding">
            <div className="w-100 h-100 bg-light p-5">
                <CloseButton
                    className="position-fixed"
                    style={{ top: "15px", right: "15px" }}
                    onClick={props.onClose}
                />
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="fw-bold">Handle Stock Entry</h2>
                    <Button variant="info" className="text-light fw-bold" onClick={() => setShowViewStockEntry(true)}>
                        <FontAwesomeIcon icon={faEye} className="me-2" /> Stock Entry
                    </Button>
                </div>
                <div className="d-flex flex-row gap-3 w-100 mb-3">
                    <div className="w-100">
                        <label>Goods Inspector</label>
                        <input
                            type="text"
                            className="form-control p-3"
                            placeholder="Enter goods inspector"
                            value={profile?.fullName}
                            readOnly
                            disabled
                        />
                    </div>
                    <div className="w-100">
                        <label>Create Date</label>
                        <input
                            type="datetime-local"
                            className="form-control p-3"
                            value={createDate}
                            onChange={(e) => setCreateDate(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <div className="d-flex flex-row justify-content-end align-items-center p-2">
                        <Button onClick={() => {
                            setShowListProductStockEntry(true);
                        }} variant="primary" className="text-light fw-bold">Add Product & Resolve Issue</Button>
                    </div>
                    <Row>
                        <Col sm={7}>
                            <h6 className="fw-bold">Product Check</h6>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product Name</th>
                                        <th>Quantity</th>
                                        <th>Product Status</th>
                                        <th>Location</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        productChecks.map((productCheck, index) => (
                                            <tr key={productCheck.id}>
                                                <td>{index + 1}</td>
                                                <td>{productCheck.productName}</td>
                                                <td style={{ width: "120px" }}>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={productCheck.quantity}
                                                        onChange={(e) => {
                                                            const newProductChecks = [...productChecks];
                                                            newProductChecks[index].quantity = parseInt(e.target.value);
                                                            setProductChecks(newProductChecks);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-select"
                                                        value={productCheck.productStatus}
                                                        onChange={(e) => {
                                                            const newProductChecks = [...productChecks];
                                                            newProductChecks[index].productStatus = e.target.value;
                                                            setProductChecks(newProductChecks);
                                                        }}
                                                    >
                                                        <option value="">-- Select a status --</option>
                                                        <option value="NORMAL">NORMAL</option>
                                                        <option value="DAMAGED">DAMAGED</option>
                                                        <option value="MISSING">MISSING</option>
                                                    </select>
                                                </td>
                                                <td className="text-center">
                                                    <button className="btn btn-light shadow">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                    </button>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="danger"
                                                        className="text-light"
                                                        onClick={() => {
                                                            const newProductChecks = [...productChecks];
                                                            newProductChecks.splice(index, 1);
                                                            setProductChecks(newProductChecks);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                            {
                                productChecks.length === 0 &&
                                <NoData />
                            }
                        </Col>
                        <Col sm={5}>
                            <h6 className="fw-bold">Product Issue</h6>
                            <NoData />
                        </Col>
                    </Row>
                </div>
            </div>
            {
                showViewStockEntry &&
                <ViewStockEntry
                    stockEntryId={props.stockEntryId}
                    onClose={() => {
                        setShowViewStockEntry(false);
                    }}
                />
            }
            {
                showListProductStockEntry &&
                <ListProductStockEntry
                    onClose={() => {
                        setShowListProductStockEntry(false);
                    }}
                    stockEntryId={props.stockEntryId}
                    addProductCheck={handleAddProductCheck}
                />
            }
        </OverLay>
    )
}

export default HandleStockEntryPage