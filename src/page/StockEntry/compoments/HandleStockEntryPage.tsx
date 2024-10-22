import { Button, CloseButton, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import GetProfile from "../../../util/GetProfile"
import React from "react"
import ViewStockEntry from "./ViewStockEntry"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faMapMarkerAlt, faTrash } from "@fortawesome/free-solid-svg-icons"
import ListProductStockEntry from "./ListProductStockEntry"
import { NoData } from "../../../compoments/NoData/NoData"
import ListShelf from "./ListShelf"
import GetStockEntryById from "../../../services/StockEntry/GetStockEntryById"
import StockEntry from "../../../interface/Entity/StockEntry"
import ActionTypeEnum from "../../../enum/ActionTypeEnum"
import CreateCheckStockEntry, { Receive } from "../../../services/StockEntry/CreateCheckStockEntry"

interface HandleStockEntryPageProps {
    onClose: () => void
    stockEntryId: string
    reload: () => void
}

interface IncidentLog {
    description: string,
    reportBy: string,
    actionTaken: string
}

interface ProductCheck {
    id: string
    productName: string
    quantity: number
    productStatus: string
    location: {
        id: string
        name: string
    }
    incidentLog: IncidentLog | null
}

enum ItemStatus {
    NORMAL = "NORMAL",
    DAMAGED = "DAMAGED",
    MISSING = "MISSING",
    SURPLUS = "SURPLUS"
}

const HandleStockEntryPage: React.FC<HandleStockEntryPageProps> = (props) => {

    const dispatch = useDispatchMessage();
    const profile = GetProfile();
    const [currentIndex, setCurrentIndex] = React.useState<number>(-1);
    const [showViewStockEntry, setShowViewStockEntry] = React.useState<boolean>(false);
    const [showListProductStockEntry, setShowListProductStockEntry] = React.useState<boolean>(false);
    const [showListShelf, setShowListShelf] = React.useState<boolean>(false);
    const [createDate, setCreateDate] = React.useState<string>("");
    const [productChecks, setProductChecks] = React.useState<ProductCheck[]>([]);
    const [stockEntry, setStockEntry] = React.useState<StockEntry>();

    React.useEffect(() => {
        const now = new Date();
        now.setHours(now.getHours() + 7);
        const formattedDate = now.toISOString().slice(0, 16);
        setCreateDate(formattedDate);
    }, []);

    React.useEffect(() => {
        GetStockEntryById(props.stockEntryId)
            .then((response) => {
                setStockEntry(response);
            })
            .catch((error) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            })
    })

    const handleAddProductCheck = (productCheck: ProductCheck) => {
        setProductChecks([...productChecks, productCheck]);
    }

    const handleSetLocation = (nameLocation: string, locationId: string, index: number) => {
        const newProductChecks = [...productChecks];
        newProductChecks[index].location = {
            id: locationId,
            name: nameLocation
        }
        setProductChecks(newProductChecks);
    }

    const validateProductCheck = () => {

        for (let i = 0; i < productChecks.length; i++) {
            if (productChecks[i].productStatus === "") {
                dispatch({ type: ActionTypeEnum.ERROR, message: "Please select product status" });
                return false;
            }

            if (productChecks[i].productStatus !== "MISSING" && productChecks[i].location === null) {
                dispatch({ type: ActionTypeEnum.ERROR, message: "Please select location" });
                return false;
            }

            if (productChecks[i].quantity <= 0 || isNaN(productChecks[i].quantity)) {
                dispatch({ type: ActionTypeEnum.ERROR, message: "Quantity must be greater than 0" });
                return false;
            }
        }
        return true;
    }

    const validateProductCheckLocation = () => {
        for (let i = 0; i < productChecks.length; i++) {
            for (let j = 0; j < productChecks.length; j++) {
                if (i !== j && productChecks[i].location.id === productChecks[j].location.id) {
                    dispatch({ type: ActionTypeEnum.ERROR, message: "Location must be unique" });
                    return false;
                }
            }
        }
        return true;
    }

    const handleSubmit = () => {
        if (validateProductCheck() && validateProductCheckLocation()) {
            const dataSubmit: Receive = {
                receiveId: props.stockEntryId,
                receiveDate: createDate,
                receiveBy: profile?.fullName || "",
                supplierId: stockEntry?.supplier.id || "",
                receiveItems: productChecks.map((productCheck) => {
                    return {
                        receiveItemId: productCheck.id,
                        receiveQuantity: productCheck.quantity,
                        itemStatus: ItemStatus[productCheck.productStatus as keyof typeof ItemStatus],
                        locationId: productCheck.location?.id
                    }
                })
            }

            CreateCheckStockEntry(dataSubmit)
                .then(() => {
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Create check stock entry successfully" });
                    props.reload();
                    props.onClose();
                })
                .catch((error) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                })
        }
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
                    <div className="d-flex gap-3">
                        <Button variant="info" className="text-light" onClick={() => setShowViewStockEntry(true)}>
                            <FontAwesomeIcon icon={faEye} className="me-2" /> Stock Entry
                        </Button>
                        <Button
                            variant="primary"
                            className="text-light"
                            onClick={handleSubmit}
                            disabled={productChecks.length === 0}
                        >
                            Create
                        </Button>
                    </div>
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
                        }} variant="danger" className="text-light">Add Product Check</Button>
                    </div>
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
                                        <td style={{ width: "200px" }}>
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
                                                <option value="SURPLUS">SURPLUS</option>
                                            </select>
                                        </td>
                                        <td className="d-flex gap-2">
                                            {
                                                (productCheck.productStatus === "" || productCheck.productStatus === "MISSING") ?
                                                    <span>---</span>
                                                    :
                                                    <>
                                                        {
                                                            productCheck.location !== null ?
                                                                <div className="d-flex justify-content-center align-items-center gap-3">
                                                                    <span>{productCheck.location.name}</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            setCurrentIndex(index);
                                                                            setShowListShelf(true);
                                                                        }}
                                                                        className="btn btn-light shadow"
                                                                    >
                                                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                                    </button>
                                                                </div>
                                                                : <button
                                                                    onClick={() => {
                                                                        setCurrentIndex(index);
                                                                        setShowListShelf(true);
                                                                    }}
                                                                    className="btn btn-light shadow"
                                                                >
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                                </button>
                                                        }
                                                    </>
                                            }
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
            {
                showListShelf &&
                <ListShelf
                    onClose={() => {
                        setShowListShelf(false);
                        setCurrentIndex(-1);
                    }}
                    currentIndex={currentIndex}
                    handleSetLocation={handleSetLocation}
                />
            }
        </OverLay>
    )
}

export default HandleStockEntryPage