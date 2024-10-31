import { Button, Col, Container, Form, FormGroup, Row, Table } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
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

interface FormEditExportProductProps {
    onClose: () => void;
    exportOrderId: string;
    reload: () => void;
}

interface ProductExport {
    productId: string;
    productCode: string;
    productName: string;
    unit: { id: string, name: string };
    quantity: number;
    skuId: string;
}

const FormEditExportProduct: React.FC<FormEditExportProductProps> = (props) => {

    const dispatch = useDispatchMessage();
    const profile = GetProfile();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [productName, setProductName] = React.useState<string>("");
    const [ExportProductCode, setExportProductCode] = React.useState<string>("");
    const [moreInfo, setMoreInfo] = React.useState<string>("");
    const [createDate, setCreateDate] = React.useState<string>("");
    const [productWantToExport, setProductWantToExport] = React.useState<Product | null>(null);
    const [listProductExport, setListProductExport] = React.useState<ProductExport[]>([]);
    const [showModelAddProduct, setShowModelAddProduct] = React.useState<boolean>(false);
    const [pagination, setPagination] = React.useState<PaginationType>({ offset: 1, limit: 5, totalElementOfPage: 0, totalPage: 0 });
    const [reload, setReload] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!props.exportOrderId) {
            const vietnamTime = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
            setCreateDate(vietnamTime.toISOString().slice(0, 16));
        }
    }, [props.exportOrderId])

    React.useEffect(() => {
        if (props.exportOrderId) {
            GetOrderExportById(props.exportOrderId)
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
                                skuId: item.skuCode // đang bi lỗi ở đây
                            }
                        }));
                    }
                })
                .catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                })
                .finally(() => {
                    setIsLoading(false);
                })
        }
    }, [props.exportOrderId, dispatch, reload])

    React.useEffect(() => {
        setIsLoading(true);
        GetProductsByNameAndCodeAndSupplierName(productName, pagination.limit, pagination.offset)
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

    const addProductExport = (product: Product, unit: Unit, quantity: number) => {
        const productExport: ProductExport = {
            productId: product.id,
            productCode: product.productCode,
            productName: product.name,
            unit: { id: unit.id, name: unit.name },
            quantity: quantity,
            skuId: product.productDetails[0].sku[0].id
        }
        setListProductExport([...listProductExport, productExport]);
    }

    const checkAddedProduct = (product: Product): boolean => {
        return listProductExport.find((item) => item.productId === product.id) ? true : false;
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

        let date = new Date(createDate);
        let currentDate = new Date();
        if (date.getTime() > currentDate.getTime()) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày tạo không được lớn hơn ngày hiện tại" });
            return false;
        }

        return true;
    }

    const handleSubmit = () => {
        if (validateForm()) {
            CreateOrderExport({
                exportCode: ExportProductCode,
                exportDate: createDate,
                description: moreInfo,
                exportBy: profile?.fullName || "",
                orderExportDetails: listProductExport.map((item) => {
                    return {
                        skuId: item.skuId,
                        quantity: item.quantity,
                        productId: item.productId,
                        unitId: item.unit.id
                    }
                })
            }).then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Tạo phiếu xuất kho thành công" });
                setReload(!reload);
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
                    console.log(item);
                    return {
                        skuId: item.skuId,
                        quantity: item.quantity,
                        productId: item.productId,
                        unitId: item.unit.id
                    }
                })
            }).then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Cập nhật phiếu xuất kho thành công" });
                props.reload();
                setReload(!reload);
            }).catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            })
        }
    }

    const handlePageChange = (page: number) => {
        setPagination({ ...pagination, offset: page });
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
                            Tạo Phiếu Xuất Kho
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
                                value={createDate}
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
                                                <td>{product.units.find((unit) => unit.isBaseUnit)?.name}</td>
                                                <td>{product.category.name}</td>
                                                <td>
                                                    <Button
                                                        disabled={checkAddedProduct(product)}
                                                        onClick={() => {
                                                            setProductWantToExport(product);
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
                        <h5 className="fw-semibold">Danh Sách Sản Phẩm Xuất Kho</h5>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mã Sản Phẩm</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Đơn Vị Tính</th>
                                    <th>Số Lượng</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    listProductExport.map((product, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{product.productCode}</td>
                                                <td>{product.productName}</td>
                                                <td>{product.unit.name}</td>
                                                <td>{product.quantity}</td>
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
                            <NoData />
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
                    addProductExport={addProductExport}
                />
            }
        </OverLay>
    )
}

export default FormEditExportProduct;