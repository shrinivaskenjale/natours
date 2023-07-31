import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../services/auth-api";

export const useUser = () => {
  const { data: user, isLoading } = useQuery({
    queryFn: getCurrentUser,
    queryKey: ["user"],
    retry: false,
  });

  return { user, isLoading, isAuthenticated: user ? true : false };
};
