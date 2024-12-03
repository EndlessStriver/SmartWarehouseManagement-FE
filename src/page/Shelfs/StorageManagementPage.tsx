import React from "react";
import './css/ShelfDetails.css';
import Shelf from '../../interface/Entity/Shelf';
import PaginationType from "../../interface/Pagination";
import GetShelfs from "../../services/Location/GetShelfs";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import SpinnerLoading from "../../compoments/Loading/SpinnerLoading";
import Pagination from "../../compoments/Pagination/Pagination";
import { NoData } from "../../compoments/NoData/NoData";
import ShelfDetails from "./Compoments/ShelfDetails";
import { Badge, Button, CloseButton } from "react-bootstrap";
import ModelCreateShelf from "./Compoments/ModelCreateShelf";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";
import DeleteShelf from "../../services/Location/DeleteShelf";
import './css/StorageManagementPage.css'
import ModelQRCodeShelf from "./Compoments/ModelQRCodeShelf";
import GetLocationByShelfIdt from "../../services/Location/GetLocationByShelfIdt";

const ShelfsPage: React.FC = () => {

    const dispatch = useDispatchMessage();
    const [shelfId, setShelfId] = React.useState<string>('')
    const [showShelfDetails, setShowShelfDetails] = React.useState<boolean>(false)
    const [showModelCreateShelf, setShowModelCreateShelf] = React.useState<boolean>(false)
    const [showModelConfirmDelete, setShowModelConfirmDelete] = React.useState<boolean>(false)

    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isLoadingDelete, setIsLoadingDelete] = React.useState<boolean>(false)
    const [shelfList, setShelfList] = React.useState<Shelf[]>([]);
    const [pagination, setPagination] = React.useState<PaginationType>({
        limit: 10,
        offset: 1,
        totalPage: 0,
        totalElementOfPage: 0
    })
    const [showQRCode, setShowQRCode] = React.useState<boolean>(false)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await GetShelfs({ offset: pagination.offset });
                if (response) {
                    const updatedShelfs = await Promise.all(
                        response.data.map(async (shelf) => {
                            try {
                                const locations = await GetLocationByShelfIdt(shelf.id);
                                if (locations) {
                                    shelf.currentColumnsUsed = locations.filter((location) => location.occupied).length;
                                }
                            } catch (error) {
                                console.error(`Error fetching locations for shelf ID ${shelf.id}:`, error);
                            }
                            return shelf;
                        })
                    );
                    setShelfList(updatedShelfs);
                    setPagination({
                        limit: Number(response.limit),
                        offset: Number(response.offset),
                        totalPage: response.totalPage,
                        totalElementOfPage: response.totalElementOfPage,
                    });
                }
            } catch (error) {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: "Lỗi trong quá trình lấy danh sách kệ" });
            } finally {
                setIsLoading(false);
            }
        };

        const id = setTimeout(() => {
            fetchData();
        }, 500);

        return () => clearTimeout(id);
    }, [dispatch, pagination.offset]);

    const handleChangePage = (page: number) => {
        setPagination({ ...pagination, offset: page })
    }

    const handleUpdatePage = (page: PaginationType) => {
        setPagination(page)
    }

    const handleUpdateListShelf = (shlefs: Shelf[]) => {
        setShelfList(shlefs)
    }

    const handleDeleteShelf = () => {
        setIsLoadingDelete(true)
        DeleteShelf(shelfId)
            .then(() => {
                return GetShelfs()
            }).then((res) => {
                if (res) {
                    setShelfList(res.data.map((shelf) => {
                        GetLocationByShelfIdt(shelf.id)
                            .then((res) => {
                                if (res) {
                                    shelf.currentColumnsUsed = res.filter((lolcation) => lolcation.occupied).length
                                }
                            }).catch((error) => {
                                console.error(error)
                            })
                        return shelf;
                    }))
                    setPagination({
                        limit: Number(res.limit),
                        offset: Number(res.offset),
                        totalPage: res.totalPage,
                        totalElementOfPage: res.totalElementOfPage
                    })
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Xóa kệ thành công" })
                    setShelfId('')
                    setShowModelConfirmDelete(false)
                }
            }).catch((error) => {
                console.error(error)
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            }).finally(() => {
                setIsLoadingDelete(false)
            })
    }

    const renderShelfs = shelfList.map((shelf: Shelf, index: number) => {
        return (
            <div
                className="d-flex gap-1 flex-column justify-content-center align-items-center shadow btn btn-light position-relative"
                key={index}
                style={{ height: "250px" }}
            >
                <CloseButton
                    className="position-absolute"
                    style={{ top: "10px", right: "10px" }}
                    onClick={() => {
                        setShelfId(shelf.id)
                        setShowModelConfirmDelete(true)
                    }}
                />
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
                <div>
                    <div
                        className="btn btn-link"
                        onClick={() => {
                            setShelfId(shelf.id)
                            setShowShelfDetails(true)
                        }}
                    >
                        Chi tiết
                    </div>
                    <div
                        className="btn btn-link"
                        onClick={() => {
                            setShelfId(shelf.id)
                            setShowQRCode(true)
                        }}
                    >
                        QR Code
                    </div>
                </div>
            </div>
        )
    })

    return (
        <div className={"position-relative h-100 w-100"}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Quản Lý Kệ</h2>
                    <p className={"h6"}>Bạn có thể quản lý kệ của bạn ở đây</p>
                </div>
                <div>
                    <Button onClick={() => {
                        setShowModelCreateShelf(true)
                    }} variant="info text-light fw-bold">+ Tạo Mới</Button>
                </div>
            </div>
            <div className="d-flex justify-content-center">
                {
                    shelfList.length > 0 ?
                        <div className="shelf-container shadow rounded">
                            {renderShelfs}
                        </div>
                        :
                        <NoData />
                }
            </div>
            {
                isLoading && <SpinnerLoading />
            }
            {
                (shelfList.length > 0) &&
                <Pagination
                    currentPage={pagination.offset}
                    totalPages={pagination?.totalPage}
                    onPageChange={handleChangePage}
                />
            }
            {
                showShelfDetails && shelfId &&
                <ShelfDetails
                    shelfId={shelfId}
                    close={() => {
                        setShelfId('')
                        setShowShelfDetails(false)
                    }}
                />
            }
            {
                showModelCreateShelf &&
                <ModelCreateShelf
                    onClose={() => {
                        setShowModelCreateShelf(false)
                        setShelfId('')
                    }}
                    updatePage={handleUpdatePage}
                    updateShelfList={handleUpdateListShelf}
                />
            }
            {
                showModelConfirmDelete &&
                <ModelConfirmDelete
                    message="Bạn có chắc muốn xóa kệ này?"
                    onClose={() => {
                        setShowModelConfirmDelete(false)
                        setShelfId('')
                    }}
                    loading={isLoadingDelete}
                    onConfirm={handleDeleteShelf}
                />
            }
            {
                showQRCode &&
                <ModelQRCodeShelf
                    ShelfId={shelfId}
                    onClosed={() => {
                        setShowQRCode(false)
                        setShelfId('')
                    }}
                />
            }
        </div>
    );
}


export default ShelfsPage;