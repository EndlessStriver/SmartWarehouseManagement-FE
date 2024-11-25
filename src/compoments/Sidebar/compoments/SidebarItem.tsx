import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import GetProfile from "../../../util/GetProfile";
interface SidebarItemProps {
    href?: string,
    icon: React.ReactNode,
    label: string,
    subItems?: { href: string, lable: string }[]
    role: string[]
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, label, subItems, role }) => {

    const location = useLocation();
    const user = GetProfile();
    const [isOpen, setIsOpen] = React.useState(false);
    const [locationPath, setLocationPath] = React.useState(location.pathname);

    React.useEffect(() => {
        setLocationPath(location.pathname);
    }, [location]);

    React.useEffect(() => {
        if (subItems && isSubItemActive(subItems)) setIsOpen(true);
    }, [locationPath]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    }

    const isSubItemActive = (subItems: { href: string, lable: string }[]) => {
        return subItems.some(subItem => locationPath.includes(subItem.href + ""));
    }

    const checkHavePermission = (role: string[]) => {
        if (role.includes(user?.role.name || "")) return true;
        return false;
    }

    if (!subItems && href && checkHavePermission(role)) {
        return (
            <li className={"sidebar-item"}>
                <NavLink
                    to={href}
                    onClick={handleToggle}
                    className={({ isActive, isPending }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <div className={"sidebar-icon"}>
                        {icon}
                    </div>
                    <span>{label}</span>
                </NavLink>
            </li>
        )
    } else if (subItems && !href && checkHavePermission(role)) {
        return (
            <li className={"sidebar-item"}>
                <span
                    onClick={handleToggle}
                    className={`sidebar-link ${isOpen ? "focus " : ""} ${subItems && isSubItemActive(subItems) ? "active" : ""}`}
                >
                    <div className={"sidebar-icon"}>
                        {icon}
                    </div>
                    <span>{label}</span>
                    {subItems && (
                        <div className={`sidebar-toggle-icon ${isOpen ? "rotate" : ""}`}>
                            <FontAwesomeIcon icon={faChevronUp} />
                        </div>
                    )}
                </span>
                {subItems && (
                    <ul className={`sidebar-submenu ${isOpen ? "show-submenu" : ""}`}>
                        {subItems.map((subItem, index) => (
                            <li key={index} className="sidebar-subitem">
                                <NavLink to={subItem.href}
                                    className={({ isActive, isPending }) =>
                                        `sidebar-sublink ${isActive ? "active" : ""}`
                                    }>
                                    {subItem.lable}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        )
    }
    return null;
}