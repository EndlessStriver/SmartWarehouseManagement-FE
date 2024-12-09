import {Button, CloseButton, Col, Row, Table} from "react-bootstrap"
import {OverLay} from "../../../compoments/OverLay/OverLay"
import {useDispatchMessage} from "../../../Context/ContextMessage"
import GetProfile from "../../../util/GetProfile"
import React from "react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTrash} from "@fortawesome/free-solid-svg-icons"
import {NoData} from "../../../compoments/NoData/NoData"
import GetStockEntryById from "../../../services/StockEntry/GetStockEntryById"
import StockEntry from "../../../interface/Entity/StockEntry"
import ActionTypeEnum from "../../../enum/ActionTypeEnum"
import ModelAddItemCheck from "./ModelAddItemCheck"
import {v4 as uuidv4} from 'uuid';
import CreateCheckStockEntry from "../../../services/StockEntry/CreateCheckStockEntry"
import {useDispatchProductCheck} from "../../../Context/ContextProductCheck"
import GetReceiveCheckByStockEntryId from "../../../services/StockEntry/GetReceiveCheckByStockEntryId"
import formatDateForInput from "../../../util/FormartDateInput"
import CancleStockEntry from "../../../services/StockEntry/CancleStockEntry"
import {useNavigate} from "react-router-dom"

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
        label: string
        value: string
    }
}

export interface ProductCheck {
    id: string
    productId: string
    productName: string
    quantity: number
    unit: { id: string, name: string }
    categoryName: string
    volume: number
    weight: number
    listAddLocation: listAddLocationInf[]
}

export interface AddLocationType {
    quantity: number,
    status: string,
    location: { label: string, value: string }
}

const HandleStockEntryPage: React.FC<HandleStockEntryPageProps> = (props) => {

    const navigate = useNavigate();
    const dispatchProductCheck = useDispatchProductCheck();
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
    const [unitId, setUnitId] = React.useState<string>("");
    const [weight, setWeight] = React.useState<number>(0);
    const [skuId, setSkuId] = React.useState<string>("");
    const [submitLoading, setSubmitLoading] = React.useState(false);

    React.useEffect(() => {
        if (props.stockEntryId !== "") {
            const now = new Date();
            now.setHours(now.getHours() + 7);
            const formattedDate = now.toISOString().slice(0, 16);
            setCreateDate(formattedDate);
        }
    }, [props.stockEntryId]);

    React.useEffect(() => {
        dispatchProductCheck({type: "ADD", data: productChecks});
    }, [productChecks, dispatchProductCheck])

    React.useEffect(() => {
        GetStockEntryById(props.stockEntryId, navigate)
            .then((response) => {
                if (response) {
                    setStockEntry(response);
                    const productChecks: ProductCheck[] = response.receiveItems.map((receiveItem) => {
                        return {
                            id: receiveItem.id,
                            productId: receiveItem.product.id,
                            productName: receiveItem.product.name,
                            quantity: receiveItem.quantity,
                            unit: {id: receiveItem.unit.id, name: receiveItem.unit.name},
                            categoryName: receiveItem.product.category.name,
                            volume: getVolume(receiveItem.sku.dimension),
                            weight: Number(receiveItem.sku.weight),
                            listAddLocation: []
                        }
                    });
                    setProductChecks(productChecks);
                }
            })
            .catch((error) => {
                console.error(error);
                dispatch({type: ActionTypeEnum.ERROR, message: error.message})
            })
    }, [props.stockEntryId, dispatch])

    React.useEffect(() => {
        if (stockEntry?.status === "COMPLETERECEIVECHECK") {
            GetReceiveCheckByStockEntryId(props.stockEntryId, navigate)
                .then((response) => {
                    if (response) {
                        const newProductChecks = productChecks.map((productCheck) => productCheck);
                        response.checkItems.forEach((receiveCheck) => {
                            const productCheck = newProductChecks.find((productCheck) => productCheck.productId === receiveCheck.product.id);
                            if (productCheck) {
                                productCheck.listAddLocation.push({
                                    id: receiveCheck.id,
                                    quantity: receiveCheck.receiveQuantity,
                                    status: receiveCheck.itemStatus ? "NORMAL" : "DAMAGE",
                                    location: {
                                        value: receiveCheck.locations[0]?.id || "A",
                                        label: receiveCheck.locations[0]?.locationCode || "A"
                                    }
                                });
                            }
                        });
                        const dateToFormat = stockEntry?.create_at ? new Date(stockEntry.create_at) : new Date();
                        setCreateDate(dateToFormat.toISOString().slice(0, 16));
                        setProductChecks(newProductChecks);
                    }
                })
        }
    }, [stockEntry, props.stockEntryId])

    const getVolume = (dimension: string) => {
        const dimensionArr = dimension.split("x");
        const volume = dimensionArr.reduce((acc, cur) => {
            return acc * Number(cur);
        }, 1);
        return volume;
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

    const addListAddLocation = (productId: string, data: AddLocationType[]) => {
        const newProductChecks = productChecks.map((productCheck) => {
            if (productCheck.id === productId) {
                if (productCheck.listAddLocation.reduce((sum, item) => sum += item.quantity, 0)
                    + data.reduce((sum, item) => sum += item.quantity, 0) > quantity) {
                    throw Error('"Tổng số lượng sản phẩm đã thêm vượt quá số lượng kiểm tra"')
                }
                const newListAddLocation: listAddLocationInf[] = JSON.parse(JSON.stringify(productCheck.listAddLocation));
                for (let item of data) {
                    const exists = newListAddLocation.find((myLocation) => myLocation.location.value === item.location.value);
                    if (exists) exists.quantity = item.quantity;
                    if (!exists) newListAddLocation.push({...item, id: uuidv4()})
                }
                productCheck.listAddLocation = newListAddLocation;
            }
            return productCheck;
        });
        setProductChecks(newProductChecks);
    }

    const validateForm = (): boolean => {
        let check = true;
        const currentDate = new Date();
        const creationDate = new Date(createDate);

        if (creationDate > currentDate) {
            dispatch({type: ActionTypeEnum.ERROR, message: "Ngày tạo không được vượt quá ngày hiện tại."});
            check = false;
        }

        productChecks.forEach((productCheck) => {
            let sumQuantity = productCheck.listAddLocation.reduce((acc, cur) => {
                return acc + cur.quantity;
            }, 0);
            if (sumQuantity !== productCheck.quantity) {
                dispatch({
                    type: ActionTypeEnum.ERROR,
                    message: `Tổng số lượng kiểm tra của sản phẩm ${productCheck.productName} không bằng số lượng nhập`
                });
                check = false;
            }
        });
        return check;
    }

    const handleSubmit = () => {
        setSubmitLoading(true);
        if (validateForm()) {
            CreateCheckStockEntry({
                receiveId: props.stockEntryId,
                receiveDate: createDate,
                receiveBy: profile?.fullName || "",
                supplierId: stockEntry!.supplier.id,
                receiveItems: productChecks.flatMap((productCheck) => {
                    return productCheck.listAddLocation.map((location) => {
                        return {
                            receiveItemId: productCheck.id,
                            receiveQuantity: location.quantity,
                            itemStatus: location.status === "NORMAL" ? true : false,
                            locationId: location.location.value
                        };
                    });
                })
            }, navigate)
                .then(() => {
                    dispatch({type: ActionTypeEnum.SUCCESS, message: "Xử lý phiếu nhập kho thành công"});
                    dispatchProductCheck({type: "RESSET", data: []});
                    props.reload();
                    props.onClose();
                })
                .catch((error) => {
                    dispatch({type: ActionTypeEnum.ERROR, message: error.message});
                })
                .finally(() => {
                    setSubmitLoading(false);
                })
        }
    }

    const handleCancleStockEntry = () => {
        CancleStockEntry(props.stockEntryId, navigate)
            .then(() => {
                dispatch({type: ActionTypeEnum.SUCCESS, message: "Hủy phiếu nhập kho thành công"});
                props.reload();
                props.onClose();
            })
            .catch((error) => {
                dispatch({type: ActionTypeEnum.ERROR, message: error.message});
            });
    }

    return (
        <OverLay className="disabled-padding">
            <div className="w-100 h-100 bg-light p-5">
                <CloseButton
                    className="position-fixed"
                    style={{top: "15px", right: "15px"}}
                    onClick={props.onClose}
                />
                <div>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="fw-bold">Xử lý phiếu nhập kho</h2>
                        <div
                            className="d-flex gap-3"
                        >
                            {
                                stockEntry?.status === "PENDING" &&
                                <Button
                                    variant="danger"
                                    className="text-light fw-bold"
                                    onClick={() => handleCancleStockEntry()}
                                    disabled={productChecks.length === 0}
                                >
                                    Hủy phiếu
                                </Button>
                            }
                            {
                                stockEntry?.status === "PENDING" &&
                                <Button
                                    variant="primary"
                                    className="text-light fw-bold"
                                    onClick={() => handleSubmit()}
                                    disabled={submitLoading || productChecks.length === 0}
                                >
                                    {submitLoading ? "Đang xử lý" : "Xác nhận"}
                                </Button>
                            }
                        </div>
                    </div>
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
                            disabled={stockEntry?.status !== "PENDING"}
                            type="datetime-local"
                            className="form-control p-3"
                            value={formatDateForInput(createDate)}
                            onChange={(e) => setCreateDate(e.target.value)}
                        />
                    </div>
                </div>
                <Row>
                    <Col>
                        <h5 className="fw-semibold">Danh Sách Sản Phẩm Kiểm Tra</h5>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên sản phẩm</th>
                                <th>Loại sản phẩm</th>
                                <th>Số lượng nhập</th>
                                <th>Đơn vị</th>
                                {
                                    stockEntry?.status === "PENDING" &&
                                    <th>Thao tác</th>
                                }
                            </tr>
                            </thead>
                            <tbody>
                            {
                                productChecks.map((productCheck, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{productCheck.productName}</td>
                                            <td>{productCheck.categoryName}</td>
                                            <td>{productCheck.quantity}</td>
                                            <td>{productCheck.unit.name}</td>
                                            {
                                                stockEntry?.status === "PENDING" &&
                                                <td>
                                                    <button
                                                        disabled={productCheck.listAddLocation.reduce((acc, cur) => acc + cur.quantity, 0) >= productCheck.quantity}
                                                        onClick={() => {
                                                            setCategoryName(productCheck.categoryName);
                                                            setVolume(productCheck.volume);
                                                            setQuantity(productCheck.quantity);
                                                            setProductCheckId(productCheck.id);
                                                            setShowModelAddItemCheck(true);
                                                            setProductId(productCheck.productId);
                                                            setUnitId(productCheck.unit.id);
                                                            setWeight(productCheck.weight);
                                                            setSkuId(stockEntry.receiveItems.find((receiveItem) => receiveItem.product.id === productCheck.productId)?.sku.id || "");
                                                        }}
                                                        className="btn btn-primary"
                                                    >
                                                        Thêm
                                                    </button>
                                                </td>
                                            }
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </Table>
                    </Col>
                    <Col>
                        <h5 className="fw-semibold">Danh Sách Sản Phẩm Đã Kiểm Tra</h5>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng Kiểm Tra</th>
                                <th>Đơn vị</th>
                                <th>Trạng Thái</th>
                                <th>Vị Trí</th>
                                {
                                    stockEntry?.status === "PENDING" &&
                                    <th>Thao tác</th>
                                }
                            </tr>
                            </thead>
                            <tbody>
                            {
                                productChecks.map((productCheck) => {
                                    return productCheck.listAddLocation.map((location, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{productCheck.productName}</td>
                                                <td>{location.quantity}</td>
                                                <td>{productCheck.unit.name}</td>
                                                <td>{location.status === "NORMAL" ? "Bình thường" : "Bị hư hại"}</td>
                                                <td>{location.location.label}</td>
                                                {
                                                    stockEntry?.status === "PENDING" &&
                                                    <td>
                                                        <Button
                                                            variant="danger"
                                                            onClick={() => {
                                                                removeListAddLocation(productCheck.id, location.id);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash}/>
                                                        </Button>
                                                    </td>
                                                }
                                            </tr>
                                        )
                                    })
                                }).flat()
                            }
                            </tbody>
                        </Table>
                        {
                            (productChecks.map((productCheck) => productCheck.listAddLocation.length).reduce((acc, cur) => acc + cur, 0) === 0) &&
                            <NoData lable="CHƯA CÓ SẢN PHẨM KIỂM TRA"/>
                        }
                    </Col>
                </Row>
            </div>
            {
                showModelAddItemCheck &&
                <ModelAddItemCheck
                    onClose={() => {
                        setShowModelAddItemCheck(false);
                    }}
                    categoryName={categoryName}
                    volume={volume}
                    quantity={quantity}
                    addItem={addListAddLocation}
                    productCheckId={productCheckId}
                    productId={productId}
                    unitId={unitId}
                    weight={weight}
                    skuId={skuId}
                />
            }
        </OverLay>
    )
}

export default HandleStockEntryPage