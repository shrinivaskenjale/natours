import { IMAGE_BASE_URL } from "../../utils/constants";
import { useUser } from "../authentication/useUser";
import { useUpdateUser } from "./useUpdateUser";

const UpdateUserForm = () => {
  const { user } = useUser();
  const { updateUser, isLoading } = useUpdateUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    updateUser(formData);
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Your account settings</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            className="input"
            id="name"
            name="name"
            type="text"
            defaultValue={user.name}
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
            defaultValue={user.email}
            required="required"
            disabled={isLoading}
          />
        </div>
        <div className="form-image-upload-group">
          <img src={`${IMAGE_BASE_URL}/users/${user.photo}`} alt="User photo" />
          <input
            className="form-upload"
            type="file"
            accept="image/*"
            name="photo"
            id="photo"
          />
          <label htmlFor="photo">Choose new photo</label>
        </div>
        <div className="form-group">
          <button className="button" disabled={isLoading}>
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUserForm;
