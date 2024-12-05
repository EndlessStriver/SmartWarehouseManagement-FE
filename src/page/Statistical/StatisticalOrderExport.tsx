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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import ViewPDFOrderExport from "./compoments/ViewPDFOrderExport";
import StatisticalOrderExportALLAPI from "../../services/Statistical/StatisticalOrderExportAllAPI";
import ExcelJS from "exceljs";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";

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

    const navigate = useNavigate();
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
    const [showViewPDFOrderExport, setShowViewPDFOrderExport] = React.useState<boolean>(false);
    const [loadingExportExcel, setLoadingExportExcel] = React.useState<boolean>(false);

    React.useEffect(() => {
        setLoading(true);
        StatisticalOrderExportAPI(navigate, fromDate, toDate, status, pagination.limit, pagination.offset)
            .then((res) => {
                if (res) {
                    console.log(res.data.length);
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

    const convertDataToDataExcel = (data: ExportOrder[]): ConvertDataToDataExcel[] => {
        return data.map((item) => {
            return item.orderExportDetails.map((location) => {
                return {
                    orderExportCode: item.exportCode,
                    createDate: formatDateVietNam(item.create_at),
                    exportBy: item.exportBy,
                    productName: item.orderExportDetails[0].product.name,
                    quantity: location.locationExport[0].exportQuantity,
                    unit: item.orderExportDetails[0].unit.name,
                    location: location.locationExport[0].locationCode,
                    status: item.status === "PENDING" ? "Chờ xuất" : item.status === "EXPORTED" ? "Đã xuất" : "Hủy",
                }
            })
        }).flat()
    }

    const exportToExcel = () => {
        setLoadingExportExcel(true);
        StatisticalOrderExportALLAPI(fromDate, toDate, status, navigate)
            .then((res) => {
                if (!res || res.data.length === 0) {
                    dispatch({
                        type: ActionTypeEnum.ERROR,
                        message: "Không Có Hàng Được Xuất Trong Khoảng Thời Gian Này",
                    });
                    return;
                }

                const data = convertDataToDataExcel(res.data);

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet("Danh Sách Xuất Kho");

                const mainTitle = "Báo Cáo Xuất Kho";
                worksheet.mergeCells("A1:H1");
                const mainTitleCell = worksheet.getCell("A1");
                mainTitleCell.value = mainTitle;
                mainTitleCell.font = {
                    size: 16,
                    bold: true,
                    color: { argb: "FFFFFFFF" },
                };
                mainTitleCell.alignment = { horizontal: "center", vertical: "middle" };
                mainTitleCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF1976D2" },
                };

                worksheet.addRow([]);

                const headers = [
                    "Mã Phiếu Xuất",
                    "Ngày Xuất",
                    "Người Xuất",
                    "Tên Sản Phẩm",
                    "Số Lượng",
                    "Đơn Vị",
                    "Vị Trí",
                    "Trạng Thái",
                ];
                worksheet.addRow(headers);

                worksheet.getRow(3).eachCell((cell) => {
                    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FF4CAF50" },
                    };
                    cell.alignment = { horizontal: "center", vertical: "middle" };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });

                data.forEach((row: any) => {
                    worksheet.addRow(Object.values(row));
                });

                worksheet.eachRow((row, rowIndex) => {
                    if (rowIndex > 3) {
                        row.eachCell((cell) => {
                            cell.alignment = { horizontal: "center", vertical: "middle" };
                            cell.border = {
                                top: { style: "thin" },
                                left: { style: "thin" },
                                bottom: { style: "thin" },
                                right: { style: "thin" },
                            };
                        });
                    }
                });

                worksheet.columns = headers.map((header) => ({
                    header,
                    width: undefined,
                }));

                workbook.xlsx.writeBuffer().then((buffer) => {
                    const blob = new Blob([buffer], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    });

                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "BaoCaoXuatKho.xlsx";

                    document.body.appendChild(link);
                    link.click();

                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                });
            })
            .catch((err) => {
                console.error(err);
                dispatch({ type: ActionTypeEnum.ERROR, message: err.message });
            })
            .finally(() => {
                setLoadingExportExcel(false);
            });
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
                            // if (toDateConvert > currentDate) {
                            //     dispatch({ type: ActionTypeEnum.ERROR, message: "Ngày kết thúc không được lớn hơn ngày hiện tại" })
                            //     return;
                            // }
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
                        onClick={() => setShowViewPDFOrderExport(true)}
                    >
                        <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                        Xuất PDF
                    </button>
                    <button
                        disabled={orderExport.length === 0 || loadingExportExcel}
                        className="btn btn-success"
                        onClick={exportToExcel}
                    >
                        <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                        {loadingExportExcel ? "Đang Xuất" : "Xuất Excel"}
                    </button>
                </div>
                <div className="mt-5">
                    <h3 className="text-center fw-bold">BẢNG THỐNG KÊ HÀNG HÓA XUẤT KHO</h3>
                    <div>
                        <p className="text-center">Từ ngày: {formatDateVietNam(fromDate)} - Đến ngày: {formatDateVietNam(toDate)}</p>
                    </div>
                    <Table striped bordered hover responsive className="mt-4">
                        <thead>
                            <tr>
                                <th>Mã Phiếu Xuất</th>
                                <th>Ngày xuất</th>
                                <th>Người xuất</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn vị</th>
                                <th>Vị trí</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                orderExport.map((item) => (
                                    item.orderExportDetails.map((location) => (
                                        <tr key={uuidv4().toString()}>
                                            <td>{item.exportCode}</td>
                                            <td>{formatDateVietNam(item.create_at)}</td>
                                            <td>{item.exportBy}</td>
                                            <td>{item.orderExportDetails[0].product.name}</td>
                                            <td>{location.locationExport[0].exportQuantity}</td>
                                            <td>{item.orderExportDetails[0].unit.name}</td>
                                            <td>{location.locationExport[0].locationCode}</td>
                                            <td>
                                                {item.status === "PENDING" && <span className="badge bg-warning">Chờ xuất</span>}
                                                {item.status === "EXPORTED" && <span className="badge bg-success">Đã xuất</span>}
                                                {item.status === "CANCEL" && <span className="badge bg-danger">Hủy</span>}
                                            </td>
                                        </tr>
                                    ))
                                )).flat()
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
            {
                showViewPDFOrderExport &&
                <ViewPDFOrderExport
                    onClose={() => setShowViewPDFOrderExport(false)}
                    fromDate={fromDate}
                    toDate={toDate}
                    status={status}
                />
            }
        </div>
    );
}

export default StatisticalOrderExport;