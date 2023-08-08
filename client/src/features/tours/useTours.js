import { useQuery } from "@tanstack/react-query";
import { getTours } from "../../services/tours-api";
import { useSearchParams } from "react-router-dom";

export const useTours = () => {
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();

  const { data: tours, isLoading } = useQuery({
    queryFn: () => getTours({ queryString }),
    queryKey: ["tours", queryString],
  });

  return { tours, isLoading };
};
