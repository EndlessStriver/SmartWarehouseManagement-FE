import { Button, Col, Container, Form, FormGroup, Row, Table } from "react-bootstrap";
import { OverLay } from "../../../compoments/OverLay/OverLay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronLeft, faRotateLeft, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import GetProfile from "../../../util/GetProfile";
import React from "react";
import Shelf from "../../../interface/Entity/Shelf";
import GetShelfByNameAndCategoryName from "../../../services/Location/GetShelfsByNameAndCategoryName";
import Pagination from "../../../compoments/Pagination/Pagination";
import CreateIventory from "../../../services/StockEntry/CreateIventory";
import { useDispatchMessage } from "../../../Context/ContextMessage";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";

interface FormEditIventoryProps {
    onClose: () => void;
    reload: () => void;
}

const FormEditIventory: React.FC<FormEditIventoryProps> = (props) => {

    const profile = GetProfile();
    const dispatch = useDispatchMessage();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [note, setNote] = React.useState<string>("");
    const [keySearch, setKeySearch] = React.useState<string>("");
    const [shelfSelect, setShelfSelect] = React.useState<{ lable: string; value: string }[]>([]);
    const [shelfs, setShelfs] = React.useState<Shelf[]>([]);
    const [pagination, setPagination] = React.useState({ limit: 10, offset: 1, totalPage: 1 });

    React.useEffect(() => {
        console.log("useEffect");
        const id = setTimeout(() => {
            GetShelfByNameAndCategoryName({ keySearch, offset: pagination.offset })
                .then((res) => {
                    if (res) {
                        setShelfs(res.data);
                        setPagination({ limit: res.limit, offset: res.offset, totalPage: res.totalPage });
                    }
                })
                .catch(console.error);
        }, 500);
        return () => clearTimeout(id);
    }, [keySearch, pagination.offset]);

    const removeShelfSelect = (id: string) => {
        setShelfSelect(shelfSelect.filter((item) => item.value !== id));
    }

    const handleSubmit = () => {
        setLoading(true);
        CreateIventory({
            note: note,
            shelfInventory: shelfSelect.map((item) => {
                return { shelfId: item.value }
            })
        })
            .then(() => {
                dispatch({ message: "Tạo phiếu kiểm kê thành công", type: ActionTypeEnum.SUCCESS });
                props.onClose();
                props.reload();
            })
            .catch((err) => {
                dispatch({ message: err.message, type: ActionTypeEnum.ERROR });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <OverLay className="disabled-padding bg-light p-4">
            <Container fluid className="h-100 w-100 position-relative shadow p-3 rounded">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex flex-row align-items-center gap-3">
                        <button onClick={() => props.onClose()} className="btn fs-3 px-3 text-primary">
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <h2 className="fw-bold mb-0">Tạo Phiếu Kiểm Kê</h2>
                    </div>
                    <Button
                        disabled={loading}
                        onClick={handleSubmit}
                        variant="primary"
                        className="px-4"
                    >
                        {loading ? "Đang tạo..." : "Tạo"}
                    </Button>
                </div>
                <Row className="p-3">
                    <Col>
                        <FormGroup className="mb-3">
                            <Form.Label className="fw-semibold">Người Tạo</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên người tạo"
                                className="form-control py-3 rounded-3"
                                disabled
                                value={profile?.fullName || ""}
                            />
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup className="mb-3">
                            <Form.Label className="fw-semibold">Ngày tạo</Form.Label>
                            <Form.Control
                                type="date"
                                value={new Date().toISOString().split("T")[0]}
                                className="form-control py-3 rounded-3"
                                disabled
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <FormGroup className="mb-4 px-3">
                    <Form.Label className="fw-semibold">Thông Tin Thêm</Form.Label>
                    <textarea
                        className="form-control py-3 rounded-3"
                        placeholder="Nhập thông tin thêm..."
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </FormGroup>
                <Row className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-semibold text-secondary">Danh Sách Kệ Cần Kiểm Kê</h4>
                        <div className="d-flex align-items-center gap-2">
                            <div className="position-relative" style={{ width: "250px" }}>
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="position-absolute top-50 translate-middle-y ms-2 text-muted"
                                />
                                <input
                                    type="search"
                                    placeholder="Tìm kiếm kệ..."
                                    className="form-control ps-5 rounded-3"
                                    value={keySearch}
                                    onChange={(e) => setKeySearch(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-outline-secondary">
                                <FontAwesomeIcon icon={faRotateLeft} />
                            </button>
                        </div>
                    </div>
                    {shelfSelect.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {shelfSelect.map((shelf, index) => (
                                <div key={index} className="badge bg-primary text-light px-3 py-2 rounded-pill fs-6">
                                    {shelf.lable}
                                    <button className="btn btn-close fs-6 ms-3" onClick={() => removeShelfSelect(shelf.value)} ></button>
                                </div>
                            ))}

                        </div>
                    )}
                    <Table striped bordered hover>
                        <thead className="table-primary">
                            <tr>
                                <th>#</th>
                                <th>Tên Kệ</th>
                                <th>Loại Kệ</th>
                                <th>Loại Hàng</th>
                                <th>Chức Năng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shelfs.map((shelf, index) => (
                                <tr key={shelf.id}>
                                    <td>{index + 1}</td>
                                    <td>{shelf.name}</td>
                                    <td>{shelf.typeShelf !== "DAMAGED" ? "Kệ Thường" : "Kệ Chứa Hàng Lỗi"}</td>
                                    <td>{shelf.category.name}</td>
                                    <td>
                                        {shelfSelect.some((item) => item.value === shelf.id) ? (
                                            <Button
                                                onClick={() =>
                                                    setShelfSelect(shelfSelect.filter((item) => item.value !== shelf.id))
                                                }
                                                variant="danger"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        ) : (
                                            <Button
                                                style={{ cursor: (Number(shelf.currentCapacity) <= 0 || Number(shelf.currentWeight) <= 0) ? "not-allowed" : "pointer" }}
                                                disabled={Number(shelf.currentCapacity) <= 0 || Number(shelf.currentWeight) <= 0}
                                                onClick={() =>
                                                    setShelfSelect([...shelfSelect, { lable: shelf.name, value: shelf.id }])
                                                }
                                                variant="primary"
                                            >
                                                <FontAwesomeIcon icon={faCheck} />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {shelfs.length > 0 && (
                        <Pagination
                            currentPage={pagination.offset}
                            onPageChange={(page) => setPagination({ ...pagination, offset: page })}
                            totalPages={pagination.totalPage}
                        />
                    )}
                </Row>
            </Container>
        </OverLay>
    );
};

export default FormEditIventory;
