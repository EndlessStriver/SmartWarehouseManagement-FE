import SpinnerLoading from "../Loading/SpinnerLoading";
import { OverLay } from "../OverLay/OverLay";
import React from "react";

interface ModelConfirmProps {
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    loading: boolean;
    lable?: string;
}

const ModelConfirmDelete: React.FC<ModelConfirmProps> = ({ onConfirm, onClose, message, loading, lable }) => {
    return (
        <OverLay className="fullscreen">
            <div className="global-model">
                <h2 className="fw-bold text-center h2">{lable || "Xác Nhận Xóa"}</h2>
                <p>{message}</p>
                {
                    loading ?
                        <SpinnerLoading />
                        :
                        <div className="model-buttons">
                            <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
                            <button className="btn btn-danger" onClick={() => { onConfirm() }}>Xác nhận</button>
                        </div>
                }
            </div>
        </OverLay>
    )
}

export default ModelConfirmDelete;