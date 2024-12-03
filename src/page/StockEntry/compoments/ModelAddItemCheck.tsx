import { CloseButton, FormGroup } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import React from "react"
import ListShelf from "./ListShelf"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import ActionTypeEnum from "../../../enum/ActionTypeEnum"
import SuggestInbound from "../../../services/StockEntry/SuggestInbound"
import { useProductCheck } from "../../../Context/ContextProductCheck"
import { NoData } from "../../../compoments/NoData/NoData";
import { AddLocationType } from "./HandleStockEntryPage";

interface ModelAddItemCheckProps {
    onClose: () => void
    addItem: (productId: string, data: AddLocationType[]) => void
    categoryName: string
    volume: number
    quantity: number
    productCheckId: string
    productId: string
    unitId: string
    weight: number
    skuId: string
}

export interface Location {
    value: string
    label: string
    maxQuantity: number
    currentQuantity: number,
    isChecked: boolean
}

const ModelAddItemCheck: React.FC<ModelAddItemCheckProps> = (props) => {

    const dispatch = useDispatchMessage();
    const productChecks = useProductCheck();
    const [quantity, setQuantity] = React.useState<number>(0)
    const [status, setStatus] = React.useState<string>("")
    const [locationChoose, setLocationChoose] = React.useState<Location[]>([])
    const [showListShelf, setShowListShelf] = React.useState<boolean>(false)
    const [locations, setLocations] = React.useState<Location[]>([])

    const addLocation = (locationId: string, locationName: string, maxQuantity: number) => {
        setLocationChoose(preData => {
            return [...preData, {
                label: locationName,
                value: locationId,
                isChecked: true,
                currentQuantity: maxQuantity,
                maxQuantity: maxQuantity
            }]
        })
        setLocations((prevState) => prevState.map((lct) => {
            if (lct.value === locationId) {
                return { ...lct, isChecked: true }
            }
            return lct
        }))
    }

    const filterRecomandLocationIsCheck = () => {
        let locationIsCheck = productChecks.map((productCheck) => productCheck.listAddLocation.map(location => location.location.value)).flat()
        return locations.filter((location) => !locationIsCheck.includes(location.value))
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
        setQuantity(getTotalQuantityNeed())
    }, [])

    React.useEffect(() => {
        const fetchSuggestedLocations = async () => {
            try {
                if (quantity > 0 && status !== "") {
                    setLocations([])
                    const response = await SuggestInbound({
                        quantity,
                        skuId: props.skuId,
                        typeShelf: status,
                        unitId: props.unitId,
                    });

                    if (response) {
                        const formattedLocations = response.map((location) => ({
                            value: location.locationId,
                            label: `${location.locationCode} - (${location.maxQuantityInbound})`,
                            maxQuantity: location.maxQuantityInbound,
                            isChecked: false,
                            currentQuantity: Math.min(location.maxQuantityInbound, props.quantity),
                        }));

                        setLocations(formattedLocations);
                    }
                } else {
                    setLocations([]);
                    setLocationChoose([]);
                }
            } catch (error: any) {
                console.error(error);
                dispatch({ message: error.message, type: ActionTypeEnum.ERROR });
            }
        };
        fetchSuggestedLocations();
    }, [quantity, status, props.skuId, props.unitId, dispatch]);


    React.useEffect(() => {
        console.log(locations)
        if (locationChoose.length === 0) setLocationChoose(locations.filter((location) => location.isChecked))
        if (locationChoose.length > 0) {
            let newLocationChoose: Location[] = JSON.parse(JSON.stringify(locationChoose));
            for (let lct of locations) {
                let exists = newLocationChoose.find((itemFind) => itemFind.value === lct.value);
                if (exists && lct.isChecked) {
                    exists = { ...lct }
                } else if (exists && !lct.isChecked) {
                    newLocationChoose = newLocationChoose.filter((location) => location.value !== lct.value)
                } else if (!exists && lct.isChecked) {
                    newLocationChoose.push(lct)
                }
            }
            setLocationChoose(newLocationChoose);
        }
    }, [locations]);

    return (
        <OverLay>
            <div className="position-relative bg-white shadow-sm rounded p-5" style={{ width: "1350px" }}>
                <CloseButton
                    className="position-absolute text-secondary"
                    style={{ top: "15px", right: "15px" }}
                    onClick={props.onClose}
                />
                <h2 className="fw-bold mb-4 text-primary">Thêm Mục</h2>

                <div className={"d-flex flex-row align-items-center justify-content-between"}>

                    <div className={"d-flex flex-row align-items-center gap-3"}>
                        <FormGroup className="mb-4">
                            <label className="fw-semibold mb-2">Số lượng:</label>
                            <input
                                min={0}
                                max={getTotalQuantityNeed()}
                                type="number"
                                className="form-control p-3 border-secondary"
                                placeholder="Nhập số lượng..."
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </FormGroup>

                        <FormGroup className="mb-4">
                            <label className="fw-semibold mb-2">Trạng thái:</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="form-select py-3 px-5 border-secondary"
                            >
                                <option value="">Tình trạng sản phẩm...</option>
                                <option value="NORMAL">Bình thường</option>
                                <option value="DAMAGED">Bị hư hại</option>
                            </select>
                        </FormGroup>
                    </div>

                    <button
                        onClick={() => {
                            try {
                                if (Number(quantity) <= 0) {
                                    throw Error('Vui lòng nhập số lượng sản phẩm')
                                }
                                if (status === "") {
                                    throw Error('Vui lòng chọn trạng thái sản phẩm')
                                }
                                if (locationChoose.length === 0) {
                                    throw Error('Vui lòng chọn vị trí')
                                }
                                if (locationChoose.reduce((sum, location) => sum + location.currentQuantity, 0) !== quantity) {
                                    throw Error('Vui lòng chọn đủ vị trí và số lượng phù hợp cho từng vị trí')
                                }
                                if (quantity > 0) {
                                    const selectedLocations = locationChoose
                                        .map((location) => ({
                                            status: status,
                                            location: { label: location.label, value: location.value },
                                            quantity: location.currentQuantity
                                        }));
                                    props.addItem(props.productCheckId, selectedLocations);
                                    props.onClose();
                                }
                            } catch (error: any) {
                                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                            }
                        }}
                        className="btn btn-primary p-3 fw-bold"
                    >
                        Xác nhận
                    </button>

                </div>

                <div className={"d-flex flex-row gap-5"}>
                    <FormGroup className="mb-4" style={{ flex: 1 }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <label className="fw-semibold h5">Vị trí đề xuất:</label>
                            <button
                                disabled={quantity <= 0 || status === ""}
                                onClick={() => {
                                    if (quantity < 0)
                                        dispatch({
                                            message: "Số lượng sản phẩm không thể nhỏ hơn 0",
                                            type: ActionTypeEnum.ERROR
                                        });
                                    if (quantity === 0)
                                        dispatch({
                                            message: "Vui lòng nhập số lượng sản phẩm",
                                            type: ActionTypeEnum.ERROR
                                        });
                                    if (quantity > 0) setShowListShelf(true);
                                }}
                                className="btn btn-link text-primary p-0 fw-bold"
                            >
                                Tùy chỉnh
                            </button>
                        </div>
                        <div>
                            {filterRecomandLocationIsCheck().length === 0 ? (
                                <NoData lable={"Không tìm thấy vị trí phù hợp!"} />
                            ) : (
                                <div className="d-flex flex-wrap align-items-center justify-content-start">
                                    {filterRecomandLocationIsCheck().map((location, index) => (
                                        <div key={index} className="p-2" style={{ width: "200px" }}>
                                            <div
                                                className="d-flex flex-row align-items-center justify-content-between p-2 border rounded">
                                                <span>{location.label}</span>
                                                <input
                                                    checked={location.isChecked}
                                                    type="checkbox"
                                                    onChange={() => {
                                                        setLocations(filterRecomandLocationIsCheck().map(myLocation => {
                                                            if (myLocation.value === location.value) return {
                                                                ...location,
                                                                isChecked: !myLocation.isChecked
                                                            }
                                                            return myLocation
                                                        }))
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FormGroup>
                    <FormGroup className="mb-4" style={{ flex: 1 }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <label className="fw-semibold mb-2 h5">Danh sách vị trí đã chọn:</label>
                        </div>
                        <div>
                            {locationChoose.length === 0 ? (
                                <NoData lable={"Chưa có vị trí nào được chọn"} />
                            ) : (
                                <div className="d-flex flex-wrap align-items-center justify-content-start gap-1">
                                    {locationChoose.map((mylct, index) => (
                                        <div key={index} className="p-2 shadow rounded" style={{ width: "190px" }}>
                                            <div
                                                className="d-flex flex-row align-items-center justify-content-between p-2 border rounded">
                                                <span>{mylct.label}</span>
                                                <CloseButton
                                                    style={{ backgroundColor: "gray" }}
                                                    onClick={() => {
                                                        if (locations.find((location) => location.value === mylct.value)) {
                                                            setLocations((prevState) => prevState.map((data) => {
                                                                if (data.value === mylct.value) {
                                                                    return { ...data, isChecked: false };
                                                                } else {
                                                                    return data;
                                                                }
                                                            }))
                                                        } else {
                                                            setLocationChoose((prevState) => prevState.filter((data) => data.value !== mylct.value));
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <input
                                                max={mylct.maxQuantity}
                                                min={0}
                                                disabled={!mylct.isChecked}
                                                type="number"
                                                value={mylct.currentQuantity}
                                                onChange={(e) => setLocationChoose(preData => preData.map((lctc) => {
                                                    if (lctc.value === mylct.value) return {
                                                        ...lctc,
                                                        currentQuantity: Number(e.target.value)
                                                    }
                                                    return lctc
                                                }))}
                                                className="form-control mt-2" placeholder="Số lượng nhập" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FormGroup>
                </div>
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
                    temporaryLocation={locationChoose}
                />
            }
        </OverLay>
    )
}

export default ModelAddItemCheck