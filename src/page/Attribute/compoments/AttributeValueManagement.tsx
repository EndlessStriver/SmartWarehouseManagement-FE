import React from "react";
import { FormEditAttributes } from "./FormEditAttributes";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import AttributeDetailType from "../../../interface/AttributeDetail";
import GetAttributeDetail from "../../../services/Attribute/GetAttributeDetail";
import PaginationType from "../../../interface/Pagination";
import Pagination from "../../../compoments/Pagination/Pagination";
import { NoData } from "../../../compoments/NoData/NoData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBalanceScale,
    faChevronLeft,
    faCubes, faList,
    faPalette,
    faPencilAlt, faRuler,
    faTag,
    faTrash
} from "@fortawesome/free-solid-svg-icons";
import { Badge, Button, Tab, Table } from "react-bootstrap";
import SpinnerLoading from "../../../compoments/Loading/SpinnerLoading";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import DeleteAttributeValue from "../../../services/Attribute/DeleteAttributeValue";
import ModelConfirmDelete from "../../../compoments/ModelConfirm/ModelConfirmDelete";
import GetUnits from "../../../services/Attribute/Unit/GetUnits";
import ModelAddUnit from "./ModelAddUnit";
import Select from 'react-select';
import OptionType from "../../../interface/OptionType";
import GetProductsByName, { Unit } from "../../../services/Product/GetProductsByName";

interface AttributeValueManagementProps {
    handleCancelEditAttribute: () => void;
    attributeId: number;
}

export const AttributeValueManagement: React.FC<AttributeValueManagementProps> = ({ handleCancelEditAttribute, attributeId }) => {

    const dispatch = useDispatchMessage();
    const [attributeValues, setAttributeValues] = React.useState<AttributeDetailType[]>([]);
    const [units, setUnits] = React.useState<Unit[]>([]);
    const [attributeValueId, setAttributeValueId] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = React.useState(false);
    const [showEditAttributeValue, setShowEditAttributeValue] = React.useState(false);
    const [showModelConfirmDelete, setShowModelConfirmDelete] = React.useState(false);
    const [pagination, setPagination] = React.useState<PaginationType>({
        totalPage: 0,
        limit: 0,
        offset: 0,
        totalElementOfPage: 0
    });
    const [reload, setReload] = React.useState<boolean>(false)
    const [productName, setProductName] = React.useState<string>("");
    const [productSelect, setProductSelect] = React.useState<{ label: string, value: string, units: Unit[] } | null>(null);
    const [products, setProducts] = React.useState<{ label: string, value: string, units: Unit[] }[]>([]);

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetProductsByName(productName)
                .then((response) => {
                    if (response) {
                        setProducts(response.map((product) => {
                            return {
                                label: product.name,
                                value: product.id,
                                units: product.units
                            }
                        }));
                    }
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                })
        }, 500);
        return () => clearTimeout(id);
    }, [productName, dispatch]);

    React.useEffect(() => {
        if (attributeId <= 5) {
            setIsLoading(true);
            GetAttributeDetail({ id: attributeId, offset: pagination.offset })
                .then((response) => {
                    if (response) {
                        setAttributeValues(response.data);
                        setPagination({
                            totalPage: response.totalPage,
                            limit: response.limit,
                            offset: response.offset,
                            totalElementOfPage: response.totalElementOfPage
                        });
                    }
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setIsLoading(false);
                })
        }
    }, [attributeId, pagination.offset, dispatch, reload]);

    const handelDeleteAttributeValue = () => {
        if (attributeId <= 5) {
            if (attributeValueId) {
                setIsLoadingDelete(true);
                DeleteAttributeValue(attributeId, attributeValueId)
                    .then(() => {
                        return GetAttributeDetail({ id: attributeId });
                    }).then((response) => {
                        if (response) {
                            updateAttributeValues(response.data);
                            updatePagination({
                                totalPage: response.totalPage,
                                limit: response.limit,
                                offset: response.offset,
                                totalElementOfPage: response.totalElementOfPage
                            });
                            setAttributeValueId("");
                            setShowModelConfirmDelete(false);
                            dispatch({ type: ActionTypeEnum.SUCCESS, message: "Xóa thành công" });
                        }
                    }).catch((error) => {
                        console.error(error);
                        dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                    }).finally(() => {
                        setIsLoadingDelete(false);
                    })
            } else {
                dispatch({ type: ActionTypeEnum.ERROR, message: "Xóa thất bại" });
            }
        }
    }

    const handleCancelEditAttributeValue = () => {
        setAttributeValueId("")
        setShowEditAttributeValue(false);
    }

    const handleEditAttributeValue = (attributeValueId: string) => {
        setAttributeValueId(attributeValueId);
        setShowEditAttributeValue(true);
    }

    const handleAddAttributeValue = () => {
        setShowEditAttributeValue(true);
    }

    const handleDeleteAttributeValue = (attributeValueId: string) => {
        setAttributeValueId(attributeValueId);
        setShowModelConfirmDelete(true);
    }

    const handleCancelModelConfirmDelete = () => {
        setAttributeValueId("");
        setShowModelConfirmDelete(false);
    }

    const handleChangePage = (page: number) => {
        setPagination({
            ...pagination,
            offset: page
        });
    }

    const updatePagination = (response: PaginationType) => {
        setPagination(response);
    }

    const updateAttributeValues = (response: AttributeDetailType[]) => {
        setAttributeValues(response);
    }

    const getAttributeName = (attributeId: number) => {
        switch (attributeId) {
            case 1:
                return (
                    <div className={"d-flex flex-row align-items-center gap-3"}>
                        <FontAwesomeIcon icon={faPalette} />
                        <span className="d-block">Màu Sắc</span>
                    </div>
                )
            case 2:
                return (
                    <div className={"d-flex flex-row align-items-center gap-3"}>
                        <FontAwesomeIcon icon={faCubes} />
                        <span className="d-block">Mẫu Mã</span>
                    </div>
                )
            case 3:
                return (
                    <div className={"d-flex flex-row align-items-center gap-3"}>
                        <FontAwesomeIcon icon={faTag} />
                        <span className="d-block">Thương Hiệu</span>
                    </div>
                )
            case 4:
                return (
                    <div className={"d-flex flex-row align-items-center gap-3"}>
                        <FontAwesomeIcon icon={faRuler} />
                        <span className="d-block">Kích cỡ</span>
                    </div>
                )
            case 5:
                return (
                    <div className={"d-flex flex-row align-items-center gap-3"}>
                        <FontAwesomeIcon icon={faList} />
                        <span className="d-block">Thể Loại</span>
                    </div>
                )
            case 6:
                return (
                    <div className={"d-flex flex-row align-items-center gap-3"}>
                        <FontAwesomeIcon icon={faBalanceScale} />
                        <span className="d-block">Đơn Vị Tính</span>
                    </div>
                )
            default:
                return "";
        }
    }

    const renderAttributeValues = attributeValues.map((attributeValue, index) => {
        return (
            <tr key={attributeValue.id}>
                <td>{index + 1}</td>
                <td>{attributeValue.sizeCode || attributeValue.brandCode || attributeValue.categoryCode || attributeValue.colorCode || attributeValue.materialCode}</td>
                <td>{attributeValue.name}</td>
                <td>{attributeValue.description}</td>
                <td>
                    <div className="d-flex flex-row gap-2">
                        <Button
                            onClick={() => {
                                handleEditAttributeValue(attributeValue.id)
                            }}
                            variant="primary"
                        >
                            <FontAwesomeIcon icon={faPencilAlt} />
                        </Button>
                        <Button
                            onClick={() => handleDeleteAttributeValue(attributeValue.id)}
                            variant="danger"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                </td>
            </tr>
        );
    });

    const renderUnits = units.map((unit, index) => {
        return (
            <tr key={unit.id}>
                <td>{index + 1}</td>
                <td>{unit.name}</td>
                <td>
                    <Badge bg={unit.isBaseUnit ? "primary" : "secondary"}>
                        {unit.isBaseUnit ? "Là đơn vị cơ bản" : "Là đơn vị quy đổi"}
                    </Badge>
                </td>
                <td>

                </td>
                <td>
                    <div className="d-flex flex-row gap-2">
                        <Button
                            onClick={() => handleDeleteAttributeValue(unit.id)}
                            variant="danger"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                </td>
            </tr>
        );
    });

    return (
        <OverLay className="disabled-padding">
            <div className="attribute-detail-management w-100 h-100 p-4 bg-light position-relative">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex flex-row align-items-center gap-2">
                        <button
                            onClick={handleCancelEditAttribute}
                            className="btn fs-3 px-3 text-primary"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h2 className="mb-0 fw-bold">{getAttributeName(attributeId)}</h2>
                    </div>
                    <div className="d-flex flex-row gap-3">
                        <Button onClick={handleAddAttributeValue} variant="info text-light fw-bold">+ Tạo Mới</Button>
                    </div>
                </div>
                {
                    attributeId <= 5 ?
                        (
                            <Table hover striped bordered>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Mã</th>
                                        <th>Tên</th>
                                        <th>Mô Tả</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderAttributeValues}
                                </tbody>
                            </Table>
                        )
                        :
                        (
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <h2>TRA CỨU THUỘC TÍNH SẢN PHẨM</h2>
                                <Select
                                    placeholder="Nhập tên sản phẩm cần tìm..."
                                    isClearable
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            padding: "0.5rem 0px",
                                            width: "800px",
                                            marginBottom: "1rem",
                                        }),
                                    }}
                                    onInputChange={setProductName}
                                    value={productSelect}
                                    onChange={(value) => setProductSelect(value)}
                                    options={products}
                                />
                                {
                                    productSelect &&
                                    <Table hover striped bordered style={{ width: "800px" }}>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Tên Đơn vị</th>
                                                <th>Giá trị</th>
                                                <th>Là Đơn Vị Cơ Bản</th>
                                                <th>Hành Động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                productSelect?.units.map((unit, index) => {
                                                    return (
                                                        <tr key={unit.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{unit.name}</td>
                                                            <td>{unit?.unitConversionsFrom[0]?.conversionFactor || 1}</td>
                                                            <td>
                                                                <Badge bg={unit.isBaseUnit ? "primary" : "secondary"}>
                                                                    {unit.isBaseUnit ? "Là đơn vị cơ bản" : "Là đơn vị quy đổi"}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex flex-row gap-2">
                                                                    <Button
                                                                        disabled={unit.isBaseUnit}
                                                                        variant="danger"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                }
                            </div>
                        )
                }
                {
                    attributeValues.length > 0 &&
                    <Pagination currentPage={pagination?.offset} totalPages={pagination?.totalPage}
                        onPageChange={handleChangePage} />
                }
                {
                    attributeId <= 5 && (attributeValues.length === 0) && !isLoading && <NoData />
                }
                {
                    isLoading && <SpinnerLoading />
                }
                {
                    showEditAttributeValue && attributeId <= 5 &&
                    <FormEditAttributes
                        attributeId={attributeId}
                        attributeDetailId={attributeValueId}
                        hideOverlay={handleCancelEditAttributeValue}
                        updatePagination={updatePagination}
                        updateAttributeValues={updateAttributeValues}
                    />
                }
                {
                    showEditAttributeValue && attributeId === 6 &&
                    <ModelAddUnit
                        onClose={() => setShowEditAttributeValue(false)}
                        reLoad={() => setReload(!reload)}
                    />
                }
            </div>
            {
                showModelConfirmDelete &&
                <ModelConfirmDelete
                    message={"Bạn có chắc chắn muốn xóa giá trị này?"}
                    onConfirm={handelDeleteAttributeValue}
                    onClose={handleCancelModelConfirmDelete}
                    loading={isLoadingDelete} />
            }
        </OverLay>
    );
};