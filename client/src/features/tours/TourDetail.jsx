import "./TourDetail.css";
import { Link, useParams } from "react-router-dom";
import { useTour } from "./useTour";
import Map from "./Map";
import { IMAGE_BASE_URL, STATIC_BASE_URL } from "../../utils/constants";
import { useEffect, useState } from "react";
import { useUser } from "../authentication/useUser";
import { useCheckout } from "../bookings/useCheckout";
import {
  HiMiniArrowTrendingUp,
  HiOutlineCalendar,
  HiStar,
  HiUserGroup,
} from "react-icons/hi2";
import { FaClock, FaLocationDot, FaStar } from "react-icons/fa6";

const TourDetail = () => {
  const { slug } = useParams();
  const { tour, isLoading } = useTour(slug);

  if (isLoading) return <p>Loading...</p>;
  return (
    <>
      <TourHeader tour={tour} />

      <TourDescription tour={tour} />

      <TourPictures tour={tour} />

      <Map />

      <TourReviews tour={tour} />

      <TourActions tour={tour} />
    </>
  );
};

export default TourDetail;

const TourHeader = ({ tour }) => {
  const { name, imageCover, duration, startLocation } = tour;
  return (
    <section
      className="tour-banner"
      style={{
        background: `linear-gradient(
        to bottom right,
        rgba(125, 213, 111, 0.85),
        rgba(40, 180, 135, 0.85)
      ),
      url(${IMAGE_BASE_URL}/tours/${imageCover}) center/cover
        no-repeat`,
      }}
    >
      <h1 className="heading">{name} tour</h1>
      <div className="stats">
        <div className="stat">
          <FaClock className="icon" />
          <span>{duration} days</span>
        </div>
        <div className="stat">
          <FaLocationDot className="icon" />
          <span>{startLocation.description}</span>
        </div>
      </div>
    </section>
  );
};

const TourDescription = ({ tour }) => {
  const {
    name,
    description,
    startDates,
    difficulty,
    ratingsAverage,
    maxGroupSize,
    guides,
  } = tour;
  return (
    <section className="tour-description">
      <div className="left">
        <div className="description-box">
          <h3 className="heading">Quick Overview</h3>
          <div className="description-item">
            <HiOutlineCalendar className="description-item-icon" />
            <span className="description-item-label">Next date</span>
            <span className="description-item-text">
              {new Date(startDates[0]).toLocaleString("en-us", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="description-item">
            <HiMiniArrowTrendingUp className="description-item-icon" />
            <span className="description-item-label">Difficulty</span>
            <span className="description-item-text">{difficulty}</span>
          </div>

          <div className="description-item">
            <HiUserGroup className="description-item-icon" />
            <span className="description-item-label">Participants</span>
            <span className="description-item-text">{`${maxGroupSize} people`}</span>
          </div>

          <div className="description-item">
            <HiStar className="description-item-icon" />
            <span className="description-item-label">Rating</span>
            <span className="description-item-text">{`${ratingsAverage} / 5`}</span>
          </div>
        </div>
        <div className="description-box">
          <h3 className="heading">Your Tour Guides</h3>
          {guides.map((guide) => (
            <div key={guide._id} className="description-item">
              <img
                className="description-item-image"
                src={`${IMAGE_BASE_URL}/users/${guide.photo}`}
                alt={guide.name}
              />
              <span className="description-item-label">
                {guide.role === "lead-guide" ? "Lead guide" : "Tour guide"}
              </span>
              <span className="description-item-text">{guide.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="right">
        <h3 className="heading">About {name} tour</h3>
        {/* description in DB has \n character in text to indicate new paragraph */}
        {description.split("\n").map((para, index) => (
          <p key={index}>{para}</p>
        ))}
      </div>
    </section>
  );
};

const TourPictures = ({ tour }) => {
  const { images, name } = tour;
  return (
    <section className="tour-pictures">
      {images.map((image, index) => (
        <img
          key={image}
          className={`picture-box__img picture-box__img--${index + 1}`}
          src={`${IMAGE_BASE_URL}/tours/${image}`}
          alt={`${name} Tour ${index + 1}`}
        />
      ))}
    </section>
  );
};

const TourReviews = ({ tour }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { reviews } = tour;

  useEffect(() => {
    if (!reviews?.length) return;
    const interval = setInterval(() => {
      setActiveIndex((activeIndex) =>
        activeIndex < reviews.length - 1 ? activeIndex + 1 : 0
      );
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [reviews?.length]);

  return (
    <section className="tour-reviews">
      <div className="reviews">
        {!reviews?.length ? (
          <p className="no-reviews">
            🥇 Be the first one to review this tour 😊
          </p>
        ) : (
          <div
            className="reviews-wrapper"
            style={{
              transform: `translateX(calc(-${activeIndex} * min(80vw, 400px)))`,
            }}
          >
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const ReviewCard = ({ review }) => {
  const {
    rating: userRating,
    user: { name, photo },
    review: reviewText,
  } = review;

  return (
    <div className="review-card">
      <div className="review-avatar">
        <img
          className="review-avatar-img"
          src={`${IMAGE_BASE_URL}/users/${photo}`}
          alt={name}
        />
        <h6 className="review-user">{name}</h6>
      </div>
      <p className="review-text">{reviewText}</p>
      <div className="review-rating">
        {[1, 2, 3, 4, 5].map((rating) => (
          <FaStar
            key={rating}
            className={`review-star review-star-${
              rating <= userRating ? "active" : "inactive"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const TourActions = ({ tour }) => {
  const { duration, images, _id } = tour;
  const { checkout, isLoading } = useCheckout();
  const { isAuthenticated } = useUser();
  return (
    <section className="tour-actions">
      <div className="images">
        <div className=" image image-1">
          <img
            src="/images/logo-white.png"
            alt="Natours logo"
            className="logo"
          />
        </div>
        <img
          className="image-2 image"
          src={`${IMAGE_BASE_URL}/tours/${images[1]}`}
          alt=""
        />
        <img
          className="image-3 image"
          src={`${IMAGE_BASE_URL}/tours/${images[2]}`}
          alt=""
        />
      </div>
      <div className="text">
        <h2>What are you waiting for?</h2>
        <p>
          {duration} days. 1 adventure. Infinite memories. Make it yours today!
        </p>
      </div>
      {isAuthenticated ? (
        <button
          className="button"
          onClick={() => checkout({ tourId: _id })}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Book tour now!"}
        </button>
      ) : (
        <Link to="/login" className="button">
          Log in to book tour
        </Link>
      )}
    </section>
  );
};
