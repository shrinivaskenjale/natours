import "./TourList.css";
import TourCard from "./TourCard";
import { useTours } from "./useTours";
import Spinner from "../../ui/Spinner";

const TourList = () => {
  const { tours, isLoading } = useTours();
  if (isLoading) return <Spinner />;
  return (
    <section className="tour-list">
      {tours.map((tour) => (
        <TourCard key={tour._id} tour={tour} />
      ))}
    </section>
  );
};

export default TourList;
