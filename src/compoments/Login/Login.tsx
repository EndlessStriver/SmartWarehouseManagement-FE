import React from "react";
import { useNavigate } from "react-router-dom";
import LoginAPI from "../../services/Authen/LoginAPI";
import GetProfileByTokenAPI from "../../services/User/GetProfileByTokenAPI";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { checkTokenExpired } from "../../util/DecodeJWT";

interface formDataType {
    username: string;
    password: string;
}

interface ErrorsType {
    username: string;
    password: string;
}

const Login: React.FC = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = React.useState<formDataType>({
        username: "",
        password: ""
    });
    const [globalError, setGlobalError] = React.useState<string>("");
    const [errors, setErrors] = React.useState<ErrorsType>({
        username: "",
        password: ""
    });
    const [loading, setLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            if (checkTokenExpired(token)) {
                localStorage.removeItem("token");
                localStorage.removeItem("profile");
                navigate("/session-expired");
            } else {
                navigate("/");
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalError("");
        setErrors({
            ...errors,
            [e.target.name]: ""
        });
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        LoginAPI(formData)
            .then((responseLogin) => {
                const token = responseLogin.token;
                localStorage.setItem("token", token);
                return GetProfileByTokenAPI(token, navigate);
            }).then((responseGetProfile) => {
                localStorage.setItem("profile", JSON.stringify(responseGetProfile));
                navigate("/");
                return
            }).catch((error) => {
                setGlobalError("Tài khoản hoặc mật khẩu không chính xác");
            }).finally(() => {
                setLoading(false);
            });
    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Row>
                <Col style={{ width: "550px" }}>
                    <div className="login-box shadow-lg p-4 rounded bg-white">
                        <h2 className="text-center mb-4 fw-bold">Đăng Nhập</h2>
                        {globalError && <p className="text-danger text-center">{globalError}</p>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên tài khoản</Form.Label>
                                <Form.Control
                                    className="py-3"
                                    type="text"
                                    placeholder="Nhập tên tài khoản..."
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.username}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.username}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Mật khẩu</Form.Label>
                                <Form.Control
                                    className="py-3"
                                    type="password"
                                    placeholder="Nhập mật khẩu..."
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.password}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.password}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Button
                                variant="primary"
                                className="w-100 py-3 fw-bold"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;