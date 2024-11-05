import { CloseButton, FormGroup } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons"
import React from "react"
import ListShelf from "./ListShelf"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import ActionTypeEnum from "../../../enum/ActionTypeEnum"
import Select from 'react-select';
import SuggestInbound from "../../../services/StockEntry/SuggestInbound"
import { useProductCheck } from "../../../Context/ContextProductCheck"

interface ModelAddItemCheckProps {
    onClose: () => void
    addItem: (id: string, quantity: number, status: string, location: { value: string, label: string }) => void
    categoryName: string
    volume: number
    quantity: number
    productCheckId: string
    productId: string
    unitId: string
    weight: number
    skuId: string
}

interface Location {
    value: string
    label: string
}

const ModelAddItemCheck: React.FC<ModelAddItemCheckProps> = (props) => {

    const dispatch = useDispatchMessage();
    const productChecks = useProductCheck();
    const [quantity, setQuantity] = React.useState<number>(0)
    const [status, setStatus] = React.useState<string>("")
    const [location, setLocation] = React.useState<Location | null>(null)
    const [showListShelf, setShowListShelf] = React.useState<boolean>(false)
    const [locations, setLocations] = React.useState<Location[]>([])

    const addLocation = (id: string, name: string) => {
        setLocation({ value: id, label: name })
    }

    const filterRecomandLocationIsCheck = () => {
        if (locations.length > 0) {
            let locationIsCheck = productChecks.map((productCheck) => productCheck.listAddLocation.map(location => location.location.value)).flat()
            return locations.filter((location) => !locationIsCheck.includes(location.value))
        }
    }

    const getTotalQuantityNeed = () => {
        let myProductCheck = productChecks.find((productCheck) => productCheck.productId === props.productId)
        if (myProductCheck) {
            let totalQuantityNeed = myProductCheck.listAddLocation.reduce((total, location) => total + location.quantity, 0)
            return props.quantity - totalQuantityNeed
        } else {
            return 0
        }
    }

    React.useEffect(() => {
        if (quantity > 0 && status !== "") {
            SuggestInbound({
                quantity: quantity,
                skuId: props.skuId,
                typeShelf: status,
                unitId: props.unitId
            })
                .then((res) => {
                    if (res) {
                        setLocations(res.map((location) => {
                            return {
                                value: location.locationId,
                                label: `${location.locationCode} - (${location.maxQuantityInbound})`
                            }
                        }))
                    }
                })
                .catch((err) => {
                    console.error(err)
                    dispatch({ message: err.message, type: ActionTypeEnum.ERROR })
                })
        }
    }, [quantity, status, props.skuId, props.unitId, dispatch])

    React.useEffect(() => {
        setQuantity(getTotalQuantityNeed())
    }, [])

    return (
        <OverLay>
            <div className="position-relative bg-light rounded p-4" style={{ width: "500px" }}>
                <CloseButton
                    className="position-absolute"
                    style={{ top: "15px", right: "15px" }}
                    onClick={props.onClose}
                />
                <h2 className="fw-bold">Thêm Mục</h2>
                <FormGroup className="mb-3">
                    <label>Số lượng: </label>
                    <input
                        min={0}
                        max={getTotalQuantityNeed()}
                        type="number"
                        className="form-control p-3"
                        placeholder="Nhập số lượng...."
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Trạng thái: </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="form-select p-3"
                    >
                        <option value={""}>Chọn trạng thái sản phẩm...</option>
                        <option value={"NORMAL"}>Bình thường</option>
                        <option value={"DAMAGED"}>Bị hư hại</option>
                    </select>
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Vị trí:</label>
                    <FormGroup className="mb-3 d-flex flex-row">
                        <Select
                            placeholder="Chọn vị trí được đề xuất..."
                            isClearable
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    padding: "0.5rem 0px",
                                    width: "385px",
                                }),
                            }}
                            value={location}
                            onChange={(e) => setLocation(e)}
                            options={filterRecomandLocationIsCheck()}
                            isDisabled={quantity <= 0 || status === ""}
                        />
                        <button
                            disabled={quantity <= 0 || status === ""}
                            onClick={() => {
                                if (quantity < 0) dispatch({ message: "Số lượng sản phẩm không thể nhỏ hơn 0", type: ActionTypeEnum.ERROR })
                                if (quantity === 0) dispatch({ message: "Vui lòng nhập số lượng sản phẩm", type: ActionTypeEnum.ERROR })
                                if (quantity > 0) setShowListShelf(true)
                            }}
                            className="btn btn-primary ms-3"
                            style={{
                                width: "60px",
                                height: "55px",
                            }}
                        >
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </button>
                    </FormGroup>
                </FormGroup>
                <button
                    onClick={() => {
                        if (Number(quantity) <= 0) {
                            dispatch({ message: "Vui lòng nhập số lượng sản phẩm", type: ActionTypeEnum.ERROR })
                            return;
                        }
                        if (status === "") {
                            dispatch({ message: "Vui lòng chọn trạng thái sản phẩm", type: ActionTypeEnum.ERROR })
                            return;
                        }
                        if (!location) {
                            dispatch({ message: "Vui lòng chọn vị trí", type: ActionTypeEnum.ERROR })
                            return;
                        }
                        if (quantity > 0 && location) {
                            props.addItem(props.productCheckId, quantity, status, location)
                            props.onClose()
                        }
                    }}
                    className="btn btn-primary form-control p-2"
                >
                    Thêm
                </button>
            </div>
            {
                showListShelf &&
                <ListShelf
                    onClose={() => setShowListShelf(false)}
                    setLocation={addLocation}
                    categoryName={props.categoryName}
                    volume={props.volume}
                    quantity={quantity}
                    productId={props.productId}
                    unitId={props.unitId}
                    weight={props.weight}
                    status={status}
                />
            }
        </OverLay>
    )
}

export default ModelAddItemCheck