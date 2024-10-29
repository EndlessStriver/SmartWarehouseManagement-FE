import React from "react";
import "./SKUManagement.css";
import { Table } from "react-bootstrap";
import GetSKUs from "../../services/SKU/GetSKUs";
import PaginationType from "../../interface/Pagination";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import Pagination from "../../compoments/Pagination/Pagination";
import { NoData } from "../../compoments/NoData/NoData";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import { SKU } from "../../interface/Entity/Product";

export const SKUManagement: React.FC = () => {

    const dispatch = useDispatchMessage()
    const [skuData, setSkuData] = React.useState<SKU[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [pagination, setPagination] = React.useState<PaginationType>({
        totalPage: 0,
        limit: 0,
        offset: 0,
        totalElementOfPage: 0
    })

    React.useEffect(() => {
        setIsLoading(true);
        GetSKUs()
            .then((data) => {
                if (data) {
                    setSkuData(data.data);
                    setPagination({
                        totalPage: data.totalPage,
                        limit: data.limit,
                        offset: data.offset,
                        totalElementOfPage: data.totalElementOfPage
                    })
                }
            }).catch((error) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            }).finally(() => {
                setIsLoading(false);
            });
    }, [dispatch]);

    React.useEffect(() => {
        setIsLoading(true);
        GetSKUs({ offset: pagination.offset })
            .then((data) => {
                if (data) {
                    setSkuData(data.data);
                    setPagination({
                        totalPage: data.totalPage,
                        limit: data.limit,
                        offset: data.offset,
                        totalElementOfPage: data.totalElementOfPage
                    })
                }
            }).catch((error) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            }).finally(() => {
                setIsLoading(false);
            });
    }, [pagination.offset, dispatch]);

    const handleChangePage = (page: number) => {
        setPagination({ ...pagination, offset: page });
    }

    const listSku = skuData.map((sku, index) => {
        return (
            <tr key={sku.skuCode}>
                <td>{index + 1}</td>
                <td>{sku.skuCode}</td>
                <td>{Number(sku.weight).toLocaleString()} (g)</td>
                <td>{sku.dimension} (cm)</td>
                <td style={{ maxWidth: "400px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {sku.description}
                </td>
            </tr>
        )
    })

    return (
        <div>
            <div className={"mb-4"}>
                <h1 className="h2 fw-bold">Quản Lý Mã SKU</h1>
                <p className="h6">Bạn có thể quản lý mã SKU ở đây</p>
            </div>
            <Table hover bordered striped>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã SKU</th>
                        <th>Khối Lượng</th>
                        <th>Kích Thước</th>
                        <th>Mô Tả</th>
                    </tr>
                </thead>
                <tbody>
                    {listSku}
                </tbody>
            </Table>
            {
                skuData.length > 0 &&
                <Pagination
                    currentPage={pagination?.offset}
                    totalPages={pagination?.totalPage}
                    onPageChange={handleChangePage}
                />
            }
            {
                (skuData.length === 0) && !isLoading && <NoData />
            }
            {
                isLoading && <SpinnerLoading />
            }
        </div>

    );
}