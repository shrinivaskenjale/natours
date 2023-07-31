import { Link } from "react-router-dom";
import "./HeroBanner.css";

const HeroBanner = () => {
  return (
    <div className="hero">
      <div className="hero-container">
        <h1 className="heading">continue exploring</h1>
        <h3 className="subheading">outdoors is where life happens</h3>
        <Link to="/tours" className="button">
          explore tours
        </Link>
      </div>
    </div>
  );
};

export default HeroBanner;
