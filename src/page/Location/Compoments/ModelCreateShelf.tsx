import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { useDispatchMessage } from "../../../Context/ContextMessage";
import CreateShelf from "../../../services/Location/CreateShelf";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import PaginationType from "../../../interface/Pagination";
import Shelf from "../../../interface/Entity/Shelf";
import GetShelfs from "../../../services/Location/GetShelfs";

interface ModelCreateShelfProps {
    onClose: () => void;
    updatePage: (page: PaginationType) => void;
    updateShelfList: (shlefs: Shelf[]) => void;
}

const ModelCreateShelf: React.FC<ModelCreateShelfProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [shelfName, setShelfName] = React.useState('');
    const [maxColumn, setMaxColumn] = React.useState(0);
    const [maxLevel, setMaxLevel] = React.useState(0);
    const [typeShelf, setTypeShelf] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const validateForm = () => {
        if (shelfName.trim() === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Shelf name is required" });
            return false;
        }
        if (maxColumn <= 0 || maxLevel <= 0) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Max column and max level must be greater than 0" });
            return false;
        }
        if (typeShelf === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Shelf type is required" });
            return false;
        }
        return true;
    }

    const handleCreateShelf = () => {
        if (validateForm()) {
            setIsLoading(true);
            CreateShelf({
                name: shelfName,
                maxColumns: Number(maxColumn),
                maxLevels: Number(maxLevel),
                typeShelf: typeShelf
            }).then(() => {
                return GetShelfs();
            }).then((response) => {
                props.updateShelfList(response.data);
                props.updatePage({
                    limit: Number(response.limit),
                    offset: Number(response.offset),
                    totalPage: response.totalPage,
                    totalElementOfPage: response.totalElementOfPage
                });
                props.onClose();
                dispatch({ type: ActionTypeEnum.SUCCESS, message: "Shelf created successfully" });
            }).catch((error) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }

    return (
        <OverLay>
            <div className="d-flex justify-content-center align-items-center bg-white rounded" style={{ width: "600px" }}>
                <div className="d-flex flex-column gap-3 p-4 w-100">
                    <h2 className="h2 fw-bold">Create Shelf</h2>
                    <div>
                        <label htmlFor="shelfName" className="form-label">Shelf Name</label>
                        <input
                            type="text" className="form-control p-3"
                            onChange={(e) => setShelfName(e.target.value)}
                            placeholder="Enter shelf name"
                        />
                    </div>
                    <div>
                        <label htmlFor="maxColumn" className="form-label">Max Column</label>
                        <input
                            type="number" className="form-control p-3"
                            onChange={(e) => setMaxColumn(parseInt(e.target.value))}
                            placeholder="Enter max column"
                        />
                    </div>
                    <div>
                        <label htmlFor="maxLevel" className="form-label">Max Level</label>
                        <input type="number" className="form-control p-3"
                            onChange={(e) => setMaxLevel(parseInt(e.target.value))}
                            placeholder="Enter max level"
                        />
                    </div>
                    <div>
                        <label htmlFor="typeShelf" className="form-label">Type Shelf</label>
                        <select className="form-select p-3"
                            onChange={(e) => setTypeShelf(e.target.value)}
                        >
                            <option value="">Choose a select...</option>
                            <option value="NORMAL">NORMAL</option>
                            <option value="COOLER">COOLER</option>
                            <option value="DAMAGED">DAMAGED</option>
                        </select>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => props.onClose()}
                        >Cancel</button>
                        <button className="btn btn-primary"
                            onClick={() => handleCreateShelf()}
                            disabled={isLoading || shelfName === '' || maxColumn === 0 || maxLevel === 0 || typeShelf === ''}
                        >
                            {
                                isLoading ? "Creating..." : "Create Shelf"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </OverLay>
    )
}

export default ModelCreateShelf;