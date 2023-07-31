import { useUpdateUser } from "./useUpdateUser";

const PasswordUpdateForm = () => {
  const { isLoading, updateUser } = useUpdateUser();

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    updateUser(formData, {
      onSuccess: () => {
        e.target.reset();
      },
    });
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Password change</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label" htmlFor="password-current">
            Current password
          </label>
          <input
            className="input"
            id="password-current"
            name="passwordCurrent"
            disabled={isLoading}
            type="password"
            // placeholder="••••••••"
            required="required"
            minLength="8"
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="password">
            New password
          </label>
          <input
            className="input"
            id="password"
            name="password"
            disabled={isLoading}
            type="password"
            // placeholder="••••••••"
            required="required"
            minLength="8"
          />
        </div>
        <div className="form-group ma-bt-lg">
          <label className="label" htmlFor="password-confirm">
            Confirm password
          </label>
          <input
            className="input"
            id="password-confirm"
            name="passwordConfirm"
            disabled={isLoading}
            type="password"
            // placeholder="••••••••"
            required="required"
            minLength="8"
          />
        </div>
        <div className="form-group">
          <button disabled={isLoading} className="button">
            Save password
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordUpdateForm;
