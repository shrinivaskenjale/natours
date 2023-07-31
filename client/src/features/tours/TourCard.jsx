import { Link } from "react-router-dom";
import { IMAGE_BASE_URL } from "../../utils/constants";
import {
  FaCalendar,
  FaFlag,
  FaLocationDot,
  FaMoneyBill1Wave,
  FaStar,
  FaUserGroup,
} from "react-icons/fa6";
import "./TourCard.css";

const TourCard = ({ tour }) => {
  const {
    name,
    imageCover,
    difficulty,
    duration,
    startDates,
    startLocation,
    locations,
    maxGroupSize,
    summary,
    slug,
    ratingsAverage,
    ratingsQuantity,
    price,
  } = tour;
  return (
    <Link to={`/tours/${slug}`}>
      <div className="tour-card">
        <img src={`${IMAGE_BASE_URL}/tours/${imageCover}`} alt={name} />
        <div className="tour-card-body">
          <h3 className="heading">{name}</h3>
          <h4 className="sub-heading">
            {difficulty} {duration}-day tour
          </h4>
          <p className="text">{summary}</p>
          <div className="tour-card-highlights">
            <div>
              <FaLocationDot className="icon" />
              <span className="description">{startLocation?.description}</span>
            </div>
            <div>
              <FaCalendar className="icon" />
              <span className="description">
                {new Date(startDates[0]).toLocaleString("en-us", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div>
              <FaFlag className="icon" />
              <span className="description">{locations.length} stops</span>
            </div>
            <div>
              <FaUserGroup className="icon" />
              <span className="description">{maxGroupSize} people</span>
            </div>
            <div>
              <FaMoneyBill1Wave className="icon" />
              <span className="description">₹ {price} per person</span>
            </div>
            <div>
              <FaStar className="icon" />
              <span className="description">
                {ratingsAverage} rating ({ratingsQuantity})
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
