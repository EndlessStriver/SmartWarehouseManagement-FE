import { CloseButton, Form, FormGroup } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import { Product, Unit } from "../../../services/Product/GetProductByNameAndCodeAndSupplierName";
import React from "react";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import ConvertUnit from "../../../services/Attribute/Unit/ConvertUnit";
import { ProductExport } from "./FormEditExportProduct";
import SuggestExportLocationFIFO from "../../../services/StockEntry/SuggestExportLocationFIFO";
import SuggestExportLocationLIFO from "../../../services/StockEntry/SuggestExportLocationLIFO";

interface ModelAddProductExportProps {
    onClose: () => void;
    product: Product | null;
    quantity: number;
    quantityDamaged: number;
    addProductExport: (product: Product, unit: Unit, quantity: number, productStatus: string, locations: { locationCode: string, quantity: number }[]) => void;
    listProductExport: ProductExport[]
}

const ModelAddProductExport: React.FC<ModelAddProductExportProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [unit, setUnit] = React.useState<string>("");
    const [quantity, setQuantity] = React.useState<number>(0);
    const [convertValue, setConvertValue] = React.useState<number>(0);
    const [statusProduct, setStatusProduct] = React.useState<string>("");
    const [typeExport, setTypeExport] = React.useState<string>(props.product?.export_criteria || "FIFO");
    const [disabledTypeExport, setDisabledTypeExport] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (unit !== "" && quantity > 0) {
            ConvertUnit(unit, quantity)
                .then((response) => {
                    if (response) {
                        setConvertValue(response)
                    }
                })
                .catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                });
        }
    }, [unit, quantity, dispatch]);

    const validateForm = () => {
        if (unit === "") {
            dispatch({ message: "Vui lòng chọn đơn vị tính", type: ActionTypeEnum.ERROR });
            return false;
        }
        if (quantity <= 0) {
            dispatch({ message: "Số lượng xuất phải lớn hơn 0", type: ActionTypeEnum.ERROR });
            return false;
        }
        if (statusProduct === "") {
            dispatch({ message: "Vui lòng chọn trạng thái sản phẩm", type: ActionTypeEnum.ERROR });
            return false;
        }
        if (typeExport === "") {
            dispatch({ message: "Vui lòng chọn kiểu xuất kho", type: ActionTypeEnum.ERROR });
            return false;
        }
        if ((checkProductExport(props.product!.id, unit, statusProduct) ? (quantity + checkProductExport(props.product!.id, unit, statusProduct)!.quantity) : quantity) * convertValue > props.product!.productDetails[0].quantity && statusProduct === "NORMAL") {
            dispatch({ message: "Số lượng xuất lớn hơn số lượng tồn kho đang có", type: ActionTypeEnum.ERROR });
            return false;
        }
        if ((checkProductExport(props.product!.id, unit, statusProduct) ? (quantity + checkProductExport(props.product!.id, unit, statusProduct)!.quantity) : quantity) * convertValue > props.product!.productDetails[0].damagedQuantity && statusProduct === "DAMAGED") {
            dispatch({ message: "Số lượng xuất lớn hơn số lượng tồn kho đang có", type: ActionTypeEnum.ERROR });
            return false;
        }
        return true
    }

    const checkProductExport = (productId: string, unitId: string, productStatus: string) => {
        return props.listProductExport.find((item) => item.productId === productId && item.unit.id === unitId && item.status === productStatus);
    }

    return (
        <OverLay>
            <div className="bg-light rounded position-relative p-3" style={{ width: "600px" }}>
                <CloseButton onClick={() => props.onClose()} className="position-absolute" style={{ top: "15px", right: "15px" }} />
                <h1>Thêm Sản Phẩm Xuất Kho</h1>
                <FormGroup className="mb-3">
                    <label>Tên Sản Phẩm</label>
                    <input type="text" className="form-control p-3" value={props.product?.name} readOnly />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Loại Sản Phẩm</label>
                    <input type="text" className="form-control p-3" value={props.product?.category.name} readOnly />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Đơn Vị Tính</label>
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="form-select p-3"
                    >
                        <option value="">Chọn đơn vị tính...</option>
                        {
                            props.product?.units.map((unit, index) => {
                                return (
                                    <option key={index} value={unit.id}>{unit.name}</option>
                                )
                            })
                        }
                    </select>
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Trạng Thái Sản Phẩm</label>
                    <select
                        value={statusProduct}
                        onChange={(e) => setStatusProduct(e.target.value)}
                        className="form-select p-3"
                    >
                        <option value="">Chọn trạng thái sản phẩm...</option>
                        <option value="NORMAL">Bình thường</option>
                        <option value="DAMAGED">Hư hỏng</option>
                    </select>
                </FormGroup>
                <FormGroup className="mb-3">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <label>Kiểu Xuất Kho</label>
                        <Form.Check
                            type="checkbox"
                            label="Tùy chỉnh"
                            checked={disabledTypeExport}
                            onChange={() => setDisabledTypeExport(!disabledTypeExport)}
                        />
                    </div>
                    <select
                        disabled={!disabledTypeExport}
                        value={typeExport}
                        onChange={(e) => setTypeExport(e.target.value)}
                        className="form-select p-3"
                    >
                        <option value="">Chọn kiểu xuất kho...</option>
                        <option value="FIFO">Vào Trước - Ra Trước</option>
                        <option value="LIFO">Vào Sau - Ra Trước</option>
                    </select>
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Số Lượng</label>
                    <input
                        type="number"
                        min={0}
                        className="form-control p-3"
                        placeholder="Nhập số lượng xuất..."
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        disabled={unit === "" || statusProduct === ""}
                    />
                </FormGroup>
                <button
                    onClick={() => {
                        if (validateForm()) {
                            if (typeExport === "FIFO") {
                                SuggestExportLocationFIFO({
                                    skuId: props.product!.productDetails[0].sku[0].id,
                                    unitId: unit,
                                    quantity: checkProductExport(props.product!.id, unit, statusProduct) ? (checkProductExport(props.product!.id, unit, statusProduct)!.quantity + quantity) : quantity,
                                    typeShelf: statusProduct
                                })
                                    .then((response) => {
                                        if (response) {
                                            props.addProductExport(props.product!, props.product!.units.find(u => u.id === unit)!, checkProductExport(props.product!.id, unit, statusProduct) ? (checkProductExport(props.product!.id, unit, statusProduct)!.quantity + quantity) : quantity, statusProduct, response.map((item) => {
                                                return {
                                                    locationCode: item.locationCode,
                                                    quantity: item.quantityTaken
                                                }
                                            }));
                                            props.onClose();
                                        }
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                        dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                                    })
                            }
                            if (typeExport === "LIFO") {
                                SuggestExportLocationLIFO({
                                    skuId: props.product!.productDetails[0].sku[0].id,
                                    unitId: unit,
                                    quantity: checkProductExport(props.product!.id, unit, statusProduct) ? (checkProductExport(props.product!.id, unit, statusProduct)!.quantity + quantity) : quantity,
                                    typeShelf: statusProduct
                                })
                                    .then((response) => {
                                        if (response) {
                                            props.addProductExport(props.product!, props.product!.units.find(u => u.id === unit)!, checkProductExport(props.product!.id, unit, statusProduct) ? (checkProductExport(props.product!.id, unit, statusProduct)!.quantity + quantity) : quantity, statusProduct, response.map((item) => {
                                                return {
                                                    locationCode: item.locationCode,
                                                    quantity: item.quantityTaken
                                                }
                                            }));
                                            props.onClose();
                                        }
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                        dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                                    })
                            }
                        }
                    }}
                    className="btn btn-primary w-100 p-2"
                >
                    Thêm
                </button>
            </div>
        </OverLay>
    );
}

export default ModelAddProductExport;