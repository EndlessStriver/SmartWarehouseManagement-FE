import { CloseButton, FormGroup } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import React from "react"
import Select from 'react-select';
import GetProductsByName, { Product } from "../../../services/Product/GetProductsByName";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import CreateUnit from "../../../services/Attribute/Unit/CreateUnit";
import { useNavigate } from "react-router-dom";

interface ModelAddUnitProps {
    onClose: () => void
    reLoad: () => void
}

interface Units {
    id: string,
    create_at: string,
    update_at: string,
    name: string,
    isBaseUnit: boolean,
}

interface Products {
    value: string,
    label: string
    units: Units[]
}

const ModelAddUnit: React.FC<ModelAddUnitProps> = (props) => {

    const navigate = useNavigate();
    const dispatch = useDispatchMessage();
    const [unitName, setUnitName] = React.useState<string>("")
    const [products, setProducts] = React.useState<Products[]>([])
    const [productSelect, setProductSelect] = React.useState<Products | null>(null)
    const [productName, setProductName] = React.useState<string>("")
    const [conversionfactor, setConversionfactor] = React.useState<number>(0)

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetProductsByName(navigate, productName)
                .then((response) => {
                    if (response) setProducts(response.map((product: Product) => ({ value: product.id, label: product.name, units: product.units })))
                })
                .catch((error) => {
                    console.error(error)
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
                })
        }, 500);
        return () => clearTimeout(id)
    }, [productName, dispatch])

    const validateForm = () => {
        if (!unitName) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập tên đơn vị mới" })
            return false
        }
        if (!productSelect) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn sản phẩm" })
            return false
        }
        if (!conversionfactor) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Giá trị quy đổi không được để trống" })
            return false
        }
        return true
    }

    const handleSubmit = () => {
        if (validateForm()) {
            CreateUnit({
                productId: productSelect!.value,
                unitFromName: unitName,
                conversionFactor: conversionfactor,
                toUnitId: productSelect!.units.find((unit) => unit.isBaseUnit)!.id
            }, navigate)
                .then(() => {
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Thêm đơn vị tính thành công" })
                    props.reLoad()
                    props.onClose()
                })
                .catch((error) => {
                    console.error(error)
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
                })
        }
    }

    return (
        <OverLay>
            <div className="bg-light rounded p-3 position-relative" style={{ width: "600px" }}>
                <CloseButton onClick={() => props.onClose()} className="position-absolute bg-light" style={{ top: "15px", right: "15px" }} />
                <h3>Thêm Đơn Vị Tính</h3>
                <FormGroup className="mb-3">
                    <label>Tên đơn vị tính</label>
                    <input
                        type="text"
                        className="form-control p-3"
                        placeholder="Nhập tên đơn vị tính..."
                        value={unitName}
                        onChange={(e) => setUnitName(e.target.value)}
                    />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Sản phẩm</label>
                    <Select
                        placeholder="Nhập tên sản phẩm..."
                        isClearable
                        styles={{
                            control: (provided) => ({
                                ...provided,
                                padding: "0.5rem 0px",
                            }),
                        }}
                        onInputChange={setProductName}
                        value={productSelect}
                        onChange={(value) => setProductSelect(value)}
                        options={products}
                    />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Tên đơn vị cơ bản</label>
                    <input
                        type="text"
                        className="form-control p-3"
                        placeholder="Đơn vị cơ bản..."
                        disabled
                        value={productSelect?.units.find((unit) => unit.isBaseUnit)?.name}
                    />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Giá trị quy đổi</label>
                    <input
                        type="number"
                        className="form-control p-3"
                        placeholder="Nhập giá trị quy đổi..."
                        min={0}
                        value={conversionfactor}
                        onChange={(e) => setConversionfactor(parseInt(e.target.value))}
                    />
                </FormGroup>
                <button
                    onClick={() => handleSubmit()}
                    className="btn btn-primary form-control p-2"
                >
                    Thêm
                </button>
            </div>
        </OverLay>
    )
}

export default ModelAddUnit