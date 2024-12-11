import { OverLay } from "../../OverLay/OverLay";

interface ModelCloseProps {
    closeModelLogout: () => void;
    handleLogout: (e: React.MouseEvent<HTMLButtonElement>) => void;
    loadingLogout: boolean;
}

export const ModelClose: React.FC<ModelCloseProps> = ({ closeModelLogout, handleLogout, loadingLogout }) => {
    return (
        <OverLay className="fullscreen">
            <div className="global-model">
                <h2 className="h2 text-center fw-bold">Đăng Xuất</h2>
                <p>Bạn có chắc chắn muốn đăng xuất?</p>
                <div className="model-buttons">
                    <button disabled={loadingLogout} className="btn btn-secondary" onClick={closeModelLogout}>Hủy</button>
                    <button disabled={loadingLogout} className="btn btn-danger" onClick={handleLogout}>{loadingLogout ? "Đang xử lý..." : "Đăng xuất"}</button>
                </div>
            </div>
        </OverLay>
    );
}