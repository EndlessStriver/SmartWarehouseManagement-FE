import { Button, CloseButton, Col, Row, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import GetProfile from "../../../util/GetProfile"
import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMapMarkerAlt, faTrash } from "@fortawesome/free-solid-svg-icons"
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

export interface ProductCheck {
    id: string
    productName: string
    quantity: number
    unit: string
    productStatus: string
    location: {
        id: string
        name: string
    } | null
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
    const [showListProductStockEntry, setShowListProductStockEntry] = React.useState<boolean>(false);
    const [showListShelf, setShowListShelf] = React.useState<boolean>(false);
    const [createDate, setCreateDate] = React.useState<string>("");
    const [productChecks, setProductChecks] = React.useState<ProductCheck[]>([]);
    const [stockEntry, setStockEntry] = React.useState<StockEntry>();
    const [categoryName, setCategoryName] = React.useState<string>("");

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
    }, [props.stockEntryId, dispatch])

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
                dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn trạng thái sản phẩm" });
                return false;
            }

            if (productChecks[i].productStatus !== "MISSING" && productChecks[i].location === null) {
                dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn vị trí sản phẩm" });
                return false;
            }

            if (productChecks[i].quantity <= 0 || isNaN(productChecks[i].quantity)) {
                dispatch({ type: ActionTypeEnum.ERROR, message: "Số lượng phải lớn hơn 0" });
                return false;
            }
        }
        return true;
    }

    const validateProductCheckLocation = () => {
        for (let i = 0; i < productChecks.length; i++) {
            for (let j = 0; j < productChecks.length; j++) {
                if (productChecks[i].location?.id === null || productChecks[j].location?.id === null) continue;
                if (i !== j && productChecks[i].location?.id === productChecks[j].location?.id) {
                    dispatch({ type: ActionTypeEnum.ERROR, message: "Vị trí phải là duy nhất" });
                    return false;
                }
            }
            return true;
        }
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
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Xử lý phiếu nhập kho thành công" });
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
                    <h2 className="fw-bold">Xử lý phiếu nhập kho</h2>
                    <Button
                        variant="primary"
                        className="text-light fw-bold"
                        onClick={() => handleSubmit()}
                        disabled={productChecks.length === 0}
                    >
                        Xác nhận
                    </Button>
                </div>
                <div className="d-flex flex-row gap-3 w-100 mb-3">
                    <div className="w-100">
                        <label>Nhân viên kiểm tra</label>
                        <input
                            type="text"
                            className="form-control p-3"
                            placeholder="Nhập tên nhân viên kiểm tra..."
                            value={profile?.fullName}
                            readOnly
                            disabled
                        />
                    </div>
                    <div className="w-100">
                        <label>Ngày tạo</label>
                        <input
                            type="datetime-local"
                            className="form-control p-3"
                            value={createDate}
                            onChange={(e) => setCreateDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="shadow p-4 rounded mb-2">
                    <h5 className="fw-semibold">Thông Tin Phiếu Nhập Kho</h5>
                    <Row>
                        <Col>
                            <h6>
                                <span className="fw-bold">Mã phiếu nhập: </span>
                                <span className="ms-3">{stockEntry?.receiveCode}</span>
                            </h6>
                        </Col>
                        <Col>
                            <h6>
                                <span className="fw-bold">Ngày lập: </span>
                                <span className="ms-3">{stockEntry?.receiveDate}</span>
                            </h6>
                        </Col>
                    </Row>
                    <h6>
                        <span className="fw-bold">Nhà cung cấp: </span>
                        <span className="ms-3">{stockEntry?.supplier.name}</span>
                    </h6>
                    <h6>
                        <span className="fw-bold">Mô tả: </span>
                        <span className="ms-3">{stockEntry?.description}</span>
                    </h6>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn vị tính</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                stockEntry?.receiveItems.map((receiveItem, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{receiveItem.product.name}</td>
                                        <td>{receiveItem.quantity}</td>
                                        <td>
                                            {
                                                receiveItem.unit === "box" ? "Hộp" : (receiveItem.unit === "carton" ? "Thùng" : receiveItem.unit)
                                            }
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </div>
                <div>
                    <div className="d-flex flex-row justify-content-end align-items-center py-2">
                        <Button onClick={() => {
                            setShowListProductStockEntry(true);
                        }} variant="primary" className="text-light">Thêm sản phẩm kiểm tra</Button>
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn vị tính</th>
                                <th>Trạng thái sản phẩm</th>
                                <th>Vị trí</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                productChecks.map((productCheck, index) => (
                                    <tr key={index}>
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
                                            {productCheck.unit === "box" ? "Hộp" : (productCheck.unit === "carton" ? "Thùng" : productCheck.unit)}
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
                                                <option value="">Chọn trạng thái sản phẩm...</option>
                                                <option value="NORMAL">Bình thường</option>
                                                <option value="DAMAGED">Bị hư hại</option>
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
                showListProductStockEntry &&
                <ListProductStockEntry
                    onClose={() => {
                        setShowListProductStockEntry(false);
                    }}
                    stockEntry={stockEntry as StockEntry}
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