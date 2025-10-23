import { lazy, Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Login = lazy(() => import('./modules/login/Login'));
const Otp = lazy(() => import('./modules/otp/Otp'));
const Layout = lazy(() => import('./components/layout/Layout'));
const DynamicRoute = lazy(() => import('./routes/DynamicRoute'));

const LoadingScreen = () => (
  <div
    className='fixed inset-0 z-[100000] flex items-center justify-center'
    style={{ background: 'rgba(236,240,245,0.92)' }}>
    <CircularProgress size={60} sx={{ color: 'rgb(59,130,246)' }} thickness={4} />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/otp' element={<Otp />} />
            <Route path='/' element={<Layout />}>
              <Route path='*' element={<DynamicRoute />} />
            </Route>
            <Route path='*' element={<div>404</div>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
