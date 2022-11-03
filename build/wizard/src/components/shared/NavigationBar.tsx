import React from "react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";

const NavigationBar = () => {

    const [navBarIsActive, setNavBarIsActive] = React.useState(false);
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams()


    const isAdminMode = (): boolean => {
        return pathname === "/admin" || searchParams.get("admin") !== null
    }

    const getQuery = () => {
        return isAdminMode() ? "?admin" : ""
    }

    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <NavLink
                    to="/"
                    onClick={() => {
                        setNavBarIsActive(!navBarIsActive);
                    }}
                    role="button"
                    className={`navbar-burger burger ${navBarIsActive ? "is-active" : ""}`}
                    aria-label="menu"
                    aria-expanded="false"
                    data-target="navMenu"
                >
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </NavLink>
            </div>
            <div id="navMenu" className={`navbar-menu ${navBarIsActive ? "is-active" : ""}`}>
                <div className="navbar-start">
                    <NavLink className={({ isActive }) => isActive ? "navbar-item is-active has-text-weight-bold" : "navbar-item"} to={`/${getQuery()}`} >Main</NavLink>
                    <NavLink className={({ isActive }) => isActive ? "navbar-item is-active has-text-weight-bold" : "navbar-item"} to={`/settings${getQuery()}`}>Settings</NavLink>
                    <NavLink className={({ isActive }) => isActive ? "navbar-item is-active has-text-weight-bold" : "navbar-item"} to={`/checksync${getQuery()}`}>Check</NavLink>
                </div>

                {isAdminMode() && (
                    <div className="navbar-end">
                        <NavLink className={({ isActive }) => isActive ? "navbar-item is-active has-text-weight-bold" : "navbar-item"} to={`/admin?admin`} >Admin</NavLink>
                    </div>
                )}
            </div>

        </nav>
    )
};

export default NavigationBar
