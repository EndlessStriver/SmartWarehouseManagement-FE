import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import GetLocationDetailsByCode, { LocationDetail } from "../../../services/Location/GetLocationDetailsByCode";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import { Badge, CloseButton, Col, Image, Row } from "react-bootstrap";

interface ModelLocationDetailProps {
    onClose: () => void;
    locationCode: string;
}

const ModelLocationDetail: React.FC<ModelLocationDetailProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [locationDetail, setLocationDetail] = React.useState<LocationDetail>();

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
            <div className="position-relative bg-light rounded p-5" style={{ width: "800px" }}>
                <CloseButton
                    onClick={() => props.onClose()}
                    className="position-absolute bg-light"
                    style={{ top: "15px", right: "15px" }}
                />
                <div className="d-flex flex-row align-items-center gap-3">
                    <div className="h4 mb-1">Location Detail: {locationDetail?.locationCode}</div>
                    <div>
                        {
                            locationDetail?.occupied ?
                                <Badge bg="danger">Đang sử dụng</Badge>
                                :
                                <Badge bg="primary">Đang trống</Badge>
                        }
                    </div>
                </div>
                <Row className="mb-3">
                    <Col>
                        <div>
                            <span className="fw-semibold">Max Capacity: </span>
                            {Number(locationDetail?.maxCapacity).toLocaleString()} cm2
                        </div>
                    </Col>
                    <Col>
                        <div>
                            <span className="fw-semibold">Current Capacity: </span>
                            {Number(locationDetail?.currentCapacity).toLocaleString()} cm2
                        </div>
                    </Col>
                </Row>
                <h4>Product Information:</h4>
                <Row>
                    <div className="my-2 d-flex justify-content-center">
                        <Image src={locationDetail?.skus?.productDetails[0]?.product.img || "/images/default-product-img.png"} thumbnail style={{
                            width: "450px",
                            height: "auto",
                            objectFit: "cover"
                        }} />
                    </div>
                    <Col>
                        <div>
                            <span className="fw-semibold">SKU Code: </span>
                            {locationDetail?.skus?.skuCode || "No information yet!"}
                        </div>
                        <div>
                            <span className="fw-semibold">Product Name: </span>
                            {locationDetail?.skus?.productDetails[0]?.product?.name || "No information yet!"}
                        </div>
                        <div>
                            <span className="fw-semibold">Weight: </span>
                            {(locationDetail?.skus?.weight || "No information yet!") + " (g)"}
                        </div>
                    </Col>
                    <Col>
                        <div>
                            <span className="fw-semibold">Quantity: </span>
                            {locationDetail?.quantity || "No information yet!"}
                        </div>
                        <div>
                            <span className="fw-semibold">Product Code: </span>
                            {locationDetail?.skus?.productDetails[0]?.product?.productCode || "No information yet!"}
                        </div>
                        <div>
                            <span className="fw-semibold">Dimension: </span>
                            {(locationDetail?.skus?.dimension || "No information yet!") + " (cm)"}
                        </div>
                    </Col>
                </Row>
            </div>
        </OverLay>
    );
}

export default ModelLocationDetail;