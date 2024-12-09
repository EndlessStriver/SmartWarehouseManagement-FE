import {CloseButton, Table} from "react-bootstrap"
import {OverLay} from "../../../compoments/OverLay/OverLay"
import formatDateVietNam from "../../../util/FormartDateVietnam";
import React from "react";
import {useDispatchMessage} from "../../../Context/ContextMessage";
import StatisticalOrderExportALLAPI, {
    ExportOrderResponse
} from "../../../services/Statistical/StatisticalOrderExportAllAPI";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import SpinnerLoading from "../../../compoments/Loading/SpinnerLoading";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilePdf} from "@fortawesome/free-solid-svg-icons";
import {v4 as uuidv4} from 'uuid';
import {useNavigate} from "react-router-dom";

interface ViewPDFOrderExportProps {
    onClose: () => void;
    fromDate: string;
    toDate: string;
    status: string;
}

const ViewPDFOrderExport: React.FC<ViewPDFOrderExportProps> = (props) => {

    const navigate = useNavigate();
    const dispatch = useDispatchMessage();
    const [orderExport, setOrderExport] = React.useState<ExportOrderResponse>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const contentRef = React.useRef(null);

    React.useEffect(() => {
        setLoading(true);
        StatisticalOrderExportALLAPI(props.fromDate, props.toDate, props.status, navigate)
            .then((res) => {
                if (res) {
                    if (res.data.length === 0) dispatch({
                        type: ActionTypeEnum.ERROR,
                        message: "Không Có Hàng Được Xuất Trong Khoảng Thời Gian Này"
                    })
                    setOrderExport(res);
                }
            })
            .catch((err) => {
                console.error(err);
                dispatch({type: ActionTypeEnum.ERROR, message: err.message})
            })
            .finally(() => {
                setLoading(false);
            })
    }, [props.fromDate, props.toDate, props.status, dispatch]);

    const handleExportPDF = () => {
        const input = contentRef.current;
        if (input) {
            html2canvas(input, {scale: 2})
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
            <div className="bg-light rounded p-4 position-relative" style={{width: "1200px"}}>
                <CloseButton onClick={() => props.onClose()} className="position-absolute"
                             style={{top: "15px", right: "15px"}}/>
                <button
                    className="btn btn-danger"
                    onClick={() => handleExportPDF()}
                >
                    <FontAwesomeIcon icon={faFilePdf} className="me-1"/>
                    Xuất PDF
                </button>
                <div ref={contentRef}>
                    <h3 className="text-center fw-bold">BẢNG THỐNG KÊ HÀNG HÓA XUẤT KHO</h3>
                    <h6 className="text-center">Từ ngày: {formatDateVietNam(props.fromDate)} - Đến
                        ngày: {formatDateVietNam(props.toDate)}</h6>
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
                        {orderExport?.data?.map((item) =>
                            item?.orderExportDetails?.map((orderExportDetail) =>
                                orderExportDetail?.locationExport?.map((locationEP) => (
                                    <tr key={`${item.exportCode}-${locationEP.locationCode}`}>
                                        <td>{item.exportCode || "N/A"}</td>
                                        <td>{item.create_at ? formatDateVietNam(item.create_at) : "N/A"}</td>
                                        <td>{item.exportBy || "N/A"}</td>
                                        <td>{orderExportDetail?.product?.name || "N/A"}</td>
                                        <td>{locationEP?.exportQuantity || 0}</td>
                                        <td>{orderExportDetail?.unit?.name || "N/A"}</td>
                                        <td>{locationEP?.locationCode || "N/A"}</td>
                                        <td>
                                            {item.status === "PENDING" && (
                                                <span className="badge bg-warning">Chờ xuất</span>
                                            )}
                                            {item.status === "EXPORTED" && (
                                                <span className="badge bg-success">Đã xuất</span>
                                            )}
                                            {item.status === "CANCEL" && (
                                                <span className="badge bg-danger">Hủy</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                        </tbody>
                    </Table>
                    <p>Tổng số lượng sản phẩm đã xuất: <span className="fw-bold">{orderExport?.totalQuantity}</span> Sản
                        phẩm</p>
                </div>
                {
                    loading &&
                    <SpinnerLoading/>
                }
            </div>
        </OverLay>
    )
}

export default ViewPDFOrderExport