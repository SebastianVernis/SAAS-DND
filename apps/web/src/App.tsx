import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/onboarding" element={<div className="p-8">Onboarding (Agente trabajando...)</div>} />
        <Route path="/checkout" element={<div className="p-8">Checkout (Coming Soon)</div>} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="projects" element={<div className="p-8">Projects (Coming Soon)</div>} />
          <Route path="team" element={<div className="p-8">Team (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
          <Route path="billing" element={<div className="p-8">Billing (Coming Soon)</div>} />
        </Route>

        {/* Editor */}
        <Route path="/editor/:projectId" element={<div className="p-8">Editor (Coming Soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
