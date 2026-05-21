import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../services/authService';
import { CalendarDays, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [error, setError] = useState('');
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const loginMutation = useMutation({
        mutationFn: () => loginApi(email, sifre),
        onSuccess: (data) => {
            login(data);
            navigate(from, { replace: true });
        },
        onError: (err) => {
            setError(err.response?.data?.error || 'Giriş başarısız.');
        },
    });

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        loginMutation.mutate();
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: '#EEF2FF', color: 'var(--primary)', borderRadius: '50%', marginBottom: '1rem' }}>
                        <CalendarDays size={40} />
                    </div>
                    <h2 style={{ margin: 0 }}>Yemekhane Rezervasyon</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Aylık Seçim & Ödeme Sistemi</p>
                </div>

                {error && (
                    <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Şifre</label>
                        <input
                            type="password"
                            className="form-control"
                            value={sifre}
                            onChange={(e) => setSifre(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }} disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <p>Demo Hesaplar:</p>
                    <p>admin@yemekhane.com / 123456</p>
                    <p>kullanici@yemekhane.com / 123456</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
