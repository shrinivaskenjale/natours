import Spinner from "../../ui/Spinner";
import BookingCard from "./BookingCard";
import { useMyBookings } from "./useMyBookings";
import "./MyBookingList.css";

const MyBookingList = () => {
  const { bookings, isLoading } = useMyBookings();

  if (isLoading) return <Spinner />;

  return (
    <section className="booking-list">
      {bookings.map((booking) => (
        <BookingCard key={booking._id} booking={booking} />
      ))}
    </section>
  );
};

export default MyBookingList;
