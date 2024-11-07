import React from "react";
import formatDateForInputNoTime from "../../util/FormartDateInputNoTime";
import { Table } from "react-bootstrap";
import StatisticalOrderExportAPI, { ExportOrder } from "../../services/Statistical/StatisticalOrderExportAPI";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import PaginationType from "../../interface/Pagination";
import Pagination from "../../compoments/Pagination/Pagination";
import { NoData } from "../../compoments/NoData/NoData";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import formatDateVietNam from "../../util/FormartDateVietnam";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';

interface ConvertDataToDataExcel {
    orderExportCode: string;
    createDate: string;
    exportBy: string;
    productName: string;
    quantity: number;
    unit: string;
    status: string;
}

const StatisticalOrderExport = () => {

    const dispatch = useDispatchMessage();
    const [fromDate, setFromDate] = React.useState<string>(new Date().toISOString().split("T")[0]);
    const [toDate, setToDate] = React.useState<string>(new Date().toISOString().split("T")[0]);
    const [status, setStatus] = React.useState<"PENDING" | "EXPORTED" | "CANCEL">("PENDING");
    const [orderExport, setOrderExport] = React.useState<ExportOrder[]>([]);
    const [pagination, setPagination] = React.useState<PaginationType>({
        limit: 10,
        offset: 1,
        totalElementOfPage: 0,
        totalPage: 0,
    })
    const [loading, setLoading] = React.useState<boolean>(false);
    const [reload, setReload] = React.useState<boolean>(false);
    const contentRef = React.useRef(null);

    React.useEffect(() => {
        setLoading(true);
        StatisticalOrderExportAPI(fromDate, toDate, status, pagination.offset, pagination.limit)
            .then((res) => {
                if (res) {
                    if (res.data.length === 0) dispatch({ type: ActionTypeEnum.ERROR, message: "Không Có Hàng Được Xuất Trong Khoảng Thời Gian Này" })
                    setOrderExport(res.data);
                    setPagination({
                        limit: res.limit,
                        offset: res.offset,
                        totalElementOfPage: res.totalElementOfPage,
                        totalPage: res.totalPage,
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message })
            })
            .finally(() => {
                setLoading(false);
            })
    }, [reload]);

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

    const convertDataToDataExcel = (data: ExportOrder[]): ConvertDataToDataExcel[] => {
        const result: ConvertDataToDataExcel[] = [];
        data.forEach((item) => {
            result.push({
                orderExportCode: item.exportCode,
                createDate: formatDateVietNam(item.create_at),
                exportBy: item.exportBy,
                productName: item.orderExportDetails[0].product.name,
                quantity: item.orderExportDetails[0].quantity,
                unit: item.orderExportDetails[0].unit.name,
                status: item.status === "PENDING" ? "Chờ xuất" : item.status === "EXPORTED" ? "Đã xuất" : "Hủy"
            })
        })
        return result;
    }

    const exportToExcel = () => {
        const data = convertDataToDataExcel(orderExport);
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        const headers = [["Mã Phiếu Xuất", "Ngày Xuất", "Người Xuất", "Tên Sản Phẩm", "Số Lượng", "Đơn Vị", "Trạng Thái"]];
        XLSX.utils.sheet_add_aoa(ws, headers, { origin: "A1" });
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'data.xlsx');
    };

    return (
        <div>
            <div className={"mb-4"}>
                <div>
                    <h1 className="h2 fw-bold">THỐNG KÊ XUẤT KHO</h1>
                    <p className="h6">Bạn có thể thống kê số liệu xuất kho ở đây</p>
                </div>
                <div className="d-flex flex-row text-nowrap justify-content-center align-items-center gap-3">
                    <span>Từ ngày:</span>
                    <input type="date" value={formatDateForInputNoTime(fromDate)} onChange={(e) => setFromDate(e.target.value)} className="form-control" style={{ width: "250px" }} />
                    <span>Đến ngày:</span>
                    <input type="date" value={formatDateForInputNoTime(toDate)} onChange={(e) => setToDate(e.target.value)} className="form-control" style={{ width: "250px" }} />
                    <span>Trạng thái:</span>
                    <select className="form-select" style={{ width: "250px" }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                        <option value="PENDING">Chờ xuất</option>
                        <option value="EXPORTED">Đã xuất</option>
                        <option value="CANCEL">Hủy</option>
                    </select>
                    <button
                        onClick={() => {
                            const currentDate = new Date();
                            const fromDateConvert = new Date(fromDate);
                            const toDateConvert = new Date(toDate);
                            if (fromDateConvert > currentDate) {
                                dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày bắt đầu không được lớn hơn ngày hiện tại" })
                                return;
                            }
                            if (toDateConvert > currentDate) {
                                dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày kết thúc không được lớn hơn ngày hiện tại" })
                                return;
                            }
                            if (fromDateConvert > toDateConvert) {
                                dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày bắt đầu không được lớn hơn ngày kết thúc" })
                                return;
                            }
                            setReload(!reload)
                        }}
                        className="btn btn-primary"
                    >
                        Thống kê
                    </button>
                    <button
                        disabled={orderExport.length === 0}
                        className="btn btn-danger"
                        onClick={handleExportPDF}
                    >
                        <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                        Xuất PDF
                    </button>
                    <button
                        disabled={orderExport.length === 0}
                        className="btn btn-success"
                        onClick={exportToExcel}
                    >
                        <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                        Xuất Excel
                    </button>
                </div>
                <div ref={contentRef} className="mt-5">
                    <h3 className="text-center fw-bold">BẢNG THỐNG KÊ HÀNG HÓA XUẤT KHO</h3>
                    <div>
                        <p className="text-center">Từ ngày: {formatDateVietNam(fromDate)} - Đến ngày: {formatDateVietNam(toDate)}</p>
                    </div>
                    <Table striped bordered hover responsive className="mt-4">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã Phiếu Xuất</th>
                                <th>Ngày xuất</th>
                                <th>Người xuất</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn vị</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                orderExport.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.exportCode}</td>
                                        <td>{formatDateVietNam(item.create_at)}</td>
                                        <td>{item.exportBy}</td>
                                        <td>{item.orderExportDetails[0].product.name}</td>
                                        <td>{item.orderExportDetails[0].quantity}</td>
                                        <td>{item.orderExportDetails[0].unit.name}</td>
                                        <td>
                                            {item.status === "PENDING" && <span className="badge bg-warning">Chờ xuất</span>}
                                            {item.status === "EXPORTED" && <span className="badge bg-success">Đã xuất</span>}
                                            {item.status === "CANCEL" && <span className="badge bg-danger">Hủy</span>}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </div>
                {
                    orderExport.length > 0 &&
                    <Pagination
                        currentPage={pagination.offset}
                        totalPages={pagination.totalPage}
                        onPageChange={(page) => {
                            setPagination({ ...pagination, offset: page });
                        }}
                    />
                }
                {
                    orderExport.length === 0 &&
                    <NoData />
                }
                {
                    loading &&
                    <SpinnerLoading />
                }
            </div>
        </div>
    );
}

export default StatisticalOrderExport;