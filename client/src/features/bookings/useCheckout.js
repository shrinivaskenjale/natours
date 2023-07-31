import { useMutation } from "@tanstack/react-query";
import { checkout } from "../../services/bookings-api";

export const useCheckout = () => {
  const { mutate, isLoading } = useMutation({
    mutationFn: checkout,
    onSuccess: (checkoutUrl) => {
      window.location = checkoutUrl;
    },
  });

  return { checkout: mutate, isLoading };
};
