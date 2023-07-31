import { Link } from "react-router-dom";

const ErrorFallback = () => {
  return (
    <section className="main">
      <div className="error">
        <div className="error__title">
          <h2 className="heading-secondary heading-secondary--error">
            Uh oh! Something went wrong!
          </h2>
          <h2 className="error__emoji">😢 🤯</h2>
        </div>
        <div className="error__msg">
          <Link to={-1}>Go back</Link>
        </div>
      </div>
    </section>
  );
};

export default ErrorFallback;
