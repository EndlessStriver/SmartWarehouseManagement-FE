import React from "react";
import "./Dashboard.css";
import checkIsLogin from "../../util/Authen/CheckIsLogin";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="logo-container">
                    <img src="https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?t=st=1724652251~exp" alt="Logo" className="logo" />
                </div>
                <h1 className="system-name">Leon Warehouse</h1>
            </header>

            <section className="features-section">
                <h2 className="section-title">Tính Năng Chính</h2>
                <div className="features-list">
                    <Link to={"/stock-entry"} className="feature-item">
                        <h3 className="feature-title">Nhập Kho</h3>
                        <p className="feature-description">Thêm các sản phẩm mới vào kho khi nhận hàng từ nhà cung cấp.</p>
                    </Link>
                    <Link to={"/export-product"} className="feature-item">
                        <h3 className="feature-title">Xuất Kho</h3>
                        <p className="feature-description">Thực hiện các đơn xuất kho nhanh chóng và chính xác.</p>
                    </Link>
                    <Link to={"/statictical-stock-entry"} className="feature-item">
                        <h3 className="feature-title">Thống Kê</h3>
                        <p className="feature-description">Xem báo cáo chi tiết về tồn kho, nhập xuất hàng hóa.</p>
                    </Link>
                </div>
            </section>
        </div>
    );
}

const ProtectedDashboard: React.FC = () => {
    const AuthenticatedOutlet = checkIsLogin(Dashboard);
    return <AuthenticatedOutlet />;
}

export default ProtectedDashboard;
