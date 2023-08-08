import { Navigate } from "react-router-dom";
import { useUser } from "./useUser";
import Spinner from "../../ui/Spinner";

const ProtectedRoute = ({ children }) => {
  // 1. Get authenticated user
  const { isLoading, isAuthenticated } = useUser();

  // 2. While loading, show spinner
  if (isLoading)
    return (
      //   <FullPage>
      //     <Spinner />
      //   </FullPage>
      <Spinner />
    );

  // 3. If there is no authenticated user, redirect to /login
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" />;
  }

  // 4. If there is a user, render the children
  if (isAuthenticated) return children;
};

export default ProtectedRoute;
