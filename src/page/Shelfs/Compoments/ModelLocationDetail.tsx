import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import GetLocationDetailsByCode from "../../../services/Location/GetLocationDetailsByCode";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import { Badge, CloseButton, Col, Image, Row } from "react-bootstrap";
import { StorageLocation } from "../../../services/Location/GetLocationByShelfIdt";

interface ModelLocationDetailProps {
    onClose: () => void;
    locationCode: string;
}

const ModelLocationDetail: React.FC<ModelLocationDetailProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [locationDetail, setLocationDetail] = React.useState<StorageLocation>();

    React.useEffect(() => {
        GetLocationDetailsByCode(props.locationCode)
            .then((response) => {
                setLocationDetail(response)
            }).catch((error) => {
                console.error(error)
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            })
    }, [dispatch, props.locationCode]);

    return (
        <OverLay>
            <div className="position-relative bg-light rounded p-4" style={{ width: "1000px" }}>
                <CloseButton
                    onClick={() => props.onClose()}
                    className="position-absolute bg-light"
                    style={{ top: "15px", right: "15px" }}
                />
                <div className="d-flex flex-row align-items-center gap-3">
                    <h2 className="fw-bold">Thông Tin Vị Trí:</h2>
                </div>
                <Row className="mb-2">
                    <Col>
                        <div>
                            <span className="fw-semibold">Tên vị trí: </span>
                            {locationDetail?.locationCode || "Chưa có thông tin!"}
                        </div>
                    </Col>
                    <Col>
                        <div>
                            <span className="fw-semibold">Trạng thái: </span>
                            {
                                locationDetail?.occupied ?
                                    <Badge bg="danger">Đang sử dụng</Badge>
                                    :
                                    <Badge bg="primary">Đang trống</Badge>
                            }
                        </div>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <div>
                            <span className="fw-semibold">Không gian tối đa: </span>
                            {Number(locationDetail?.maxCapacity).toLocaleString()} cm3
                        </div>
                    </Col>
                    <Col>
                        <div>
                            <span className="fw-semibold">Không gian đã sử dụng: </span>
                            {Number(locationDetail?.currentCapacity).toLocaleString()} cm3
                        </div>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <div>
                            <span className="fw-semibold">Khối lượng chứa tối đa: </span>
                            {Number(locationDetail?.maxWeight).toLocaleString()} kg
                        </div>
                    </Col>
                    <Col>
                        <div>
                            <span className="fw-semibold">Khối lượng đang chứa: </span>
                            {Number(locationDetail?.currentWeight).toLocaleString()} kg
                        </div>
                    </Col>
                </Row>
                <h5 className="fw-bold">Thông Tin Sản Phẩm:</h5>
                <div className="d-flex flex-row gap-3 justify-content-between align-items-center">
                    <div className="my-2 d-flex justify-content-center" style={{ flex: 1 }}>
                        <Image src={locationDetail?.skus?.productDetails?.product?.img || "/images/default-product-img.png"} thumbnail style={{
                            width: "150px",
                            height: "auto",
                            objectFit: "cover"
                        }} />
                    </div>
                    <Row style={{ flex: 3 }}>
                        <Col>
                            <div>
                                <span className="fw-semibold">Mã SKU: </span>
                                {locationDetail?.skus?.skuCode || "Chưa có thông tin!"}
                            </div>
                            <div>
                                <span className="fw-semibold">Tên sản phẩm: </span>
                                {locationDetail?.skus?.productDetails?.product?.name || "Chưa có thông tin!"}
                            </div>
                            <div>
                                <span className="fw-semibold">Trọng lượng: </span>
                                {(locationDetail?.skus?.weight || "Chưa có thông tin!") + " (kg)"}
                            </div>
                        </Col>
                        <Col>
                            <div>
                                <span className="fw-semibold">Số lượng: </span>
                                {(locationDetail?.quantity + " " + locationDetail?.skus?.productDetails?.product?.units.find((unit) => unit.isBaseUnit)?.name || "Chưa có thông tin!")}
                            </div>
                            <div>
                                <span className="fw-semibold">Mã sản phẩm: </span>
                                {locationDetail?.skus?.productDetails?.product?.productCode || "Chưa có thông tin!"}
                            </div>
                            <div>
                                <span className="fw-semibold">kích thước: </span>
                                {(locationDetail?.skus?.dimension || "Chưa có thông tin!") + " (cm)"}
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </OverLay>
    );
}

export default ModelLocationDetail;