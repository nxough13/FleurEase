import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css'

import Header from './Components/Layout/Header';
import Footer from './Components/Layout/Footer';
import Home from './Components/Home';
import Login from './Components/User/Login';
import Register from './Components/User/Register';
import Profile from './Components/User/Profile';
import UpdateProfile from './Components/User/UpdateProfile';
import UpdatePassword from './Components/User/UpdatePassword';
import Wishlist from './Components/User/Wishlist';

// Product Components
import Products from './Components/Product/Products';
import ProductDetails from './Components/Product/ProductDetails';

// Cart Components
import Cart from './Components/Cart/Cart';
import Shipping from './Components/Cart/Shipping';
import ConfirmOrder from './Components/Cart/ConfirmOrder';

// Order Components
import ListOrders from './Components/Order/ListOrders';
import OrderDetails from './Components/Order/OrderDetails';

// Admin Components
import Dashboard from './Components/Admin/Dashboard';
import CategoryList from './Components/Admin/CategoryList';
import NewCategory from './Components/Admin/NewCategory';
import UpdateCategory from './Components/Admin/UpdateCategory';
import ProductsList from './Components/Admin/ProductsList';
import NewProduct from './Components/Admin/NewProduct';
import UpdateProduct from './Components/Admin/UpdateProduct';
import AdminProductDetails from './Components/Admin/ProductDetails';
import UsersList from './Components/Admin/UsersList';
import UpdateUser from './Components/Admin/UpdateUser';
import UserDetails from './Components/Admin/UserDetails';
import OrdersList from './Components/Admin/OrdersList';
import ProcessOrder from './Components/Admin/ProcessOrder';
import ProductReviews from './Components/Admin/ProductReviews';
import ProtectedRoute from './Components/Route/ProtectedRoute';

function App() {

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<div className="container container-fluid"><Home /></div>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route 
              path="/me" 
              element={
                <ProtectedRoute>
                  <div className="container container-fluid"><Profile /></div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/me/update" 
              element={
                <ProtectedRoute>
                  <div className="container container-fluid"><UpdateProfile /></div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/password/update" 
              element={
                <ProtectedRoute>
                  <div className="container container-fluid"><UpdatePassword /></div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wishlist" 
              element={
                <ProtectedRoute>
                  <div className="container container-fluid"><Wishlist /></div>
                </ProtectedRoute>
              } 
            />

            {/* Product Routes */}
            <Route path="/products" element={<div className="container container-fluid"><Products /></div>} />
            <Route path="/product/:id" element={<div className="container container-fluid"><ProductDetails /></div>} />

            {/* Cart Routes */}
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <div className="container container-fluid"><Cart /></div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shipping" 
              element={
                <ProtectedRoute>
                  <div className="container container-fluid"><Shipping /></div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/confirm-order" 
              element={
                <ProtectedRoute>
                  <div className="container container-fluid"><ConfirmOrder /></div>
                </ProtectedRoute>
              } 
            />

            {/* Order Routes */}
            <Route 
              path="/orders/me" 
              element={
                <ProtectedRoute>
                  <div className="container container-fluid"><ListOrders /></div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order/:id" 
              element={
                <ProtectedRoute>
                  <div className="container container-fluid"><OrderDetails /></div>
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes - No container for full width */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Category Routes */}
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <CategoryList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/category/new" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <NewCategory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/category/:id" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <UpdateCategory />
                </ProtectedRoute>
              } 
            />

            {/* Admin Product Routes */}
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <ProductsList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/product/new" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <NewProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/product/:id" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <UpdateProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/product/:id/details" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <AdminProductDetails />
                </ProtectedRoute>
              } 
            />

            {/* Admin User Routes */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <UsersList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/user/:id" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <UpdateUser />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/user/:id/details" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <UserDetails />
                </ProtectedRoute>
              } 
            />

            {/* Admin Order Routes */}
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <OrdersList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/order/:id" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <ProcessOrder />
                </ProtectedRoute>
              } 
            />

            {/* Admin Review Route */}
            <Route 
              path="/admin/reviews" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <ProductReviews />
                </ProtectedRoute>
              } 
            />
          </Routes>
        <Footer />
        <ToastContainer 
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  )
}

export default App
