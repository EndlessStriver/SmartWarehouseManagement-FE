import { CloseButton, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import formatDateVietNam from "../../../util/FormartDateVietnam";
import React from "react";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import SpinnerLoading from "../../../compoments/Loading/SpinnerLoading";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import StatisticalStockEntryAllAPI, { ProductCheckResponse } from "../../../services/Statistical/StatisticalStockEntryAllAPI";

interface ViewPDFStockEntryProps {
    onClose: () => void;
    fromDate: string;
    toDate: string;
}

const ViewPDFStockEntry: React.FC<ViewPDFStockEntryProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [productStockEntry, setProductStockEntry] = React.useState<ProductCheckResponse>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const contentRef = React.useRef(null);

    React.useEffect(() => {
        setLoading(true);
        StatisticalStockEntryAllAPI(props.fromDate, props.toDate)
            .then((res) => {
                if (res) {
                    setProductStockEntry(res);
                }
            })
            .catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message })
            })
            .finally(() => {
                setLoading(false);
            })
    }, [props.fromDate, props.toDate, dispatch]);

    const handleExportPDF = () => {
        const input = contentRef.current;
        if (input) {
            html2canvas(input, { scale: 2 })
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(imgData, 'PNG', 0, 5, pdfWidth, pdfHeight);
                    pdf.save('document.pdf');
                })
        }
    }

    return (
        <OverLay>
            <div className="bg-light rounded p-4 position-relative" style={{ width: "1000px" }}>
                <CloseButton onClick={() => props.onClose()} className="position-absolute" style={{ top: "15px", right: "15px" }} />
                <button
                    className="btn btn-danger"
                    onClick={() => handleExportPDF()}
                >
                    <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                    Xuất PDF
                </button>
                <div ref={contentRef} >
                    <h3 className="text-center fw-bold">BẢNG THỐNG KÊ HÀNG HÓA NHẬP KHO</h3>
                    <h6 className="text-center">Từ ngày: {formatDateVietNam(props.fromDate)} - Đến ngày: {formatDateVietNam(props.toDate)}</h6>
                    <Table striped bordered responsive className="mt-4">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã Sản Phẩm</th>
                                <th>Tên Sản Phẩm</th>
                                <th>Số Lượng Nhập</th>
                                <th>Đơn vị</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                productStockEntry?.checkedProducts.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.product.productCode}</td>
                                        <td>{item.product.name}</td>
                                        <td>{item.receiveQuantity}</td>
                                        <td>{item.unit ? item.unit.name : "Không có"}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                    <div className="d-flex flex-row justify-content-between">
                        <h6>Tổng số sản phẩm: <span className="fw-bold">{productStockEntry?.totalProducts}</span></h6>
                        <h6>Tổng số lượng dự kiến: <span className="fw-bold">{productStockEntry?.totalExpectQuantity}</span></h6>
                        <h6>Tổng số lượng nhập: <span className="fw-bold">{productStockEntry?.totalReceiveQuantity}</span></h6>
                    </div>
                </div>
                {
                    loading &&
                    <SpinnerLoading />
                }
            </div>
        </OverLay>
    )
}

export default ViewPDFStockEntry