import React from "react";
import { OverLay } from "../../../compoments/OverLay/OverLay"
import { useDispatchMessage } from "../../../Context/ContextMessage";
import CreateShelf from "../../../services/Location/CreateShelf";
import ActionTypeEnum from "../../../enum/ActionTypeEnum";
import PaginationType from "../../../interface/Pagination";
import Shelf from "../../../interface/Entity/Shelf";
import GetShelfs from "../../../services/Location/GetShelfs";
import OptionType from "../../../interface/OptionType";
import Select from 'react-select';
import GetCategoriesByName from "../../../services/Attribute/Category/GetCategoriesByName";

interface ModelCreateShelfProps {
    onClose: () => void;
    updatePage: (page: PaginationType) => void;
    updateShelfList: (shlefs: Shelf[]) => void;
}

const ModelCreateShelf: React.FC<ModelCreateShelfProps> = (props) => {

    const dispatch = useDispatchMessage();
    const [shelfName, setShelfName] = React.useState('');
    const [maxColumn, setMaxColumn] = React.useState(0);
    const [maxLevel, setMaxLevel] = React.useState(0);
    const [typeShelf, setTypeShelf] = React.useState('');
    const [categories, setCategories] = React.useState<OptionType[]>([]);
    const [categoryName, setCategoryName] = React.useState('');
    const [categorySelect, setCategorySelect] = React.useState<OptionType | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const validateForm = () => {
        if (shelfName.trim() === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập tên kệ" });
            return false;
        }
        if (maxColumn <= 0 || maxLevel <= 0) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Số cột và số hàng phải lớn hơn 0" });
            return false;
        }
        if (typeShelf === "") {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập loại kệ" });
            return false;
        }
        if (!categorySelect) {
            dispatch({ type: ActionTypeEnum.ERROR, message: "Vui lòng nhập loại hàng" });
            return false;
        }
        return true;
    }

    const handleCreateShelf = () => {
        if (validateForm()) {
            setIsLoading(true);
            CreateShelf({
                name: shelfName,
                maxColumns: Number(maxColumn),
                maxLevels: Number(maxLevel),
                typeShelf: typeShelf,
                categoryId: categorySelect?.value || ''
            }).then(() => {
                return GetShelfs();
            }).then((response) => {
                if (response) {
                    props.updateShelfList(response.data);
                    props.updatePage({
                        limit: Number(response.limit),
                        offset: Number(response.offset),
                        totalPage: response.totalPage,
                        totalElementOfPage: response.totalElementOfPage
                    });
                    props.onClose();
                    dispatch({ type: ActionTypeEnum.SUCCESS, message: "Tạo kệ thành công" });
                }
            }).catch((error) => {
                dispatch({ type: ActionTypeEnum.ERROR, message: error.message });
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }

    React.useEffect(() => {
        const id = setTimeout(() => {
            GetCategoriesByName(categoryName)
                .then((response) => {
                    if (response) {
                        setCategories(response.map((cate) => {
                            return {
                                value: cate.id,
                                label: cate.name
                            }
                        }))
                    }
                }).catch((error) => {
                    dispatch({ type: ActionTypeEnum.ERROR, message: error.message })
                })
        }, 500)

        return () => clearTimeout(id)
    }, [dispatch, categoryName])

    return (
        <OverLay>
            <div className="d-flex justify-content-center align-items-center bg-white rounded" style={{ width: "600px" }}>
                <div className="d-flex flex-column gap-3 p-4 w-100">
                    <h2 className="h2 fw-bold">Tạo Mới Kệ</h2>
                    <div>
                        <label htmlFor="shelfName" className="form-label">Tên kệ</label>
                        <input
                            type="text" className="form-control p-3"
                            onChange={(e) => setShelfName(e.target.value)}
                            placeholder="Nhập tên kệ..."
                            value={shelfName}
                        />
                    </div>
                    <div>
                        <label htmlFor="maxColumn" className="form-label">Số cột</label>
                        <input
                            type="number" className="form-control p-3"
                            onChange={(e) => setMaxColumn(parseInt(e.target.value))}
                            placeholder="Nhập số cột..."
                            value={maxColumn}
                        />
                    </div>
                    <div>
                        <label htmlFor="maxLevel" className="form-label">Số tầng</label>
                        <input type="number" className="form-control p-3"
                            onChange={(e) => setMaxLevel(parseInt(e.target.value))}
                            placeholder="Nhập số tầng..."
                            value={maxLevel}
                        />
                    </div>
                    <div>
                        <label className="form-label">Loại hàng</label>
                        <Select
                            placeholder="Nhập loại sản phẩm..."
                            isClearable
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    padding: "0.5rem 0px",
                                }),
                            }}
                            onInputChange={setCategoryName}
                            onChange={(value) => setCategorySelect(value)}
                            options={categories}
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Loại kệ</label>
                        <select className="form-select p-3"
                            onChange={(e) => setTypeShelf(e.target.value)}
                            value={typeShelf}
                        >
                            <option value="">Chọn loại kệ...</option>
                            <option value="NORMAL">Bình Thường</option>
                            <option value="DAMAGED">Chứa Hàng Hư</option>
                        </select>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => props.onClose()}
                        >Hủy</button>
                        <button className="btn btn-primary"
                            onClick={() => handleCreateShelf()}
                            disabled={isLoading || shelfName === '' || maxColumn === 0 || maxLevel === 0 || typeShelf === ''}
                        >
                            {isLoading ? "Đang tạo..." : "Tạo"}
                        </button>
                    </div>
                </div>
            </div>
        </OverLay>
    )
}

export default ModelCreateShelf;