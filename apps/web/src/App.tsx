import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load all pages for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'));
const OnboardingWizard = lazy(() => import('./pages/onboarding/OnboardingWizard'));
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/Home'));
const Projects = lazy(() => import('./pages/dashboard/Projects'));
const Team = lazy(() => import('./pages/dashboard/Team'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/checkout" element={<div className="p-8">Checkout (Coming Soon)</div>} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="projects" element={<Projects />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
            <Route path="billing" element={<div className="p-8">Billing (Coming Soon)</div>} />
          </Route>

          {/* Editor */}
          <Route path="/editor/:projectId" element={<div className="p-8">Editor (Coming Soon)</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
