import { Link } from "react-router-dom";
import "./EmptyBookings.css";
const EmptyBookings = () => {
  return (
    <div className="empty-bookings">
      <p>There are no booked tours</p>
      <Link to="/tours" className="button">
        explore tours
      </Link>
    </div>
  );
};

export default EmptyBookings;
