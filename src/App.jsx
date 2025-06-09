import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ComingSoonPage from './pages/ComingSoonPage';
import OrderPage from './pages/OrderPage';
import ProductList from './components/molecules/ProductList';
import ProductFormModal from './components/AddProducts/ProductFormModal';
import MarketingPage from './pages/MarketingPage';
import PaymentDashboard from './components/molecules/PaymentDashboard';
import TopSellersList from './pages/TopSellers';
import CategoryPage from './pages/Categorypage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import ProfilePage from './pages/profilepage';
import EditProduct from './components/AddProducts/EditProduct';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/Addproducts" element={<ProductFormModal />} />
            <Route path="/editproduct/:productId" element={<EditProduct />} />
            <Route path="/topsellers" element={<TopSellersList />} />
            {/* <Route path="/marketing" element={<MarketingPage />} /> */} 
            <Route path="/payments" element={<PaymentDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="*" element={<ComingSoonPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="bottom-center" />
    </Router>
  );
}
