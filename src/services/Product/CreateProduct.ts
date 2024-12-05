import axios from "axios";
import DataTypeCreateProductAdmin from "../../interface/PageProduct/DataTypeCreateProductAdmin";
import { ResponseError } from "../../interface/ResponseError";
import { checkTokenExpired } from "../../util/DecodeJWT";
import { NavigateFunction } from "react-router-dom";

const CreateProduct = async (product: DataTypeCreateProductAdmin, navigate: NavigateFunction): Promise<void> => {
    try {
        const HOST = process.env.REACT_APP_HOST_BE;
        const token = localStorage.getItem('token');

        if (!token) {
            navigate("/login");
        } else if (checkTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            navigate("/session-expired");
        } else {
            const formData = new FormData();
            product.image.forEach((file) => {
                formData.append('image', file);
            });
            formData.append('name', product.name);
            formData.append("categoryId", product.categoryId);
            formData.append("description", product.description);
            formData.append("productCode", product.productCode);
            formData.append("supplierId", product.supplierId);
            formData.append("colorId", product.colorId);
            formData.append("sizeId", product.sizeId);
            formData.append("materialId", product.materialId);
            formData.append("brandId", product.brandId);
            formData.append("dimension", product.dimension);
            formData.append("weight", product.weight.toString());
            formData.append("unitName", product.unitName);
            formData.append("exportCriteria", product.exportCriteria);
            const response = await axios.post(`${HOST}/products`, formData, {
                headers: {
                    "content-type": "multipart/form-data",
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.data;
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('profile');
                window.location.href = "/session-expired";
            }
            const data = error.response.data as ResponseError;
            throw new Error(data.message || "An unexpected error occurred.");
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

export default CreateProduct;