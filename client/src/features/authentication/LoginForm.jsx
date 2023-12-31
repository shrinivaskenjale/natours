import { useLogin } from "./useLogin";
import "./LoginForm.css";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const { login, isLoading } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData.entries());
    login({ email, password });
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Log in</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label" htmlFor="email">
            Email address
          </label>
          <input
            className="input"
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
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
        <div className="form-actions">
          <button className="button" disabled={isLoading}>
            Login
          </button>
        </div>
        <div className="form-links">
          <Link to="/signup">Create New Account</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
