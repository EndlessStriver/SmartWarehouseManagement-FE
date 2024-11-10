import { OverLay } from "../../OverLay/OverLay";

interface ModelCloseProps {
    closeModelLogout: () => void;
    handleLogout: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ModelClose: React.FC<ModelCloseProps> = ({ closeModelLogout, handleLogout }) => {
    return (
        <OverLay className="fullscreen">
            <div className="global-model">
                <h2 className="h2 text-center fw-bold">Đăng Xuất</h2>
                <p>Bạn có chắc chắn muốn đăng xuất?</p>
                <div className="model-buttons">
                    <button className="btn btn-secondary" onClick={closeModelLogout}>Hủy</button>
                    <button className="btn btn-danger" onClick={handleLogout}>Đăng Xuất</button>
                </div>
            </div>
        </OverLay>
    );
}