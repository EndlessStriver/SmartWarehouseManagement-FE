import React from "react";
import PaginationType from "../../../interface/Pagination";
import Supplier from "../../../interface/Entity/Supplier";
import DeleteSupplierById from "../../../services/Supplier/DeleteSupplierById";
import GetSuppliers from "../../../services/Supplier/GetSuppliers";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import SpinnerLoading from "../../../compoments/Loading/SpinnerLoading";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";

interface ModelConfirmDeleteSupplierProps {
    supplierId: string;
    closeModelConfirmDelete: () => void;
    updateSuppliers: (data: Supplier[]) => void;
    updatePagination: (response: PaginationType) => void;
}

const ModelConfirmDeleteSupplier: React.FC<ModelConfirmDeleteSupplierProps> = ({ closeModelConfirmDelete, supplierId, updatePagination, updateSuppliers }) => {

    const dispatch = useDispatchMessage();
    const [isLoading, setIsLoading] = React.useState(false);

    const handelDeleteSupplier = () => {
        setIsLoading(true);
        DeleteSupplierById(supplierId)
            .then(() => {
                return GetSuppliers();
            }).then((response) => {
                if (response) {
                    updateSuppliers(response.data);
                    updatePagination({
                        totalPage: response.totalPage,
                        limit: response.limit,
                        offset: response.offset,
                        totalElementOfPage: response.totalElementOfPage
                    });
                    closeModelConfirmDelete();
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Delete supplier successfully" });
                }
            }).catch((error) => {
                console.error(error);
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            }).finally(() => {
                setIsLoading(false);
            })
    }

    return (
        <OverLay className="fullscreen">
            <div className="global-model">
                <h2 className="h2 fw-bold">Confirm Delete</h2>
                <p>Are you sure you want to delete this supplier?</p>
                {
                    isLoading ?
                        <SpinnerLoading />
                        :
                        <div className="model-buttons">
                            <button className="btn btn-secondary" onClick={closeModelConfirmDelete}>Cancel</button>
                            <button className="btn btn-danger" onClick={handelDeleteSupplier}>Delete</button>
                        </div>
                }
            </div>
        </OverLay>
    );
}

export default ModelConfirmDeleteSupplier;