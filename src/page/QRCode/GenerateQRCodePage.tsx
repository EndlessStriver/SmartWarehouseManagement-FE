import { QRCodeCanvas } from "qrcode.react";
import React from "react";
import { useReactToPrint } from "react-to-print";

const GenerateQRCodePage = () => {

    const contentRef = React.useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });
    const [qrCode, setQRCode] = React.useState<string>("");
    const [showModel, setShowModel] = React.useState<boolean>(false);

    return (
        <div>
            <div>
                <h1 className="h2 fw-bold">TẠO MÃ QR CODE</h1>
                <p className="h6">Bạn có thể tạo mã QR Code theo ý muốn của bạn ở đây</p>
            </div>
            <div className={"mb-4 d-flex flex-column justify-content-center align-items-center"}>
                <div className="d-flex justify-content-center">
                    <input
                        value={qrCode}
                        onChange={(e) => setQRCode(e.target.value)}
                        type="text"
                        className="form-control p-3"
                        placeholder="Nhập nội dung cần tạo QR Code"
                        style={{
                            width: "550px",
                        }}
                    />
                </div>
                {
                    qrCode && (
                        <div className="p-5 bg-light rounded d-flex flex-column justify-content-center position-relative" style={{ maxWidth: "350px" }}>
                            <div ref={contentRef}>
                                <QRCodeCanvas value={qrCode} size={256} />
                            </div>
                            <button className="btn btn-danger mt-3" onClick={() => reactToPrintFn()}>In Mã QR</button>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default GenerateQRCodePage;