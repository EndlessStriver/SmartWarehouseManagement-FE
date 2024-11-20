import { CloseButton, Col, Row } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import React from "react";
import GetAllLocationHaveProduct, { Product } from "../../../services/StockEntry/GetAllLocationHaveProduct";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import { NoData } from "../../../compoments/NoData/NoData";

interface ModelViewInventoryTrackingProps {
    onClose: () => void;
    productId: string;
}

const ModelViewInventoryTracking: React.FC<ModelViewInventoryTrackingProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [product, setProduct] = React.useState<Product | null>(null);

    React.useEffect(() => {
        GetAllLocationHaveProduct(props.productId)
            .then((res) => {
                console.log(res);
                if (res) setProduct(res);
            })
            .catch((err) => {
                console.log(err);
                dispatch({ message: "Có lỗi xảy ra", type: ActionTypeEnum.ERROR });
            })
    }, [props.productId, dispatch]);

    return (
        <OverLay>
            <div className="bg-light rounded p-4 position-relative" style={{ width: "800px" }}>
                <CloseButton className="position-absolute" onClick={() => props.onClose()} style={{ top: "15px", right: "15px" }} />
                <h3>Thông Tin Chi Tiết Sản Phẩm Tồn Kho</h3>
                <Row>
                    <Col style={{ flex: 1 }}>
                        <img src={product?.img} className="shadow" alt="product" style={{ width: "250px", height: "250px" }} />
                    </Col>
                    <Col style={{ flex: 2 }}>
                        <h4>{product?.name}</h4>
                        <h6>Mã sản phẩm: {product?.productCode}</h6>
                        <h6>Mã SKU: {product?.productDetails[0].sku[0].skuCode}</h6>
                        <h6>Loại sản phẩm: {product?.category.name}</h6>
                        <h6>Khối lượng: {product?.productDetails[0].sku[0].weight} kg</h6>
                        <h6>Kích thước: {product?.productDetails[0].sku[0].dimension} cm</h6>
                        <h6>Mô tả: {product?.description}</h6>
                        <h6>Số lượng tồn kho: {product?.productDetails[0].quantity} {product?.units.find((unit) => unit.isBaseUnit)?.name}</h6>
                        <h6>Số lỗi tồn kho: {product?.productDetails[0].damagedQuantity} {product?.units.find((unit) => unit.isBaseUnit)?.name}</h6>
                    </Col>
                </Row>
                <div className="mt-3">
                    <h4>Danh sách vị trí chứa sản phẩm</h4>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã vị trí</th>
                                <th>Số lượng</th>
                                <th>Đơn vị tính</th>
                                <th>Tình trạng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {product?.productDetails[0].sku[0].locations.map((location, index) => (
                                <tr
                                    key={location.id}
                                >
                                    <td>{index + 1}</td>
                                    <td>{location.locationCode}</td>
                                    <td>{location.quantity}</td>
                                    <td>{product?.units.find((unit) => unit.isBaseUnit)?.name}</td>
                                    <td>{location.shelf.typeShelf === "NORMAL" ? "Bình thường" : "Lỗi"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {
                        product?.productDetails[0].sku[0].locations.length === 0 &&
                        <NoData lable="KHÔNG CÓ VỊ TRÍ NÀO CHỨA SẢN PHẨM" />
                    }
                </div>
            </div>
        </OverLay>
    );
}

export default ModelViewInventoryTracking;