import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { EditUserComponent } from "./compoments/EditUserComponent";
import React from "react";
import { NoData } from "../../compoments/NoData/NoData";
import GetAccountsAPI from "../../services/User/GetAccountsAPI";
import Pagination from "../../compoments/Pagination/Pagination";
import PaginationType from "../../interface/Pagination";
import { Button, Table } from "react-bootstrap";
import { Account } from "../../interface/Account";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";
import DeleteAccountAPI from "../../services/User/DeleteAccountAPI";

export const UserManagement: React.FC = () => {

    const dispatch = useDispatchMessage();
    const [users, setUsers] = React.useState<Account[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = React.useState(false);
    const [showOverlayModelUser, setShowOverlayModelUser] = React.useState(false);
    const [showOverlayModelDelete, setShowOverlayModelDelete] = React.useState(false);
    const [userId, setUserId] = React.useState<string>("");
    const [pagination, setPagination] = React.useState<PaginationType>({
        totalPage: 0,
        limit: 0,
        offset: 0,
        totalElementOfPage: 0
    });

    React.useEffect(() => {
        setIsLoading(true);
        GetAccountsAPI()
            .then((response) => {
                if (response) {
                    setUsers(response.data);
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
            });
    }, [dispatch]);

    React.useEffect(() => {
        const id = setTimeout(() => {
            setIsLoading(true);
            GetAccountsAPI({ offset: pagination.offset })
                .then((response) => {
                    if (response) {
                        setUsers(response.data);
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
                });
        }, 500);
        return () => clearTimeout(id);
    }, [pagination.offset, dispatch]);

    const handleDeleteAccount = () => {
        if (userId) {
            setIsLoadingDelete(true);
            DeleteAccountAPI(userId)
                .then(() => {
                    return GetAccountsAPI();
                }).then((response) => {
                    if (response) {
                        setUsers(response.data);
                        updatePagination({
                            totalPage: response.totalPage,
                            limit: response.limit,
                            offset: response.offset,
                            totalElementOfPage: response.totalElementOfPage
                        });
                        dispatch({ type: ActionTypeEnum.SUCCESS, message: "Delete user successfully" });
                        handleHideOverlayModelDelete();
                    }
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setIsLoadingDelete(false);
                })
        } else {
            dispatch({ type: ActionTypeEnum.ERROR, message: "User delete failed" });
        }
    }

    const handleHideOverlayModelUser = () => {
        setShowOverlayModelUser(false);
        setUserId("");
    }

    const handleShowOverlayModelDelete = (userId: string) => {
        setShowOverlayModelDelete(true);
        setUserId(userId);
    }

    const handleHideOverlayModelDelete = () => {
        setShowOverlayModelDelete(false);
        setUserId("");
    }

    const updateUsers = (response: Account[]) => {
        setUsers(response);
    }

    const updatePagination = (response: PaginationType) => {
        setPagination(response);
    }

    const handleChangePage = (page: number) => {
        setPagination({
            ...pagination,
            offset: page
        });
    }

    const listUser = users.map((user, index) => {
        return (
            <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.role.name}</td>
                <td>
                    <div className="d-flex flex-row gap-2">
                        <Button
                            onClick={() => {
                                setUserId(user.id)
                                setShowOverlayModelUser(true);
                            }}
                            variant="primary"
                        >
                            <FontAwesomeIcon icon={faPencilAlt} />
                        </Button>
                        <Button
                            onClick={() => handleShowOverlayModelDelete(user.id)}
                            variant="danger"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                </td>
            </tr>
        )
    }
    );

    return (
        <div className={"w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Quản Lý Người Dùng</h2>
                    <p className={"h6"}>Bạn có thể quản lý các thông tin người dùng ở đây</p>
                </div>
                <div>
                    <Button onClick={() => {
                        setShowOverlayModelUser(true);
                    }} variant="info text-light fw-bold">+ Tạo Mới</Button>
                </div>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên Tài Khoản</th>
                        <th>Họ Và Tên</th>
                        <th>Email</th>
                        <th>Số Điện Thoại</th>
                        <th>Quyền Hạn</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 && listUser}
                </tbody>
            </Table>
            {
                users.length > 0 && <Pagination currentPage={pagination?.offset} totalPages={pagination?.totalPage}
                    onPageChange={handleChangePage} />
            }
            {
                (users.length === 0) && !isLoading && <NoData />
            }
            {
                isLoading && <SpinnerLoading />
            }
            {
                showOverlayModelUser &&
                <EditUserComponent
                    hideOverlay={handleHideOverlayModelUser}
                    userId={userId}
                    updateUsers={updateUsers}
                    updatePagination={updatePagination}
                />
            }
            {
                showOverlayModelDelete &&
                <ModelConfirmDelete
                    message={"Bạn có chắc muốn xóa người dùng này?"}
                    onConfirm={handleDeleteAccount}
                    onClose={handleHideOverlayModelDelete}
                    loading={isLoadingDelete}
                />
            }
        </div>
    )
}
