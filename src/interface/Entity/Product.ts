export interface Product {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    productCode: string;
    img: string;
    export_criteria: string;
    category: Category;
    productDetails: ProductDetail[];
    units: Unit[];
}

interface Category {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    categoryCode: string;
}

interface ProductDetail {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    quantity: number;
    images: Image[];
    sku: SKU[];
}

interface Image {
    url: string;
    publicId: string;
    isDeleted: boolean;
}

export interface SKU {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    skuCode: string;
    batchCode: string;
    weight: string;
    dimension: string;
    description: string;
    supplier: Supplier;
    brand: Brand;
    color: Color;
    material: Material;
    size: Size;
}

interface Supplier {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    supplierCode: string;
    contactPerson: string;
    location: string;
    status: boolean;
    notes: string;
    website: string;
    taxId: string;
    isActive: boolean;
}

interface Brand {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    brandCode: string;
}

interface Color {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    colorCode: string;
}

interface Material {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    materialCode: string;
}

interface Size {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    description: string;
    sizeCode: string;
}

interface Unit {
    id: string;
    create_at: string;
    update_at: string;
    isDeleted: boolean;
    name: string;
    isBaseUnit: boolean;
}
