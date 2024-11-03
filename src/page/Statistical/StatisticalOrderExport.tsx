import React from "react";
import formatDateForInputNoTime from "../../util/FormartDateInputNoTime";

const StatisticalOrderExport = () => {

    const [fromDate, setFromDate] = React.useState<string>("");
    const [toDate, setToDate] = React.useState<string>("");

    React.useEffect(() => {
        const dateNoew = new Date();
        setFromDate(dateNoew.toISOString().split("T")[0]);
        setToDate(dateNoew.toISOString().split("T")[0]);
    }, []);

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
                    <input type="date" value={formatDateForInputNoTime(toDate)} onChange={(e) => setFromDate(e.target.value)} className="form-control" style={{ width: "250px" }} />
                    <button className="btn btn-primary">Thống kê</button>
                </div>
            </div>
        </div>
    );
}

export default StatisticalOrderExport;