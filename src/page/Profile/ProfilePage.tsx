import React from "react";
import { Col, FloatingLabel, FormControl, FormSelect, Image, Row } from "react-bootstrap";
import { Profile } from "../../interface/Profile";
import GetProfileByTokenAPI from "../../services/User/GetProfileByTokenAPI";
import { useDispatchMessage } from "../../Context/ContextMessage";
import ActionTypeEnum from "../../enum/ActionTypeEnum";
import FormChangePassword from "./compoments/FormChangePassword";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import UpdateProfileUser from "../../services/Profile/UpdateProfileUser";
import SpinnerLoadingOverLayer from "../../compoments/Loading/SpinnerLoadingOverLay";
import ChangeAvatarModel from "./compoments/ChangeAvatarModel";

interface FormDataType extends Omit<Profile, 'role'> {
    role: string;
}

const ProfilePage: React.FC = () => {
    const dispatch = useDispatchMessage();
    const [profileDefault, setProfileDefault] = React.useState<FormDataType>({
        id: "",
        create_at: "",
        update_at: "",
        isDeleted: false,
        username: "",
        fullName: "",
        email: "",
        address: "",
        avatar: "",
        dateOfBirth: "",
        gender: "",
        phoneNumber: "",
        position: "",
        status: false,
        role: "",
    });
    const [profile, setProfile] = React.useState<FormDataType>({
        id: "",
        create_at: "",
        update_at: "",
        isDeleted: false,
        username: "",
        fullName: "",
        email: "",
        address: "",
        avatar: "",
        dateOfBirth: "",
        gender: "",
        phoneNumber: "",
        position: "",
        status: false,
        role: "",
    });
    const [showChangePassword, setShowChangePassword] = React.useState(false);
    const [showEditProfile, setShowEditProfile] = React.useState(false);
    const [showEditAvatar, setShowEditAvatar] = React.useState(false);
    const [loading, setloading] = React.useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            GetProfileByTokenAPI(token)
                .then((responseProfile) => {
                    setProfile({
                        ...responseProfile,
                        role: responseProfile.role.name
                    });
                    setProfileDefault({
                        ...responseProfile,
                        role: responseProfile.role.name
                    });
                    localStorage.setItem("profile", JSON.stringify(responseProfile));
                })
                .catch((error) => {
                    dispatch({ message: error.message, type: ActionTypeEnum.ERROR });
                })
        } else {
            dispatch({ message: "Token not found", type: ActionTypeEnum.ERROR });
        }
    }, [dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const checkDataChange = () => {
        if (profileDefault.fullName !== profile.fullName) return true;
        if (profileDefault.dateOfBirth !== profile.dateOfBirth) return true;
        if (profileDefault.gender !== profile.gender) return true;
        if (profileDefault.email !== profile.email) return true;
        if (profileDefault.phoneNumber !== profile.phoneNumber) return true;
        if (profileDefault.address !== profile.address) return true;

        return false;
    }

    const handleSubmit = () => {

        const dataUpdate: {
            fullName?: string;
            dateOfBirth?: string;
            gender?: string;
            email?: string;
            phoneNumber?: string;
            address?: string;
        } = {
            fullName: profile?.fullName,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            address: profile.address,
        };

        if (profileDefault?.fullName === profile?.fullName) delete dataUpdate.fullName;
        if (profileDefault?.dateOfBirth === profile?.dateOfBirth) delete dataUpdate.dateOfBirth;
        if (profileDefault?.gender === profile?.gender) delete dataUpdate.gender;
        if (profileDefault?.email === profile?.email) delete dataUpdate.email;
        if (profileDefault?.phoneNumber === profile?.phoneNumber) delete dataUpdate.phoneNumber;
        if (profileDefault?.address === profile?.address) delete dataUpdate.address;

        setloading(true);
        UpdateProfileUser(dataUpdate)
            .then((responseProfile) => {
                if (responseProfile) {
                    setProfile({
                        ...responseProfile,
                        role: responseProfile.role.name
                    });
                    setProfileDefault({
                        ...responseProfile,
                        role: responseProfile.role.name
                    });
                    localStorage.setItem("profile", JSON.stringify(responseProfile));
                    dispatch({ message: "Update profile successfully!", type: ActionTypeEnum.SUCCESS });
                }
            }).catch((error) => {
                dispatch({ message: error.message, type: ActionTypeEnum.ERROR });
            }).finally(() => {
                setloading(false);
            });
    }

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="bg-white rounded shadow p-4" style={{ width: "1000px", minHeight: "500px" }}>
                <div className="d-flex flex-row justify-content-between border-bottom p-3">
                    <div className="d-flex flex-row justify-content-start align-items-center gap-4">
                        <div className="position-relative">
                            <Image
                                src={profile?.avatar || "/images/default-avt.png"}
                                roundedCircle
                                width={100}
                                height={100}
                                className="object-fit-cover"
                            />
                            <div className="position-absolute bottom-0 end-0">
                                <button
                                    onClick={() => setShowEditAvatar(true)}
                                    className="btn btn-light btn-sm shadow-sm rounded-circle d-flex align-items-center justify-content-center text-primary"
                                    style={{ width: "35px", height: "35px" }}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                            </div>
                        </div>
                        <div className="d-flex flex-column">
                            <span className="fw-bold h5">{profile?.fullName}</span>
                            <span>{profile?.position}</span>
                            <span>{profile?.role}</span>
                        </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                        {
                            !showEditProfile ? (
                                <button
                                    onClick={() => setShowEditProfile(true)}
                                    className="btn btn-danger"
                                >
                                    <FontAwesomeIcon icon={faEdit} /> Edit
                                </button>
                            ) : (
                                <div className="d-flex flex-row gap-2">
                                    <button
                                        onClick={() => handleSubmit()}
                                        className="btn btn-primary"
                                        disabled={checkDataChange() === false}
                                    >
                                        <FontAwesomeIcon icon={faEdit} /> Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setProfile({ ...profileDefault });
                                            setShowEditProfile(false);
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )
                        }
                        <button
                            className="btn btn-link"
                            onClick={() => setShowChangePassword(true)}
                        >
                            Change Password
                        </button>
                    </div>
                </div>
                <div className="d-flex flex-column justify-content-center p-3">
                    <FloatingLabel
                        label="Username"
                        className="mb-3"
                    >
                        <FormControl type="text" value={profile?.username} readOnly />
                    </FloatingLabel>
                    <FloatingLabel
                        label="FullName"
                        className="mb-3"
                    >
                        <FormControl
                            type="text"
                            value={profile?.fullName}
                            disabled={!showEditProfile}
                            name="fullName"
                            onChange={handleChange}
                        />
                    </FloatingLabel>
                    <div>
                        <Row>
                            <Col>
                                <FloatingLabel
                                    label="Birthday"
                                    className="mb-3"
                                >
                                    <FormControl
                                        type="date"
                                        value={profile?.dateOfBirth}
                                        disabled={!showEditProfile}
                                        name="dateOfBirth"
                                        onChange={handleChange}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col>
                                <FloatingLabel
                                    label="Gender"
                                >
                                    <FormSelect
                                        value={profile?.gender}
                                        disabled={!showEditProfile}
                                        name="gender"
                                        onChange={handleChange}
                                    >
                                        <option>-- Select a gender --</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Others">Others</option>
                                    </FormSelect>
                                </FloatingLabel>
                            </Col>
                        </Row>
                    </div>
                    <div>
                        <Row>
                            <Col>
                                <FloatingLabel
                                    label="Email"
                                    className="mb-3"
                                >
                                    <FormControl
                                        type="email"
                                        value={profile?.email}
                                        disabled={!showEditProfile}
                                        name="email"
                                        onChange={handleChange}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col>
                                <FloatingLabel
                                    label="PhoneNumber"
                                    className="mb-3"
                                >
                                    <FormControl
                                        type="phone"
                                        value={profile?.phoneNumber}
                                        disabled={!showEditProfile}
                                        name="phoneNumber"
                                        onChange={handleChange}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                    </div>
                    <FloatingLabel
                        label="Address"
                        className="mb-3"
                    >
                        <FormControl
                            type="text"
                            value={profile?.address}
                            disabled={!showEditProfile}
                            name="address"
                            onChange={handleChange}
                        />
                    </FloatingLabel>
                </div>
            </div>
            {
                showChangePassword && <FormChangePassword closeModel={() => setShowChangePassword(false)} />
            }
            {
                loading && <SpinnerLoadingOverLayer />
            }
            {
                showEditAvatar && <ChangeAvatarModel onClose={() => setShowEditAvatar(false)} avatar={profile.avatar} />
            }
        </div>
    )
}

export default ProfilePage;