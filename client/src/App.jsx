import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AppLayout from "./ui/AppLayout";
import Tour from "./pages/Tour";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import ErrorFallback from "./ui/ErrorFallback";
import Account from "./pages/Account";
import ProtectedRoute from "./features/authentication/ProtectedRoute";
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import Signup from "./pages/Signup";
import UserBookings from "./pages/UserBookings";

const queryClient = new QueryClient();

// NOTE - in pug block content is <Outlet/> of app layout
// base AppLayout

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorFallback />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "tours",
        element: <Tours />,
      },
      {
        path: "tours/:slug",
        element: <Tour />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "bookings/me",
        element: <UserBookings />,
      },
      {
        path: "account",
        element: (
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        toastOptions={{
          // style: { fontSize: "1.5rem" },
          duration: 5000,
        }}
      />
    </QueryClientProvider>
  );
};

export default App;
