import request from "./axios";

export const getTours = async ({ queryString }) => {
  const response = await request.get(`/tours?${queryString}`);
  return response?.data?.data?.tours;
};

export const getTour = async ({ slug }) => {
  const response = await request.get(`/tours/${slug}`);
  return response?.data?.data?.tour;
};
