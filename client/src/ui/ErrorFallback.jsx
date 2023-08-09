import "./ErrorFallback.css";
import { Link } from "react-router-dom";

const ErrorFallback = () => {
  return (
    <section className="main error-screen section-center">
      <h2>Something went wrong!</h2>
      <Link className="button" to={-1}>
        Go back
      </Link>
    </section>
  );
};

export default ErrorFallback;
