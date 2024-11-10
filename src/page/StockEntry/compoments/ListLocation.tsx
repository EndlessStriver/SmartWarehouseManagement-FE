import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { Badge, CloseButton, Col, Row } from "react-bootstrap";
import GetLocationByShelfIdt, { StorageLocation } from "../../../services/Location/GetLocationByShelfIdt";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import Shelf from "../../../interface/Entity/Shelf";
import GetShelfById from "../../../services/Location/GetShelfById";
import ModelLocationDetail from "../../Shelfs/Compoments/ModelLocationDetail";
import ConvertUnit from "../../../services/Attribute/Unit/ConvertUnit";
import { useProductCheck } from "../../../Context/ContextProductCheck";

interface ListLocationProps {
    locationMoveId?: string;
    shelfId: string;
    volume: number
    quantity: number
    productId: string
    unitId: string
    weight: number
    addLocation: (id: string, name: string) => void;
    close: () => void;
    closeAll: () => void;
}

const ListLocation: React.FC<ListLocationProps> = (props) => {

    const productCheck = useProductCheck();
    const dispatch = useDispatchMessage();
    const [shelf, setShelf] = React.useState<Shelf>();
    const [locations, setLocations] = React.useState<StorageLocation[]>([]);
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [showModelLocationDetail, setShowModelLocationDetail] = React.useState(false);
    const [locationCode, setlocationCode] = React.useState<string>("");
    const [startX, setStartX] = React.useState(0);
    const [startY, setStartY] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [scrollTop, setScrollTop] = React.useState(0);
    const [valueConvert, setValueConvert] = React.useState(0);

    React.useEffect(() => {
        GetLocationByShelfIdt(props.shelfId)
            .then((response) => {
                if (response) setLocations(response)
            }).catch((error) => {
                console.error(error)
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            })
    }, [dispatch, props.shelfId]);

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

    React.useEffect(() => {
        ConvertUnit(props.unitId, props.quantity)
            .then((response) => {
                if (response) {
                    setValueConvert(response)
                }
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            });
    }, [dispatch, props.quantity, props.unitId]);

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

    const checkLocationIsNotOk = (location: StorageLocation): boolean => {
        if (props.locationMoveId && props.locationMoveId === location.id) return true;
        if (location.occupied && location.skus.productDetails.product.id !== props.productId) return true;
        if (returnValueCountIsUsed(location) < props.quantity) {
            return true;
        }
        if (checkLocationIsChoose(location)) return true;
        return false
    }

    const returnValueCountIsUsed = (location: StorageLocation): number => {
        let countUsedWidthVolume = Math.floor((Number(location.maxCapacity) - Number(location.currentCapacity)) / (props.volume * valueConvert))
        let countUsedWidthWeight = Math.floor((Number(location.maxWeight) - Number(location.currentWeight)) / (props.weight * valueConvert))
        return countUsedWidthVolume < countUsedWidthWeight ? countUsedWidthVolume : countUsedWidthWeight
    }

    const checkLocationIsChoose = (location: StorageLocation): boolean => {

        let check = false;

        productCheck.forEach((product) => {
            product.listAddLocation.forEach((locationAdd) => {
                if (locationAdd.location.value === location.id) check = true;
            })
        })

        return check;
    }

    const renderLocation = locations.map((location, index) => {
        return (
            <button
                disabled={checkLocationIsNotOk(location)}
                key={index}
                className={`btn btn-light shadow shelf-item d-flex justify-content-center align-items-center position-relative ${checkLocationIsNotOk(location) ? "bg-warning" : "bg-light"}`}
            >
                <div>
                    <div className="h5 fw-bold">{location.locationCode}</div>
                    <div className="h6">Còn trống: {(100 - (Number(location.currentCapacity) / Number(location.maxCapacity)) * 100).toFixed(2)}%</div>
                    {
                        location.occupied && (
                            <>
                                <div className="h6">Tên sản phẩm: {location.skus.productDetails.product.name}</div>
                                <div className="h6">Số lượng: {location.quantity} {location.skus.productDetails.product.units.find((unit) => unit.isBaseUnit)?.name}</div>
                            </>
                        )
                    }
                    <div className="d-flex flex-row">
                        <div
                            onClick={() => {
                                setlocationCode(location.locationCode)
                                setShowModelLocationDetail(true)
                            }}
                            className="btn btn-link"
                        >
                            Chi Tiết
                        </div>
                        <div
                            onClick={() => {
                                if ((Number(location.maxCapacity) / props.volume) < props.quantity) {
                                    dispatch({ type: ActionTypeEnum.ERROR, message: "Vị trí này không thể chứa đủ số lượng yêu cầu vui lòng giảm số lượng hoặc chọn một vị trí khác" })
                                    return;
                                }
                                props.addLocation(location.id, location.locationCode)
                                props.closeAll()
                            }}
                            className={`btn btn-link ${checkLocationIsNotOk(location) ? "text-light" : "text-danger"}`}
                        >
                            Thêm
                        </div>
                    </div>
                </div>
                {
                    location.occupied ?
                        <Badge className="position-absolute top-0 end-0" bg="danger">Đang sử dụng</Badge>
                        :
                        <Badge className="position-absolute top-0 end-0" bg="primary">Đang trống</Badge>
                }
                <Badge className="position-absolute top-100 start-50 translate-middle" bg="success">Số lượng có thể chứa: <span>{returnValueCountIsUsed(location)}</span></Badge>
                {
                    checkLocationIsChoose(location) &&
                    <div className="position-absolute top-50 start-50 translate-middle">
                        <h3 className="fw-bold text-light">ĐÃ ĐƯỢC CHỌN</h3>
                    </div>
                }
            </button >
        )
    })

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
            <div className="mt-3 w-100 px-4 py-2 shadow text-start">
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
                        <h5><span className="fw-bold">Không gian đối đa: </span>{Number(shelf?.maxCapacity).toLocaleString()} cm3</h5>
                    </Col>
                    <Col>
                        <h5><span className="fw-bold">Không gian đã sử dụng :</span>{Number(shelf?.currentCapacity).toLocaleString()} cm3</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h5><span className="fw-bold">Khối lượng tối đa: </span>{Number(shelf?.maxWeight).toLocaleString()} kg</h5>
                    </Col>
                    <Col>
                        <h5><span className="fw-bold">Khối lượng đang lưu trữ :</span>{Number(shelf?.currentWeight).toLocaleString()} kg</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h5><span className="fw-bold">Vị trí còn trống: </span>{(shelf?.totalColumns || 0) - (shelf?.currentColumnsUsed || 0)} Vị trí</h5>
                    </Col>
                    <Col>
                        <h5><span className="fw-bold">Vị trí đang sử dụng: </span>{locations.reduce((currentVal, location) => {
                            if (location.occupied) return currentVal + 1;
                            return currentVal;
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
                    onClick={() => { props.close() }}
                    className="position-fixed bg-light"
                    style={{ top: "15px", right: "15px", zIndex: "3000" }}
                />
                {renderGrid}
            </div>
            {
                showModelLocationDetail &&
                <ModelLocationDetail
                    onClose={() => {
                        setShowModelLocationDetail(false)
                        setlocationCode("")
                    }}
                    locationCode={locationCode}
                />
            }
        </OverLay>
    )
}

export default ListLocation;