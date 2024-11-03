import { QRCodeCanvas } from "qrcode.react";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import React from "react";
import { useReactToPrint } from "react-to-print";
import { CloseButton } from "react-bootstrap";

interface ModelGenerateQRCodeProps {
    valueQRCodeGenerate: string;
    onClose: () => void;
}

const ModelGenerateQRCode: React.FC<ModelGenerateQRCodeProps> = (props) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    return (
        <OverLay>
            <div className="p-5 bg-light rounded d-flex flex-column justify-content-center position-relative">
                <CloseButton onClick={() => props.onClose()} className="position-absolute" style={{ top: "15px", right: "15px" }} />
                <div ref={contentRef}>
                    <QRCodeCanvas value={props.valueQRCodeGenerate} size={256} />
                </div>
                <button className="btn btn-danger mt-3" onClick={() => reactToPrintFn()}>In Mã QR</button>
            </div>
        </OverLay>
    );
}

export default ModelGenerateQRCode;