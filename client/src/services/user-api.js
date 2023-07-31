import request from "./axios";

export const updateCurrentUser = async (formData) => {
  if (formData.has("password")) {
    const response = await request.patch(`/users/update-my-password`, formData);
    return response?.data;
  }

  // Normal data
  const response = await request.patch(`/users/me`, formData);
  return response?.data;
};
