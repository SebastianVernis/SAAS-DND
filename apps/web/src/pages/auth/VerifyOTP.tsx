import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]; // Only one digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    if (newOtp.every((digit) => digit !== '')) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleSubmit = async (code?: string) => {
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Por favor ingresa los 6 dígitos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authApi.verifyOtp({
        email,
        code: otpCode,
      });

      const { token, user, organization } = response.data;

      // Get full session
      const sessionResponse = await authApi.getSession();
      const { subscription } = sessionResponse.data;

      setAuth({
        user,
        organization,
        subscription,
        token,
      });

      // Redirect to onboarding or dashboard
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código OTP inválido');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      await authApi.resendOtp({ email });
      setTimeLeft(600); // Reset timer
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al reenviar código');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎨 DragNDrop</h1>
          <p className="text-white/80">Verifica tu email</p>
        </div>

        {/* Verify Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Revisa tu Email
            </h2>
            <p className="text-gray-600 text-sm">
              Hemos enviado un código de 6 dígitos a
              <br />
              <strong className="text-gray-900">{email}</strong>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* OTP Inputs */}
          <div className="mb-6">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Código expira en:{' '}
              <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-purple-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>

          {/* Resend Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleResend}
              disabled={resending || timeLeft > 540} // Can resend after 1 minute
              className="text-purple-600 hover:text-purple-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Reenviando...' : '🔄 Reenviar código'}
            </button>
          </div>

          <button
            onClick={() => handleSubmit()}
            disabled={loading || otp.some((d) => !d)}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Verificar Código'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿Email incorrecto?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
                Cambiar email
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-white hover:text-white/80 text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
