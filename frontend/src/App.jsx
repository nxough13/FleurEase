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
        <div className="container container-fluid">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route 
              path="/me" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/me/update" 
              element={
                <ProtectedRoute>
                  <UpdateProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/password/update" 
              element={
                <ProtectedRoute>
                  <UpdatePassword />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wishlist" 
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } 
            />

            {/* Product Routes */}
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />

            {/* Cart Routes */}
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shipping" 
              element={
                <ProtectedRoute>
                  <Shipping />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/confirm-order" 
              element={
                <ProtectedRoute>
                  <ConfirmOrder />
                </ProtectedRoute>
              } 
            />

            {/* Order Routes */}
            <Route 
              path="/orders/me" 
              element={
                <ProtectedRoute>
                  <ListOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order/:id" 
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
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

            {/* Product Routes */}
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

            {/* User Routes */}
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
        </div>
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
