import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { Badge, CloseButton, Col, Row } from "react-bootstrap";
import GetLocationByShelfIdt, { StorageLocation } from "../../../services/Location/GetLocationByShelfIdt";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import ModelLocationDetail from "./ModelLocationDetail";
import Shelf from "../../../interface/Entity/Shelf";
import GetShelfById from "../../../services/Location/GetShelfById";

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

    React.useEffect(() => {
        GetLocationByShelfIdt(props.shelfId)
            .then((response) => {
                if (response) setLocations(response);
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            });
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

    const renderLocation = locations.map((location, index) => {
        return (
            <div
                key={index}
                className="btn btn-light shadow shelf-item d-flex justify-content-center align-items-center position-relative"
            >
                <div>
                    <div className="h5 fw-bold">{location.locationCode}</div>
                    <div className="h6">Còn trống: {(100 - (Number(location.currentCapacity) / Number(location.maxCapacity)) * 100).toFixed(2)}%</div>
                    {
                        location.occupied && (
                            <>
                                <div className="h6">Tên sản phẩm: {location.skus.productDetails.product.name}</div>
                                <div className="h6">Số lượng: {location.quantity} {location.skus.productDetails.product.units?.find((unit) => unit.isBaseUnit)?.name || ""}</div>
                            </>
                        )
                    }
                    <div
                        onClick={() => {
                            setLocationCode(location.locationCode)
                            setShowLocationDetail(true)
                        }}
                        className="btn btn-link"
                    >
                        Chi Tiết
                    </div>
                </div>
                {
                    location.occupied ?
                        <Badge className="position-absolute top-0 end-0" bg="danger">Đang sử dụng</Badge>
                        :
                        <Badge className="position-absolute top-0 end-0" bg="primary">Đang trống</Badge>
                }
            </div>
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
                        <h5><span className="fw-bold">Không gian đối đa: </span>{Number(shelf?.maxCapacity).toLocaleString()} cm3</h5>
                    </Col>
                    <Col>
                        <h5><span className="fw-bold">Không gian đã sử dụng :</span>{Number(shelf?.currentCapacity).toLocaleString()} cm3</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h5><span className="fw-bold">Khối lượng chứa đối đa: </span>{Number(shelf?.maxWeight).toLocaleString()} kg</h5>
                    </Col>
                    <Col>
                        <h5><span className="fw-bold">Khối lượng đang chứa :</span>{Number(shelf?.currentWeight).toLocaleString()} kg</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h5><span className="fw-bold">Vị trí còn trống: </span>{(shelf?.totalColumns || 0) - (shelf?.currentColumnsUsed || 0)} Vị trí</h5>
                    </Col>
                    <Col>
                        <h5><span className="fw-bold">Vị trí đang sử dụng: </span>{shelf?.currentColumnsUsed || 0} Vị trí</h5>
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