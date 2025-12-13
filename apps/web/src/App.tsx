import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/onboarding" element={<div className="p-8">Onboarding (Coming Soon)</div>} />
        <Route path="/dashboard" element={<div className="p-8">Dashboard (Coming Soon)</div>} />
        <Route path="/checkout" element={<div className="p-8">Checkout (Coming Soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
