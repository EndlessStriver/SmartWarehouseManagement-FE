import React from "react";
import formatDateForInputNoTime from "../../util/FormartDateInputNoTime";
import { NoData } from "../../compoments/NoData/NoData";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import formatDateVietNam from "../../util/FormartDateVietnam";
import { Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import { useDispatchMessage } from "../../Context/ContextMessage";
import StatisticalStockEntryAPI, { StatisticalStockEntryResponse } from "../../services/Statistical/StatisticalStockEntryAPI";
import ViewPDFStockEntry from "./compoments/ViewPDFStockEntry";
import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';

interface CheckedProductToDataExcel {
    productCode: string;
    productName: string;
    receiveQuantity: number;
    unit: string;
    location: string;
    importDate: string;
}

const StaticticalStockEntry = () => {
    const dispatch = useDispatchMessage();
    const [fromDate, setFromDate] = React.useState<string>(new Date().toISOString().split("T")[0]);
    const [toDate, setToDate] = React.useState<string>(new Date().toISOString().split("T")[0]);
    const [productStockEntry, setProductStockEntry] = React.useState<StatisticalStockEntryResponse[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [reload, setReload] = React.useState<boolean>(false);
    const contentRef = React.useRef(null);
    const [ShowViewPDFStockEntry, setShowViewPDFStockEntry] = React.useState<boolean>(false);
    const [loadingExportExcel, setLoadingExportExcel] = React.useState<boolean>(false);

    React.useEffect(() => {
        setLoading(true);
        StatisticalStockEntryAPI(fromDate, toDate)
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
    }, [reload]);

    const convertDataToExcel = (data: StatisticalStockEntryResponse[]): CheckedProductToDataExcel[] => {
        return data.map((item) => {
            return item.checkItems.map((item1) => {
                return {
                    productCode: item1.product.productCode,
                    productName: item1.product.name,
                    receiveQuantity: item1.receiveQuantity,
                    unit: item1.unit ? item1.unit.name : "Không có",
                    location: item1.locations[0].locationCode,
                    importDate: formatDateVietNam(item.create_at),
                }
            })
        }).flat();
    }

    const exportToExcel = async () => {
        try {
            const data = convertDataToExcel(productStockEntry);
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            worksheet.mergeCells('A1:F1');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = 'Báo Cáo Nhập Kho';
            titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
            titleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4CAF50' },
            };

            const headers = ["Mã Sản Phẩm", "Tên Sản Phẩm", "Số Lượng", "Đơn Vị", "Vị Trí", "Ngày Nhập"];
            worksheet.addRow(headers);

            const headerRow = worksheet.getRow(2);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF2196F3' },
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });

            data.forEach((item) => {
                worksheet.addRow([
                    item.productCode,
                    item.productName,
                    item.receiveQuantity,
                    item.unit,
                    item.location,
                    item.importDate,
                ]);
            });

            worksheet.columns = [
                { width: 15 },
                { width: 30 },
                { width: 10 },
                { width: 10 },
                { width: 15 },
                { width: 15 },
            ];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 2) {
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        };
                    });
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();

            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Báo_Cáo_Nhập_Kho_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error exporting to Excel:", error);
        }
    };


    return (
        <div>
            <div className={"mb-4"}>
                <div>
                    <h1 className="h2 fw-bold">THỐNG KÊ NHẬP KHO</h1>
                    <p className="h6">Bạn có thể thống kê số liệu nhập kho ở đây</p>
                </div>
                <div className="d-flex flex-row text-nowrap justify-content-center align-items-center gap-3">
                    <span>Từ ngày:</span>
                    <input type="date" value={formatDateForInputNoTime(fromDate)} onChange={(e) => setFromDate(e.target.value)} className="form-control" style={{ width: "250px" }} />
                    <span>Đến ngày:</span>
                    <input type="date" value={formatDateForInputNoTime(toDate)} onChange={(e) => setToDate(e.target.value)} className="form-control" style={{ width: "250px" }} />
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
                        disabled={productStockEntry.length === 0}
                        className="btn btn-danger"
                        onClick={() => setShowViewPDFStockEntry(true)}
                    >
                        <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                        Xuất PDF
                    </button>
                    <button
                        disabled={productStockEntry.length === 0 || loadingExportExcel}
                        className="btn btn-success"
                        onClick={exportToExcel}
                    >
                        <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                        {loadingExportExcel ? "Đang xuất..." : "Xuất Excel"}
                    </button>
                </div>
                <div ref={contentRef} className="mt-5">
                    <h3 className="text-center fw-bold">BẢNG THỐNG KÊ HÀNG HÓA NHẬP KHO</h3>
                    <div>
                        <p className="text-center">Từ ngày: {formatDateVietNam(fromDate)} - Đến ngày: {formatDateVietNam(toDate)}</p>
                    </div>
                    <Table striped bordered responsive className="mt-4">
                        <thead>
                            <tr>
                                <th>Mã Sản Phẩm</th>
                                <th>Tên Sản Phẩm</th>
                                <th>Số Lượng Nhập</th>
                                <th>Đơn vị</th>
                                <th>Vị trí</th>
                                <th>Ngày Nhập</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                productStockEntry.map((item) => {
                                    return item.checkItems.map((item1) => (
                                        <tr key={uuidv4()}>
                                            <td>{item1.product.productCode}</td>
                                            <td>{item1.product.name}</td>
                                            <td>{item1.receiveQuantity}</td>
                                            <td>{item1.unit ? item1.unit.name : "Không có"}</td>
                                            <td>{item1.locations[0].locationCode}</td>
                                            <td>{formatDateVietNam(item1.create_at)}</td>
                                        </tr>
                                    ))
                                }).flat()
                            }
                        </tbody>
                    </Table>
                </div>
                {
                    productStockEntry.length === 0 &&
                    <NoData />
                }
                {
                    loading &&
                    <SpinnerLoading />
                }
            </div>
            {
                ShowViewPDFStockEntry &&
                <ViewPDFStockEntry
                    fromDate={fromDate}
                    toDate={toDate}
                    onClose={() => setShowViewPDFStockEntry(false)}
                />
            }
        </div>
    );
}

export default StaticticalStockEntry;