import { Button, CloseButton, Col, Container, Form, FormGroup, Row, Table } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faLocationDot, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import { NoData } from "../../../compoments/NoData/NoData";
import GetProductsByNameAndCodeAndSupplierName, { Product, Unit } from "../../../services/Product/GetProductByNameAndCodeAndSupplierName";
import SpinnerLoading from "../../../compoments/Loading/SpinnerLoading";
import GetProfile from "../../../util/GetProfile";
import ModelAddProductExport from "./ModelAddProductExport";
import CreateOrderExport from "../../../services/StockEntry/CreateOrderExport";
import PaginationType from "../../../interface/Pagination";
import Pagination from "../../../compoments/Pagination/Pagination";
import GetOrderExportById from "../../../services/StockEntry/GetOrderExportById";
import UpdateOrderExport from "../../../services/StockEntry/UpdateOrderExport";
import ModelRecomedLocationOrderExport from "./ModelRecomandLocationOrderExport";
import formatDateForInput from "../../../util/FormartDateInput";
import { useNavigate } from "react-router-dom";

interface FormEditExportProductProps {
    onClose: () => void;
    exportOrderId: string;
    reload: () => void;
}

export interface ProductExport {
    productId: string;
    productCode: string;
    productName: string;
    unit: { id: string, name: string };
    quantity: number;
    skuId: string;
    status: string;
    locations: { locationCode: string, quantity: number }[];
    criteria: string,
}

const FormEditExportProduct: React.FC<FormEditExportProductProps> = (props) => {

    const navigate = useNavigate();
    const dispatch = useDispatchMessage();
    const profile = GetProfile();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [productName, setProductName] = React.useState<string>("");
    const [ExportProductCode, setExportProductCode] = React.useState<string>(generateExportCode());
    const [moreInfo, setMoreInfo] = React.useState<string>("");
    const [createDate, setCreateDate] = React.useState<string>("");
    const [productWantToExport, setProductWantToExport] = React.useState<Product | null>(null);
    const [listProductExport, setListProductExport] = React.useState<ProductExport[]>([]);
    const [showModelAddProduct, setShowModelAddProduct] = React.useState<boolean>(false);
    const [pagination, setPagination] = React.useState<PaginationType>({ offset: 1, limit: 5, totalElementOfPage: 0, totalPage: 0 });
    const [reload, setReload] = React.useState<boolean>(false);
    const [showModelRecomendLocation, setShowModelRecomendLocation] = React.useState<boolean>(false);

    const [skuId, setSkuId] = React.useState<string>("");
    const [unitId, setUnitId] = React.useState<string>("");
    const [typeShelf, setTypeShelf] = React.useState<string>("");
    const [quantity, setQuantity] = React.useState<number>(0);
    const [quantityDamged, setQuantityDamged] = React.useState<number>(0);
    const [locations, setLocations] = React.useState<{ locationCode: string, quantity: number }[]>([]);
    const [unit, setUnit] = React.useState<string>("");

    React.useEffect(() => {
        if (!props.exportOrderId) {
            const vietnamTime = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
            setCreateDate(vietnamTime.toISOString().slice(0, 16));
        }
    }, [props.exportOrderId])

    React.useEffect(() => {
        if (props.exportOrderId) {
            GetOrderExportById(props.exportOrderId, navigate)
                .then((response) => {
                    if (response) {
                        setExportProductCode(response.exportCode);
                        setCreateDate(new Date(response.exportDate).toISOString().slice(0, 16));
                        setMoreInfo(response.description);
                        setListProductExport(response.orderExportDetails.map((item) => {
                            return {
                                productId: item.product.id,
                                productCode: item.product.productCode,
                                productName: item.product.name,
                                unit: { id: item.unit.id, name: item.unit.name },
                                quantity: item.quantity,
                                skuId: item.sku.id,
                                status: item.itemStatus ? "NORMAL" : "DAMAGE",
                                locations: item.locationExport.map((location) => {
                                    return {
                                        locationCode: location.locationCode,
                                        quantity: location.exportQuantity
                                    };
                                }),
                                totalQuantity: item.quantity,
                                criteria: item.product.export_criteria
                            };
                        }));
                    }
                })
                .catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [props.exportOrderId, dispatch, reload]);

    React.useEffect(() => {
        setIsLoading(true);
        GetProductsByNameAndCodeAndSupplierName(navigate, productName, pagination.limit, pagination.offset)
            .then((res) => {
                if (res) {
                    setProducts(res.data);
                    setPagination({
                        offset: res.offset,
                        limit: res.limit,
                        totalElementOfPage: res.totalElementOfPage,
                        totalPage: res.totalPage
                    });
                }
            }).catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            }).finally(() => {
                setIsLoading(false);
            })
    }, [productName, dispatch, pagination.limit, pagination.offset])

    function generateExportCode() {
        const now = new Date();
        const timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');
        return `XK${timestamp}`;
    }

    const addProductExport = (product: Product, unit: Unit, quantity: number, productStatus: string, locations: { locationCode: string, quantity: number }[]) => {
        const productExport: ProductExport = {
            productId: product.id,
            productCode: product.productCode,
            productName: product.name,
            unit: { id: unit.id, name: unit.name },
            quantity: quantity,
            skuId: product.productDetails[0].sku[0].id,
            status: productStatus,
            locations: locations,
            criteria: product.export_criteria
        }
        setListProductExport((preVal) => {
            let check = false;
            const newValue = preVal.map((item) => {
                if (item.productId === productExport.productId && item.status === productExport.status) {
                    check = true;
                    return productExport;
                } else {
                    return item;
                }
            })
            if (!check) {
                newValue.push(productExport);
            }
            return newValue;
        });
    }

    const validateForm = (): boolean => {
        if (ExportProductCode === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Mã phiếu xuất kho không được để trống" });
            return false;
        }
        if (createDate === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày tạo không được để trống" });
            return false;
        }
        if (listProductExport.length === 0) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Danh sách sản phẩm xuất kho phải có tối thiểu 1 sản phẩm" });
            return false;
        }
        for (const item of listProductExport) {
            if (item.quantity === 0) {
                dispatch({ type: ActionTypeEnum.ERROR, message: `Số lượng sản phẩm xuất kho của ${item.productName} phải lớn hơn 0` });
                return false;
            }
            if (item.locations.reduce((total, location) => total + location.quantity, 0) < item.quantity) {
                dispatch({ type: ActionTypeEnum.ERROR, message: `Tổng số lượng xuất kho của ${item.productName} phải bằng số lượng cần xuất` });
                return false;
            }
        }
        let date = new Date(createDate);
        let currentDate = new Date();
        if (date.getTime() > currentDate.getTime()) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày tạo không được lớn hơn ngày hiện tại" });
            return false;
        }
        return true;
    }

    const handleSubmit = () => {
        if (validateForm() === true) {
            CreateOrderExport({
                exportCode: ExportProductCode,
                exportDate: createDate,
                description: moreInfo,
                exportBy: profile?.fullName || "",
                orderExportDetails: listProductExport.map((item) => {
                    return {
                        skuId: item.skuId,
                        productId: item.productId,
                        unitId: item.unit.id,
                        itemStatus: item.status === "NORMAL" ? true : false,
                        locationExport: item.locations.map((location) => {
                            return {
                                locationCode: location.locationCode,
                                quantity: location.quantity
                            }
                        }),
                        totalQuantity: item.locations.reduce((total, location) => total + location.quantity, 0)
                    }
                })
            }, navigate).then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Tạo phiếu xuất kho thành công" });
                props.reload();
                props.onClose();
            }).catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            })
        }
    }

    const handleUpdate = () => {
        if (validateForm()) {
            UpdateOrderExport(props.exportOrderId, {
                exportCode: ExportProductCode,
                exportDate: createDate,
                description: moreInfo,
                exportBy: profile?.fullName || "",
                orderExportDetails: listProductExport.map((item) => {
                    return {
                        skuId: item.skuId,
                        productId: item.productId,
                        unitId: item.unit.id,
                        itemStatus: item.status === "NORMAL" ? true : false,
                        locationExport: item.locations.map((location) => {
                            return {
                                locationCode: location.locationCode,
                                quantity: location.quantity
                            }
                        }),
                        totalQuantity: item.locations.reduce((total, location) => total + location.quantity, 0)
                    }
                })
            }, navigate).then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Cập nhật phiếu xuất kho thành công" });
                props.reload();
                props.onClose();
            }).catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            })
        }
    }

    const handlePageChange = (page: number) => {
        setPagination({ ...pagination, offset: page });
    }

    const removeLocation = (skuId: string, locationCode: string) => {
        setListProductExport(listProductExport.map((item) => {
            if (item.skuId === skuId) {
                item.locations = item.locations.filter((location) => location.locationCode !== locationCode);
            }
            return item;
        }))
    }

    const updateLocations = (skuId: string, locations: { locationCode: string, quantity: number }[]) => {
        setListProductExport(listProductExport.map((item) => {
            if (item.skuId === skuId) {
                item.locations = locations;
            }
            return item;
        }))
    }

    return (
        <OverLay className="disabled-padding bg-light p-4">
            <Container fluid className="h-100 w-100 position-relative shadow p-3 rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex flex-row align-items-center gap-2">
                        <button
                            onClick={() => {
                                props.onClose();
                            }}
                            className="btn fs-3 px-3 text-primary"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h2 className="fw-bold mb-0">
                            {props.exportOrderId ? "Cập Nhật Phiếu Xuất Kho" : "Tạo Mới Phiếu Xuất Kho"}
                        </h2>
                    </div>
                    <div>
                        {
                            props.exportOrderId ?
                                <Button
                                    onClick={() => {
                                        handleUpdate();
                                    }}
                                    variant="success"
                                >
                                    Cập Nhật
                                </Button>
                                :
                                <Button
                                    onClick={() => {
                                        handleSubmit();
                                    }}
                                    variant="primary"
                                    className="px-4"
                                >
                                    Tạo
                                </Button>
                        }
                    </div>
                </div>
                <Row className={"p-3"}>
                    <FormGroup className="mb-3">
                        <Form.Label>Mã Phiếu Xuất Kho</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập mã phiếu xuất kho..."
                            className={"form-control py-3"}
                            value={ExportProductCode}
                            onChange={(e) => setExportProductCode(e.target.value)}
                            disabled={true}
                        />
                    </FormGroup>
                    <Col>
                        <FormGroup>
                            <Form.Label>Nhân viên tạo</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên nhân viên..."
                                className={"form-control py-3"}
                                value={profile?.fullName || ""}
                                disabled={true}
                            />
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Form.Label>Ngày tạo</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                className={"form-control py-3"}
                                value={formatDateForInput(createDate)}
                                onChange={(e) => setCreateDate(e.target.value)}
                            />
                        </FormGroup>
                    </Col>
                    <FormGroup className={"mt-3"}>
                        <Form.Label>Thông Tin Thêm</Form.Label>
                        <textarea
                            className={"form-control py-3"}
                            placeholder="Nhập thông tin thêm..."
                            rows={3}
                            value={moreInfo}
                            onChange={(e) => setMoreInfo(e.target.value)}
                        />
                    </FormGroup>
                </Row>
                <Row className="px-3">
                    <Col>
                        <div className="d-flex flex-row justify-content-between align-items-center mb-2">
                            <h5 className="fw-semibold">Danh Sách Sản Phẩm</h5>
                            <div className="d-flex flex-row gap-2">
                                <Form.Control
                                    type="search"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                                <button
                                    onClick={() => setProductName("")}
                                    className="btn btn-primary"
                                >
                                    <FontAwesomeIcon icon={faRotateLeft} />
                                </button>
                            </div>
                        </div>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Lượng Tồn Kho</th>
                                    <th>Số Lượng Lỗi</th>
                                    <th>Đơn Vị Tính</th>
                                    <th>Loại Sản phẩm</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    products.map((product, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{product.name}</td>
                                                <td>{product.productDetails[0].quantity}</td>
                                                <td>{product.productDetails[0].damagedQuantity}</td>
                                                <td>{product.units.find((unit) => unit.isBaseUnit)?.name}</td>
                                                <td>{product.category.name}</td>
                                                <td>
                                                    <Button
                                                        onClick={() => {
                                                            setProductWantToExport(product);
                                                            setQuantity(product.productDetails[0].quantity);
                                                            setQuantityDamged(product.productDetails[0].damagedQuantity);
                                                            setShowModelAddProduct(true);
                                                        }}
                                                        variant="primary"
                                                        className="px-3"
                                                    >
                                                        Thêm
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                        {
                            products.length > 0 &&
                            <Pagination
                                currentPage={pagination.offset}
                                onPageChange={handlePageChange}
                                totalPages={pagination.totalPage}
                            />
                        }
                        {
                            products.length === 0 &&
                            <NoData />
                        }
                        {
                            isLoading &&
                            <SpinnerLoading />
                        }
                    </Col>
                    <Col>
                        <div className="d-flex justify-content-between">
                            <h5 className="fw-semibold">Danh Sách Sản Phẩm Xuất Kho</h5>
                        </div>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Đơn Vị Tính</th>
                                    <th>Số Lượng</th>
                                    <th>Trạng Thái</th>
                                    <th>Vị Trí</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    listProductExport.map((product, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{product.productName}</td>
                                                <td>{product.unit.name}</td>
                                                <td>{product.quantity}</td>
                                                <td>
                                                    {
                                                        product.status === "NORMAL" ?
                                                            "Bình thường" : "Hư hỏng"
                                                    }
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-row justify-content-center align-items-center gap-2">
                                                        {
                                                            product.locations.length > 0 &&
                                                            <div className="d-flex flex-column">
                                                                {
                                                                    product.locations.map((location, index) => {
                                                                        return (
                                                                            <p key={index} className="text-nowrap d-flex align-items-center gap-3">
                                                                                <h6 className="m-0">{location.locationCode} ({location.quantity})</h6>
                                                                                <CloseButton
                                                                                    className="p-0"
                                                                                    onClick={() => {
                                                                                        removeLocation(product.skuId, location.locationCode);
                                                                                    }}
                                                                                />
                                                                            </p>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        }
                                                        {
                                                            product.locations.reduce((total, location) => total + location.quantity, 0) < product.quantity &&
                                                            <Button
                                                                onClick={() => {
                                                                    setSkuId(product.skuId);
                                                                    setUnitId(product.unit.id);
                                                                    setTypeShelf(product.status);
                                                                    setQuantity(product.quantity);
                                                                    setLocations(product.locations);
                                                                    setUnit(product.unit.name);
                                                                    setShowModelRecomendLocation(true);
                                                                }}
                                                                variant="primary"
                                                            >
                                                                <FontAwesomeIcon icon={faLocationDot} />
                                                            </Button>
                                                        }
                                                    </div>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="danger"
                                                        onClick={() => {
                                                            setListProductExport(listProductExport.filter((item) => item.skuId !== product.skuId));
                                                        }}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                        {
                            listProductExport.length === 0 &&
                            <NoData lable="KHÔN CÓ SẢN PHẨM CẦN XUẤT KHO" />
                        }
                    </Col>
                </Row>
            </Container>
            {
                showModelAddProduct &&
                <ModelAddProductExport
                    onClose={() => {
                        setShowModelAddProduct(false);
                    }}
                    product={productWantToExport}
                    quantity={quantity}
                    quantityDamaged={quantityDamged}
                    addProductExport={addProductExport}
                    listProductExport={listProductExport}
                />
            }
            {
                showModelRecomendLocation &&
                <ModelRecomedLocationOrderExport
                    quantity={quantity}
                    skuId={skuId}
                    typeShelf={typeShelf}
                    unitId={unitId}
                    locations={locations}
                    updateLocations={updateLocations}
                    unit={unit}
                    onClose={() => {
                        setShowModelRecomendLocation(false);
                    }}
                />
            }
        </OverLay>
    )
}

export default FormEditExportProduct;