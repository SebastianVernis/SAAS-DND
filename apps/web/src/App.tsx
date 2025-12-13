import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<div className="p-8">Login Page (Coming Soon)</div>} />
        <Route path="/register" element={<div className="p-8">Register Page (Coming Soon)</div>} />
        <Route path="/dashboard" element={<div className="p-8">Dashboard (Coming Soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
