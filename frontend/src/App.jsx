import React from "react";
import Navbar from "./components/core/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/core/Footer";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ScrollToTop from "./pages/Scrolltotop";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";

import AddCategory from "./pages/AddCategory";
import ViewUsers from "./pages/ViewUsers";
import AboutUs from "./pages/AboutUs";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Brands from "./pages/Addbrand";
import CreateOrder from "./pages/CreateOrder";
import ManageOrders from "./pages/ManageOrders";
import OpenRoute from "./components/core/OpenRoute";
import PrivateRoute from "./components/core/PrivateRoute";
import ContactUs from "./pages/ContactUs";
import Profile from "./pages/Profile";
import UserRoute from "./components/core/UserRoute";
import TechSupport from "./pages/TechSupport";
import Notfound from "./pages/notfound";
import { useSelector } from "react-redux";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetForgotPassword from "./pages/ResetForgotPassword";
import FeaturedProduct from "./pages/FeaturedProducts";
import NewArrival from "./pages/NewArrival";
import OnSale from "./pages/Onsale";
import FAQ from "./pages/Faq";
import SupportCenter from "./pages/SupportCenter";
import CustomerCareGuide from "./pages/CareGuide";

const App = () => {
  


  return (
    <div className="relative">
      <Navbar />

      <ScrollToTop />

      <div className="mt-[10vh] lg:mt-[17vh]">
        <Routes>
          {/* OpenRoute – Unauthenticated Only */}
          <Route
            path="/signup"
            element={
              <OpenRoute>
                <Signup />
              </OpenRoute>
            }
          />
          <Route
            path="/login"
            element={
              <OpenRoute>
                <Login />
              </OpenRoute>
            }
          />

          <Route
            path="/forgetpassword"
            element={
              <OpenRoute>
                <ForgotPassword />
              </OpenRoute>
            }
          />

          <Route
            path="/resetforgetpassword"
            element={
              <OpenRoute>
                <ResetForgotPassword />
              </OpenRoute>
            }
          />

          

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/products" element={<Products />} />
          <Route path="/productdetail" element={<ProductDetail />} />
          <Route path="/featuredproducts" element={<FeaturedProduct/>}/>
            <Route path="/newarrival" element={<NewArrival/>}/>
            <Route path="/onsale" element={<OnSale/>}/>
            <Route path="/faq" element={<FAQ/>}/>
             <Route path="/support" element={<SupportCenter/>}/>
            <Route path="/care-guide" element={<CustomerCareGuide/>}/>
            
          <Route
            path="/create-order"
            element={
              <UserRoute>
                <CreateOrder />
              </UserRoute>
            }
          />
          <Route path="/contactus" element={<ContactUs />} />

          <Route
            path="/profile"
            element={
              <UserRoute>
                <Profile />
              </UserRoute>
            }
          />

          <Route
            path="/resetpassword"
            element={
              <UserRoute>
                <ResetPassword />
              </UserRoute>
            }
          />

          {/* Private Admin Routes */}
          <Route
            path="/admindashboard"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            
            <Route index element={<AdminDashboard />} />
            <Route path="addproduct" element={<AddProduct />} />
            <Route path="manageorders" element={<ManageOrders />} />
            <Route path="addcategory" element={<AddCategory />} />
            <Route path="addbrands" element={<Brands />} />
            <Route path="viewusers" element={<ViewUsers />} />
            <Route path='techsupport' element={<TechSupport/>}/>
          </Route>
          <Route path="*" element={<Notfound/>}/>
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;
