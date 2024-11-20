import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import { useReactToPrint } from "react-to-print";
import { QRCodeCanvas } from "qrcode.react";
import { CloseButton } from "react-bootstrap";

interface ModelQRCodeLocationProps {
    locationId: string;
    onClosed: () => void;
}

const ModelQRCodeLocation: React.FC<ModelQRCodeLocationProps> = (props) => {

    const contentRef = React.useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    return (
        <OverLay>
            <div className="p-5 bg-light rounded d-flex flex-column justify-content-center position-relative" style={{ maxWidth: "350px" }}>
                <CloseButton onClick={() => props.onClosed()} className="position-absolute" style={{ top: "15px", right: "15px" }} />
                <div ref={contentRef}>
                    <QRCodeCanvas value={props.locationId + ".location"} size={256} />
                </div>
                <button className="btn btn-danger mt-3" onClick={() => reactToPrintFn()}>In Mã QR</button>
            </div>
        </OverLay>
    )
}

export default ModelQRCodeLocation;