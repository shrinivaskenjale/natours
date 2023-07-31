import { useQuery } from "@tanstack/react-query";
import { getTour } from "../../services/tours-api";

export const useTour = (slug) => {
  const { data: tour, isLoading } = useQuery({
    queryFn: () => getTour({ slug }),
    queryKey: ["tours", slug],
  });
  return { tour, isLoading };
};
