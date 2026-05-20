import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getAllReservations } from '../services/reservationService';
import { getAllRefunds } from '../services/holidayService';
import Card from '../components/Card';
import Table from '../components/Table';
import { Users, DollarSign, RefreshCcw, AlertTriangle } from 'lucide-react';

const AdminReservations = () => {
    const [activeTab, setActiveTab] = useState('reservations');
    const [reservationsQuery, refundsQuery] = useQueries({
        queries: [
            { queryKey: ['reservations', 'all'], queryFn: getAllReservations },
            { queryKey: ['refunds', 'all'], queryFn: getAllRefunds },
        ],
    });

    const reservations = reservationsQuery.data ?? [];
    const refunds = refundsQuery.data ?? [];
    const loading = reservationsQuery.isLoading || refundsQuery.isLoading;

    const reservationColumns = [
        { field: 'islemTarihi', header: 'İşlem Tarihi', render: (row) => new Date(row.islemTarihi).toLocaleString('tr-TR') },
        { field: 'user', header: 'Kullanıcı', render: (row) => `${row.user.ad} ${row.user.soyad}` },
        { field: 'user', header: 'E-posta', render: (row) => row.user.email },
        { field: 'ay', header: 'Dönem', render: (row) => `${new Date(row.yil, row.ay - 1, 1).toLocaleDateString('tr-TR', { month: 'long' })} ${row.yil}` },
        { field: 'secilenGunSayisi', header: 'Seçilen Gün' },
        { field: 'toplamTutar', header: 'Tutar (TL)', render: (row) => `${row.toplamTutar} TL` },
        {
            field: 'odemeDurumu',
            header: 'Durum',
            render: (row) => (
                <span style={{ padding: '0.25rem 0.5rem', background: '#D1FAE5', color: '#065F46', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                    {row.odemeDurumu}
                </span>
            )
        }
    ];

    const refundColumns = [
        {
            field: 'islemTarihi',
            header: 'İade Tarihi',
            render: (row) => new Date(row.islemTarihi).toLocaleString('tr-TR')
        },
        { field: 'user', header: 'Kullanıcı', render: (row) => `${row.user.ad} ${row.user.soyad}` },
        { field: 'user', header: 'E-posta', render: (row) => row.user.email },
        {
            field: 'tatilTarihi',
            header: 'Tatil Günü',
            render: (row) => new Date(row.tatilTarihi).toLocaleDateString('tr-TR')
        },
        { field: 'tatilAciklama', header: 'Tatil Açıklaması' },
        {
            field: 'iadeEdilen',
            header: 'İade Tutarı',
            render: (row) => (
                <span style={{ color: '#10B981', fontWeight: '700' }}>
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

    const totalRevenue = reservations.reduce((sum, r) => sum + r.toplamTutar, 0);
    const totalRefunded = refunds.reduce((sum, r) => sum + r.iadeEdilen, 0);

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
            <h1 className="page-title">Tüm Ödemeler ve Rezervasyonlar</h1>

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#EEF2FF', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toplam Rezervasyon</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reservations.length} İşlem</div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#D1FAE5', padding: '1rem', borderRadius: '50%', color: '#065F46' }}>
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Net Ciro</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalRevenue - totalRefunded} TL</div>
                            {totalRefunded > 0 && (
                                <div style={{ fontSize: '0.8rem', color: '#EF4444' }}>
                                    ({totalRevenue} TL toplam - {totalRefunded} TL iade)
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {refunds.length > 0 && (
                <div style={{
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: '10px',
                    padding: '1rem 1.5rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#92400E'
                }}>
                    <AlertTriangle size={20} />
                    <span>
                        <strong>{refunds.length} iade işlemi</strong> gerçekleştirilmiştir.
                        Toplam <strong>{totalRefunded} TL</strong> iade edilmiştir.
                    </span>
                </div>
            )}

            <Card>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <button style={tabStyle('reservations')} onClick={() => setActiveTab('reservations')}>
                        <Users size={18} /> Rezervasyonlar ({reservations.length})
                    </button>
                    <button style={tabStyle('refunds')} onClick={() => setActiveTab('refunds')}>
                        <RefreshCcw size={18} /> İadeler ({refunds.length})
                    </button>
                </div>

                {reservationsQuery.isError || refundsQuery.isError ? (
                    <div className="text-danger">Rezervasyon ve iade verileri yüklenirken hata oluştu.</div>
                ) : loading ? (
                    <p>Yükleniyor...</p>
                ) : activeTab === 'reservations' ? (
                    <Table columns={reservationColumns} data={reservations} />
                ) : (
                    refunds.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <RefreshCcw size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Henüz iade işlemi bulunmamaktadır.</p>
                        </div>
                    ) : (
                        <Table columns={refundColumns} data={refunds} />
                    )
                )}
            </Card>
        </div>
    );
};

export default AdminReservations;
