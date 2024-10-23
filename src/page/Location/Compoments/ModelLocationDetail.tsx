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
                console.log(response)
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
                                <Badge bg="danger">Occupied</Badge>
                                :
                                <Badge bg="primary">Unoccupied</Badge>
                        }
                    </div>
                </div>
                <Row className="mb-3">
                    <Col>
                        <div>Max Capacity: {locationDetail?.maxCapacity}cm</div>
                    </Col>
                    <Col>
                        <div>Current Capacity: {Number(locationDetail?.currentCapacity).toFixed(2)}cm</div>
                    </Col>
                </Row>
                <h4>Product Information:</h4>
                <Row>
                    <div className="my-2">
                        <Image src={locationDetail?.skus?.productDetails[0]?.product.img || "/images/default-product-img.png"} thumbnail style={{
                            width: "250px",
                            height: "auto",
                            objectFit: "cover"
                        }} />
                    </div>
                    <Col>
                        <div>SKU Code: {locationDetail?.skus?.skuCode || "Chưa có thông tin!"}</div>
                        <div>Product Name: {locationDetail?.skus?.productDetails[0]?.product?.name || "Chưa có thông tin!"}</div>
                        <div>Weight: {locationDetail?.skus?.weight + "g" || "Chưa có thông tin!"}</div>
                    </Col>
                    <Col>
                        <div>Quantity: {locationDetail?.skus?.productDetails[0].quantity + "" || "Chưa có thông tin!"}</div>
                        <div>Product Code: {locationDetail?.skus?.productDetails[0]?.product?.productCode || "Chưa có thông tin!"}</div>
                        <div>Dimension: {locationDetail?.skus?.dimension + "cm" || "Chưa có thông tin!"}</div>
                    </Col>
                </Row>
            </div>
        </OverLay>
    );
}

export default ModelLocationDetail;