import { CloseButton } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";

interface ViewReceiveCheckProps {
    onClose: () => void;
    stockEntryId: string;
}

const ViewReceiveCheck: React.FC<ViewReceiveCheckProps> = (props) => {
    console.log(props.stockEntryId);
    return (
        <OverLay>
            <div className="position-relative bg-light rounded p-4" style={{ width: "700px" }}>
                <CloseButton
                    onClick={() => props.onClose()}
                    className="position-absolute"
                    style={{ top: "15px", right: "15px" }}
                />
                <h1 className="text-center fw-semibold">Receive Check</h1>
            </div>
        </OverLay>
    );
}

export default ViewReceiveCheck;