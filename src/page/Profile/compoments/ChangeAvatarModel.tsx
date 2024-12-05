import { Button, CloseButton, FormControl, Image } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import React from "react";
import UpdateAvatarUser from "../../../services/Profile/UpdateAvatarUser";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import { useNavigate } from "react-router-dom";

interface ChangeAvatarModelProps {
    onClose: () => void;
    avatar: string;
}

const ChangeAvatarModel: React.FC<ChangeAvatarModelProps> = (props) => {

    const navigate = useNavigate();
    const dispatch = useDispatchMessage();
    const fileRef = React.useRef<HTMLInputElement>(null);
    const [file, setFile] = React.useState<File | null>(null);
    const [filePreview, setFilePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    const handleChangeAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    }

    const handOnSave = () => {
        setLoading(true);
        UpdateAvatarUser(file as File, navigate)
            .then(() => {
                dispatch({ message: "Update avatar successfully", type: ActionTypeEnum.SUCCESS });
                props.onClose();
            })
            .catch((error) => {
                dispatch({ message: error.message, type: ActionTypeEnum.ERROR });
            }).finally(() => {
                setLoading(false);
            });
    }

    return (
        <OverLay>
            <div className="position-relative d-flex flex-column align-items-center gap-3 bg-white rounded p-4" style={{ width: "400px" }}>
                <span className="h2 fw-semibold">My Avatar</span>
                <div>
                    <Image
                        src={filePreview || props.avatar || "/images/default-avt.png"}
                        roundedCircle
                        width={150}
                        height={150}
                        className="object-fit-cover"
                    />
                    <FormControl
                        ref={fileRef}
                        type="file"
                        className="mt-3 d-none"
                        onChange={handleChangeAvatar}
                    />
                </div>
                {
                    !file ? (
                        <Button
                            onClick={() => fileRef.current?.click()}
                            variant="primary"
                            className="mt-3"
                        >
                            + Upload new photo
                        </Button>
                    ) : (
                        <div className="d-flex gap-3 mt-3">
                            <Button
                                onClick={handOnSave}
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save"}
                            </Button>
                            <Button
                                onClick={() => {
                                    setFile(null);
                                    setFilePreview(null);
                                }}
                                variant="secondary"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>
                    )
                }
                <CloseButton
                    onClick={props.onClose}
                    className="position-absolute"
                    style={{ top: "15px", right: "15px" }}
                    disabled={loading}
                />
            </div>
        </OverLay>
    )
}

export default ChangeAvatarModel;