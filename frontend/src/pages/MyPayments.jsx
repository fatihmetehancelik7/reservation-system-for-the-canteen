import { useState, useCallback } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getUserTransactions } from '../services/reservationService';
import { getUserRefunds, markRefunded } from '../services/holidayService';
import Card from '../components/Card';
import Table from '../components/Table';
import { CreditCard, RefreshCcw, AlertTriangle, DollarSign, CheckCheck } from 'lucide-react';

const MyPayments = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('payments');
    const [bulkLoading, setBulkLoading] = useState(false);
    const queryClient = useQueryClient();
    const [transactionsQuery, refundsQuery] = useQueries({
        queries: [
            { queryKey: ['transactions', 'user', user?.id], queryFn: () => getUserTransactions(user.id), enabled: !!user?.id },
            { queryKey: ['refunds', 'user', user?.id], queryFn: () => getUserRefunds(user.id), enabled: !!user?.id },
        ],
    });

    const transactions = transactionsQuery.data ?? [];
    const refunds = refundsQuery.data ?? [];
    const loading = transactionsQuery.isLoading || refundsQuery.isLoading;

    const handleBulkMarkRefunded = useCallback(async () => {
        const pending = refunds.filter(r => !r.isRefunded);
        if (pending.length === 0) return;
        const total = pending.reduce((s, r) => s + r.iadeEdilen, 0);
        if (!window.confirm(`Toplam ${total} TL tutarındaki ${pending.length} iade kalemini nakit/kredi olarak tümünü aldığınızı onaylıyor musunuz?`)) return;
        setBulkLoading(true);
        try {
            await Promise.all(pending.map(r => markRefunded(r.id)));
            queryClient.invalidateQueries(['refunds', 'user', user.id]);
        } catch (e) {
            alert('Toplu işlem sırasında hata oluştu.');
        } finally {
            setBulkLoading(false);
        }
    }, [refunds, queryClient, user]);

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
            header: 'Tutar',
            render: (row) => (
                <span style={{ color: '#10B981', fontWeight: '700', fontSize: '1rem' }}>
                    {row.iadeEdilen} TL
                </span>
            )
        },
        {
            field: 'status',
            header: 'İşlem',
            render: (row) => {
                if (row.isRefunded) {
                    return (
                        <span style={{ padding: '0.25rem 0.5rem', background: '#D1FAE5', color: '#065F46', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                            İADE ALINDI
                        </span>
                    );
                }
                return (
                    <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                        onClick={async () => {
                            if (window.confirm('Bu tutarı nakit/kredi olarak geri aldığınızı onaylıyor musunuz?')) {
                                try {
                                    await markRefunded(row.id);
                                    queryClient.invalidateQueries(['refunds', 'user', user.id]);
                                } catch (e) {
                                    alert('İşlem başarısız.');
                                }
                            }
                        }}
                    >
                        İade Aldım
                    </button>
                );
            }
        }
    ];

    const totalPaid = transactions.reduce((sum, r) => {
        if (r.islemTipi === 'İPTAL') return sum; // İptaller fiyattan düşmez, iade olarak hesaba katılır
        return sum + r.islemTutari;
    }, 0);
    
    // Yalnızca İade Alındı olarak işaretlenenler Toplam İadeye yansır
    const totalRefunded = refunds.filter(r => r.isRefunded).reduce((sum, r) => sum + r.iadeEdilen, 0);

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

            {refunds.some(r => !r.isRefunded) && (
                <div style={{
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    border: '1px solid #F59E0B',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#92400E'
                }}>
                    <AlertTriangle size={20} color="#D97706" />
                    <div>
                        <strong>Bekleyen İadeleriniz Var:</strong> Henüz tahsil etmediğiniz{' '}
                        <strong>{refunds.filter(r => !r.isRefunded).reduce((s, r) => s + r.iadeEdilen, 0)} TL</strong> iade tutarınız bulunmaktadır. Parayı aldığınızda tablodan "İade Aldım" olarak işaretleyiniz.
                    </div>
                </div>
            )}

            <Card>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <button style={tabStyle('payments')} onClick={() => setActiveTab('payments')}>
                        <CreditCard size={18} /> Ödemelerim ({transactions.length})
                    </button>
                    <button style={tabStyle('refunds')} onClick={() => setActiveTab('refunds')}>
                        <RefreshCcw size={18} /> Bekleyen/Alınan İadeler ({refunds.length})
                        {refunds.filter(r => !r.isRefunded).length > 0 && (
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
                                {refunds.filter(r => !r.isRefunded).length}
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
                    refunds.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <RefreshCcw size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Henüz iptal veya iade bulunmamaktadır.</p>
                        </div>
                    ) : (
                        <>
                            {refunds.some(r => !r.isRefunded) && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#059669', borderColor: '#059669' }}
                                        onClick={handleBulkMarkRefunded}
                                        disabled={bulkLoading}
                                    >
                                        <CheckCheck size={16} />
                                        {bulkLoading ? 'İşleniyor...' : `Tümünü İade Aldım (${refunds.filter(r => !r.isRefunded).reduce((s, r) => s + r.iadeEdilen, 0)} TL)`}
                                    </button>
                                </div>
                            )}
                            <Table columns={refundColumns} data={refunds} />
                        </>
                    )
                )}
            </Card>
        </div>
    );
};

export default MyPayments;
