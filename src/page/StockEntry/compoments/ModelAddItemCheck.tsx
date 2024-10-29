import { CloseButton, FormGroup } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons"
import React from "react"
import ListShelf from "./ListShelf"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import ActionTypeEnum from "../../../enum/ActionTypeEnum"

interface ModelAddItemCheckProps {
    onClose: () => void
    addItem: (id: string, quantity: number, status: string, location: { id: string, name: string }) => void
    categoryName: string
    volume: number
    quantity: number
    productCheckId: string
    productId: string
}

interface Location {
    id: string
    name: string
}

const ModelAddItemCheck: React.FC<ModelAddItemCheckProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [quantity, setQuantity] = React.useState<number>(0)
    const [status, setStatus] = React.useState<string>("NORMAL")
    const [location, setLocation] = React.useState<Location | null>(null)
    const [showListShelf, setShowListShelf] = React.useState<boolean>(false)

    const addLocation = (id: string, name: string) => {
        setLocation({ id, name })
    }

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
                        <option value={"NORMAL"}>Bình thường</option>
                        <option value={"DAMAGED"}>Bị hư hại</option>
                    </select>
                </FormGroup>
                <FormGroup className="mb-3">
                    <label>Vị trí:</label>
                    {
                        location &&
                        <span className="ms-2 fw-bold">{location.name}</span>
                    }
                    <button
                        onClick={() => {
                            if (quantity === 0) dispatch({ message: "Vui lòng nhập số lượng sản phẩm", type: ActionTypeEnum.ERROR })
                            if (quantity > 0) setShowListShelf(true)
                        }}
                        className="btn btn-primary ms-3"
                    >
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </button>
                </FormGroup>
                <button
                    onClick={() => {
                        if (Number(quantity) <= 0) {
                            dispatch({ message: "Vui lòng nhập số lượng sản phẩm", type: ActionTypeEnum.ERROR })
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
                />
            }
        </OverLay>
    )
}

export default ModelAddItemCheck