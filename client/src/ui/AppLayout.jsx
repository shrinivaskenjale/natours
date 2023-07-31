import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import Main from "./Main";
import "./AppLayout.css";

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </div>
  );
};

export default AppLayout;
