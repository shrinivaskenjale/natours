import { Link } from "react-router-dom";
import "./BookingCard.css";
import { formatDate } from "../../utils/helpers";
import {
  FaCalendarCheck,
  FaFlagCheckered,
  FaMoneyBill1,
  FaRegCalendarDays,
} from "react-icons/fa6";

const BookingCard = ({ booking }) => {
  const { createdAt, price, tour } = booking;
  const { name, slug, startDates, duration } = tour;
  return (
    <article className="booking-card">
      <h4>
        <Link to={`/tours/${slug}`}>{name}</Link>
      </h4>
      <div className="row">
        <FaCalendarCheck className="icon" />
        <span>
          Booked on <span className="bold">{formatDate(createdAt)}</span>
        </span>
      </div>
      <div className="row">
        <FaMoneyBill1 className="icon" />
        <span>
          Paid <span className="bold">₹{price}</span>
        </span>
      </div>
      <div className="row">
        <FaFlagCheckered className="icon" />
        <span>
          Tour start date:{" "}
          <span className="bold">{formatDate(startDates[0])}</span>
        </span>
      </div>
      <div className="row">
        <FaRegCalendarDays className="icon" />
        <span>
          Duration: <span className="bold">{duration} Days</span>
        </span>
      </div>
    </article>
  );
};

export default BookingCard;
