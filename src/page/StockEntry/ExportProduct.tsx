import React from "react";
import { Button, Table } from "react-bootstrap";
import { NoData } from "../../compoments/NoData/NoData";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import FormEditExportProduct from "./compoments/FormEditExportProduct";

const ExportProduct: React.FC = () => {

    const [showFormEditExportProduct, setShowFormEditExportProduct] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [exportProduct, setExportProduct] = React.useState<any[]>([]);

    return (
        <div className={"w-100 h-100"}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Quản Lý Xuất Kho</h2>
                    <p className={"h6"}>Bạn có thể quản lý việc xuất kho ở đây</p>
                </div>
                <div className="d-flex flex-row gap-3">
                    <Button onClick={() => {
                        setShowFormEditExportProduct(true);
                    }} variant="info text-light fw-bold">+ Tạo Mới</Button>
                </div>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã Phiếu Xuất Kho</th>
                        <th>Tạo Bởi</th>
                        <th>Ngày Tạo</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </Table>
            {
                exportProduct.length === 0 &&
                <NoData />
            }
            {
                isLoading && <SpinnerLoading />
            }
            {
                showFormEditExportProduct &&
                <FormEditExportProduct
                    onClose={() => {
                        setShowFormEditExportProduct(false);
                    }}
                />
            }
        </div>
    )
}

export default ExportProduct;