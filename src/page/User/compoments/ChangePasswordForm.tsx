import React, { useState } from 'react';
import { Form, Button, Container, CloseButton } from 'react-bootstrap';
import ValidatePassword from '../../../util/Validate/ValidatePassword';
import UpdateAccountAPI from '../../../services/User/UpdateAccountAPI';
import { OverLay } from '../../../compoments/OverLay/OverLay';
import { useDispatchMessage } from '../../../Context/ContextMessage';
import ActionTypeEnum from '../../../enum/ActionTypeEnum';
import { useNavigate } from 'react-router-dom';

interface ChangePasswordFormProps {
  userId: string;
  hideOver: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ userId, hideOver }) => {

  const navigate = useNavigate();
  const dispatch = useDispatchMessage();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const checkPassword = ValidatePassword(newPassword);
    if (checkPassword) dispatch({ type: ActionTypeEnum.ERROR, message: checkPassword })
    if (newPassword !== confirmPassword) {
      dispatch({ type: ActionTypeEnum.ERROR, message: 'Password and confirm password do not match!' });
    } else if (ValidatePassword(newPassword)) {
      dispatch({ type: ActionTypeEnum.ERROR, message: ValidatePassword(newPassword) });
    } else {
      setIsLoading(true);
      UpdateAccountAPI(userId, { password: newPassword }, navigate)
        .then(() => {
          dispatch({ type: ActionTypeEnum.SUCCESS, message: 'Change password successfully!' });
          hideOver();
        }).catch((error) => {
          dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
        }).finally(() => {
          setNewPassword('');
          setConfirmPassword('');
          setIsLoading(false);
        });
    }
  };

  return (
    <OverLay>
      <Container className="position-relative bg-light p-4 rounded" style={{ width: "550px" }}>
        <CloseButton
          onClick={() => { hideOver() }}
          className="position-absolute btn-close"
          style={{ top: "20px", right: "20px", cursor: 'pointer' }}
        />
        <h2 className="text-center fw-bold">Change Password</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formNewPassword" className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              className='p-3'
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formConfirmPassword" className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              className='p-3'
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button disabled={isLoading} variant="primary" type="submit" className="w-100 py-3 rounded" style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
            {isLoading ? 'Loading...' : 'Change Password'}
          </Button>
        </Form>
      </Container>
    </OverLay>
  );
};

export default ChangePasswordForm;
