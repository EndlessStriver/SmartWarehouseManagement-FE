import React from "react";
import "./ManagementUser.css";
import {OverLay} from "../../OverLay/OverLay";
import Select, {MultiValue, SingleValue} from "react-select";
import {User} from "../../../interface/User";

interface OptionType {
    value: string;
    label: string;
}

interface AddUserComponentProps {
    hideOverlay: () => void;
    userId?: number | null;
}

const AddUserComponent: React.FC<AddUserComponentProps> = ({hideOverlay, userId}) => {

    const optionsGroup: OptionType[] = [
        {value: "Admin", label: "Admin"},
        {value: "Staff", label: "Staff"},
        {value: "Customer", label: "Customer"},
    ];
    const [selectedOptionGroup, setSelectedOptionGroup] = React.useState<OptionType | null>(null);
    const handleSelectChangeGroup = (newValue: SingleValue<OptionType> | MultiValue<OptionType>) => {
        setSelectedOptionGroup(newValue as OptionType);
    };

    const optionsStatus: OptionType[] = [
        {value: "Active", label: "Active"},
        {value: "Disable", label: "Disable"},
    ];
    const [selectedOptionStatus, setSelectedOptionStatus] = React.useState<OptionType | null>(null);
    const handleSelectChangeStatus = (newValue: SingleValue<OptionType> | MultiValue<OptionType>) => {
        setSelectedOptionStatus(newValue as OptionType);
    };

    const handleSubmit = () => {
        if (userId) {
            console.log("Update user");
            return;
        }
        console.log("Add user");
    }

    return (
        <div className="add-user-modal">
            <button onClick={hideOverlay} className="add-user-modal-close">
                <i className="fas fa-times"></i>
            </button>
            <h2 className="add-user-modal-title">{userId ? "Update User" : "Add User"}</h2>
            <form className="add-user-modal-form">
                <div className="form-group">
                    <label htmlFor="username" className="form-group-label">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="form-group-input"
                        required
                        placeholder={"Enter Username"}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="fullname" className="form-group-label">Fullname</label>
                    <input
                        type="text"
                        id="fullname"
                        name="fullname"
                        className="form-group-input"
                        required
                        placeholder={"Enter your fullname"}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password" className="form-group-label">Group</label>
                    <Select
                        styles={{
                            control: (base) => ({
                                ...base,
                                width: "100%",
                                height: "45px",
                                borderRadius: "4px",
                                border: "1px solid #d1d1d1",
                                fontSize: "14px",
                            }),
                        }}
                        value={selectedOptionGroup as OptionType}
                        onChange={handleSelectChangeGroup}
                        options={optionsGroup}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password" className="form-group-label">Status</label>
                    <Select
                        styles={{
                            control: (base) => ({
                                ...base,
                                width: "100%",
                                height: "45px",
                                borderRadius: "4px",
                                border: "1px solid #d1d1d1",
                                fontSize: "14px",
                            }),
                        }}
                        value={selectedOptionStatus as OptionType}
                        onChange={handleSelectChangeStatus}
                        options={optionsStatus}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email" className="form-group-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-group-input"
                        required
                        placeholder={"Enter Email"}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone" className="form-group-label">Phone Number</label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        className="form-group-input"
                        required
                        placeholder={"Enter phone number"}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password"
                           className="form-group-label">{userId ? "New Password" : "Password"}</label>
                    <p className={"form-group-label-second"}>{userId ? "** Leave blank if you don't want to change password" : ""}</p>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-group-input"
                        required
                        placeholder={"Enter Password"}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password" className="form-group-label">Confirm Password</label>
                    <input
                        type="password"
                        id="confirm-password"
                        name="confirm-password"
                        className="form-group-input"
                        required
                        placeholder={"Confirm Password"}
                    />
                </div>
                <input
                    type="submit"
                    className="add-user-modal-submit"
                    onClick={handleSubmit}
                    value={userId ? "Update User" : "Add User"}
                />
            </form>
        </div>
    );
}

export const ManagementUser: React.FC = () => {

    const [users, setUsers] = React.useState<User[]>([
        {
            id: 1,
            username: "lecongkhanh124",
            fullName: "john_doe",
            group: "Admin",
            email: "john@example.com",
            phoneNumber: "0321547895",
            status: true,
        },
        {
            id: 2,
            username: "tadsabc123",
            fullName: "john_doe",
            group: "Staff",
            email: "abc@example.com",
            phoneNumber: "0321547895",
            status: true,
        },
    ]);
    const [showOverlay, setShowOverlay] = React.useState(false);
    const [userId, setUserId] = React.useState<number | null>(null);

    const handleShowOverlay = () => {
        setShowOverlay(true);
    }

    const handleHideOverlay = () => {
        setShowOverlay(false);
        setUserId(null);
    }

    const listUser = users.map((user, index) => {
            return (
                <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.fullName}</td>
                    <td>{user.group}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.status ? "Active" : "InActive"}</td>
                    <td>
                        <button
                            onClick={() => {
                                setUserId(user.id)
                                handleShowOverlay()
                            }}
                            className="edit-button"
                        >
                            Edit
                        </button>
                        <button className="delete-button">Delete</button>
                    </td>
                </tr>
            )
        }
    );

    return (
        <div className="container-right">
            <h2 className={"primary-label"}>User Account Management</h2>
            <p className={"primary-description"}>Manage user accounts and their status</p>
            <button onClick={handleShowOverlay} className="add-button">Add User</button>
            <table className="table id-column">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>FullName</th>
                    <th>Group</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {listUser}
                </tbody>
            </table>
            {showOverlay && (
                <OverLay>
                    <AddUserComponent hideOverlay={handleHideOverlay} userId={userId}/>
                </OverLay>
            )}
        </div>
    );
}