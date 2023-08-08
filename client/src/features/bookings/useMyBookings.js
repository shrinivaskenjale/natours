import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../../services/bookings-api";

export const useMyBookings = () => {
  const { data: bookings, isLoading } = useQuery({
    queryFn: getMyBookings,
    queryKey: ["bookings", "me"],
  });

  return { bookings, isLoading };
};
