import ProductHeader from "./ProductHeader";
import Supplier from "./Supplier";

interface SKU {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    skuCode: string;
    batchCode: string;
    weight: string;
    dimension: string;
    description: string;
}

export interface ReceiveItem {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    quantity: number;
    unit: string;
    product: ProductHeader;
    sku: SKU
}

interface StockEntry {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    receiveDate: string;
    receiveBy: string;
    status: string;
    description: string;
    receiveCode: string;
    supplier: Supplier;
    receiveItems: ReceiveItem[];
}

export default StockEntry;