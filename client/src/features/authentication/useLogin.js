import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../services/auth-api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: login, isLoading } = useMutation({
    mutationFn: loginApi,
    onSuccess: () => {
      toast.success("Logged in successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/", { replace: true });
    },
    onError: (error) => {
      console.log(error?.response?.data);
      toast.error(error?.response?.data?.message);
    },
  });
  return { login, isLoading };
};
