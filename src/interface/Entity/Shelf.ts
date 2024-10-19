interface Shelf {
    id: string;
    createAt: string;
    updateAt: string;
    isDeleted: boolean;
    name: string;
    maxColumns: number;
    maxLevels: number;
    typeShelf: string;
}

export default Shelf;