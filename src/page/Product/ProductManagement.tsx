import React from 'react'
import { Product } from '../../interface/Entity/Product'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Table } from 'react-bootstrap';
import GetProducts from '../../services/Product/GetProducts';
import PaginationType from '../../interface/Pagination';
import Pagination from '../../compoments/Pagination/Pagination';
import FormEditProduct from './compoments/FormEditProduct';
import { NoData } from "../../compoments/NoData/NoData";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import DeleteProductById from "../../services/Product/DeleteProductById";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";

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

    const updateProducts = (response: Product[]) => {
        setProducts(response)
    }

    const updatePagination = (response: PaginationType) => {
        setPagination(response)
    }

    const handleChangePage = (page: number) => {
        setIsLoading(true)
        GetProducts({ offset: page })
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
    }

    React.useEffect(() => {
        setIsLoading(true)
        GetProducts()
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
    }, [dispatch])

    const handleDeleteAccount = () => {
        if (productId) {
            setIsLoadingDelete(true);
            DeleteProductById(productId)
                .then(() => {
                    return GetProducts();
                }).then((response) => {
                    if (response) {
                        updateProducts(response.data);
                        updatePagination({
                            totalPage: response.totalPage,
                            limit: response.limit,
                            offset: response.offset,
                            totalElementOfPage: response.totalElementOfPage
                        });
                        setShowModelConfirmDelete(false);
                        setProductId("");
                        dispatch({ type: ActionTypeEnum.SUCCESS, message: "Delete product successfully" });
                    }
                }).catch((error) => {
                    console.error(error);
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
                }).finally(() => {
                    setIsLoadingDelete(false);
                })
        } else {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Product delete failed" });
        }
    }

    const renderProducts = products.map((product, index) => {
        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{product.productCode}</td>
                <td>{product.name}</td>
                <td>{product.description}</td>
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
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã Sản Phẩm</th>
                        <th>Tên Sản Phẩm</th>
                        <th>Mô Tả</th>
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
                />
            }
            {
                showModelConfirmDelete &&
                <ModelConfirmDelete
                    message={"Are you sure delete this product?"}
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
