import Spinner from "../../ui/Spinner";
import BookingCard from "./BookingCard";
import { useMyBookings } from "./useMyBookings";
import "./MyBookingList.css";
import EmptyBookings from "./EmptyBookings";

const MyBookingList = () => {
  const { bookings, isLoading } = useMyBookings();

  if (isLoading) return <Spinner />;

  if (!bookings.length) return <EmptyBookings />;

  return (
    <section className="booking-list">
      {bookings.map((booking) => (
        <BookingCard key={booking._id} booking={booking} />
      ))}
    </section>
  );
};

export default MyBookingList;
