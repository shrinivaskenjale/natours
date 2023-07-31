import "./TourList.css";
import TourCard from "./TourCard";
import { useTours } from "./useTours";

const TourList = () => {
  const { tours, isLoading } = useTours();
  if (isLoading) return <p>Loading...</p>;
  return (
    <section className="tour-list">
      {tours.map((tour) => (
        <TourCard key={tour._id} tour={tour} />
      ))}
    </section>
  );
};

export default TourList;
