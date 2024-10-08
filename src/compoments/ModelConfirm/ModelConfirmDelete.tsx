import SpinnerLoading from "../Loading/SpinnerLoading";
import {OverLay} from "../OverLay/OverLay";
import React from "react";

interface ModelConfirmProps {
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    loading: boolean;
}

const ModelConfirmDelete: React.FC<ModelConfirmProps> = ({onConfirm, onClose, message, loading}) => {
    return (
        <OverLay className="fullscreen">
            <div className="global-model">
                <h2 className="fw-bold text-center h2">Confirm Delete</h2>
                <p>{message}</p>
                {
                    loading ?
                        <SpinnerLoading />
                        :
                        <div className="model-buttons">
                            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => { onConfirm() }}>Delete</button>
                        </div>
                }
            </div>
        </OverLay>
    )
}

export default ModelConfirmDelete;