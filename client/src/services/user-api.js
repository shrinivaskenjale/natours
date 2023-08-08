import request from "./axios";

export const updateCurrentUser = async (formData) => {
  if (formData.has("password")) {
    const passwordData = Object.fromEntries(formData.entries());
    const response = await request.patch(
      `/users/update-my-password`,
      passwordData
    );
    return response?.data;
  }

  // Normal data
  const response = await request.patch(`/users/me`, formData);
  return response?.data;
};
