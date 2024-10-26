import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Table } from 'react-bootstrap';
import GetSuppliers from '../../services/Supplier/GetSuppliers';
import Supplier from '../../interface/Entity/Supplier';
import PaginationType from '../../interface/Pagination';
import { NoData } from '../../compoments/NoData/NoData';
import Pagination from '../../compoments/Pagination/Pagination';
import FormEditSupplier from './compoments/FormEditSupplier';
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import DeleteSupplierById from "../../services/Supplier/DeleteSupplierById";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";

export const SupplierManagement: React.FC = () => {

    const dispatch = useDispatchMessage();
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isLoadingDelete, setIsLoadingDelete] = React.useState<boolean>(false);
    const [showDetail, setShowDetail] = React.useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
    const [supplierId, setSupplierId] = React.useState<string>("");
    const [pagination, setPagination] = React.useState<PaginationType>({
        limit: 0,
        offset: 0,
        totalPage: 0,
        totalElementOfPage: 0
    });

    React.useEffect(() => {
        setIsLoading(true);
        GetSuppliers()
            .then((response) => {
                if (response) {
                    setSuppliers(response.data);
                    setPagination({
                        limit: response.limit,
                        offset: response.offset,
                        totalPage: response.totalPage,
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
            GetSuppliers({ offset: pagination.offset })
                .then((response) => {
                    if (response) {
                        setSuppliers(response.data);
                        setPagination({
                            limit: response.limit,
                            offset: response.offset,
                            totalPage: response.totalPage,
                            totalElementOfPage: response.totalElementOfPage
                        });
                    }
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setIsLoading(false);
                });
        }, 1000);
        return () => clearTimeout(id);
    }, [pagination.offset, dispatch]);

    const handelDeleteSupplier = () => {
        if (supplierId) {
            setIsLoadingDelete(true);
            DeleteSupplierById(supplierId)
                .then(() => {
                    return GetSuppliers();
                }).then((response) => {
                    if (response) {
                        updateSuppliers(response.data);
                        updatePagination({
                            totalPage: response.totalPage,
                            limit: response.limit,
                            offset: response.offset,
                            totalElementOfPage: response.totalElementOfPage
                        });
                        setShowConfirmDelete(false);
                        setSupplierId("");
                        dispatch({ type: ActionTypeEnum.SUCCESS, message: "Xóa nhà cung cấp thành công" });
                    }
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setIsLoadingDelete(false);
                })
        } else {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Xóa nhà cung cấp thất bại" });
        }
    }

    const handleDelete = (id: string) => {
        setSupplierId(id);
        setShowConfirmDelete(true);
    };

    const handleChangePage = (page: number) => {
        setPagination({
            ...pagination,
            offset: page
        });
    }

    const updateSuppliers = (suppliers: Supplier[]) => {
        setSuppliers(suppliers);
    }

    const updatePagination = (pagination: PaginationType) => {
        setPagination(pagination);
    }

    const supplierList = suppliers.map((supplier, index) => {
        return (
            <tr key={supplier.id}>
                <td>{index + 1}</td>
                <td>{supplier.supplierCode}</td>
                <td>{supplier.name}</td>
                <td>{supplier.description}</td>
                <td style={{ width: "200px" }}>{supplier.phone}</td>
                <td>{supplier.address}</td>
                <td>{supplier.email}</td>
                <td>
                    <div className="d-flex flex-row gap-2">
                        <Button
                            onClick={() => {
                                setSupplierId(supplier.id);
                                setShowDetail(true);
                            }}
                            variant="primary"
                        >
                            <FontAwesomeIcon icon={faPencilAlt} />
                        </Button>
                        <Button
                            onClick={() => handleDelete(supplier!.id)}
                            variant="danger"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                </td>
            </tr>
        );
    }
    );

    return (
        <div className={"position-relative w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Quản Lý Nhà Cung Cấp</h2>
                    <p className={"h6"}>Bạn có thể quản lý nhà cung cấp ở đây</p>
                </div>
                <div className="d-flex flex-row gap-5">
                    <Button onClick={() => {
                        setShowDetail(true)
                    }} variant="info fw-bold text-light">+ Tạo Mới</Button>
                </div>
            </div>
            <Table striped hover bordered>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã Nhà Cung Cấp</th>
                        <th>Tên Nhà Cung Cấp</th>
                        <th>Mô Tả</th>
                        <th>Số Điện Thoại</th>
                        <th>Địa Chỉ</th>
                        <th>Email</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {supplierList}
                </tbody>
            </Table>
            {
                suppliers.length > 0 && <Pagination currentPage={pagination?.offset} totalPages={pagination?.totalPage}
                    onPageChange={handleChangePage} />
            }
            {
                (suppliers.length === 0) && !isLoading && <NoData />
            }
            {
                showConfirmDelete &&
                <ModelConfirmDelete
                    message={"Bạn có chắc chắn muốn xóa nhà cung cấp này?"}
                    onConfirm={handelDeleteSupplier}
                    onClose={() => {
                        setShowConfirmDelete(false);
                        setSupplierId("");
                    }}
                    loading={isLoadingDelete}
                />
            }
            {
                showDetail &&
                <FormEditSupplier
                    updatePagination={updatePagination}
                    updateSuppliers={updateSuppliers}
                    supplierId={supplierId}
                    hideOverlay={() => {
                        setShowDetail(false);
                        setSupplierId("");
                    }} />
            }
            {
                isLoading && <SpinnerLoading />
            }
        </div>
    );
};
