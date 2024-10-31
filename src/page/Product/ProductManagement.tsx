import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faRedo, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Table } from 'react-bootstrap';
import PaginationType from '../../interface/Pagination';
import Pagination from '../../compoments/Pagination/Pagination';
import FormEditProduct from './compoments/FormEditProduct';
import { NoData } from "../../compoments/NoData/NoData";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import DeleteProductById from "../../services/Product/DeleteProductById";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import GetProductsByNameAndCodeAndSupplierName, { Product } from '../../services/Product/GetProductByNameAndCodeAndSupplierName';

export const ProductManagement: React.FC = () => {

    const dispatch = useDispatchMessage();
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isLoadingDelete, setIsLoadingDelete] = React.useState<boolean>(false)
    const [showFormEdit, setShowFormEdit] = React.useState<boolean>(false)
    const [showModelConfirmDelete, setShowModelConfirmDelete] = React.useState<boolean>(false)
    const [productId, setProductId] = React.useState<string>("")
    const [products, setProducts] = React.useState<Product[]>([])
    const [pagination, setPagination] = React.useState<PaginationType>({
        limit: 10,
        offset: 1,
        totalPage: 0,
        totalElementOfPage: 0
    })
    const [reload, setReload] = React.useState<boolean>(false)
    const [key, setKey] = React.useState<string>("")

    const handleChangePage = (page: number) => {
        setPagination({ ...pagination, offset: page })
    }

    React.useEffect(() => {
        setIsLoading(true)
        GetProductsByNameAndCodeAndSupplierName(key, pagination.limit, pagination.offset)
            .then((response) => {
                if (response) {
                    setProducts(response.data)
                    setPagination({
                        limit: response.limit,
                        offset: response.offset,
                        totalPage: response.totalPage,
                        totalElementOfPage: response.totalElementOfPage
                    })
                }
            }).catch((error) => {
                console.error(error)
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            }).finally(() => {
                setIsLoading(false)
            })
    }, [dispatch, reload, key, pagination.limit, pagination.offset])

    const handleDeleteAccount = () => {
        if (productId) {
            setIsLoadingDelete(true);
            DeleteProductById(productId)
                .then(() => {
                    setReload(!reload);
                    setShowModelConfirmDelete(false);
                    setProductId("");
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Xóa sản phẩm thành công" });
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setIsLoadingDelete(false);
                })
        } else {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Xóa sản phẩm thất bại" });
        }
    }

    const renderProducts = products.map((product, index) => {
        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{product.productCode}</td>
                <td>{product.name}</td>
                <td>{product.category.name}</td>
                <td>{product.productDetails[0].sku[0].skuCode}</td>
                <td>
                    <div className='d-flex gap-2'>
                        <Button
                            onClick={() => {
                                setProductId(product.id)
                                setShowFormEdit(true)
                            }}
                            variant="primary"
                        >
                            <FontAwesomeIcon icon={faPencilAlt} />
                        </Button>
                        <Button
                            onClick={() => {
                                setProductId(product.id)
                                setShowModelConfirmDelete(true)
                            }}
                            variant="danger"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                </td>
            </tr>
        )
    })

    return (
        <div className={"position-relative h-100 w-100"}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Quản Lý Sản Phẩm</h2>
                    <p className={"h6"}>Bạn có thể quản lý các danh mục sản phẩm ở đây</p>
                </div>
                <div className="d-flex flex-row gap-3">
                    <Button onClick={() => setShowFormEdit(true)} variant="info text-light fw-bold">+ Tạo Mới</Button>
                </div>
            </div>
            <div className='d-flex flex-row gap-2 justify-content-end mb-3'>
                <input
                    type="search"
                    className="form-control"
                    placeholder="Nhập từ khóa tìm kiếm..."
                    onChange={(e) => setKey(e.target.value)}
                    style={{ width: "300px" }}
                    value={key}
                />
                <button
                    className='btn btn-primary'
                    onClick={() => setKey("")}
                >
                    <FontAwesomeIcon icon={faRedo} />
                </button>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã Sản Phẩm</th>
                        <th>Tên Sản Phẩm</th>
                        <th>Tên Loại Sản Phẩm</th>
                        <th>SKU</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {renderProducts}
                </tbody>
            </Table>
            {
                isLoading && <SpinnerLoading />
            }
            {
                (products.length > 0) ?
                    <Pagination
                        currentPage={pagination.offset}
                        totalPages={pagination?.totalPage}
                        onPageChange={handleChangePage}
                    />
                    :
                    (!isLoading && <NoData />) || null
            }
            {
                showFormEdit &&
                <FormEditProduct
                    handleClose={() => {
                        setShowFormEdit(false)
                        setProductId("")
                    }}
                    productId={productId}
                    reload={() => setReload(!reload)}
                />
            }
            {
                showModelConfirmDelete &&
                <ModelConfirmDelete
                    message={"Bạn có chắc muốn xóa sản phẩm này?"}
                    onConfirm={handleDeleteAccount}
                    onClose={() => {
                        setShowModelConfirmDelete(false)
                        setProductId("")
                    }}
                    loading={isLoadingDelete}
                />
            }
        </div>
    )
}
