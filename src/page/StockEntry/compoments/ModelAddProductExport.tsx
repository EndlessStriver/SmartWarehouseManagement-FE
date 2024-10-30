import { CloseButton, FormGroup } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import { Product, Unit } from "../../../services/Product/GetProductByNameAndCodeAndSupplierName";
import React from "react";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import ConvertUnit from "../../../services/Attribute/Unit/ConvertUnit";

interface ModelAddProductExportProps {
    onClose: () => void;
    product: Product | null;
    addProductExport: (product: Product, unit: Unit, quantity: number) => void;
}

const ModelAddProductExport: React.FC<ModelAddProductExportProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [unit, setUnit] = React.useState<string>("");
    const [quantity, setQuantity] = React.useState<number>(0);
    const [convertValue, setConvertValue] = React.useState<number>(0);

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
        if (quantity * convertValue > props.product!.productDetails[0].quantity) {
            dispatch({ message: "Số lượng xuất phải nhỏ hơn hoặc bằng số lượng tồn", type: ActionTypeEnum.ERROR });
            return false;
        }
        return true
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
                    <label>Số Lượng</label>
                    <input
                        type="number"
                        min={0}
                        className="form-control p-3"
                        placeholder="Nhập số lượng xuất..."
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                    />
                </FormGroup>
                <button
                    onClick={() => {
                        if (validateForm()) {
                            props.addProductExport(props.product!, props.product!.units.find(u => u.id === unit)!, quantity);
                            props.onClose();
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