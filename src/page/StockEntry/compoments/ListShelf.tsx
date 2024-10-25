import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay"
import Shelf from "../../../interface/Entity/Shelf";
import PaginationType from "../../../interface/Pagination";
import GetShelfs from "../../../services/Location/GetShelfs";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Badge, CloseButton } from "react-bootstrap";
import Pagination from "../../../compoments/Pagination/Pagination";
import ListLocation from "./ListLocation";

interface ListShelfProps {
    onClose: () => void
    currentIndex: number;
    handleSetLocation: (nameLocation: string, locationId: string, index: number) => void;
}

const ListShelf: React.FC<ListShelfProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [shelfId, setShelfId] = React.useState<string>("");
    const [shelfs, setShelfs] = React.useState<Shelf[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [showListLocation, setShowListLocation] = React.useState<boolean>(false);
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
    }, [dispatch])

    React.useEffect(() => {
        const id = setTimeout(() => {
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

        return () => clearTimeout(id)
    }, [dispatch, pagination.offset])

    const renderShelfs = () => {
        return shelfs.map((shelf: Shelf, index: number) => {
            return (
                <div
                    onClick={() => {
                        setShowListLocation(true)
                        setShelfId(shelf.id)
                    }}
                    className="d-flex gap-1 flex-column justify-content-center align-items-center shadow btn btn-light position-relative"
                    key={index}
                    style={{ height: "250px" }}
                >
                    <h4 className="fw-bold">{shelf.name}</h4>
                    <h6>MaxColumns: {shelf.maxColumns}</h6>
                    <h6>MaxRows: {shelf.maxLevels}</h6>
                    <Badge bg={`${shelf.typeShelf === "NORMAL" ? "primary" : (shelf.typeShelf === "COOLER") ? "info" : "danger"}`}>
                        {shelf.typeShelf}
                    </Badge>
                    <FontAwesomeIcon icon={faEye} />
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
            <div>
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
                {
                    shelfs.length > 0 &&
                    <Pagination
                        currentPage={pagination.offset}
                        totalPages={pagination.totalPage}
                        onPageChange={handleChangePage}
                    />
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
                    currentIndex={props.currentIndex}
                    handleSetLocation={props.handleSetLocation}
                />
            }
        </OverLay>
    )
}

export default ListShelf