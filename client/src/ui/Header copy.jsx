import { Link } from "react-router-dom";
import { useUser } from "../features/authentication/useUser";
import { STATIC_BASE_URL } from "../utils/constants";
import { useLogout } from "../features/authentication/useLogout";

const Header = () => {
  const { isAuthenticated, user } = useUser();
  const { isLoading, logout } = useLogout();

  return (
    <header className="header">
      <nav className="nav nav--tours">
        <Link to="/" className="nav__el">
          All tours
        </Link>
      </nav>
      <div className="header__logo">
        <img src="/img/logo-white.png" alt="Natours logo" />
      </div>
      <nav className="nav nav--user">
        {isAuthenticated ? (
          <>
            <button
              className="nav__el nav__el--logout"
              onClick={logout}
              disabled={isLoading}
            >
              Log out
            </button>
            <Link to="/account" className="nav__el">
              <img
                className="nav__user-img"
                src={`${STATIC_BASE_URL}/img/users/${user.photo}`}
                alt={user.name}
              />
              <span>{user.name.split(" ")[0]}</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav__el ">
              Log in
            </Link>
            <Link to="/signup" className="nav__el nav__el--cta">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
