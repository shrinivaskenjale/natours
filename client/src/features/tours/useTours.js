import { useQuery } from "@tanstack/react-query";
import { getTours } from "../../services/tours-api";

export const useTours = () => {
  const { data: tours, isLoading } = useQuery({
    queryFn: getTours,
    queryKey: ["tours"],
  });

  return { tours, isLoading };
};
