import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <img src="/images/logo-green.png" className="logo" alt="natours logo" />
        <ul className="footer-links">
          <li>
            <a href="#">About us</a>
          </li>
          <li>
            <a href="#">Download apps</a>
          </li>
          <li>
            <a href="#">Become a guide</a>
          </li>
          <li>
            <a href="#">Careers</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
        </ul>
        <div className="copyright">© 2023 by Shrinivas Kenjale</div>
      </div>
    </footer>
  );
};

export default Footer;
