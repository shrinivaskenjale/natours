import { Link } from "react-router-dom";
import { useUser } from "../features/authentication/useUser";
import { IMAGE_BASE_URL } from "../utils/constants";
import "./Header.css";
import { useState } from "react";
import { useLogout } from "../features/authentication/useLogout";
import { useOutsideClick } from "../hooks/useOutsideClick";
const Header = () => {
  const [isMenuShown, setIsMenuShown] = useState(false);
  const { user, isAuthenticated } = useUser();
  const { logout } = useLogout();

  const handleCloseMenu = () => {
    setIsMenuShown(false);
  };
  const ref = useOutsideClick(handleCloseMenu, false);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuShown((isMenuShown) => !isMenuShown);
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/">
          <img
            className="logo"
            src="/images/logo-white.png"
            alt="Natours logo"
          />
        </Link>
        <div className="user-actions">
          {isAuthenticated ? (
            <>
              <div className="user-avatar" onClick={handleToggleMenu}>
                <img
                  src={`${IMAGE_BASE_URL}/users/${user.photo}`}
                  alt={user.name}
                />
                <span>{user.name.split(" ")[0]}</span>
                {isMenuShown && (
                  <ul
                    className="user-menu"
                    ref={ref}
                    // If user clicks on gaps between links i.e., on menu itself, don't close the menu. It can be done by preventing the event from reaching user-avatar.
                    onClick={(e) =>
                      e.target === e.currentTarget && e.stopPropagation()
                    }
                  >
                    <li>
                      <Link to="/account">Account</Link>
                    </li>
                    <li>
                      <Link to="/bookings/me">My bookings</Link>
                    </li>

                    <li>
                      <span className="logout" onClick={logout}>
                        Log out
                      </span>
                    </li>
                  </ul>
                )}
              </div>
            </>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
