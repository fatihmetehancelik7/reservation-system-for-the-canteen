import { Link, useRouteError } from 'react-router-dom';

const RouteError = () => {
    const error = useRouteError();
    const message = error?.response?.data?.error || error?.data?.error || error?.message || 'Sayfa yüklenirken bir hata oluştu.';

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.08)' }}>
                <h2 style={{ marginTop: 0 }}>İşlem tamamlanamadı</h2>
                <p style={{ color: 'var(--text-muted)' }}>{message}</p>
                <Link to="/dashboard" className="btn btn-primary">Panele dön</Link>
            </div>
        </div>
    );
};

export default RouteError;
