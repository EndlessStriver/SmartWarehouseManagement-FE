import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPlus, faSave, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button, Col, Container, Form, FormGroup, Row, Table } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import Select from "react-select";
import GetProfile from "../../../util/GetProfile";
import OptionType from "../../../interface/OptionType";
import GetSuppliersByName from "../../../services/Supplier/GetSuppliersByName";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import GetSupplierById from "../../../services/Supplier/GetSupplierById";
import GetProductsBySupplier, { Product } from "../../../services/Product/GetProductsBySupplier";
import { NoData } from "../../../compoments/NoData/NoData";
import SpinnerLoading from "../../../compoments/Loading/SpinnerLoading";
import CreateStockEntry from "../../../services/StockEntry/CreateStockEntry";
import SpinnerLoadingOverLayer from "../../../compoments/Loading/SpinnerLoadingOverLay";
import GetStockEntryById from "../../../services/StockEntry/GetStockEntryById";
import deepEqual from "../../../util/DeepEqual";
import UpdateStockEntryById from "../../../services/StockEntry/UpdateStockEntryById";
import PaginationType from "../../../interface/Pagination";
import ReceiveHeader from "../../../interface/Entity/ReceiveHeader";
import GetStockEntries from "../../../services/StockEntry/GetStockEntries";
import Pagination from '../../../compoments/Pagination/Pagination';
import ViewReceiveCheck from "./ViewReceiveCheck";

interface FormEditStockEntryProps {
    handleClose: () => void;
    stockEntryId: string;
    updateStockEntry: (stockEntries: ReceiveHeader[]) => void;
    updatePagination: (pagination: PaginationType) => void;
}

interface ProductItem {
    id?: string;
    productId: string;
    name: string;
    quantity: number;
    unit: string;
    skuId: string;
}

const FormEditStockEntry: React.FC<FormEditStockEntryProps> = ({ handleClose, stockEntryId, updatePagination, updateStockEntry }) => {

    const profile = GetProfile();
    const dispatch = useDispatchMessage();

    const [supplierName, setSupplierName] = React.useState("");
    const [suppliers, setSuppliers] = React.useState<OptionType[]>([]);
    const [supplierSelected, setSupplierSelected] = React.useState<OptionType | null>(null);
    const [loadingSuppliers, setLoadingSuppliers] = React.useState(false);

    const [createDate, setCreateDate] = React.useState("");
    const [createDateDefault, setCreateDateDefault] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const [descriptionDefault, setDescriptionDefault] = React.useState("");
    const [description, setDescription] = React.useState("");

    const [products, setProducts] = React.useState<Product[]>([]);
    const [productItemsDefault, setProductItemsDefault] = React.useState<ProductItem[]>([]);
    const [productItems, setProductItems] = React.useState<ProductItem[]>([]);
    const [loadingProducts, setLoadingProducts] = React.useState(false);
    const [pagination, setPagination] = React.useState<PaginationType>({
        totalPage: 1,
        limit: 5,
        offset: 0,
        totalElementOfPage: 0
    });
    const [statusStockEntry, setStatusStockEntry] = React.useState<string>("");
    const [loadingSubmit, setLoadingSubmit] = React.useState(false);
    const [showReceiveCheck, setShowReceiveCheck] = React.useState(false);

    const getVietnamTime = (date: Date) => {
        const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
        return vietnamTime.toISOString().slice(0, 16);
    };

    React.useEffect(() => {
        if (stockEntryId === "") {
            const currentDate = new Date();
            setCreateDate(getVietnamTime(currentDate));
        }
    }, [stockEntryId]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateDate(e.target.value);
    };

    React.useEffect(() => {
        if (stockEntryId) {
            GetStockEntryById(stockEntryId)
                .then((res) => {
                    if (res) {
                        setCreateDate(getVietnamTime(new Date(res.receiveDate)));
                        setCreateDateDefault(getVietnamTime(new Date(res.receiveDate)));
                        setStatusStockEntry(res.status);
                        setDescription(res.description);
                        setDescriptionDefault(res.description);
                        setSupplierSelected({
                            value: res.supplier.id,
                            label: res.supplier.name
                        });
                        setProductItems(res.receiveItems.map((item) => ({
                            id: item.id,
                            productId: item.product.id,
                            name: item.product.name,
                            quantity: item.quantity,
                            unit: item.unit.id,
                            skuId: item.sku.id
                        })));
                        setProductItemsDefault(res.receiveItems.map((item) => ({
                            id: item.id,
                            productId: item.product.id,
                            name: item.product.name,
                            quantity: item.quantity,
                            unit: item.unit.id,
                            skuId: item.sku.id
                        })));
                    }
                }).catch((err) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
                })
        }
    }, [stockEntryId, dispatch])

    React.useEffect(() => {
        const id = setTimeout(() => {
            setLoadingSuppliers(true);
            GetSuppliersByName(supplierName)
                .then((res) => {
                    if (res) {
                        setSuppliers(res.map((supplier) => ({
                            value: supplier.id,
                            label: supplier.name,
                        })));
                    }
                }).catch((err) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
                }).finally(() => {
                    setLoadingSuppliers(false);
                })
        }, 500)

        return () => clearTimeout(id);
    }, [supplierName, dispatch])

    React.useEffect(() => {
        if (supplierSelected) {
            setLoadingProducts(true);
            GetProductsBySupplier(supplierSelected.value)
                .then((res) => {
                    if (res) {
                        setProducts(res.data);
                        setPagination({
                            totalPage: res.totalPage,
                            limit: res.limit,
                            offset: res.offset,
                            totalElementOfPage: res.totalElementOfPage
                        });
                    }
                }).catch((err) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
                }).finally(() => {
                    setLoadingProducts(false);
                })
        }
    }, [supplierSelected, dispatch])

    React.useEffect(() => {
        if (supplierSelected) {
            setLoadingProducts(true);
            GetProductsBySupplier(supplierSelected.value, { offset: pagination.offset })
                .then((res) => {
                    if (res) {
                        setProducts(res.data);
                        setPagination({
                            totalPage: res.totalPage,
                            limit: res.limit,
                            offset: res.offset,
                            totalElementOfPage: res.totalElementOfPage
                        });
                    }
                }).catch((err) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
                }).finally(() => {
                    setLoadingProducts(false);
                })
        }
    }, [supplierSelected, dispatch, pagination.offset])

    const handleChangePage = (page: number) => {
        setPagination({
            ...pagination,
            offset: page
        });
    }

    React.useEffect(() => {
        if (supplierSelected) {
            GetSupplierById(supplierSelected.value)
                .then((res) => {
                    if (res) {
                        setAddress(res.address);
                        setPhoneNumber(res.phone);
                        // setProductItems([]);
                    }
                }).catch((err) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
                })
        }
    }, [supplierSelected, dispatch, stockEntryId])

    const handleAddItem = (productId: string) => {
        const product = products.find((product) => product.id === productId);
        if (product) {
            setProductItems((preValue) => {
                const isExist = preValue.find((item) => item.productId === productId);
                if (isExist) {
                    return preValue.map((item) => {
                        if (item.productId === productId) {
                            return {
                                ...item,
                                quantity: item.quantity + 1
                            }
                        }
                        return item;
                    })
                }
                return [...preValue, {
                    productId: productId,
                    name: product.name,
                    quantity: 1,
                    unit: "",
                    skuId: product.productDetails[0].sku[0].id
                }]
            })
        }
    }

    const handleDeleteItem = (productId: string) => {
        setProductItems(productItems.filter((product) => product.productId !== productId));
    }

    const listProductItems = () => {
        return productItems.map((product, index) => (
            <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td style={{ verticalAlign: "middle" }}>
                    <Form.Control
                        type="number"
                        value={product.quantity}
                        min={0}
                        style={{ width: "100px", margin: "0 auto" }}
                        onChange={(e) => {
                            let value = parseFloat(e.target.value);
                            setProductItems(productItems.map((item) => {
                                if (item.productId === product.productId) {
                                    return {
                                        ...item,
                                        quantity: value
                                    };
                                }
                                return item;
                            }));
                        }}
                        disabled={statusStockEntry !== "" && statusStockEntry !== "PENDING"}
                    />
                </td>
                <td style={{ verticalAlign: "middle", textAlign: "center", width: "180px" }}>
                    <select
                        disabled={statusStockEntry !== "" && statusStockEntry !== "PENDING"}
                        className="form-select"
                        value={product.unit}
                        onChange={(e) => {
                            setProductItems(productItems.map((item) => {
                                if (item.productId === product.productId) {
                                    return {
                                        ...item,
                                        unit: e.target.value
                                    };
                                }
                                return item;
                            }));
                        }}
                    >
                        <option value="">Đơn vị tính...</option>
                        {
                            products.find((item) => item.id === product.productId)?.units.map((unit) => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))
                        }
                    </select>
                </td>
                <td style={{ textAlign: "center" }}>
                    <button
                        disabled={statusStockEntry !== "" && statusStockEntry !== "PENDING"}
                        onClick={() => { handleDeleteItem(product.productId) }}
                        className={"btn btn-danger"}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </td>
            </tr>

        ))
    }

    const listProducts = () => {
        return products.map((product, index) => (
            <tr key={product.id} style={{ verticalAlign: "middle" }}>
                <td>{index + 1}</td>
                <td style={{ textAlign: "center" }}>
                    <img src={product.img || "https://via.placeholder.com/50"}
                        style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "5px",
                            marginLeft: "auto",
                            marginRight: "auto"
                        }}
                        alt="product"
                    />
                </td>
                <td>{product.name}</td>
                <td style={{ textAlign: "center" }}>
                    {
                        productItems.find((item) => item.productId === product.id) ? (
                            <span className={"badge bg-success py-2"}>Added</span>
                        ) : (
                            <button
                                disabled={statusStockEntry !== "" && statusStockEntry !== "PENDING"}
                                onClick={() => { handleAddItem(product.id) }}
                                className={"btn btn-primary"}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        )
                    }
                </td>
            </tr>
        ))
    }

    const handleSubmit = () => {

        if (supplierSelected === null) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn nhà cung cấp" });
            return;
        }

        if (productItems.length === 0) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn sản phẩm" });
            return;
        }

        if (productItems.some((item) => item.quantity === 0 || isNaN(item.quantity))) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Số lượng sản phẩm phải lớn hơn 0" });
            return;
        }
        const currentDate = new Date();
        const creationDate = new Date(createDate);
        if (creationDate > currentDate) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày tạo không được vượt quá ngày hiện tại." });
            return;
        }

        if (stockEntryId === "") {
            setLoadingSubmit(true);
            CreateStockEntry({
                receiveDate: createDate,
                receiveBy: profile?.fullName || "",
                description: description,
                supplierId: supplierSelected.value,
                receiveItems: productItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitId: item.unit,
                    skuId: item.skuId
                }))
            }).then(() => {
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Tạo phiếu nhập kho thành công" });
                handleClose();
                return GetStockEntries()
            }).then((res) => {
                if (res) {
                    updateStockEntry(res.data);
                    updatePagination({
                        totalPage: res.totalPage,
                        limit: res.limit,
                        offset: res.offset,
                        totalElementOfPage: res.totalElementOfPage
                    });
                }
            }).catch((err) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            }).finally(() => {
                setLoadingSubmit(false);
            })
        } else {
            setLoadingSubmit(true);
            UpdateStockEntryById(stockEntryId, {
                description: description,
                receiveItems: productItems.map((item) => ({
                    id: item.id || "",
                    quantity: parseInt(item.quantity.toFixed(0)),
                    unitId: item.unit,
                }))
            }).then((res) => {
                if (res) {
                    setDescription(res.description);
                    setDescriptionDefault(res.description);
                    setSupplierSelected({
                        value: res.supplier.id,
                        label: res.supplier.name
                    });
                    setProductItems(res.receiveItems.map((item) => ({
                        id: item.id,
                        productId: item.product.id,
                        name: item.product.name,
                        quantity: item.quantity,
                        unit: item.product.units[0].id,
                        skuId: item.sku.id
                    })));
                    setProductItemsDefault(res.receiveItems.map((item) => ({
                        id: item.id,
                        productId: item.product.id,
                        name: item.product.name,
                        quantity: item.quantity,
                        unit: item.product.units[0].id,
                        skuId: item.sku.id
                    })));
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Cập nhật phiếu nhập kho thành công" });
                    handleClose();
                    return GetStockEntries()
                }
            }).then((res) => {
                if (res) {
                    updateStockEntry(res.data);
                    updatePagination({
                        totalPage: res.totalPage,
                        limit: res.limit,
                        offset: res.offset,
                        totalElementOfPage: res.totalElementOfPage
                    });
                }
            }).catch((err) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            }).finally(() => {
                setLoadingSubmit(false);
            })
        }

    }

    const handleCheckChangeData = (): boolean => {
        if (descriptionDefault !== description) {
            return true;
        }
        if (productItemsDefault.length !== productItems.length) {
            return true;
        }
        if (createDateDefault !== createDate) {
            return true;
        }
        for (let i = 0; i < productItemsDefault.length; i++) {
            if (!deepEqual(productItemsDefault[i], productItems[i])) {
                return true;
            }
        }
        return false;
    }

    return (
        <OverLay className="disabled-padding bg-light p-4">
            <Container fluid className="h-100 w-100 position-relative shadow p-3 rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex flex-row align-items-center gap-2">
                        <button
                            onClick={() => {
                                handleClose()
                            }}
                            className="btn fs-3 px-3 text-primary"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h2 className="fw-bold mb-0">
                            {stockEntryId === "" ? "Tạo Phiếu Nhập Kho" : "Cập Nhật Phiếu Nhập Kho"}
                        </h2>
                    </div>
                    <div>
                        {
                            stockEntryId === "" ? (
                                <Button
                                    onClick={() => {
                                        handleSubmit();
                                    }}
                                    variant="primary"
                                    className="px-4"
                                >
                                    Tạo
                                </Button>
                            ) : (
                                statusStockEntry === "PENDING" && (
                                    <div>
                                        <Button
                                            onClick={() => {
                                                handleSubmit();
                                            }}
                                            variant="primary"
                                            className="px-4"
                                            disabled={!handleCheckChangeData()}
                                        >
                                            <FontAwesomeIcon icon={faSave} className="me-2" /> Lưu
                                        </Button>
                                    </div>
                                )
                            )
                        }
                    </div>
                </div>
                <Row className={"p-3"}>
                    <Col>
                        <FormGroup>
                            <Form.Label>Nhân viên tạo</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên nhân viên"
                                value={profile?.fullName || ""}
                                className={"form-control py-3"}
                                disabled={true}
                            />
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Form.Label>Ngày tạo</Form.Label>
                            <Form.Control
                                disabled={statusStockEntry !== ""}
                                type="datetime-local"
                                value={createDate}
                                className={"form-control py-3"}
                                onChange={handleDateChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row className={"p-3"}>
                    <Col>
                        <FormGroup>
                            <Form.Label>Nhà cung cấp</Form.Label>
                            <Select
                                placeholder="Nhập tên nhà cung cấp..."
                                isClearable
                                styles={{
                                    control: (provided) => ({
                                        ...provided,
                                        padding: "0.5rem 0px",
                                    }),
                                }}
                                onInputChange={setSupplierName}
                                value={supplierSelected}
                                onChange={(value) => setSupplierSelected(value as OptionType)}
                                options={suppliers}
                                required
                                isLoading={loadingSuppliers}
                                isDisabled={stockEntryId !== ""}
                            />
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="phone"
                                placeholder="Nhập số điện thoại..."
                                className={"form-control py-3"}
                                disabled
                                value={phoneNumber}
                            />
                        </FormGroup>
                    </Col>
                    <FormGroup className={"mt-3"}>
                        <Form.Label>Địa chỉ nhà cung cấp</Form.Label>
                        <Form.Control
                            type="phone"
                            placeholder="Nhâp địa chỉ nhà cung cấp..."
                            className={"form-control py-3"}
                            disabled
                            value={address}
                        />
                    </FormGroup>
                    <FormGroup className={"mt-3"}>
                        <Form.Label>Mô tả</Form.Label>
                        <textarea
                            className={"form-control py-3"}
                            placeholder="Nhập mô tả..."
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={statusStockEntry !== "" && statusStockEntry !== "PENDING"}
                        />
                    </FormGroup>
                </Row>
                <div className="d-flex flex-row gap-3 px-3">
                    <div className="w-100">
                        <div className="d-flex flex-row justify-content-between align-items-center mb-2">
                            <h5 className="fw-semibold">Danh Sách Sản Phẩm</h5>
                            <div className="d-flex flex-row gap-1">
                                {
                                    (statusStockEntry === "PENDING" || statusStockEntry === "") && (
                                        <>
                                            <input type="search" placeholder="Tìm kiếm sản phẩm..." className="form-control" style={{ width: "250px" }} />
                                            <button className="btn btn-primary ms-2">
                                                <FontAwesomeIcon icon={faSearch} />
                                            </button>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr style={{ textAlign: "center" }}>
                                    <th>#</th>
                                    <th>Hình ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listProducts()}
                            </tbody>
                        </Table>
                        {
                            products.length === 0 && !loadingProducts && (
                                <NoData />
                            )
                        }
                        {
                            loadingProducts && (
                                <SpinnerLoading />
                            )
                        }
                        {
                            products.length > 0 &&
                            <Pagination
                                currentPage={pagination?.offset}
                                totalPages={pagination?.totalPage}
                                onPageChange={handleChangePage}
                            />
                        }
                    </div>
                    <div className="w-100">
                        <h5 className="fw-semibold">Danh Sách Sản Phẩm Nhập Kho</h5>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr style={{ textAlign: "center" }}>
                                    <th>#</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Đơn vị tính</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listProductItems()}
                            </tbody>
                        </Table>
                        {
                            productItems.length === 0 && !loadingProducts && (
                                <NoData />
                            )
                        }
                    </div>
                </div>
                {
                    loadingSubmit &&
                    <SpinnerLoadingOverLayer />
                }
            </Container>
            {
                showReceiveCheck && (
                    <ViewReceiveCheck
                        onClose={() => {
                            setShowReceiveCheck(false);
                        }}
                        stockEntryId={stockEntryId}
                    />
                )
            }
        </OverLay>
    );
};

export default FormEditStockEntry;