import request from "./axios";

export const checkout = async ({ tourId }) => {
  const response = await request.post(`/bookings/create-checkout-session`, {
    tourId,
  });

  return response.data.data.session.url;
};
