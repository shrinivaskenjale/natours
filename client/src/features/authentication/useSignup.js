import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup as signupApi } from "../../services/auth-api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const useSignup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: signup, isLoading } = useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      toast.success("Welcome to Natours family");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/", { replace: true });
    },
    onError: (error) => {
      console.log(error?.response?.data);
      toast.error(error?.response?.data?.message);
    },
  });
  return { signup, isLoading };
};
