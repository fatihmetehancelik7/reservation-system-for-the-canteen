import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { CreditCard, Calendar } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const isAdmin = user?.rol === 'ADMIN';

    return (
        <div className="fade-in">
            <h1 className="page-title">Hoş Geldiniz, {user?.ad} {user?.soyad}</h1>

            <div className="grid-2">
                {!isAdmin && (
                    <Card title="Hızlı İşlemler">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <a href="/monthly-selection" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <Calendar size={20} />
                                Yeni Aylık Rezervasyon Yap
                            </a>
                            <a href="/my-payments" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <CreditCard size={20} />
                                Ödeme Geçmişim
                            </a>
                        </div>
                    </Card>
                )}

                {isAdmin && (
                    <Card title="Yönetim İşlemleri">
                        <p>Sol menüyü kullanarak tatil günlerini tanımlayabilir, aylık menüleri girebilir ve kullanıcı ödemelerini takip edebilirsiniz.</p>
                        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                            <li>Önce 2026 Tatil Günlerini tanımlayın.</li>
                            <li>Sonra iş günleri için Menüleri ekleyin.</li>
                            <li>Kullanıcılar ilgili ay için günleri seçip toplu ödeme yapacaktır.</li>
                        </ul>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
