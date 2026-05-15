import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import DesktopHeader from './components/DesktopHeader';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Deals from './pages/Deals';
import AddOrder from './pages/AddOrder';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Inquiries from './pages/Inquiries';
import AddInquiry from './pages/AddInquiry';
import InquiryDetails from './pages/InquiryDetails';
import OrderDetails from './pages/OrderDetails';
import Clients from './pages/Clients';
import AddClient from './pages/AddClient';
import FabricEntryPublic from './pages/FabricEntryPublic';
import FabricEntryPublicPdf from './pages/FabricEntryPublicPdf';
import PublicInventoryView from './pages/PublicInventoryView';
import api from './utils/api';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const HomeRoute = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  return <Dashboard />;
};

/**
 * On every app load, silently fetch the latest user data from the backend
 * and refresh localStorage. This keeps profile picture and other fields
 * in sync across all devices without requiring a re-login.
 */
const useSyncUser = () => {
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!isAuthenticated || !user.id) return;

    api.get(`/api/users/${user.id}`)
      .then(res => {
        const fresh = res.data;
        if (!fresh) return;
        // Merge server data into local user
        const merged = { ...user, ...fresh };
        localStorage.setItem('user', JSON.stringify(merged));
        // Only notify components if the profile picture actually changed
        // (avoids interfering with the upload-done banner timer)
        if (fresh.profilePictureUrl !== user.profilePictureUrl) {
          window.dispatchEvent(new Event('userProfileUpdated'));
        }
      })
      .catch(() => {
        // Silently ignore — offline or cold-start, use cached data
      });
  }, []); // run once on mount
};

function App() {
  useSyncUser();
  const location = useLocation();

  // Auth pages don't show the navigation header
  const isAuthPage = ['/login', '/signup'].some(path => location.pathname.includes(path));
  // Public pages that don't need header
  const isPublicPage = location.pathname.startsWith('/public/') || location.pathname.startsWith('/f/');
  const showHeader = !isAuthPage && !isPublicPage;

  return (
    <div className="app-root-wrapper">
      {showHeader && <DesktopHeader />}
      
      <div className="page-container">
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/public/fabric-entry/:id" element={<FabricEntryPublic />} />
            <Route path="/public/fabric-entry/:id/pdf" element={<FabricEntryPublicPdf />} />
            <Route path="/f/:id/p" element={<FabricEntryPublicPdf />} />
            <Route path="/public/inventory/:id" element={<PublicInventoryView />} />

            <Route path="/" element={<ProtectedRoute><HomeRoute /></ProtectedRoute>} />
            <Route path="/deals" element={<ProtectedRoute><Deals /></ProtectedRoute>} />
            <Route path="/deal-detail/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/add-order" element={<ProtectedRoute><AddOrder /></ProtectedRoute>} />
            <Route path="/add-deal" element={<Navigate to="/add-order" replace />} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/profile/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/inquiries" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
            <Route path="/add-inquiry" element={<ProtectedRoute><AddInquiry /></ProtectedRoute>} />
            <Route path="/inquiry/:id" element={<ProtectedRoute><InquiryDetails /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/add-client" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;

