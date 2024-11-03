import React, { ChangeEvent } from "react";
import { Button, Col, Container, Form, Image, InputGroup, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import ChangePasswordForm from "./ChangePasswordForm";
import { Account } from "../../../interface/Account";
import PaginationType from "../../../interface/Pagination";
import { Role } from "../../../interface/Role";
import { DataTypeFormUser } from "../../../interface/PageUser/DataTypeFormUser";
import Gender from "../../../enum/Gender";
import GetRolesAPI from "../../../services/Authen/GetRolesAPI";
import GetAccountById from "../../../services/User/GetAccountById";
import validateFullName from "../../../util/Validate/ValidateFullName";
import validateEmail from "../../../util/Validate/ValidateEmail";
import validatePhone from "../../../util/Validate/ValidatePhone";
import ValidatePassword from "../../../util/Validate/ValidatePassword";
import ValidateUsername from "../../../util/Validate/ValidateUsername";
import DataTypeUpdateUserAdmin from "../../../interface/PageUser/DataTypeUpdateUserAdmin";
import DataTypeCreateUserAdmin from "../../../interface/PageUser/DataTypeCreateUserAdmin";
import UpdateAccountAPI from "../../../services/User/UpdateAccountAPI";
import GetAccountsAPI from "../../../services/User/GetAccountsAPI";
import RegisterAPI from "../../../services/Authen/RegisterAPI";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import SpinnerLoadingOverLayer from "../../../compoments/Loading/SpinnerLoadingOverLay";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import GetLogsUser, { Action } from "../../../services/User/UserLogs";
import { NoData } from "../../../compoments/NoData/NoData";
import Pagination from "../../../compoments/Pagination/Pagination";

interface EditUserComponentProps {
    hideOverlay: () => void;
    userId: string;
    updateUsers: (response: Account[]) => void;
    updatePagination: (response: PaginationType) => void;
}

export const EditUserComponent: React.FC<EditUserComponentProps> = ({
    hideOverlay,
    userId,
    updateUsers,
    updatePagination
}) => {
    const dispatch = useDispatchMessage();
    const file = React.useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = React.useState<boolean>(false);
    const [editUser, setEditUser] = React.useState<boolean>(false);
    const [changePassword, setChangePassword] = React.useState<boolean>(false);
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [fileAvatar, setFileAvatar] = React.useState<File | null>(null);
    const [dataDefault, setDataDefault] = React.useState<DataTypeFormUser>({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        email: "",
        phoneNumber: "",
        position: "",
        address: "",
        username: "",
        roleName: "",
        avatar: "",
    });
    const [formData, setFormData] = React.useState<DataTypeFormUser>({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        email: "",
        phoneNumber: "",
        position: "",
        address: "",
        roleName: "",
        username: "",
        confirmPassword: "",
        password: "",
        avatar: "",
    });
    const gender: Gender[] = [Gender.Male, Gender.Female, Gender.Others];
    const [logs, setLogs] = React.useState<Action[]>([]);
    const [pagination, setPagination] = React.useState<PaginationType>({
        totalPage: 0,
        limit: 10,
        offset: 1,
        totalElementOfPage: 0
    });

    React.useEffect(() => {
        setIsLoading(true);
        GetRolesAPI()
            .then((response) => {
                if (response) setRoles(response);
            }).catch((err) => {
                console.error(err.message);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            }).finally(() => {
                setIsLoading(false);
            })
    }, [dispatch])

    React.useEffect(() => {
        if (userId) {
            GetLogsUser(userId, pagination.limit, pagination.offset)
                .then((response) => {
                    if (response) {
                        setLogs(response.data);
                        setPagination({
                            totalPage: response.totalPage,
                            limit: Number(response.limit),
                            offset: Number(response.offset),
                            totalElementOfPage: response.totalElementOfPage
                        });
                    }
                }).catch((err) => {
                    console.error(err.message);
                    dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
                })
        }
    }, [userId, dispatch, pagination.limit, pagination.offset])

    React.useEffect(() => {
        if (userId) {
            GetAccountById(userId)
                .then((response) => {
                    if (response) {
                        setFormData({
                            ...response,
                            roleName: response.role.name,
                        });
                        setDataDefault({
                            ...response,
                            roleName: response.role.name,
                        });
                    }
                }).catch((err) => {
                    console.error(err.message);
                    dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
                })
        }
    }, [userId, dispatch])

    const handleChangeInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(preVal => ({
            ...preVal,
            [name]: value
        }));
    };

    const handleChagleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(preVal => ({
                    ...preVal,
                    [e.target.name]: reader.result as string
                }))
            }
            reader.readAsDataURL(file);
        }
    }

    const validate1 = (): boolean => {
        if (!formData.fullName) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập họ và tên" });
            return false;
        }
        if (!formData.dateOfBirth) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập ngày sinh" });
            return false;
        }
        if (!formData.gender) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn giới tính" });
            return false;
        }
        if (!formData.roleName) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn quyền hạn" });
            return false;
        }
        if (!formData.email) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập email" });
            return false;
        }
        if (!formData.phoneNumber) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập số điện thoại" });
            return false;
        }
        if (!formData.position) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập chức vự" });
            return false;
        }
        if (!formData.address) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập địa chỉ" });
            return false;
        }
        if (!formData.username && !userId) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập tên tài khoản" });
            return false;
        }
        if (!formData.roleName) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng chọn quyền hạn" });
            return false;
        }
        if (!formData.password && !userId) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập mật khẩu" });
            return false;
        }
        if (!formData.confirmPassword && !userId) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng xác nhận mật khẩu" });
            return false;
        }
        if (formData.password !== formData.confirmPassword && !userId) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Mật khẩu xác nhận không chính xác" });
            return false;
        }
        return true;
    }

    const validate2 = (): boolean => {
        const checkFullName = validateFullName(formData.fullName || "");
        const checkEmail = validateEmail(formData.email || "");
        const checkPhone = validatePhone(formData.phoneNumber || "");
        const checkPassword = ValidatePassword(formData.password || "");
        const checkUsername = ValidateUsername(formData.username || "");
        if (checkFullName) {
            dispatch({ type: ActionTypeEnum.ERROR, message: checkFullName });
            return false;
        }
        if (checkEmail) {
            dispatch({ type: ActionTypeEnum.ERROR, message: checkEmail });
            return false;
        }
        if (checkPhone) {
            dispatch({ type: ActionTypeEnum.ERROR, message: checkPhone });
            return false;
        }
        if (checkPassword && !userId) {
            dispatch({ type: ActionTypeEnum.ERROR, message: checkPassword });
            return false;
        }
        if (checkUsername && !userId) {
            dispatch({ type: ActionTypeEnum.ERROR, message: checkUsername });
            return false;
        }
        if (formData.dateOfBirth) {
            const currentDate = new Date();
            const dateOfBirth = new Date(formData.dateOfBirth);
            if (dateOfBirth > currentDate) {
                dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày sinh không được vượt quá ngày hiện tại." });
                return false;
            }
        }
        return true;
    }

    const checkChangeFormData = (): boolean => {
        let check = true;
        if (formData.fullName !== dataDefault.fullName) check = false
        if (formData.dateOfBirth !== dataDefault.dateOfBirth) check = false
        if (formData.gender !== dataDefault.gender) check = false
        if (formData.email !== dataDefault.email) check = false
        if (formData.phoneNumber !== dataDefault.phoneNumber) check = false
        if (formData.position !== dataDefault.position) check = false
        if (formData.address !== dataDefault.address) check = false
        if (formData.roleName !== dataDefault.roleName) check = false
        if (formData.avatar !== dataDefault.avatar) check = false
        return check;
    }

    const formartDataUpate = (): DataTypeUpdateUserAdmin => {
        const dataRequest: DataTypeUpdateUserAdmin = {
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            roleName: formData.roleName,
            position: formData.position,
            address: formData.address,
            avatar: fileAvatar,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
        }
        if (formData.fullName === dataDefault.fullName) delete dataRequest.fullName;
        if (formData.dateOfBirth === dataDefault.dateOfBirth) delete dataRequest.dateOfBirth;
        if (formData.gender === dataDefault.gender) delete dataRequest.gender;
        if (formData.email === dataDefault.email) delete dataRequest.email;
        if (formData.phoneNumber === dataDefault.phoneNumber) delete dataRequest.phoneNumber;
        if (formData.position === dataDefault.position) delete dataRequest.position;
        if (formData.address === dataDefault.address) delete dataRequest.address;
        if (formData.roleName === dataDefault.roleName) delete dataRequest.roleName;
        if (formData.avatar === dataDefault.avatar && fileAvatar === null) delete dataRequest.avatar;
        return dataRequest;
    }

    const formartDataRegister = (): DataTypeCreateUserAdmin | null => {
        try {
            if (!formData.email) throw new Error("Vui lòng nhập email");
            if (!formData.password) throw new Error("Vui lòng nhập mật khẩu");
            if (!formData.fullName) throw new Error("Vui lòng nhập họ và tên");
            if (!formData.phoneNumber) throw new Error("Vui lòng nhập số điện thoại");
            if (!formData.roleName) throw new Error("Vui lòng chọn quyền hạn");
            if (!formData.position) throw new Error("Vui lòng nhập chức vụ");
            if (!formData.address) throw new Error("Vui lòng nhập địa chỉ");
            if (!formData.dateOfBirth) throw new Error("Vui lòng nhập ngày sinh");
            if (!formData.gender) throw new Error("Vui lòng chọn giới tính");
            if (!formData.username) throw new Error("Vui lòng nhập tên tài khoản");
            return {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                roleName: formData.roleName,
                position: formData.position,
                address: formData.address,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                username: formData.username,
            }
        } catch (error: any) {
            dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            return null;
        }
    }

    const handleSubmit = () => {
        if (validate1() && validate2()) {
            setIsLoadingSubmit(true);
            if (userId) {
                UpdateAccountAPI(userId, formartDataUpate())
                    .then((response) => {
                        if (response) {
                            setDataDefault({
                                fullName: response.fullName,
                                dateOfBirth: response.dateOfBirth,
                                address: response.address,
                                email: response.email,
                                avatar: response.avatar,
                                gender: response.gender,
                                phoneNumber: response.phoneNumber,
                                position: response.position,
                                roleName: response.role.name,
                                username: response.username,
                            });
                            setFormData({
                                fullName: response.fullName,
                                dateOfBirth: response.dateOfBirth,
                                address: response.address,
                                email: response.email,
                                avatar: response.avatar,
                                confirmPassword: "",
                                password: "",
                                gender: response.gender,
                                phoneNumber: response.phoneNumber,
                                position: response.position,
                                roleName: response.role.name,
                                username: response.username,
                            });
                            return GetAccountsAPI();
                        }
                    }).then((response) => {
                        if (response) {
                            updateUsers(response.data);
                            updatePagination({
                                totalPage: response.totalPage,
                                limit: response.limit,
                                offset: response.offset,
                                totalElementOfPage: response.totalElementOfPage
                            })
                            dispatch({ type: ActionTypeEnum.SUCCESS, message: "Cập nhật người dùng thành công!" });
                            setEditUser(false);
                        }
                    }).catch((err) => {
                        dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
                    }).finally(() => {
                        setIsLoadingSubmit(false);
                    })
                return;
            } else {
                RegisterAPI(formartDataRegister())
                    .then(() => {
                        return GetAccountsAPI();
                    }).then((response) => {
                        if (response) {
                            updateUsers(response.data);
                            updatePagination({
                                totalPage: response.totalPage,
                                limit: response.limit,
                                offset: response.offset,
                                totalElementOfPage: response.totalElementOfPage
                            })
                            dispatch({ type: ActionTypeEnum.SUCCESS, message: "Tạo người dùng thành công!" });
                            setTimeout(() => {
                                hideOverlay();
                            }, 1000);
                        }
                    }).catch((err) => {
                        dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
                    }).finally(() => {
                        setIsLoadingSubmit(false);
                    })
            }
        }
    }

    return (
        <OverLay className="disabled-padding bg-light p-4">
            <Container fluid className="w-100 h-100 position-relative shadow p-3 rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex flex-row align-items-center gap-2">
                        <button
                            onClick={() => hideOverlay()}
                            className="btn fs-3 px-3 text-primary"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h2 className="fw-bold mb-0">{userId ? "Chỉnh Sửa Thông Tin Người Dùng" : "Tạo Mới Người Dùng"}</h2>
                    </div>
                    {
                        userId &&
                            editUser ? (
                            <div className="d-flex flex-row gap-2">
                                <button
                                    disabled={checkChangeFormData()}
                                    onClick={() => handleSubmit()}
                                    className="btn btn-primary d-flex align-items-center"
                                >
                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                    Lưu
                                </button>
                                <button
                                    disabled={isLoadingSubmit}
                                    onClick={() => {
                                        setEditUser(false);
                                        setFormData(dataDefault);
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Hủy
                                </button>
                            </div>
                        ) : userId && (
                            <button
                                disabled={isLoadingSubmit || isLoading}
                                onClick={() => setEditUser(true)}
                                className="btn btn-danger fw-bold d-flex align-items-center"
                            >
                                <FontAwesomeIcon icon={faEdit} className="me-2" /> Chỉnh Sửa
                            </button>
                        )
                    }
                </div>
                <Row className="mx-2 rounded">
                    <Col md={6}>
                        <Row className="p-3">
                            {
                                userId && (
                                    <Col className="d-flex align-items-center justify-content-center">
                                        <div className="position-relative">
                                            <Image
                                                src={formData?.avatar || "/images/default-avt.png"}
                                                thumbnail
                                                style={{ width: "250px", height: "auto" }}
                                            />
                                            <Form.Control
                                                type="file"
                                                className="d-none"
                                                name="avatar"
                                                onChange={handleChagleFile}
                                                accept="image/*"
                                                ref={file}
                                            />
                                            <div className="position-absolute bottom-0 end-0">
                                                <button
                                                    className="btn btn-light btn-sm shadow-sm rounded-circle d-flex align-items-center justify-content-center text-primary"
                                                    style={{ width: "35px", height: "35px" }}
                                                    onClick={() => {
                                                        if (file.current) {
                                                            file.current.click();
                                                        }
                                                    }}
                                                    disabled={!editUser}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            </div>
                                        </div>
                                    </Col>
                                )
                            }
                            <Col>
                                <Row>
                                    <h5 className="fw-semibold border-bottom pb-2 mb-3">Thông tin cơ bản</h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Họ và tên</Form.Label>
                                        <Form.Control
                                            className="py-3"
                                            type="text"
                                            value={formData.fullName}
                                            name="fullName"
                                            placeholder="Nhập họ và tên..."
                                            onChange={handleChangeInput}
                                            disabled={userId !== "" && !editUser}
                                        />
                                    </Form.Group>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ngày sinh</Form.Label>
                                            <Form.Control
                                                className="py-3"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                name="dateOfBirth"
                                                disabled={userId !== "" && !editUser}
                                                onChange={handleChangeInput}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Giới tính</Form.Label>
                                            <Form.Select
                                                value={formData.gender}
                                                onChange={handleChangeInput}
                                                name="gender"
                                                disabled={userId !== "" && !editUser}
                                                className="py-3"
                                            >
                                                <option value={""}>Chọn giới tính...</option>
                                                {gender.map((item, index) => (
                                                    <option key={index} value={item}>{item}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <div className="p-3">
                            <h5 className="fw-semibold border-bottom pb-2 mb-3">Thông tin cá nhân</h5>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            className="py-3"
                                            type="email"
                                            value={formData.email}
                                            name="email"
                                            onChange={handleChangeInput}
                                            disabled={userId !== "" && !editUser}
                                            placeholder="Nhập email..."
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Số điện thoại</Form.Label>
                                        <Form.Control
                                            className="py-3"
                                            type="text"
                                            value={formData.phoneNumber}
                                            name="phoneNumber"
                                            onChange={handleChangeInput}
                                            disabled={userId !== "" && !editUser}
                                            placeholder="Nhập số điện thoại..."
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Chức vụ</Form.Label>
                                <Form.Control
                                    className="py-3"
                                    type="text"
                                    value={formData.position}
                                    name="position"
                                    onChange={handleChangeInput}
                                    disabled={userId !== "" && !editUser}
                                    placeholder="Nhập chức vụ..."
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control
                                    className="py-3"
                                    type="text"
                                    value={formData.address}
                                    name="address"
                                    onChange={handleChangeInput}
                                    disabled={userId !== "" && !editUser}
                                    placeholder="Nhập địa chỉ..."
                                />
                            </Form.Group>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="p-3">
                            <h5 className="fw-semibold border-bottom pb-2 mb-3">Thông tin tài khoản</h5>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tên tài khoản</Form.Label>
                                        <Form.Control
                                            className="py-3"
                                            type="text"
                                            value={formData.username}
                                            name="username"
                                            disabled={userId !== ""}
                                            placeholder="Nhập tên tài khoản..."
                                            onChange={handleChangeInput}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Quyền hạn</Form.Label>
                                        <Form.Select
                                            value={formData.roleName}
                                            name="roleName"
                                            onChange={handleChangeInput}
                                            disabled={userId !== "" && !editUser}
                                            className="py-3"
                                        >
                                            <option value={""}>Chọn quyền hạn...</option>
                                            {roles.map((item, index) => (
                                                <option key={index} value={item.name}>{item.name}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            {
                                userId ? (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                className="py-3"
                                                type="password"
                                                value={"********"}
                                                name="password"
                                                disabled
                                            />
                                            <InputGroup.Text>
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    disabled={!editUser}
                                                    onClick={() => setChangePassword(true)}
                                                >
                                                    Đổi mật khẩu
                                                </button>
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                ) : (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mật khẩu</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    className="py-3"
                                                    type="password"
                                                    value={formData.password}
                                                    name="password"
                                                    disabled={userId !== ""}
                                                    placeholder="Nhập mật khẩu..."
                                                    onChange={handleChangeInput}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Xác nhận mật khẩu</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    className="py-3"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    name="confirmPassword"
                                                    disabled={userId !== ""}
                                                    placeholder="Nhập lại mật khẩu..."
                                                    onChange={handleChangeInput}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                        <Button variant="primary" onClick={() => handleSubmit()}
                                            className="form-control py-3 fw-bold">
                                            Create
                                        </Button>
                                    </>
                                )
                            }
                            <h5 className="fw-semibold border-bottom pb-2 mb-3">Nhật kí hoạt động</h5>
                            <div className="border p-3"
                                style={{
                                    width: "100%",
                                    height: "350px",
                                    overflowY: "auto"
                                }}

                            >
                                {
                                    logs.map((item, index) => (
                                        <div key={index} className="mb-3">
                                            <p className="mb-1 fw-bold">{item.actionType}</p>
                                            <p className="mb-1">{item.description}</p>
                                            <p className="mb-1">{item.timestamp}</p>
                                        </div>
                                    ))
                                }
                                {
                                    logs.length === 0 &&
                                    <NoData lable="NGƯỜI DÙNG CHƯA CÓ HOẠT ĐỘNG NÀO" />
                                }
                            </div>
                            {
                                logs.length > 0 &&
                                <Pagination
                                    currentPage={pagination.offset}
                                    totalPages={pagination.totalPage}
                                    onPageChange={(page) => {
                                        setPagination(preVal => ({
                                            ...preVal,
                                            offset: page
                                        }))
                                    }}
                                />
                            }
                        </div>
                    </Col>
                </Row>
                {
                    userId != null &&
                    changePassword &&
                    <ChangePasswordForm userId={userId} hideOver={() => setChangePassword(false)} />
                }
                {(isLoading || isLoadingSubmit) && <SpinnerLoadingOverLayer />}
            </Container>
        </OverLay>
    );
}