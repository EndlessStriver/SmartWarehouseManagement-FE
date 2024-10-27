interface Shelf {
    id: string;
    createAt: string;
    updateAt: string;
    isDeleted: boolean;
    name: string;
    maxColumns: number;
    maxLevels: number;
    typeShelf: string;
    currentCapacity: string;
    maxCapacity: string;
    maxWeight: string;
    currentWeight: string;
    currentColumnsUsed: number;
    totalColumns: number;
    category: Category;
}

interface Category {
    id: string;
    createAt: string;
    updateAt: string;
    isDeleted: boolean;
    name: string;
    description: string;
    categoryCode: string;
}

export default Shelf;