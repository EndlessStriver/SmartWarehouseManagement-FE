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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import ModelCreateShelf from "./Compoments/ModelCreateShelf";
import ModelConfirmDelete from "../../compoments/ModelConfirm/ModelConfirmDelete";
import DeleteShelf from "../../services/Location/DeleteShelf";
import './css/StorageManagementPage.css'

const LocationPage: React.FC = () => {

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

    React.useEffect(() => {
        setIsLoading(true)
        GetShelfs()
            .then((response) => {
                setShelfList(response.data)
                setPagination({
                    limit: Number(response.limit),
                    offset: Number(response.offset),
                    totalPage: response.totalPage,
                    totalElementOfPage: response.totalElementOfPage
                })
            }).catch((error) => {
                console.error(error)
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
            }).finally(() => {
                setIsLoading(false)
            })
    }, [dispatch])

    React.useEffect(() => {
        const id = setTimeout(() => {
            setIsLoading(true)
            GetShelfs({ offset: pagination.offset })
                .then((response) => {
                    setShelfList(response.data)
                    setPagination({
                        limit: Number(response.limit),
                        offset: Number(response.offset),
                        totalPage: response.totalPage,
                        totalElementOfPage: response.totalElementOfPage
                    })
                }).catch((error) => {
                    console.error(error)
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
                }).finally(() => {
                    setIsLoading(false)
                })
        }, 500)

        return () => clearTimeout(id)

    }, [dispatch, pagination.offset])

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
                setShelfList(res.data)
                setPagination({
                    limit: Number(res.limit),
                    offset: Number(res.offset),
                    totalPage: res.totalPage,
                    totalElementOfPage: res.totalElementOfPage
                })
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Delete shelf success" })
                setShelfId('')
                setShowModelConfirmDelete(false)
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
                <h4 className="fw-bold">{shelf.name}</h4>
                <h6>MaxColumns: {shelf.maxColumns}</h6>
                <h6>MaxRows: {shelf.maxLevels}</h6>
                <Badge bg={`${shelf.typeShelf === "NORMAL" ? "primary" : (shelf.typeShelf === "COOLER") ? "info" : "danger"}`}>
                    {shelf.typeShelf}
                </Badge>
                <div
                    onClick={() => {
                        setShelfId(shelf.id)
                        setShowShelfDetails(true)
                    }}
                >
                    <FontAwesomeIcon icon={faEye} />
                </div>
            </div>
        )
    })

    return (
        <div className={"position-relative h-100 w-100"}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className={"h2 fw-bold"}>Shelf Management</h2>
                    <p className={"h6"}>Manager your shelf here</p>
                </div>
                <div>
                    <Button onClick={() => {
                        setShowModelCreateShelf(true)
                    }} variant="info text-light fw-bold">+ NEW</Button>
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
                (shelfList.length > 0) ?
                    <Pagination
                        currentPage={pagination.offset}
                        totalPages={pagination?.totalPage}
                        onPageChange={handleChangePage}
                    />
                    :
                    (!isLoading && <NoData />) || null
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
                    message="Are you sure you want to delete this shelf?"
                    onClose={() => {
                        setShowModelConfirmDelete(false)
                        setShelfId('')
                    }}
                    loading={isLoadingDelete}
                    onConfirm={handleDeleteShelf}
                />
            }
        </div>
    );
}


export default LocationPage;