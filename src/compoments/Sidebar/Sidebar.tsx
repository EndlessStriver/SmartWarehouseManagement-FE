import React from "react";
import "./Sidebar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faWarehouse, faBox, faUser, faBarcode, faTruck, faBoxes, faChartBar, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { SidebarItem } from "./compoments/SidebarItem";
import { SidebarNav } from "./compoments/SidebarNav";
import { SidebarLogo } from "./compoments/SidebarLogo";

export const Sidebar: React.FC = () => {
    const logo = "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?t=st=1724652251~exp";

    return (
        <div className={"sidebar"}>
            <SidebarLogo logo={logo} />
            <SidebarNav>
                {/* <SidebarItem
                    href={"/"}
                    icon={<FontAwesomeIcon icon={faTachometerAlt} />}
                    label={"Bảng điều khiển"}
                    role={["admin", "warehouse_manager", "inventory_specialist"]}
                /> */}
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faWarehouse} />}
                    label={"Quản lý kho"}
                    subItems={
                        [
                            { href: "/stock-entry", lable: "Quản Lý Nhập Kho" },
                            { href: "/export-product", lable: "Quản Lý Xuất Kho" },
                            { href: "/inventory-tracking", lable: "Hàng Tồn Kho" },
                            { href: "/inventory", lable: "Kiểm kê" },
                        ]
                    }
                    role={["admin", "warehouse_manager", "inventory_specialist"]}
                />
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faBoxes} />}
                    label={"Kệ hàng"}
                    href={"/shelfs"}
                    role={["admin", "warehouse_manager", "inventory_specialist"]}
                />
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faBox} />}
                    label={"Sản phẩm"}
                    subItems={
                        [
                            { href: "/Product-management", lable: "Danh mục sản phẩm" },
                            { href: "/management-Attribute", lable: "Thuộc tính sản phẩm" },
                        ]
                    }
                    role={["admin", "warehouse_manager"]}
                />
                <SidebarItem
                    href={"/management-Supplier"}
                    icon={<FontAwesomeIcon icon={faTruck} />}
                    label={"Nhà cung cấp"}
                    role={["admin", "warehouse_manager"]}
                />
                <SidebarItem
                    href={"/management-SKU"}
                    icon={<FontAwesomeIcon icon={faBarcode} />}
                    label={"SKU"}
                    role={["admin", "warehouse_manager"]}
                />
                <SidebarItem
                    href={"/management-user"}
                    icon={<FontAwesomeIcon icon={faUser} />}
                    label={"Người dùng"}
                    role={["admin"]}
                />
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faChartBar} />}
                    label={"Thống kê"}
                    subItems={
                        [
                            { href: "/statictical-stock-entry", lable: "Thống kê nhập kho" },
                            { href: "/statictical-order-export", lable: "Thống kê xuất kho" },
                        ]
                    }
                    role={["admin", "warehouse_manager"]}
                />
                <SidebarItem
                    href={"/qr-code"}
                    icon={<FontAwesomeIcon icon={faQrcode} />}
                    label={"QR Code"}
                    role={["admin", "warehouse_manager"]}
                />
            </SidebarNav>
        </div>
    )
}