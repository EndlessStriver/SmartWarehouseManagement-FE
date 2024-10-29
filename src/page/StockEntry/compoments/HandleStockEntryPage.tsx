import { Accordion, Button, CloseButton, Col, Row, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import GetProfile from "../../../util/GetProfile"
import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { NoData } from "../../../compoments/NoData/NoData"
import GetStockEntryById from "../../../services/StockEntry/GetStockEntryById"
import StockEntry from "../../../interface/Entity/StockEntry"
import ActionTypeEnum from "../../../enum/ActionTypeEnum"
import ModelAddItemCheck from "./ModelAddItemCheck"
import { v4 as uuidv4 } from 'uuid';

interface HandleStockEntryPageProps {
    onClose: () => void
    stockEntryId: string
    reload: () => void
}

interface listAddLocationInf {
    id: string
    quantity: number
    status: string
    location: {
        id: string
        name: string
    }
}

export interface ProductCheck {
    id: string
    productId: string
    productName: string
    quantity: number
    unit: string
    categoryName: string
    volume: number
    listAddLocation: listAddLocationInf[]
}

const HandleStockEntryPage: React.FC<HandleStockEntryPageProps> = (props) => {

    const dispatch = useDispatchMessage();
    const profile = GetProfile();
    const [createDate, setCreateDate] = React.useState<string>("");
    const [productChecks, setProductChecks] = React.useState<ProductCheck[]>([]);
    const [stockEntry, setStockEntry] = React.useState<StockEntry>();
    const [showModelAddItemCheck, setShowModelAddItemCheck] = React.useState<boolean>(false);

    const [categoryName, setCategoryName] = React.useState<string>("");
    const [volume, setVolume] = React.useState<number>(0);
    const [quantity, setQuantity] = React.useState<number>(0);
    const [productCheckId, setProductCheckId] = React.useState<string>("");
    const [productId, setProductId] = React.useState<string>("");

    React.useEffect(() => {
        const now = new Date();
        now.setHours(now.getHours() + 7);
        const formattedDate = now.toISOString().slice(0, 16);
        setCreateDate(formattedDate);
    }, []);

    React.useEffect(() => {
        GetStockEntryById(props.stockEntryId)
            .then((response) => {
                console.log(response?.receiveItems[0]);
                if (response) {
                    const productChecks: ProductCheck[] = response.receiveItems.map((receiveItem) => {
                        console.log(receiveItem);
                        return {
                            id: receiveItem.id,
                            productId: receiveItem.product.id,
                            productName: receiveItem.product.name,
                            quantity: receiveItem.quantity,
                            unit: receiveItem.unit,
                            categoryName: receiveItem.product.category.name,
                            volume: getVolume(receiveItem.sku.dimension),
                            listAddLocation: []
                        }
                    });
                    setProductChecks(productChecks);
                }
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            })
    }, [props.stockEntryId, dispatch])

    const getVolume = (dimension: string) => {
        const dimensionArr = dimension.split("x");
        const volume = dimensionArr.reduce((acc, cur) => {
            return acc * Number(cur);
        }, 1);
        return volume;
    }

    const validateAddLocation = (productCheckId: string, quantity: number) => {

        const productCheck = productChecks.find((productCheck) => productCheck.id === productCheckId);

        if (!productCheck) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Không tìm thấy sản phẩm" });
            return false;
        }

        let sumQuantity = productCheck?.listAddLocation.reduce((acc, cur) => {
            return acc + cur.quantity;
        }, 0);

        if (sumQuantity + quantity > productCheck?.quantity) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Tổng số lượng vượt quá số lượng nhập" });
            return false;
        }

        return true
    }

    const removeListAddLocation = (productCheckId: string, locationId: string) => {
        const newProductChecks = productChecks.map((productCheck) => {
            if (productCheck.id === productCheckId) {
                productCheck.listAddLocation = productCheck.listAddLocation.filter((location) => location.id !== locationId);
            }
            return productCheck;
        });

        setProductChecks(newProductChecks);
    }

    const addListAddLocation = (id: string, quantity: number, status: string, location: { id: string, name: string }) => {
        if (!validateAddLocation(id, quantity)) return;
        const newProductChecks = productChecks.map((productCheck) => {
            if (productCheck.id === id) {
                productCheck.listAddLocation.push({
                    quantity: quantity,
                    status: status,
                    location: location,
                    id: uuidv4()
                });
            }
            return productCheck;
        });
        setProductChecks(newProductChecks);
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
                        onClick={() => { }}
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
                <div>
                    <div className="d-flex flex-row justify-content-start align-items-center py-2">
                        <h5 className="fw-semibold">Danh Sách Sản Phẩm Kiểm Tra</h5>
                    </div>
                    <Accordion defaultActiveKey="0">
                        {
                            productChecks.map((productCheck, index) => {
                                return (
                                    <Accordion.Item key={index} eventKey={index + ""}>
                                        <Accordion.Header>
                                            <Row className="w-100">
                                                <Col>
                                                    <span>
                                                        Tên sản phẩm:
                                                        <span className="fw-semibold"> {productCheck.productName}</span>
                                                    </span>
                                                </Col>
                                                <Col>
                                                    <span>
                                                        Loại sản phẩm:
                                                        <span className="fw-semibold"> {productCheck.categoryName}</span>
                                                    </span>
                                                </Col>
                                                <Col>
                                                    <span>
                                                        Số lượng nhập:
                                                        <span className="fw-semibold"> {productCheck.quantity}</span>
                                                    </span>
                                                </Col>
                                                <Col>
                                                    <span>
                                                        Đơn vị:
                                                        <span className="fw-semibold"> {productCheck.unit}</span>
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="d-flex justify-content-end mb-3">
                                                <button
                                                    onClick={() => {
                                                        setCategoryName(productCheck.categoryName);
                                                        setVolume(productCheck.volume);
                                                        setQuantity(productCheck.quantity);
                                                        setProductCheckId(productCheck.id);
                                                        setShowModelAddItemCheck(true);
                                                        setProductId(productCheck.productId);
                                                    }}
                                                    className="btn btn-primary"
                                                >
                                                    Thêm
                                                </button>
                                            </div>
                                            <Table striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Số lượng</th>
                                                        <th>Đơn vị</th>
                                                        <th>Trạng thái</th>
                                                        <th>Vị trí</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        productCheck.listAddLocation.map((location, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{location.quantity}</td>
                                                                    <td>{productCheck.unit}</td>
                                                                    <td>
                                                                        {location.status === "NORMAL" ? "Bình thường" : "Bị hư hại"}
                                                                    </td>
                                                                    <td>{location.location.name}</td>
                                                                    <td>
                                                                        <Button
                                                                            variant="danger"
                                                                            onClick={() => {
                                                                                removeListAddLocation(productCheck.id, location.id);
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </tbody>
                                            </Table>
                                            {
                                                productCheck.listAddLocation.length === 0 &&
                                                <NoData />
                                            }
                                        </Accordion.Body>
                                    </Accordion.Item>
                                )
                            })
                        }
                    </Accordion>
                </div>
            </div>
            {
                showModelAddItemCheck &&
                <ModelAddItemCheck
                    onClose={() => {
                        setShowModelAddItemCheck(false);
                        setCategoryName("");
                        setVolume(0);
                    }}
                    categoryName={categoryName}
                    volume={volume}
                    quantity={quantity}
                    addItem={addListAddLocation}
                    productCheckId={productCheckId}
                    productId={productId}
                />
            }
        </OverLay>
    )
}

export default HandleStockEntryPage