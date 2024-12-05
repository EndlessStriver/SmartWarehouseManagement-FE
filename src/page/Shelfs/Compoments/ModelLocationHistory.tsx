import { CloseButton } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import React from "react"
import GetLocationHistoryById, { Transaction } from "../../../services/StockEntry/GetLocationHistoryById"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import ActionTypeEnum from "../../../enum/ActionTypeEnum"
import formatDateVietNam from "../../../util/FormartDateVietnam"
import Pagination from "../../../compoments/Pagination/Pagination"
import { useNavigate } from "react-router-dom"

interface ModelLocationHistoryProps {
    onClose: () => void
    locationId: string
}

const ModelLocationHistory: React.FC<ModelLocationHistoryProps> = (props) => {

    const navigate = useNavigate();
    const dispatch = useDispatchMessage();
    const [historyLocations, setHistoryLocations] = React.useState<Transaction[]>([])
    const [pagination, setPagination] = React.useState({
        limit: 10,
        offset: 1,
        totalPage: 0,
    })

    React.useEffect(() => {
        GetLocationHistoryById(navigate, props.locationId, pagination.limit, pagination.offset)
            .then((data) => {
                if (data) {
                    setHistoryLocations(data.data)
                    setPagination({
                        limit: data.limit,
                        offset: data.offset,
                        totalPage: data.totalPage
                    })
                }
            })
            .catch((error) => {
                console.error(error)
                dispatch({ message: error.message, type: ActionTypeEnum.ERROR })
            })
    }, [props.locationId, dispatch, pagination.limit, pagination.offset])

    return (
        <OverLay>
            <div
                className="bg-white p-4 position-relative rounded"
                style={{
                    width: "800px"
                }}>
                <CloseButton
                    onClick={() => props.onClose()}
                    className="position-absolute"
                    style={{
                        top: "15px",
                        right: "15px",
                    }} />
                <h3>Lịch sử hoạt động</h3>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Ngày tạo</th>
                            <th>Loại</th>
                            <th>Số lượng</th>
                            <th>Vị trí mới</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyLocations.map((location, index) => (
                            <tr key={index}>
                                <td>{formatDateVietNam(location.transactionDate)}</td>
                                <td>
                                    {
                                        location.transactionType === "INBOUND" ? "Nhập" :
                                            location.transactionType === "OUTBOUND" ? "Xuất" : "Chuyển"
                                    }
                                </td>
                                <td>{location.quantity}</td>
                                <td>{location?.toLocation?.locationCode || "---"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {
                    historyLocations.length === 0 ? (
                        <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center">
                            <h4>Không có dữ liệu</h4>
                        </div>
                    )
                        :
                        <Pagination
                            currentPage={pagination.offset}
                            totalPages={pagination.totalPage}
                            onPageChange={(page) => setPagination({ ...pagination, offset: page })}
                        />
                }
            </div>
        </OverLay>
    )
}

export default ModelLocationHistory