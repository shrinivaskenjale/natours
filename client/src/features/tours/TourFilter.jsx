import { useSearchParams } from "react-router-dom";
import "./TourFilter.css";
const TourFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <div className="tour-filter">
      <form className="filter-form">
        <div className="filter-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            className="select"
            name="difficulty"
            id="difficulty"
            value={searchParams.get("difficulty")}
            onChange={(e) => {
              const value = e.target.value;
              value === "all"
                ? searchParams.delete("difficulty")
                : searchParams.set("difficulty", value);

              setSearchParams(searchParams);
            }}
          >
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="sortBy">Sort by</label>
          <select
            className="select"
            name="sortBy"
            value={searchParams.get("sort")}
            id="sortBy"
            onChange={(e) => {
              const value = e.target.value;
              value === ""
                ? searchParams.delete("sort")
                : searchParams.set("sort", value);

              setSearchParams(searchParams);
            }}
          >
            <option value=""></option>
            <option value="price">Price (Low to High)</option>
            <option value="-price">Price (High to Low)</option>
            <option value="ratings">Ratings (Low to High)</option>
            <option value="-ratings">Ratings (High to Low)</option>
            <option value="duration">Duration (Low to High)</option>
            <option value="-duration">Duration (High to Low)</option>
          </select>
        </div>
      </form>
    </div>
  );
};

export default TourFilter;
