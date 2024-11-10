import { faSignOutAlt, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

interface DropDownMenuProps {
    openModelLogout: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const DropDownMenu: React.FC<DropDownMenuProps> = ({ openModelLogout }) => {

    return (
        <div className='dropdown-menu-user'>
            <Link to="/profile">
                <FontAwesomeIcon icon={faUserCircle} className="dropdown-icon" />
                Thông tin cá nhân
            </Link>
            <Link to="/" onClick={openModelLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                Đăng xuất
            </Link>
        </div>

    );
}