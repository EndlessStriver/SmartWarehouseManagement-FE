import React from "react";
import "./SKUManagement.css";
import { Table } from "react-bootstrap";
import SKU from "../../interface/Entity/SKU";
import GetSKUs from "../../services/SKU/GetSKUs";
import PaginationType from "../../interface/Pagination";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import Pagination from "../../compoments/Pagination/Pagination";
import { NoData } from "../../compoments/NoData/NoData";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";

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
                setSkuData(data.data);
                setPagination({
                    totalPage: data.totalPage,
                    limit: data.limit,
                    offset: data.offset,
                    totalElementOfPage: data.totalElementOfPage
                })
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
                setSkuData(data.data);
                setPagination({
                    totalPage: data.totalPage,
                    limit: data.limit,
                    offset: data.offset,
                    totalElementOfPage: data.totalElementOfPage
                })
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
                <td>{sku.batchCode}</td>
                <td>{sku.weight}</td>
                <td>{sku.dimension}</td>
                <td>{sku.description}</td>
            </tr>
        )
    })

    return (
        <div>
            <div className={"mb-4"}>
                <h1 className="h2 fw-bold">SKU Management</h1>
                <p className="h6">Manage your SKU codes here</p>
            </div>
            <Table hover bordered striped>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>SKU Code</th>
                        <th>Batch Code</th>
                        <th>Weight</th>
                        <th>Dimension</th>
                        <th>Description</th>
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