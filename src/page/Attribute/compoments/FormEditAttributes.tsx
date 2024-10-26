import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import React from "react";
import AddAttributeValue from "../../../services/Attribute/AddAttributeValue";
import Attribute from "../../../interface/Attribute";
import GetAttributeDetail from "../../../services/Attribute/GetAttributeDetail";
import PaginationType from "../../../interface/Pagination";
import AttributeDetailType from "../../../interface/AttributeDetail";
import { Button, CloseButton, Col, Form, Row } from "react-bootstrap";
import GetAttributeValueById from "../../../services/Attribute/GetAttributeValueById";
import UpdateAttributeValue from "../../../services/Attribute/UpdateAttributeValue";
import validateVietnamese from "../../../util/Validate/ValidateVietnamese";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";

interface EditAttributeValueProps {
    hideOverlay: () => void;
    attributeDetailId: string;
    attributeId: number;
    updateAttributeValues: (data: AttributeDetailType[]) => void;
    updatePagination: (data: PaginationType) => void;
}

export const FormEditAttributes: React.FC<EditAttributeValueProps> = ({
    hideOverlay,
    attributeDetailId,
    attributeId,
    updateAttributeValues,
    updatePagination
}) => {

    const dispatch = useDispatchMessage();
    const [formData, setFormData] = React.useState<Attribute>({
        name: "",
        description: "",
        sizeCode: ""
    });
    const [loading, setLoading] = React.useState(false);
    const [editAttributeValue, setEditAttributeValue] = React.useState(false);

    React.useEffect(() => {
        if (attributeDetailId) {
            setLoading(true);
            GetAttributeValueById(attributeId, attributeDetailId)
                .then((response) => {
                    if (response)
                        setFormData({
                            name: response.name,
                            description: response.description,
                            sizeCode: response.sizeCode || response.brandCode || response.colorCode || response.materialCode || response.categoryCode
                        });
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setLoading(false);
                });
        }
    }, [attributeDetailId, attributeId, dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = () => {
        setLoading(true);
        if (attributeDetailId) {
            UpdateAttributeValue(attributeId, attributeDetailId, formData)
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
                        dispatch({ type: ActionTypeEnum.SUCCESS, message: "Cập nhật giá trị thuộc tính thành công" });
                        setEditAttributeValue(false);
                    }
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setLoading(false);
                })
        } else {
            AddAttributeValue(attributeId, formData)
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
                        dispatch({ type: ActionTypeEnum.SUCCESS, message: "Thêm giá trị thuộc tính thành công" });
                        setTimeout(() => {
                            hideOverlay();
                        }, 1000)
                    }
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setLoading(false);
                })
        }
    }

    const validate1 = (): boolean => {
        if (!formData.name) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập tên" });
            return false;
        }
        if (!formData.description) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập mô tả" });
            return false;
        }
        if (!formData.sizeCode) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập mã code" });
            return false;
        }
        return true;
    }

    const validate2 = (): boolean => {
        const checkName = validateVietnamese(formData.name);
        const checkDescription = validateVietnamese(formData.description);
        if (checkName !== "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: checkName });
            return false;
        }
        if (checkDescription !== "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: checkDescription });
            return false;
        }
        return true;
    }

    return (
        <OverLay className="disabled-padding bg-light">
            <div className="rounded p-4 shadow" style={{ width: "800px" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0">
                        {`${attributeDetailId ? "Chỉnh Sửa" : "Thêm Mới"}`}
                    </h2>
                    <CloseButton onClick={() => hideOverlay()} />
                </div>

                <div className="border rounded shadow-sm p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-semibold h6">Thông tin</span>
                        {attributeDetailId && (
                            <button
                                className="btn btn-danger btn-sm"
                                disabled={editAttributeValue}
                                onClick={() => setEditAttributeValue(true)}
                            >
                                <FontAwesomeIcon icon={faEdit} className="me-1" /> Chỉnh sửa
                            </button>
                        )}
                    </div>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên</Form.Label>
                                <Form.Control
                                    className="p-3"
                                    type="text"
                                    value={formData.name}
                                    name="name"
                                    onChange={handleChange}
                                    disabled={!editAttributeValue && attributeDetailId !== ""}
                                    placeholder="Nhập tên..."
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Mã Đại Diện</Form.Label>
                                <Form.Control
                                    className="p-3"
                                    type="text"
                                    value={formData.sizeCode}
                                    name="sizeCode"
                                    onChange={handleChange}
                                    disabled={!editAttributeValue && attributeDetailId !== ""}
                                    placeholder="Nhập mã đại diện..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô Tả</Form.Label>
                        <textarea
                            className="form-control p-3"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={!editAttributeValue && attributeDetailId !== ""}
                            placeholder="Nhập mô tả..."
                            rows={3}
                        />
                    </Form.Group>
                    {editAttributeValue && attributeDetailId && (
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEditAttributeValue(false)}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (validate1() && validate2()) {
                                        handleSubmit();
                                    }
                                }}
                                disabled={loading}
                            >
                                Lưu
                            </button>
                        </div>
                    )}

                    {!attributeDetailId && (
                        <Button
                            variant="primary" type="submit" className="w-100 py-3 rounded"
                            style={{ fontWeight: 'bold', letterSpacing: '1px' }}
                            onClick={() => {
                                if (validate1() && validate2()) {
                                    handleSubmit();
                                }
                            }}
                            disabled={loading || (attributeDetailId !== "")}
                        >
                            Tạo
                        </Button>
                    )}
                </div>
            </div>
        </OverLay>
    );
}