import request from "./axios";

export const login = async ({ email, password }) => {
  await request.post("/users/login", {
    email,
    password,
  });
};

export const signup = async ({ email, name, password, passwordConfirm }) => {
  await request.post("/users/signup", {
    email,
    password,
    passwordConfirm,
    name,
  });
};

export const getCurrentUser = async () => {
  const response = await request.get("/users/me");
  return response?.data?.data?.user;
};

export const logout = async () => {
  await request.post("/users/logout");
};
