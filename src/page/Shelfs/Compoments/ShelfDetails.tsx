import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { Badge, CloseButton, Col, Row } from "react-bootstrap";
import GetLocationByShelfIdt, { StorageLocation } from "../../../services/Location/GetLocationByShelfIdt";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import ModelLocationDetail from "./ModelLocationDetail";
import Shelf from "../../../interface/Entity/Shelf";
import GetShelfById from "../../../services/Location/GetShelfById";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import SuggestInbound from "../../../services/StockEntry/SuggestInbound";
import MoveProductInLocation from "../../../services/Location/MoveProductInLocation";
import ListShelf from "../../StockEntry/compoments/ListShelf";
import Select from 'react-select';
import OptionType from "../../../interface/OptionType";
import ModelLocationHistory from "./ModelLocationHistory";
import ModelQRCodeLocation from "./ModelQRCodeLocation";

interface ShelfDetailsProps {
    shelfId: string;
    close: () => void;
}

const ShelfDetails: React.FC<ShelfDetailsProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [shelf, setShelf] = React.useState<Shelf>();
    const [locations, setLocations] = React.useState<StorageLocation[]>([]);
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [locationCode, setLocationCode] = React.useState<string>('');
    const [showLocationDetail, setShowLocationDetail] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [startY, setStartY] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [scrollTop, setScrollTop] = React.useState(0);
    const [resset, setResset] = React.useState(false);

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetLocationByShelfIdt(props.shelfId)
                .then((response) => {
                    if (response) setLocations(response);
                })
                .catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                });
        }, 1000);
        return () => clearTimeout(id);
    }, [dispatch, props.shelfId, resset]);

    React.useEffect(() => {
        if (props.shelfId) {
            GetShelfById(props.shelfId)
                .then((response) => {
                    if (response) setShelf(response);
                })
                .catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                });
        }
    }, [dispatch, props.shelfId]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (scrollContainerRef.current) {
            setIsDragging(true);
            setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
            setStartY(e.pageY - scrollContainerRef.current.offsetTop);
            setScrollLeft(scrollContainerRef.current.scrollLeft);
            setScrollTop(scrollContainerRef.current.scrollTop);
            scrollContainerRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseLeave = () => {
        if (scrollContainerRef.current) {
            setIsDragging(false);
            scrollContainerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseUp = () => {
        if (scrollContainerRef.current) {
            setIsDragging(false);
            scrollContainerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const y = e.pageY - scrollContainerRef.current.offsetTop;
        const walkX = (x - startX) * 2;
        const walkY = (y - startY) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
        scrollContainerRef.current.scrollTop = scrollTop - walkY;
    };

    const renderLocation = locations.map((location) => {
        return (
            <MyLocation
                key={location.locationCode}
                location={location}
                setLocationCode={setLocationCode}
                setShowLocationDetail={setShowLocationDetail}
                typeShelf={shelf?.typeShelf || ""}
                categoryName={shelf?.category?.name || ""}
                ressetShelf={() => setResset(!resset)}
            />
        );
    });

    const renderGrid = [];
    for (let i = (shelf?.maxLevels || 0); i > 0; i--) {
        renderGrid.push(
            <React.Fragment key={`row-${i}`}>
                {renderLocation.slice((i - 1) * (shelf?.maxColumns || 0), i * (shelf?.maxColumns || 0))}
            </React.Fragment>
        );
        renderGrid.push(
            <div
                key={`empty-row-${i}`}
                style={{
                    gridColumn: `1 / span ${shelf?.maxColumns}`,
                    height: "70px",
                    pointerEvents: "none",
                    userSelect: "none",
                }}
                className="d-flex justify-content-center align-items-center shadow bg-primary text-light rounded"
            >
                <h1>Tầng {i}</h1>
            </div>
        );
    }

    return (
        <OverLay className="disabled-padding bg-light">
            <div className="mt-3 w-100 px-4 py-2 shadow">
                <div className="d-flex gap-2 align-items-center">
                    <h1 className="fw-bold">
                        THÔNG TIN KỆ HÀNG: {shelf?.name}
                    </h1>
                    <div>
                        {
                            shelf?.typeShelf === "NORMAL" ?
                                <Badge bg="primary" className="ms-2">Kệ thường</Badge>
                                :
                                <Badge bg="danger" className="ms-2">Kệ chứa hàng lỗi</Badge>
                        }
                    </div>
                </div>
                <h5><span className="fw-bold">Loại hàng: </span>{shelf?.category?.name || ""}</h5>
                <Row>
                    <Col>
                        <h5><span className="fw-bold">Số tầng: </span>{shelf?.maxLevels}</h5>
                    </Col>
                    <Col>
                        <h5><span className="fw-bold">Số cột: </span>{shelf?.maxColumns}</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h5><span
                            className="fw-bold">Không gian đối đa: </span>{Number(shelf?.maxCapacity).toLocaleString()} cm3
                        </h5>
                    </Col>
                    <Col>
                        <h5><span
                            className="fw-bold">Không gian đã sử dụng :</span>{Number(shelf?.currentCapacity).toLocaleString()} cm3
                        </h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h5><span
                            className="fw-bold">Khối lượng chứa đối đa: </span>{Number(shelf?.maxWeight).toLocaleString()} kg
                        </h5>
                    </Col>
                    <Col>
                        <h5><span
                            className="fw-bold">Khối lượng đang chứa :</span>{Number(shelf?.currentWeight).toLocaleString()} kg
                        </h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h5><span
                            className="fw-bold">Vị trí còn trống: </span>{(shelf?.totalColumns || 0) - (locations.filter((location) => location.occupied).length || 0)} Vị
                            trí</h5>
                    </Col>
                    <Col>
                        <h5><span
                            className="fw-bold">Vị trí đang sử dụng: </span>{locations.reduce((currentVal, location) => {
                                return location.occupied ? currentVal + 1 : currentVal
                            }, 0) || 0} Vị trí</h5>
                    </Col>
                </Row>
            </div>
            <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className="shelf-details-container"
                style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    gridTemplateColumns: `repeat(${shelf?.maxColumns}, 200px)`,
                    gridTemplateRows: `repeat(${shelf?.maxLevels}, 200px 50px)`,
                    gridGap: "50px",
                    overflow: "auto",
                    padding: "25px",
                }}
            >
                <CloseButton
                    onClick={() => {
                        props.close()
                    }}
                    className="position-fixed bg-light"
                    style={{ top: "15px", right: "15px", zIndex: "3000" }}
                />
                {renderGrid}
            </div>
            {
                showLocationDetail &&
                <ModelLocationDetail
                    onClose={() => {
                        setShowLocationDetail(false)
                        setLocationCode('')
                    }}
                    locationCode={locationCode}
                />
            }
        </OverLay>
    )
}
export default ShelfDetails;

interface ModelLocationProps {
    onClose: () => void;
    typeShelf: string;
    categoryName: string;
    location: StorageLocation;
    ressetShelf: () => void;
}

const ModelMoveLocation: React.FC<ModelLocationProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [quantity, setQuantity] = React.useState(props.location.quantity);
    const [suggestedLocation, setSuggestedLocation] = React.useState<{ value: string, label: string }[]>();
    const [unitId, setUnitId] = React.useState<string>('');
    const [newLocation, setNewLocation] = React.useState<OptionType | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [showListShelf, setShowListShelf] = React.useState(false);

    React.useEffect(() => {
        if (quantity > 0 && unitId !== '' && props.location.skus.id && props.typeShelf) {
            SuggestInbound({
                quantity: quantity,
                skuId: props.location.skus.id,
                typeShelf: props.typeShelf,
                unitId: unitId
            })
                .then((res) => {
                    if (res) {
                        if (res.length === 0) dispatch({
                            message: "Không tìm thấy vị trí phù hợp",
                            type: ActionTypeEnum.ERROR
                        })
                        setSuggestedLocation(res.map((location) => {
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
    })

    const filterCurrentLocation = suggestedLocation?.filter((location) => location.value !== props.location.id);

    const volumnProudct = () => {
        const dimension = props.location.skus.dimension.split("x");
        return Number(dimension[0]) * Number(dimension[1]) * Number(dimension[2]);
    }

    const handleSubmit = () => {
        if (quantity === 0) {
            dispatch({ message: "Số lượng sản phẩm cần chuyển phải lớn hơn 0", type: ActionTypeEnum.ERROR })
            return;
        }
        if (unitId === "") {
            dispatch({ message: "Chưa chọn đơn vị tính", type: ActionTypeEnum.ERROR })
            return;
        }
        if (newLocation === undefined || newLocation?.value === "") {
            dispatch({ message: "Chưa chọn vị trí mới", type: ActionTypeEnum.ERROR })
            return;
        }
        setLoading(true)
        MoveProductInLocation({
            locationCurrentId: props.location.id,
            locationDestinationId: newLocation?.value || "",
            quantity: quantity,
            unitId: unitId
        })
            .then(() => {
                dispatch({ message: "Chuyển hàng thành công", type: ActionTypeEnum.SUCCESS })
                props.ressetShelf();
                props.onClose();
            })
            .catch((err) => {
                console.error(err)
                dispatch({ message: err.message, type: ActionTypeEnum.ERROR })
            })
            .finally(() => setLoading(false))
    }

    const updateNewLocation = (id: string, value: string) => {
        setNewLocation({ value: id, label: value })
    }

    return (
        <OverLay className="disabled-padding">
            <div className="p-4 bg-light rounded position-relative" style={{ width: "550px" }}>
                <CloseButton onClick={() => props.onClose()} className="position-absolute"
                    style={{ top: "15px", right: "15px" }} />
                <h2 className="text-start">Chuyển Hàng</h2>
                <div className="mb-3 text-start">
                    <label>Vị trí hiện tại</label>
                    <input type="text" value={props.location.locationCode} className="form-control p-3"
                        placeholder="Vị trí cần chuyển..." readOnly />
                </div>
                <div className="mb-3 text-start">
                    <label>Số lượng sản phẩm cần chuyển</label>
                    <input
                        type="number"
                        value={quantity}
                        min={1}
                        max={props.location.quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="form-control p-3"
                        placeholder="Vị trí cần chuyển..."
                    />
                </div>
                <div className="mb-3 text-start">
                    <label>Đơn vị tính</label>
                    <select
                        className="form-select p-3"
                        value={unitId}
                        onChange={(e) => setUnitId(e.target.value)}
                    >
                        <option value="">Chọn đơn vị tính...</option>
                        {
                            props.location.skus.productDetails.product.units?.map((unit) => {
                                return (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                )
                            })
                        }
                    </select>
                </div>
                <div className="mb-3 text-start">
                    <label>Vị trí mới</label>
                    <div className="d-flex flex-row gap-3">
                        <Select
                            placeholder="Chọn vị trí được đề xuất..."
                            isClearable
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    padding: "0.5rem 0px",
                                    width: "430px",
                                }),
                            }}
                            value={newLocation}
                            onChange={(e) => setNewLocation(e)}
                            options={filterCurrentLocation}
                            isDisabled={quantity > 0 && unitId !== '' && props.location.skus.id && props.typeShelf ? false : true}
                        />
                        <button
                            disabled={quantity > 0 && unitId !== '' && props.location.skus.id && props.typeShelf ? false : true}
                            onClick={() => setShowListShelf(true)}
                            style={{ width: "57px", height: "57px" }}
                            className="btn btn-primary"
                        >
                            <FontAwesomeIcon icon={faLocationDot} />
                        </button>
                    </div>
                </div>
                <div className="d-flex justify-content-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn btn-primary w-100 py-3"
                    >
                        {loading ? "Đang chuyển..." : "Chuyển hàng"}
                    </button>
                </div>
            </div>
            {
                showListShelf &&
                <ListShelf
                    onClose={() => setShowListShelf(false)}
                    unitId={unitId}
                    quantity={quantity}
                    categoryName={props.categoryName}
                    productId={props.location.skus.productDetails.product.id}
                    status={props.typeShelf}
                    weight={Number(props.location.skus.weight)}
                    setLocation={updateNewLocation}
                    volume={volumnProudct()}
                    locationMoveId={props.location.id}
                />
            }
        </OverLay>
    )
}

interface MyLocationProps {
    typeShelf: string;
    categoryName: string;
    location: StorageLocation;
    setLocationCode: (locationCode: string) => void;
    setShowLocationDetail: (show: boolean) => void;
    ressetShelf: () => void;
}

const MyLocation: React.FC<MyLocationProps> = (props) => {

    const [showOptions, setShowOptions] = React.useState(false);
    const [showMoveLocation, setShowMoveLocation] = React.useState(false);
    const [showLocationHistory, setShowLocationHistory] = React.useState(false);
    const [showQRCode, setShowQRCode] = React.useState(false);

    return (
        <div
            onMouseEnter={() => setShowOptions(true)}
            onMouseLeave={() => setShowOptions(false)}
            className="btn btn-light shadow shelf-item d-flex justify-content-center align-items-center position-relative"
        >
            <div>
                <div className="h4 fw-bold">{props.location.locationCode}</div>
                {
                    props.location.occupied && (
                        <>
                            <div className="h6 text-info">{props.location.skus.productDetails.product.name}</div>
                            <div className="h6">Số lượng: {props.location.quantity} {props.location.skus.productDetails.product.units?.find((unit) => unit.isBaseUnit)?.name || ""}</div>
                        </>
                    )
                }
            </div>
            {
                props.location.occupied ?
                    <Badge className="position-absolute top-0 end-0" bg="danger">Đang sử dụng</Badge>
                    :
                    <Badge className="position-absolute top-0 end-0" bg="primary">Đang trống</Badge>
            }
            {
                showOptions &&
                <div
                    className="position-absolute w-100 h-100 bg-light d-flex flex-column justify-content-center gap-1 p-2 rounded">
                    <button
                        onClick={() => {
                            props.setLocationCode(props.location.locationCode)
                            props.setShowLocationDetail(true)
                        }}
                        className="btn btn-primary"
                    >
                        Chi Tiết
                    </button>
                    {
                        props.location.occupied &&
                        <button
                            onClick={() => {
                                setShowMoveLocation(true)
                            }}
                            className="btn btn-danger"
                        >
                            Chuyển hàng
                        </button>
                    }
                    <button
                        onClick={() => setShowLocationHistory(true)}
                        className="btn btn-secondary"
                    >
                        Lịch sử hoạt động
                    </button>
                    <button
                        onClick={() => setShowQRCode(true)}
                        className="btn btn-warning"
                    >
                        QR Code
                    </button>
                </div>
            }
            {
                showMoveLocation &&
                <ModelMoveLocation
                    onClose={() => setShowMoveLocation(false)}
                    location={props.location}
                    typeShelf={props.typeShelf}
                    categoryName={props.categoryName}
                    ressetShelf={props.ressetShelf}
                />
            }
            {
                showLocationHistory &&
                <ModelLocationHistory
                    onClose={() => setShowLocationHistory(false)}
                    locationId={props.location.id}
                />
            }
            {
                showQRCode &&
                <ModelQRCodeLocation
                    locationCode={props.location.locationCode}
                    onClosed={() => setShowQRCode(false)}
                />
            }
        </div>
    )
}