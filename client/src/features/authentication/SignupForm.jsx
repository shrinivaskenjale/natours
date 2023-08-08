import { Link } from "react-router-dom";
import { useSignup } from "./useSignup";

const SignupForm = () => {
  const { signup, isLoading } = useSignup();

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const { email, password, passwordConfirm, name } = Object.fromEntries(
      formData.entries()
    );
    signup({ email, password, passwordConfirm, name });
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Create new account</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label" htmlFor="name">
            Full Name
          </label>
          <input
            className="input"
            id="name"
            type="text"
            name="name"
            placeholder="John Doe"
            required="required"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="email">
            Email address
          </label>
          <input
            className="input"
            id="email"
            type="email"
            name="email"
            placeholder="john@example.com"
            required="required"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            className="input"
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            required="required"
            minLength="8"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="passwordConfirm">
            Confirm your password
          </label>
          <input
            className="input"
            id="passwordConfirm"
            type="password"
            name="passwordConfirm"
            placeholder="••••••••"
            required="required"
            minLength="8"
            disabled={isLoading}
          />
        </div>
        <div className="form-actions">
          <button className="button" disabled={isLoading}>
            signup
          </button>
        </div>
        <div className="form-links">
          <Link to="/login">Log in with existing account</Link>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
