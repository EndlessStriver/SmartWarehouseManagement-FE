import { faEye, faRotateLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Table } from "react-bootstrap";
import GetProductsByNameAndCodeAndSupplierName, { Product } from "../../services/Product/GetProductByNameAndCodeAndSupplierName";
import React from "react";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import PaginationType from "../../interface/Pagination";
import { NoData } from "../../compoments/NoData/NoData";
import Pagination from "../../compoments/Pagination/Pagination";

const InventoryTracking: React.FC = () => {

    const dispatch = useDispatchMessage();
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [key, setKey] = React.useState<string>("");
    const [pagination, setPagination] = React.useState<PaginationType>({
        limit: 10,
        offset: 1,
        totalElementOfPage: 0,
        totalPage: 0
    });

    React.useEffect(() => {
        const id = setTimeout(() => {
            setLoading(true);
            GetProductsByNameAndCodeAndSupplierName(key, pagination.limit, pagination.offset)
                .then((res) => {
                    if (res) {
                        setProducts(res.data);
                        setPagination({
                            limit: res.limit,
                            offset: res.offset,
                            totalElementOfPage: res.totalElementOfPage,
                            totalPage: res.totalPage
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    dispatch({ message: err.message, type: ActionTypeEnum.ERROR })
                })
                .finally(() => {
                    setLoading(false);
                })
        }, 500);

        return () => clearTimeout(id);
    }, [key, dispatch, pagination.limit, pagination.offset]);

    return (
        <div className={"w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Quản Lý Hàng Tồn Kho</h2>
                    <p className={"h6"}>Bạn có thể tra cứu hàng tồn kho ở đây</p>
                </div>
                <div className="d-flex flex-row">
                    <input
                        type="search"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="form-control"
                        style={{ width: "250px" }}
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                    />
                    <button
                        onClick={() => setKey("")}
                        className="btn btn-primary ms-2"
                    >
                        <FontAwesomeIcon icon={faRotateLeft} />
                    </button>
                </div>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã Sản Phẩm</th>
                        <th>Tên Sản Phẩm</th>
                        <th>Số Lượng Tồn Kho</th>
                        <th>Đơn Vị</th>
                        <th>SKU</th>
                        <th>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={product.id}>
                            <td>{index + 1}</td>
                            <td>{product.productCode}</td>
                            <td>{product.name}</td>
                            <td>{product.productDetails[0].quantity}</td>
                            <td>{product.units.find((unit) => unit.isBaseUnit)?.name}</td>
                            <td>{product.productDetails[0].sku[0].skuCode}</td>
                            <td>
                                <button className="btn btn-primary">
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {
                products.length > 0 &&
                <Pagination
                    currentPage={pagination.offset}
                    onPageChange={(page) => setPagination({ ...pagination, offset: page })}
                    totalPages={pagination.totalPage}
                />
            }
            {
                products.length === 0 &&
                <NoData />

            }
            {
                loading &&
                <SpinnerLoading />
            }
        </div>
    )
}

export default InventoryTracking;