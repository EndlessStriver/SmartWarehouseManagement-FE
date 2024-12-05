import { Button, CloseButton, Container, FormControl, FormGroup, FormLabel } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import { Form, useNavigate } from "react-router-dom";
import React from "react";
import UpdatePasswordUser from "../../../services/Profile/UpdatePasswordUser";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import ValidatePassword from "../../../util/Validate/ValidatePassword";

interface FormChangePasswordProps {
    closeModel: () => void;
}

const FormChangePassword: React.FC<FormChangePasswordProps> = (props) => {

    const navigate = useNavigate();
    const dispatch = useDispatchMessage();
    const [password, setPassword] = React.useState<string>('');
    const [newPassword, setNewPassword] = React.useState<string>('');
    const [confirmPassword, setConfirmPassword] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const checkPassword = ValidatePassword(password);
        const checkNewPassword = ValidatePassword(newPassword);

        if (newPassword !== confirmPassword) {
            dispatch({ message: 'Confirm password not match', type: ActionTypeEnum.ERROR });
            return;
        }

        if (checkPassword || checkNewPassword) {
            dispatch({ message: checkPassword || checkNewPassword, type: ActionTypeEnum.ERROR })
            return;
        }

        setIsLoading(true);
        UpdatePasswordUser({ oldPassword: password, password: newPassword }, navigate)
            .then(() => {
                dispatch({ message: 'Change password successfully', type: ActionTypeEnum.SUCCESS });
                props.closeModel();
            })
            .catch((error) => {
                dispatch({ message: error.message, type: ActionTypeEnum.ERROR });
            }).finally(() => {
                setIsLoading(false);
            })
    }

    return (
        <OverLay>
            <Container className="position-relative bg-light p-4 rounded" style={{ width: "550px" }}>
                <CloseButton
                    onClick={() => { props.closeModel() }}
                    className="position-absolute btn-close"
                    style={{ top: "20px", right: "20px", cursor: 'pointer' }}
                />
                <h2 className="text-center fw-bold">Change Password</h2>
                <Form onSubmit={handleSubmit}>
                    <FormGroup controlId="formNewPassword" className="mb-3">
                        <FormLabel>Password</FormLabel>
                        <FormControl
                            className='p-3'
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup controlId="formNewPassword" className="mb-3">
                        <FormLabel>New Password</FormLabel>
                        <FormControl
                            className='p-3'
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup controlId="formConfirmPassword" className="mb-3">
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl
                            className='p-3'
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <Button disabled={isLoading} variant="primary" type="submit" className="w-100 py-3 rounded" style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
                        {isLoading ? 'Loading...' : 'Change Password'}
                    </Button>
                </Form>
            </Container>
        </OverLay>
    );
}

export default FormChangePassword;