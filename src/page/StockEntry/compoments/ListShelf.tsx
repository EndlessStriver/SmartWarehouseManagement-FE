import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay"
import Shelf from "../../../interface/Entity/Shelf";
import PaginationType from "../../../interface/Pagination";
import GetShelfs from "../../../services/Location/GetShelfs";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import { Badge, CloseButton, Form } from "react-bootstrap";
import Pagination from "../../../compoments/Pagination/Pagination";
import ListLocation from "./ListLocation";
import GetShelfByCategoryName from "../../../services/Location/GetShelfsByCategoryName";
import { NoData } from "../../../compoments/NoData/NoData";
import SpinnerLoading from "../../../compoments/Loading/SpinnerLoading";
import GetShelfByCategoryNameAndTypeShelf from "../../../services/Location/GetShelfsByCategoryName";

interface ListShelfProps {
    onClose: () => void
    setLocation: (id: string, name: string) => void
    categoryName: string
    volume: number
    quantity: number
    productId: string
    unitId: string
    weight: number
    status: string
}

const ListShelf: React.FC<ListShelfProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [shelfId, setShelfId] = React.useState<string>("");
    const [shelfs, setShelfs] = React.useState<Shelf[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [showListLocation, setShowListLocation] = React.useState<boolean>(false);
    const [getAllShelf, setGetAllShelf] = React.useState<boolean>(false);
    const [pagination, setPagination] = React.useState<PaginationType>({
        limit: 10,
        offset: 1,
        totalPage: 0,
        totalElementOfPage: 0
    })

    React.useEffect(() => {
        if (!getAllShelf) {
            setIsLoading(true)
            GetShelfByCategoryNameAndTypeShelf({ categoryName: props.categoryName, typeShelf: props.status })
                .then((response) => {
                    if (response) {
                        setShelfs(response.data)
                        setPagination({
                            limit: Number(response.limit),
                            offset: Number(response.offset),
                            totalPage: response.totalPage,
                            totalElementOfPage: response.totalElementOfPage
                        })
                    }
                }).catch((error) => {
                    console.error(error)
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
                }).finally(() => {
                    setIsLoading(false)
                })
        } else {
            setIsLoading(true)
            GetShelfs()
                .then((response) => {
                    if (response) {
                        setShelfs(response.data)
                        setPagination({
                            limit: Number(response.limit),
                            offset: Number(response.offset),
                            totalPage: response.totalPage,
                            totalElementOfPage: response.totalElementOfPage
                        })
                    }
                }).catch((error) => {
                    console.error(error)
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
                }).finally(() => {
                    setIsLoading(false)
                })
        }
    }, [dispatch, props.categoryName, getAllShelf, props.status])

    React.useEffect(() => {
        let id: NodeJS.Timeout | number;
        if (getAllShelf) {
            id = setTimeout(() => {
                setIsLoading(true)
                GetShelfs({ offset: pagination.offset })
                    .then((response) => {
                        if (response) {
                            setShelfs(response.data)
                            setPagination({
                                limit: Number(response.limit),
                                offset: Number(response.offset),
                                totalPage: response.totalPage,
                                totalElementOfPage: response.totalElementOfPage
                            })
                        }
                    }).catch((error) => {
                        console.error(error)
                        dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
                    }).finally(() => {
                        setIsLoading(false)
                    })
            }, 500)
        } else {
            setIsLoading(true)
            id = setTimeout(() => {
                GetShelfByCategoryNameAndTypeShelf({ categoryName: props.categoryName, typeShelf: props.status, offset: pagination.offset })
                    .then((response) => {
                        if (response) {
                            setShelfs(response.data)
                            setPagination({
                                limit: Number(response.limit),
                                offset: Number(response.offset),
                                totalPage: response.totalPage,
                                totalElementOfPage: response.totalElementOfPage
                            })
                        }
                    }).catch((error) => {
                        console.error(error)
                        dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
                    }).finally(() => {
                        setIsLoading(false)
                    })
            }, 500)
        }
        return () => clearTimeout(id)
    }, [dispatch, pagination.offset, props.categoryName, getAllShelf, props.status])

    const renderShelfs = () => {
        return shelfs.map((shelf: Shelf, index: number) => {
            return (
                <div
                    className="d-flex gap-1 flex-column justify-content-center align-items-center shadow btn btn-light position-relative"
                    key={index}
                    style={{ height: "250px" }}
                >
                    <div className="d-flex w-100">
                        <div style={{ flex: 1 }} className="text-end">Tên kệ: &nbsp;</div>
                        <div style={{ flex: 1 }} className="fw-bold text-start">{shelf.name}</div>
                    </div>
                    <div className="d-flex w-100">
                        <div style={{ flex: 1 }} className="text-end">Loại kệ: &nbsp;</div>
                        <div style={{ flex: 1 }} className="fw-bold text-start">
                            <Badge bg={`${shelf.typeShelf === "NORMAL" ? "primary" : (shelf.typeShelf === "COOLER") ? "info" : "danger"}`}>
                                {shelf.typeShelf === "NORMAL" ? "Thường" : "Lỗi"}
                            </Badge>
                        </div>
                    </div>
                    <div className="d-flex w-100">
                        <div style={{ flex: 1 }} className="text-end">Còn trống: &nbsp;</div>
                        <div style={{ flex: 1 }} className="fw-bold text-start">
                            {(((Number(shelf.maxCapacity) - Number(shelf.currentCapacity)) / Number(shelf.maxCapacity)) * 100).toLocaleString()}%
                        </div>
                    </div>
                    <div className="d-flex w-100">
                        <div style={{ flex: 1 }} className="text-end">Loại hàng: &nbsp;</div>
                        <div style={{ flex: 1 }} className="fw-bold text-start">
                            <span>{shelf.category?.name || ""}</span>
                        </div>
                    </div>
                    <div className="d-flex w-100">
                        <div style={{ flex: 1 }} className="text-end">Vị trí trống: &nbsp;</div>
                        <div style={{ flex: 1 }} className="fw-bold text-start">
                            <span>{shelf.totalColumns - shelf.currentColumnsUsed}</span>
                        </div>
                    </div>
                    <div
                        className="btn btn-link"
                        onClick={() => {
                            setShowListLocation(true)
                            setShelfId(shelf.id)
                        }}
                    >
                        Chi tiết
                    </div>
                </div>
            )
        })
    }

    const handleChangePage = (page: number) => {
        setPagination({ ...pagination, offset: page })
    }

    return (
        <OverLay>
            <CloseButton
                onClick={() => props.onClose()}
                className="position-fixed bg-white"
                style={{ top: "15px", right: "15px" }}
            />
            <div className="bg-white d-flex flex-column justify-content-center align-items-center p-3 rounded position-relative" style={{ minWidth: "800px", minHeight: "300px" }}>
                <Form.Check
                    type="switch"
                    label="Lấy tẩt cả kệ"
                    className="position-absolute"
                    style={{
                        top: "15px",
                        right: "15px",
                    }}
                    checked={getAllShelf}
                    onChange={(e) => setGetAllShelf(e.target.checked)}
                />
                {
                    shelfs.length > 0 &&
                    (
                        <div
                            className="bg-light rounded"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 250px)",
                                gridTemplateRows: "repeat(2, 250px)",
                                gap: "10px",
                                padding: "10px"
                            }}
                        >
                            {renderShelfs()}
                        </div>
                    )
                }
                {
                    shelfs.length > 0 &&
                    <Pagination
                        currentPage={pagination.offset}
                        totalPages={pagination.totalPage}
                        onPageChange={handleChangePage}
                    />
                }
                {
                    isLoading &&
                    <SpinnerLoading />
                }
                {
                    shelfs.length === 0 &&
                    <NoData lable="Không tìm thấy kệ chứa phù hợp" />
                }
            </div>
            {
                showListLocation &&
                <ListLocation
                    close={() => {
                        setShowListLocation(false)
                        setShelfId("")
                    }}
                    shelfId={shelfId}
                    closeAll={() => {
                        setShowListLocation(false)
                        props.onClose()
                    }}
                    addLocation={props.setLocation}
                    volume={props.volume}
                    quantity={props.quantity}
                    productId={props.productId}
                    unitId={props.unitId}
                    weight={props.weight}
                />
            }
        </OverLay>
    )
}

export default ListShelf