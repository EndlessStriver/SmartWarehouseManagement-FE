import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import { Button, CloseButton, Col, Container, Form, Image, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faEdit, faImage, faImages } from "@fortawesome/free-solid-svg-icons";
import Select from 'react-select';
import GetSizesByName from "../../../services/Attribute/Size/GetSizesByName";
import GetColorsByName from "../../../services/Attribute/Color/GetColorsByName";
import GetBrandsByName from "../../../services/Attribute/Brand/GetBrandsByName";
import GetMaterialsByName from "../../../services/Attribute/Material/GetMaterialsByName";
import GetCategoriesByName from "../../../services/Attribute/Category/GetCategoriesByName";
import GetSuppliersByName from "../../../services/Supplier/GetSuppliersByName";
import DataTypeCreateProductAdmin from "../../../interface/PageProduct/DataTypeCreateProductAdmin";
import CreateProduct from "../../../services/Product/CreateProduct";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import GetProductById from "../../../services/Product/GetProductById";
import SpinnerLoadingOverLay from "../../../compoments/Loading/SpinnerLoadingOverLay";
import { Product } from "../../../interface/Entity/Product";
import DeepEqual from "../../../util/DeepEqual";
import DataTypeUpdateProductAdmin from "../../../interface/PageProduct/DataTypeUpdateProductAdmin";
import UpdateProductByProductId from "../../../services/Product/UpdateProductByProductId";
import DeleteImageByProductId from "../../../services/Product/DeleteImageByProductId";
import ModelConfirmDelete from "../../../compoments/ModelConfirm/ModelConfirmDelete";
import '../css/FormEditProduct.css'
import AddImagesProduct from "../../../services/Product/AddImagesProduct";
import OptionType from "../../../interface/OptionType";

interface FormEditProductProps {
    handleClose: () => void;
    productId?: string;
    reload: () => void;
}

interface FormDataType {
    detailId: string;
    name: string;
    description: string;
    weight: string;
    unitName: string;
    productCode: string;
    length: string;
    width: string;
    height: string;
    color: OptionType | null;
    branch: OptionType | null;
    model: OptionType | null;
    size: OptionType | null;
    category: OptionType | null;
    supplier: OptionType | null;
    exportCriteria: string;
}

interface TypeImagePreview {
    key: string,
    url: string
}

interface TypeImageUpload {
    key: string,
    file: File
}

const FormEditProduct: React.FC<FormEditProductProps> = (props) => {

    const dispatch = useDispatchMessage();
    const uploadRef = React.useRef<HTMLInputElement>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [showModelConfirmDeleteImage, setShowModelConfirmDeleteImage] = React.useState<boolean>(false);
    const [isEdit, setIsEdit] = React.useState<boolean>(false);
    const [reload, setReload] = React.useState<boolean>(false);

    const [keyImageDelete, setKeyImageDelete] = React.useState<string>("");

    const [color, setColor] = React.useState<string>("");
    const [branch, setBranch] = React.useState<string>("");
    const [model, setModel] = React.useState<string>("");
    const [size, setSize] = React.useState<string>("");
    const [category, setCategory] = React.useState<string>("");
    const [supplier, setSupplier] = React.useState<string>("");
    const [images, setImages] = React.useState<TypeImageUpload[]>([]);
    const [imagePreviewsDefault, setImagePreviewsDefault] = React.useState<TypeImagePreview[]>([]);
    const [imagePreviews, setImagePreviews] = React.useState<TypeImagePreview[]>([]);

    const [colors, setColors] = React.useState<OptionType[]>([]);
    const [branches, setBranches] = React.useState<OptionType[]>([]);
    const [models, setModels] = React.useState<OptionType[]>([]);
    const [sizes, setSizes] = React.useState<OptionType[]>([]);
    const [categories, setCategories] = React.useState<OptionType[]>([]);
    const [suppliers, setSuppliers] = React.useState<OptionType[]>([]);

    const [dataDefault, setDataDefault] = React.useState<FormDataType>({
        detailId: "",
        name: "",
        description: "",
        weight: "",
        productCode: "",
        unitName: "",
        length: "",
        width: "",
        height: "",
        color: null,
        branch: null,
        model: null,
        size: null,
        category: null,
        supplier: null,
        exportCriteria: ""
    });
    const [formData, setFormData] = React.useState<FormDataType>({
        detailId: "",
        name: "",
        description: "",
        weight: "",
        unitName: "",
        productCode: "",
        length: "",
        width: "",
        height: "",
        color: null,
        branch: null,
        model: null,
        size: null,
        category: null,
        supplier: null,
        exportCriteria: ""
    })

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const FormatDataGet = (data: Product): FormDataType => {
        return {
            detailId: data.productDetails[0].id,
            name: data.name,
            description: data.description,
            weight: data.productDetails[0].sku[0].weight.toString(),
            unitName: data.units?.find(unit => unit.isBaseUnit)?.name || "",
            productCode: data.productCode,
            length: data.productDetails[0].sku[0].dimension.split("x")[0],
            width: data.productDetails[0].sku[0].dimension.split("x")[1],
            height: data.productDetails[0].sku[0].dimension.split("x")[2],
            color: {
                value: data.productDetails[0].sku[0].color.id,
                label: data.productDetails[0].sku[0].color.name
            },
            branch: {
                value: data.productDetails[0].sku[0].brand.id,
                label: data!.productDetails[0].sku[0].brand.name
            },
            model: {
                value: data.productDetails[0].sku[0].material.id,
                label: data.productDetails[0].sku[0].material.name
            },
            size: { value: data.productDetails[0].sku[0].size.id, label: data.productDetails[0].sku[0].size.name },
            category: { value: data.category!.id, label: data.category!.name },
            supplier: { value: data.productDetails[0].sku[0].supplier.id, label: data.productDetails[0].sku[0].supplier.name },
            exportCriteria: data.export_criteria
        }
    }

    const validate1 = (): boolean => {
        if (formData.name === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập tên sản phẩm" });
            return true;
        }
        if (formData.description === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập mô tả" });
            return true;
        }
        if (formData.weight === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập trọng lượng" });
            return true;
        }
        if (formData.unitName === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập đơn vị tính cơ bản" });
            return true;
        }
        if (formData.productCode === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập mã sản phẩm" });
            return true;
        }
        if (formData.length === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập chiều dài" });
            return true;
        }
        if (formData.width === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập chiều rộng" });
            return true;
        }
        if (formData.height === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập chiều cao" });
            return true;
        }
        if (formData.color === null) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn màu sắc" });
            return true;
        }
        if (formData.branch === null) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn thương hiệu" });
            return true;
        }
        if (formData.model === null) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn mẫu mã" });
            return true;
        }
        if (formData.size === null) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn kích cỡ" });
            return true;
        }
        if (formData.category === null) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn loại sản phẩm" });
            return true;
        }
        if (formData.supplier === null) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn nhà cung cấp" });
            return true;
        }
        if (formData.exportCriteria === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn tiêu chí xuất kho" });
            return true;
        }
        return false;
    }

    const CheckDataChange = (): boolean => {
        let isChange = false;
        Object.keys(formData).forEach((key) => {
            if ((typeof formData[key as keyof FormDataType] === "object") && (typeof dataDefault[key as keyof FormDataType] === "object")) {
                if (!DeepEqual(formData[key as keyof FormDataType], dataDefault[key as keyof FormDataType])) isChange = true;
            } else {
                if (formData[key as keyof FormDataType] !== dataDefault[key as keyof FormDataType]) isChange = true;
            }
        });
        return isChange;
    }

    React.useEffect(() => {
        if (props.productId) {
            console.log(props.productId)
            GetProductById(props.productId)
                .then((data) => {
                    if (data) {
                        setFormData(FormatDataGet(data));
                        setDataDefault(FormatDataGet(data));
                        setImagePreviews(data.productDetails[0].images.map((image) => {
                            return {
                                key: crypto.randomUUID().toString(),
                                url: image.url
                            }
                        }) || []);
                        setImagePreviewsDefault(data.productDetails[0].images.map((image) => {
                            return {
                                key: crypto.randomUUID().toString(),
                                url: image.url
                            }
                        }) || []);
                    }
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setLoading(false);
                })
        }
    }, [props.productId, dispatch, reload])

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetColorsByName(color)
                .then((data) => {
                    if (data) setColors(data.map((size) => ({ value: size.id, label: size.name })));
                })
                .catch((error) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                });
        }, 500);
        return () => clearTimeout(id);
    }, [color, dispatch]);

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetBrandsByName(branch)
                .then((data) => {
                    if (data) setBranches(data.map((size) => ({ value: size.id, label: size.name })));
                })
                .catch((error) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                });
        }, 500);
        return () => clearTimeout(id);
    }, [branch, dispatch]);

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetMaterialsByName(model)
                .then((data) => {
                    if (data) setModels(data.map((size) => ({ value: size.id, label: size.name })));
                })
                .catch((error) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                });
        }, 500);
        return () => clearTimeout(id);
    }, [model, dispatch]);

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetSizesByName(size)
                .then((data) => {
                    setSizes(data.map((size) => ({ value: size.id, label: size.name })));
                })
                .catch((error) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                });
        }, 500);
        return () => clearTimeout(id);
    }, [size, dispatch]);

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetCategoriesByName(category)
                .then((data) => {
                    if (data) setCategories(data.map((size) => ({ value: size.id, label: size.name })));
                })
                .catch((error) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                });
        }, 500);
        return () => clearTimeout(id);
    }, [category, dispatch]);

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetSuppliersByName(supplier)
                .then((data) => {
                    if (data) setSuppliers(data.map((size) => ({ value: size.id, label: size.name })));
                })
                .catch((error) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                });
        }, 500);
        return () => clearTimeout(id);
    }, [supplier, dispatch]);

    const getListImage = (): File[] => {
        return images.map((image) => image.file);
    }

    const formatDataCreate = (): DataTypeCreateProductAdmin => {
        return {
            name: formData.name,
            categoryId: formData.category!.value,
            description: formData.description,
            unitName: formData.unitName,
            productCode: formData.productCode,
            supplierId: formData.supplier!.value,
            colorId: formData.color!.value,
            sizeId: formData.size!.value,
            materialId: formData.model!.value,
            brandId: formData.branch!.value,
            dimension: `${formData.length}x${formData.width}x${formData.height}`,
            weight: Number(formData.weight),
            image: getListImage(),
            exportCriteria: formData.exportCriteria
        }
    }

    const formatDataUpdate = (): DataTypeUpdateProductAdmin => {

        const dataUpdate: DataTypeUpdateProductAdmin = {
            detailId: formData.detailId,
            name: formData.name,
            categoryId: formData.category!.value,
            description: formData.description,
            productCode: formData.productCode,
            supplierId: formData.supplier!.value,
            colorId: formData.color!.value,
            brandId: formData.branch!.value,
            dimension: `${formData.length}x${formData.width}x${formData.height}`,
            weight: Number(formData.weight),
            unitName: formData.unitName,
            sizeId: formData.size!.value,
            materialId: formData.model!.value,
            exportCriteria: formData.exportCriteria
        }
        return dataUpdate;
    }

    const handleSubmit = () => {
        if (validate1()) return;
        setLoading(true);
        if (!props.productId) {
            CreateProduct(formatDataCreate())
                .then(() => {
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Tạo sản phẩm thành công" });
                    setTimeout(() => {
                        props.handleClose();
                        props.reload();
                    }, 1000);
                })
                .catch((error) => {
                    console.log(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                })
                .finally(() => {
                    setLoading(false);
                })
        } else {
            const dataUpdate = formatDataUpdate();
            if (Object.keys(dataUpdate).length === 0) {
                dispatch({ type: ActionTypeEnum.ERROR, message: "Không có dữ liệu thay đổi" });
                setLoading(false);
            } else {
                UpdateProductByProductId(props.productId, dataUpdate)
                    .then((response) => {
                        if (response) {
                            setFormData(FormatDataGet(response));
                            setDataDefault(FormatDataGet(response));
                            dispatch({ type: ActionTypeEnum.SUCCESS, message: "Cập nhật sản phẩm thành công" });
                            props.reload();
                            setIsEdit(false);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                    })
                    .finally(() => {
                        setLoading(false);
                    })
            }
        }
    }

    const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: FileList | null = e.target.files;
        const maxFileSize = 10 * 1024 * 1024;
        if (files !== null) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].size > maxFileSize) {
                    dispatch({ type: ActionTypeEnum.ERROR, message: "File của bạn lớn hơn 10Mb" });
                    break;
                } else {
                    const keyRandom = crypto.randomUUID().toString();
                    imagePreviews.push({
                        key: keyRandom,
                        url: URL.createObjectURL(files[i])
                    });
                    setImages((preState) => {
                        return [...preState, { key: keyRandom, file: files[i] }];
                    });
                }
            }
        }
    }

    const handleRemoveImage = (key: string) => {
        if (props.productId) {
            const image = imagePreviews.find((image) => image.key === key);
            if (image) {
                setLoading(true);
                DeleteImageByProductId(props.productId, image.url)
                    .then(() => {
                        const newPreviews = imagePreviews.filter((image) => image.key !== key);
                        setImagePreviews(newPreviews);
                        setImagePreviewsDefault(newPreviews);
                    })
                    .catch((error) => {
                        dispatch({ type: ActionTypeEnum.ERROR, message: error.message });

                    }).finally(() => {
                        setLoading(false);
                    })
            } else {
                dispatch({ type: ActionTypeEnum.ERROR, message: "Không tìm thấy ảnh" });
            }
        } else {
            const newImages = images.filter((image) => image.key !== key);
            const newPreviews = imagePreviews.filter((image) => image.key !== key);
            setImages(newImages);
            setImagePreviews(newPreviews);
        }
    }

    const handleConfirmDeleteImage = () => {
        handleRemoveImage(keyImageDelete);
        setShowModelConfirmDeleteImage(false);
        setKeyImageDelete("");
    }

    const checkImageNew = (key: string): boolean => {
        let isNewImage = false;
        images.forEach((img) => {
            if (img.key === key) {
                isNewImage = true;
            }
        })
        return isNewImage;
    }

    const handleCheckImageChangeData = (): boolean => {
        return !DeepEqual(imagePreviews, imagePreviewsDefault);
    }

    const handleAddNewImage = () => {
        if (images.length > 0) {
            setLoading(true);
            AddImagesProduct(props.productId!, getListImage())
                .then(() => {
                    setReload(!reload);
                    setImages([]);
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Thêm ảnh thành công" });
                })
                .catch((error) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Không có ảnh để thêm" });
        }
    };

    return (
        <OverLay className="disabled-padding bg-light p-4">
            <Container fluid className="h-100 w-100 position-relative shadow p-3 rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex flex-row align-items-center gap-2">
                        <button
                            onClick={() => props.handleClose()}
                            className="btn fs-3 px-3 text-primary"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h2 className="fw-bold mb-0">{`${props.productId ? "Chỉnh Sửa Sản Phẩm" : "Tạo Mới Sản Phẩm"}`}</h2>
                    </div>
                    {
                        props.productId ?
                            isEdit ?
                                <div className={"d-flex gap-2"}>
                                    <Button
                                        variant="primary"
                                        className="fw-semibold"
                                        onClick={() => {
                                            handleSubmit()
                                        }}
                                        disabled={!CheckDataChange()}
                                    >Lưu</Button>
                                    <Button
                                        variant="secondary"
                                        className="fw-semibold"
                                        onClick={() => {
                                            setIsEdit(false);
                                            setFormData(dataDefault);
                                            setImagePreviews(imagePreviewsDefault.map((image) => {
                                                return image;
                                            }));
                                            setImages([]);
                                        }}
                                    >Hủy</Button>
                                </div>
                                :
                                <Button
                                    variant="danger"
                                    className="fw-semibold"
                                    onClick={() => setIsEdit(true)}
                                >
                                    <FontAwesomeIcon icon={faEdit} className={"me-2"} />
                                    Chỉnh Sửa
                                </Button>
                            :
                            <Button
                                variant="primary"
                                className="fw-semibold"
                                onClick={handleSubmit}
                            >Tạo</Button>
                    }
                </div>
                <Row className="px-4">
                    <Col md={6} className="p-3">
                        <h5 className="fw-semibold border-bottom pb-2 mb-3">Chi Tiết Sản Phẩm</h5>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên Sản Phẩm</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhâp tên sản phẩm..."
                                className="py-3"
                                name="name"
                                onChange={handleChangeInput}
                                required
                                disabled={props.productId !== "" && !isEdit}
                                value={formData.name}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <div className="d-flex flex-column">
                                <Form.Label>Mô Tả</Form.Label>
                                <textarea
                                    className="form-control py-3"
                                    placeholder="Nhập mô tả sản phẩm..."
                                    cols={3}
                                    name="description"
                                    onChange={handleChangeInput}
                                    required
                                    disabled={props.productId !== "" && !isEdit}
                                    value={formData.description}
                                />
                            </div>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mã Sản Phẩm</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập mã sản phẩm..."
                                        className="py-3"
                                        name="productCode"
                                        onChange={handleChangeInput}
                                        required
                                        value={formData.productCode}
                                        disabled={props.productId !== "" && !isEdit}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Trọng Lượng (kg)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nhập trọng lượng..."
                                        className="py-3"
                                        name="weight"
                                        onChange={handleChangeInput}
                                        value={formData.weight}
                                        required
                                        disabled={props.productId !== "" && !isEdit}
                                    />
                                </Form.Group>
                            </Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Đơn vị tính cơ bản</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập tên đơn vị tính cơ bản..."
                                    className="py-3"
                                    name="unitName"
                                    onChange={handleChangeInput}
                                    required
                                    value={formData.unitName}
                                    disabled={props.productId !== "" && !isEdit}
                                />
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Kích Thước (cm)</Form.Label>
                            <div className="d-flex flex-row gap-3 align-items-center">
                                <Form.Control
                                    type="number"
                                    min={0}
                                    placeholder="Nhập chiều dài..."
                                    className="py-3"
                                    name="length"
                                    onChange={handleChangeInput}
                                    value={formData.length}
                                    required
                                    disabled={props.productId !== "" && !isEdit}
                                />
                                <span>X</span>
                                <Form.Control
                                    type="number"
                                    placeholder="Nhập chiều rộng..."
                                    min={0}
                                    className="py-3"
                                    name="width"
                                    onChange={handleChangeInput}
                                    value={formData.width}
                                    required
                                    disabled={props.productId !== "" && !isEdit}
                                />
                                <span>X</span>
                                <Form.Control
                                    type="number"
                                    placeholder="Nhập chiều cao..."
                                    min={0}
                                    className="py-3"
                                    name="height"
                                    onChange={handleChangeInput}
                                    value={formData.height}
                                    required
                                    disabled={props.productId !== "" && !isEdit}
                                />
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Row className="p-3">
                            <h5 className="fw-semibold border-bottom pb-2 mb-3">Thuộc Tính Sản Phẩm</h5>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Màu sắc</Form.Label>
                                    <Select
                                        placeholder="Nhâp màu sản phẩm..."
                                        isClearable
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                padding: "0.5rem 0px",
                                            }),
                                        }}
                                        onInputChange={setColor}
                                        value={formData.color}
                                        onChange={(value) => setFormData({ ...formData, color: value })}
                                        options={colors}
                                        required
                                        isDisabled={props.productId !== "" && !isEdit}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mẫu mã</Form.Label>
                                    <Select
                                        placeholder="Nhập mẫu sản phẩm..."
                                        isClearable
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                padding: "0.5rem 0px",
                                            }),
                                        }}
                                        onInputChange={setModel}
                                        value={formData.model}
                                        onChange={(value) => setFormData({ ...formData, model: value })}
                                        options={models}
                                        required
                                        isDisabled={props.productId !== "" && !isEdit}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Thượng Hiệu</Form.Label>
                                    <Select
                                        placeholder="Nhập tên thương hiệu..."
                                        isClearable
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                padding: "0.5rem 0px",
                                            }),
                                        }}
                                        onInputChange={setBranch}
                                        value={formData.branch}
                                        onChange={(value) => setFormData({ ...formData, branch: value })}
                                        options={branches}
                                        required
                                        isDisabled={props.productId !== "" && !isEdit}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Kích cỡ</Form.Label>
                                    <Select
                                        placeholder="Nhập kích cỡ..."
                                        isClearable
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                padding: "0.5rem 0px",
                                            }),
                                        }}
                                        onInputChange={setSize}
                                        value={formData.size}
                                        onChange={(value) => setFormData({ ...formData, size: value })}
                                        options={sizes}
                                        required
                                        isDisabled={props.productId !== "" && !isEdit}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="p-3">
                            <h5 className="fw-semibold border-bottom pb-2 mb-3">Phân Loại Và Nhà Cung Cấp</h5>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Loại sản phẩm</Form.Label>
                                    <Select
                                        placeholder="Nhập loại sản phẩm..."
                                        isClearable
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                padding: "0.5rem 0px",
                                            }),
                                        }}
                                        onInputChange={setCategory}
                                        value={formData.category}
                                        onChange={(value) => setFormData({ ...formData, category: value })}
                                        options={categories}
                                        required
                                        isDisabled={props.productId !== "" && !isEdit}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
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
                                        onInputChange={setSupplier}
                                        value={formData.supplier}
                                        onChange={(value) => setFormData({ ...formData, supplier: value })}
                                        options={suppliers}
                                        required
                                        isDisabled={props.productId !== "" && !isEdit}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="p-3">
                            <h5 className="fw-semibold border-bottom pb-2 mb-3">Xuất Kho</h5>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tiêu Chí Xuất Kho</Form.Label>
                                    <br />
                                    <select
                                        disabled={props.productId !== "" && !isEdit}
                                        className="form-select py-3"
                                        name="exportCriteria"
                                        onChange={handleChangeInput}
                                        value={formData.exportCriteria}
                                    >
                                        <option value="">Chọn tiêu chí xuất kho...</option>
                                        <option value="FIFO">Vào Trước - Ra Trước</option>
                                        <option value="LIFO">Vào Sau - Ra Trước</option>
                                    </select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="p-3">
                    <div className="border-bottom pb-2 mb-3 d-flex justify-content-between">
                        <h5 className="fw-semibold d-flex align-items-center">
                            <FontAwesomeIcon icon={faImages} className="me-2" />
                            Danh Sách Ảnh
                        </h5>
                        <Button
                            variant="outline-primary"
                            className="fw-semibold"
                            onClick={() => {
                                uploadRef.current?.click()
                            }}
                            disabled={props.productId !== "" && !isEdit}
                        >+ Thêm Ảnh</Button>
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Control
                            ref={uploadRef}
                            type="file"
                            placeholder="Enter name supplier"
                            className="py-3 d-none"
                            multiple
                            onChange={handleChangeFile}
                            disabled={props.productId !== "" && !isEdit}
                            accept={"image/*"}
                        />
                    </Form.Group>
                    <div className="masonry mb-4">
                        {imagePreviews.map((image) => (
                            <div className="position-relative image-box" key={image.key}>
                                <Image
                                    src={image.url}
                                    alt="preview"
                                    thumbnail
                                />
                                <CloseButton
                                    className="position-absolute bg-light"
                                    onClick={() => {
                                        if (!props.productId) {
                                            handleRemoveImage(image.key)
                                        } else {
                                            setKeyImageDelete(image.key);
                                            if (checkImageNew(image.key)) {
                                                const newImages = images.filter((img) => img.key !== image.key);
                                                const newPreviews = imagePreviews.filter((img) => img.key !== image.key);
                                                setImages(newImages);
                                                setImagePreviews(newPreviews);
                                            } else {
                                                setShowModelConfirmDeleteImage(true);
                                            }
                                        }
                                    }}
                                    style={{ top: "0.5rem", right: "0.5rem" }}
                                    disabled={props.productId !== "" && !isEdit}
                                />
                                {
                                    checkImageNew(image.key) &&
                                    <span className="badge text-bg-danger position-absolute top-0 start-0">Ảnh mới</span>
                                }
                            </div>
                        ))}
                    </div>
                    {
                        imagePreviews.length === 0 &&
                        <div
                            className="d-flex flex-column align-items-center justify-content-center gap-2 text-secondary">
                            <FontAwesomeIcon icon={faImage} size="3x" />
                            <span>Không Có Hình Ảnh!</span>
                        </div>
                    }
                    {
                        handleCheckImageChangeData() && images.length > 0 && props.productId &&
                        <div className={"d-flex justify-content-end gap-2"}>
                            <div
                                onClick={handleAddNewImage}
                                className={"btn btn-primary"}
                            >
                                Đăng tải
                            </div>
                            <div
                                onClick={() => {
                                    setImagePreviews(imagePreviewsDefault.map((image) => {
                                        return image;
                                    }));
                                    setImages([]);
                                }}
                                className={"btn btn-secondary"}
                            >
                                Hủy
                            </div>
                        </div>
                    }
                </Row>
            </Container>
            {
                loading && <SpinnerLoadingOverLay />
            }
            {
                showModelConfirmDeleteImage &&
                <ModelConfirmDelete
                    message={"Bạn có chắc chắn muốn xóa ảnh này?"}
                    onConfirm={handleConfirmDeleteImage}
                    onClose={() => {
                        setShowModelConfirmDeleteImage(false)
                        setKeyImageDelete("");
                    }}
                    loading={loading}
                />
            }
        </OverLay>
    )
}

export default FormEditProduct;