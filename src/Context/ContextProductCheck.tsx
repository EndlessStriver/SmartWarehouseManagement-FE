import React from "react";
import { ProductCheck } from "../page/StockEntry/compoments/HandleStockEntryPage";

interface ContextProductCheckProps {
    children: React.ReactNode;
}

export interface ActionTypeProductCheck {
    data: ProductCheck[],
    type: "ADD" | "RESSET"
}

const productcheck = React.createContext<ProductCheck[]>([]);
const dispatchProductCheck = React.createContext<React.Dispatch<ActionTypeProductCheck>>(() => { });

const ContextProductCheck: React.FC<ContextProductCheckProps> = ({ children }) => {

    const initialState: ProductCheck[] = [];

    const reducer = (state: ProductCheck[], action: ActionTypeProductCheck) => {
        switch (action.type) {
            case "ADD":
                return action.data;
            case "RESSET":
                return [];
            default:
                return state;
        }
    }

    const [state, dispatch] = React.useReducer(reducer, initialState);

    return (
        <productcheck.Provider value={state}>
            <dispatchProductCheck.Provider value={dispatch}>
                {children}
            </dispatchProductCheck.Provider>
        </productcheck.Provider>
    );
}

export default ContextProductCheck;

export const useProductCheck = () => {
    return React.useContext(productcheck);
}

export const useDispatchProductCheck = () => {
    return React.useContext(dispatchProductCheck);
}