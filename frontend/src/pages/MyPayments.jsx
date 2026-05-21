import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getUserTransactions } from '../services/reservationService';
import { getUserRefunds } from '../services/holidayService';
import Card from '../components/Card';
import Table from '../components/Table';
import { CreditCard, RefreshCcw, AlertTriangle, DollarSign } from 'lucide-react';

const MyPayments = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('payments');
    const [transactionsQuery, refundsQuery] = useQueries({
        queries: [
            { queryKey: ['transactions', 'user', user?.id], queryFn: () => getUserTransactions(user.id), enabled: !!user?.id },
            { queryKey: ['refunds', 'user', user?.id], queryFn: () => getUserRefunds(user.id), enabled: !!user?.id },
        ],
    });

    const transactions = transactionsQuery.data ?? [];
    const refunds = refundsQuery.data ?? [];
    const loading = transactionsQuery.isLoading || refundsQuery.isLoading;

    const paymentColumns = [
        { field: 'yil', header: 'Yıl' },
        {
            field: 'ay',
            header: 'Ay',
            render: (row) => new Date(row.yil, row.ay - 1, 1).toLocaleDateString('tr-TR', { month: 'long' })
        },
        { field: 'islemTarihi', header: 'İşlem Tarihi', render: (row) => new Date(row.islemTarihi).toLocaleString('tr-TR') },
        { field: 'islemGunSayisi', header: 'Gün Sayısı Farkı', render: (row) => row.islemTipi === 'İPTAL' ? `-${Math.abs(row.islemGunSayisi)} Gün` : `+${row.islemGunSayisi} Gün` },
        { field: 'islemTutari', header: 'Tutar (TL)', render: (row) => row.islemTipi === 'İPTAL' ? `-${row.islemTutari} TL` : `+${row.islemTutari} TL` },
        {
            field: 'islemTipi',
            header: 'İşlem Tipi',
            render: (row) => {
                let bg = '#F3F4F6'; let color = '#4B5563';
                if (row.islemTipi === 'YENİ REZERVASYON') { bg = '#D1FAE5'; color = '#065F46'; }
                else if (row.islemTipi === 'EK ÖDEME') { bg = '#DBEAFE'; color = '#1E40AF'; }
                else if (row.islemTipi === 'İPTAL') { bg = '#FEE2E2'; color = '#991B1B'; }
                return (
                    <span style={{ padding: '0.25rem 0.5rem', background: bg, color, borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                        {row.islemTipi}
                    </span>
                );
            }
        }
    ];

    const refundColumns = [
        {
            field: 'islemTarihi',
            header: 'İade Tarihi',
            render: (row) => new Date(row.islemTarihi).toLocaleString('tr-TR')
        },
        {
            field: 'tatilTarihi',
            header: 'İptal Edilen Gün',
            render: (row) => new Date(row.tatilTarihi).toLocaleDateString('tr-TR')
        },
        { field: 'tatilAciklama', header: 'Neden' },
        {
            field: 'iadeEdilen',
            header: 'İade Tutarı',
            render: (row) => (
                <span style={{ color: '#10B981', fontWeight: '700', fontSize: '1rem' }}>
                    + {row.iadeEdilen} TL
                </span>
            )
        },
        {
            field: 'status',
            header: 'Durum',
            render: () => (
                <span style={{ padding: '0.25rem 0.5rem', background: '#FEF3C7', color: '#92400E', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                    İADE EDİLDİ
                </span>
            )
        }
    ];

    const holidayRefunds = refunds.filter(r => r.tatilAciklama !== 'Kullanıcı rezervasyon iptali');
    
    const totalPaid = transactions.reduce((sum, r) => {
        if (r.islemTipi === 'İPTAL') return sum - r.islemTutari;
        return sum + r.islemTutari;
    }, 0);
    const totalRefunded = holidayRefunds.reduce((sum, r) => sum + r.iadeEdilen, 0);

    const tabStyle = (tab) => ({
        padding: '0.65rem 1.5rem',
        border: 'none',
        borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
        background: 'transparent',
        color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: activeTab === tab ? '700' : '500',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
    });

    return (
        <div className="fade-in">
            <h1 className="page-title">Ödeme Geçmişim</h1>

            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toplam Ödeme</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalPaid} TL</div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#FEF3C7', padding: '1rem', borderRadius: '50%', color: '#92400E' }}>
                            <RefreshCcw size={24} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toplam İade</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>+ {totalRefunded} TL</div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#D1FAE5', padding: '1rem', borderRadius: '50%', color: '#059669' }}>
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Net Tutar</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{totalPaid - totalRefunded} TL</div>
                        </div>
                    </div>
                </Card>
            </div>

            {holidayRefunds.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                    border: '1px solid #34D399',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#065F46'
                }}>
                    <AlertTriangle size={20} color="#10B981" />
                    <div>
                        <strong>Tatil İade Bildirimi:</strong> Rezervasyon yaptığınız{' '}
                        <strong>{holidayRefunds.length} gün</strong> tatil ilan edilmiş olup toplamda{' '}
                        <strong>{totalRefunded} TL</strong> iade alacaksınız.
                        Detaylar için "İadelerim" sekmesine bakınız.
                    </div>
                </div>
            )}

            <Card>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <button style={tabStyle('payments')} onClick={() => setActiveTab('payments')}>
                        <CreditCard size={18} /> Ödemelerim ({transactions.length})
                    </button>
                    <button style={tabStyle('refunds')} onClick={() => setActiveTab('refunds')}>
                        <RefreshCcw size={18} /> İadelerim ({holidayRefunds.length})
                        {holidayRefunds.length > 0 && (
                            <span style={{
                                background: '#EF4444',
                                color: 'white',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {holidayRefunds.length}
                            </span>
                        )}
                    </button>
                </div>

                {transactionsQuery.isError || refundsQuery.isError ? (
                    <div className="text-danger">Ödeme ve iade verileri yüklenirken hata oluştu.</div>
                ) : loading ? (
                    <p>Yükleniyor...</p>
                ) : activeTab === 'payments' ? (
                    <Table columns={paymentColumns} data={transactions} />
                ) : (
                    holidayRefunds.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <RefreshCcw size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Henüz iade bulunmamaktadır.</p>
                        </div>
                    ) : (
                        <Table columns={refundColumns} data={holidayRefunds} />
                    )
                )}
            </Card>
        </div>
    );
};

export default MyPayments;
