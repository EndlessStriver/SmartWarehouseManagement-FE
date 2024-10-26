import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import App from './App';
import reportWebVitals from './reportWebVitals';
import ProtectedDashboard from "./page/Dashboard/Dashboard";
import Login from "./compoments/Login/Login";
import { UserManagement } from "./page/User/UserManagement";
import { SKUManagement } from "./page/SKU/SKUManagement";
import { AttributeManagement } from "./page/Attribute/AttributeManagement";
import { ProductManagement } from "./page/Product/ProductManagement";
import { SupplierManagement } from './page/Supplier/SupplierManagement';
import ErrorPage from "./page/Error/ErrorPage";
import SessionExpiredPage from "./page/SessionExpired/SessionExpiredPage";
import StockEntry from "./page/StockEntry/StockEntry";
import ProfilePage from './page/Profile/ProfilePage';
import LocationPage from './page/Location/StorageManagementPage';
import IssueLog from './page/StockEntry/IssueLog';
import InventoryTracking from './page/StockEntry/InventoryTracking';

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <ProtectedDashboard />,
            },
            {
                path: "management-user",
                element: <UserManagement />,
            },
            {
                path: "management-SKU",
                element: <SKUManagement />,
            },
            {
                path: "management-Supplier",
                element: <SupplierManagement />,
            },
            {
                path: "management-Attribute",
                element: <AttributeManagement />,
            },
            {
                path: "Product-management",
                element: <ProductManagement />,
            },
            {
                path: "stock-entry",
                element: <StockEntry />,
            },
            {
                path: "issue-log",
                element: <IssueLog />,
            },
            {
                path: "inventory-tracking",
                element: <InventoryTracking />,
            },
            {
                path: "profile",
                element: <ProfilePage />,
            },
            {
                path: "location",
                element: <LocationPage />,
            }
        ]
    },
    {
        path: "/session-expired",
        element: <SessionExpiredPage />,
    },
    {
        path: "*",
        element: <ErrorPage />,
    }
]);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
