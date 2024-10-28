import { Button, Col, Container, Form, FormGroup, Row, Table } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faSearch } from "@fortawesome/free-solid-svg-icons";

interface FormEditExportProductProps {
    onClose: () => void;
}

const FormEditExportProduct: React.FC<FormEditExportProductProps> = (props) => {
    return (
        <OverLay className="disabled-padding bg-light p-4">
            <Container fluid className="h-100 w-100 position-relative shadow p-3 rounded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex flex-row align-items-center gap-2">
                        <button
                            onClick={() => {
                                props.onClose();
                            }}
                            className="btn fs-3 px-3 text-primary"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h2 className="fw-bold mb-0">
                            Tạo Phiếu Xuất Kho
                        </h2>
                    </div>
                    <div>
                        <Button
                            onClick={() => {

                            }}
                            variant="primary"
                            className="px-4"
                        >
                            Tạo
                        </Button>
                    </div>
                </div>
                <Row className={"p-3"}>
                    <FormGroup className="mb-3">
                        <Form.Label>Mã Phiếu Xuất Kho</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập mã phiếu xuất kho..."
                            className={"form-control py-3"}
                            disabled={true}
                        />
                    </FormGroup>
                    <Col>
                        <FormGroup>
                            <Form.Label>Nhân viên tạo</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên nhân viên..."
                                className={"form-control py-3"}
                                disabled={true}
                            />
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Form.Label>Ngày tạo</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                className={"form-control py-3"}
                            />
                        </FormGroup>
                    </Col>
                    <FormGroup className={"mt-3"}>
                        <Form.Label>Thông Tin Thêm</Form.Label>
                        <textarea
                            className={"form-control py-3"}
                            placeholder="Nhập thông tin thêm..."
                            rows={3}
                        />
                    </FormGroup>
                </Row>
                <Row className="px-3">
                    <Col>
                        <div className="d-flex flex-row justify-content-between align-items-center mb-2">
                            <h5 className="fw-semibold">Danh Sách Sản Phẩm</h5>
                            <div className="d-flex flex-row gap-2">
                                <Form.Control
                                    type="search"
                                    placeholder="Tìm kiếm sản phẩm..."
                                />
                                <button className="btn btn-primary">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </div>
                        </div>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mã Sản Phẩm</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Đơn Vị Tính</th>
                                    <th>Lượng Tồn Kho</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>SP001</td>
                                    <td>Sản Phẩm 1</td>
                                    <td>Chiếc</td>
                                    <td>10</td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            className="px-3"
                                        >
                                            Chọn
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                    <Col>
                        <h5 className="fw-semibold">Danh Sách Sản Phẩm Xuất Kho</h5>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mã Sản Phẩm</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Đơn Vị Tính</th>
                                    <th>Số Lượng</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>SP001</td>
                                    <td>Sản Phẩm 1</td>
                                    <td>Chiếc</td>
                                    <td>10</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            className="px-3"
                                        >
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        </OverLay>
    )
}

export default FormEditExportProduct;