import { Button, CloseButton, Table } from "react-bootstrap"
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { useDispatchMessage } from "../../../Context/ContextMessage"
import GetProfile from "../../../util/GetProfile"
import React from "react"
import ViewStockEntry from "./ViewStockEntry"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye } from "@fortawesome/free-solid-svg-icons"
import ListProductStockEntry from "./ListProductStockEntry"
import ModelConfirmDelete from "../../../compoments/ModelConfirm/ModelConfirmDelete"

interface HandleStockEntryPageProps {
    onClose: () => void
    stockEntryId: string
}

const HandleStockEntryPage: React.FC<HandleStockEntryPageProps> = (props) => {

    const dispatch = useDispatchMessage();
    const profile = GetProfile();
    const [showViewStockEntry, setShowViewStockEntry] = React.useState<boolean>(false);
    const [showListProductStockEntry, setShowListProductStockEntry] = React.useState<boolean>(false);
    const [createDate, setCreateDate] = React.useState<string>("");

    React.useEffect(() => {
        const now = new Date();
        now.setHours(now.getHours() + 7);
        const formattedDate = now.toISOString().slice(0, 16);
        setCreateDate(formattedDate);
    }, []);

    return (
        <OverLay className="disabled-padding">
            <div className="w-100 h-100 bg-light p-5">
                <CloseButton
                    className="position-fixed"
                    style={{ top: "15px", right: "15px" }}
                    onClick={props.onClose}
                />
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="fw-bold">Handle Stock Entry</h2>
                    <Button variant="success" className="text-light fw-bold" onClick={() => setShowViewStockEntry(true)}>
                        <FontAwesomeIcon icon={faEye} /> Stock Entry
                    </Button>
                </div>
                <div className="d-flex flex-row gap-3 w-100 mb-3">
                    <div className="w-100">
                        <label>Goods Inspector</label>
                        <input
                            type="text"
                            className="form-control p-3"
                            placeholder="Enter goods inspector"
                            value={profile?.fullName}
                            readOnly
                            disabled
                        />
                    </div>
                    <div className="w-100">
                        <label>Create Date</label>
                        <input
                            type="datetime-local"
                            className="form-control p-3"
                            value={createDate}
                            onChange={(e) => setCreateDate(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <div className="d-flex flex-row justify-content-end align-items-center p-2">
                        <Button onClick={() => {
                            setShowListProductStockEntry(true);
                        }} variant="primary" className="text-light fw-bold">Add Item Check</Button>
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Product Status</th>
                                <th>Location</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </Table>
                </div>
            </div>
            {
                showViewStockEntry &&
                <ViewStockEntry
                    stockEntryId={props.stockEntryId}
                    onClose={() => {
                        setShowViewStockEntry(false);
                    }}
                />
            }
            {
                showListProductStockEntry &&
                <ListProductStockEntry
                    onClose={() => {
                        setShowListProductStockEntry(false);
                    }}
                    stockEntryId={props.stockEntryId}
                />
            }
        </OverLay>
    )
}

export default HandleStockEntryPage