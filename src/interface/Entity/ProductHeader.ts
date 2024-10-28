import Category from "./Category";

export default interface ProductHeader {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    unit: string;
    description: string;
    productCode: string;
    img: string;
    category: Category;
}