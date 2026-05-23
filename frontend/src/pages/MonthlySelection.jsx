import { useMemo, useState } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getMenusByMonth } from '../services/menuService';
import { processBulkReservations, getUserReservations } from '../services/reservationService';
import { getAllHolidays } from '../services/holidayService';
import Card from '../components/Card';
import { Check, CreditCard } from 'lucide-react';

const MonthlySelection = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const currentYear = 2026;

    const timeQuery = useQuery({
        queryKey: ['istanbulTime'],
        queryFn: async () => {
            try {
                const res = await fetch('http://worldtimeapi.org/api/timezone/Europe/Istanbul');
                const data = await res.json();
                return data.datetime.split('T')[0];
            } catch {
                const d = new Date();
                const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                const ist = new Date(utc + (3600000 * 3));
                return ist.toISOString().split('T')[0];
            }
        },
        staleTime: 1000 * 60, // 1 dakika
        refetchInterval: 1000 * 60, // her 1 dakikada bir otomatik yenile
    });
    
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedDaysByMonth, setSelectedDaysByMonth] = useState({});
    const [error, setError] = useState('');

    const [menusQuery, holidaysQuery, reservationsQuery] = useQueries({
        queries: [
            { queryKey: ['menus', currentYear, selectedMonth], queryFn: () => getMenusByMonth(currentYear, selectedMonth) },
            { queryKey: ['holidays'], queryFn: getAllHolidays },
            {
                queryKey: ['reservations', 'user', user?.id],
                queryFn: () => getUserReservations(user.id),
                enabled: !!user?.id,
            },
        ],
    });

    const menus = menusQuery.data ?? [];
    const holidays = useMemo(() => (holidaysQuery.data ?? []).map(h => h.tarih), [holidaysQuery.data]);
    const reservations = useMemo(() => reservationsQuery.data ?? [], [reservationsQuery.data]);
    const existingReservation = useMemo(
        () => reservations.find(r => r.yil === currentYear && r.ay === selectedMonth) ?? null,
        [reservations, selectedMonth]
    );
    const selectableExistingDays = useMemo(
        () => (existingReservation?.secilenGunler ?? []).filter(dateStr => !holidays.includes(dateStr)),
        [existingReservation, holidays]
    );
    const selectedDays = (selectedDaysByMonth[selectedMonth] ?? selectableExistingDays)
        .filter(dateStr => !holidays.includes(dateStr));
    const loading = menusQuery.isLoading || holidaysQuery.isLoading || reservationsQuery.isLoading;

    const bulkReservationMutation = useMutation({
        mutationFn: processBulkReservations,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations', 'user', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', 'user', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['refunds', 'user', user?.id] });
        },
    });

    const getDaysInMonth = () => {
        const date = new Date(currentYear, selectedMonth - 1, 1);
        const days = [];
        while (date.getMonth() === selectedMonth - 1) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                const dateStr = localDate.toISOString().split('T')[0];
                days.push({
                    dateStr,
                    dayNum: date.getDate(),
                    dayName: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
                    isHoliday: holidays.includes(dateStr),
                    menu: menus.find(m => m.tarih === dateStr)
                });
            }
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const toggleDaySelection = (dateStr, isHoliday, hasMenu) => {
        if (isHoliday || !hasMenu) return;

        const todayStr = timeQuery.data;
        if (!todayStr) return; // wait for time

        if (existingReservation && dateStr <= todayStr) {
            return;
        }

        setSelectedDaysByMonth(prev => {
            const currentSelection = (prev[selectedMonth] ?? selectableExistingDays)
                .filter(d => !holidays.includes(d));
            const nextSelection = currentSelection.includes(dateStr)
                ? currentSelection.filter(d => d !== dateStr)
                : [...currentSelection, dateStr];

            return {
                ...prev,
                [selectedMonth]: nextSelection,
            };
        });
    };

    const handleMonthChange = (e) => {
        setError('');
        setSelectedMonth(Number(e.target.value));
    };

    // ── Tüm ayların özeti ve Global Sepet ───────────────────────────────────
    const monthName = (m) => new Date(2026, m - 1, 1).toLocaleDateString('tr-TR', { month: 'long' });

    const allMonthsBreakdown = Array.from({ length: 12 }, (_, i) => i + 1).reduce((acc, m) => {
        const existingForMonth = reservations.find(r => r.yil === currentYear && r.ay === m);
        const pendingDays = selectedDaysByMonth[m];
        let dayCnt = 0;
        let isPending = false;
        let isChanged = false;
        let oldDayCnt = 0;
        let diffDays = 0;

        let oldDaysArr = [];

        if (existingForMonth) {
            oldDaysArr = (existingForMonth.secilenGunler ?? []).filter(d => !holidays.includes(d));
            oldDayCnt = oldDaysArr.length;
        }

        if (pendingDays !== undefined) {
            const validPendingDays = pendingDays.filter(d => !holidays.includes(d));
            dayCnt = validPendingDays.length;
            isPending = true;
            
            // Gerçekten değiştiğini anlamak için sadece sayıya değil içeriğe de bakmalıyız
            const sortedPending = [...validPendingDays].sort();
            const sortedOld = [...oldDaysArr].sort();
            isChanged = JSON.stringify(sortedPending) !== JSON.stringify(sortedOld);
            
            diffDays = dayCnt - oldDayCnt;
        } else if (existingForMonth) {
            dayCnt = oldDayCnt;
        }

        if (dayCnt > 0 || isChanged) {
            acc.push({ 
                month: m, 
                days: dayCnt, 
                oldDays: oldDayCnt,
                isPending, 
                isChanged,
                diffDays,
                existing: existingForMonth, 
                pendingDays: selectedDaysByMonth[m] 
            });
        }
        return acc;
    }, []);

    const hasChanges = allMonthsBreakdown.some(x => x.isChanged);
    const globalDiffDays = allMonthsBreakdown.reduce((s, x) => s + (x.isChanged ? x.diffDays : 0), 0);
    const globalDiffAmount = globalDiffDays * 100;
    
    let globalType = 'NO_DIFFERENCE';
    if (globalDiffAmount > 0) globalType = 'PAYMENT_REQUIRED';
    else if (globalDiffAmount < 0) globalType = 'REFUND_REQUIRED';

    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleProcessChanges = async () => {
        if (!hasChanges) return;
        
        const changedMonths = allMonthsBreakdown.filter(x => x.isChanged);
        
        let confirmMsg = 'Değişiklikleri kaydetmek istediğinize emin misiniz?';
        if (globalType === 'PAYMENT_REQUIRED') {
            confirmMsg = `Toplam ${globalDiffAmount} TL tutarında ek ödeme alınacaktır. Onaylıyor musunuz?`;
        } else if (globalType === 'REFUND_REQUIRED') {
            confirmMsg = `Toplam ${Math.abs(globalDiffAmount)} TL tutarında iade oluşturulacaktır. Onaylıyor musunuz?`;
        }

        if (!window.confirm(confirmMsg)) return;

        setError('');
        setIsProcessing(true);
        try {
            const selections = changedMonths.map(item => {
                const daysToSend = (item.pendingDays ?? []).filter(d => !holidays.includes(d));
                return {
                    ay: item.month,
                    secilenGunler: daysToSend,
                    existingReservationId: item.existing ? item.existing.id : null
                };
            });

            await bulkReservationMutation.mutateAsync({
                userId: user.id,
                yil: currentYear,
                selections: selections
            });

            setSelectedDaysByMonth({});
            alert('İşlemleriniz başarıyla tamamlandı!');
        } catch (err) {
            setError(err.response?.data?.error || 'İşlem sırasında hata oluştu.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fade-in">
            <h1 className="page-title">Aylık Rezervasyon ve Ödeme</h1>

            <Card className="mb-4">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bold' }}>Ay Seçimi (2026):</label>
                    <select
                        className="form-control"
                        style={{ width: '200px' }}
                        value={selectedMonth}
                        onChange={handleMonthChange}
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(2026, m - 1, 1).toLocaleDateString('tr-TR', { month: 'long' })}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {error && <div className="alert" style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

            {menusQuery.isError || holidaysQuery.isError || reservationsQuery.isError ? (
                <div className="alert" style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    Takvim verileri yüklenirken bir hata oluştu.
                </div>
            ) : loading ? (
                <p>Takvim yükleniyor...</p>
            ) : (
                <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    {/* ── Takvim ────────────────────────────────────────────────── */}
                    <Card title="Gün Seçimi (Sadece Hafta İçi)">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                            {getDaysInMonth().map(day => {
                                const isSelected = selectedDays.includes(day.dateStr);
                                const isClickable = !day.isHoliday && day.menu;
                                const todayStr = timeQuery.data;
                                const isLocked = todayStr ? day.dateStr <= todayStr : true;

                                let bg = '#F9FAFB';
                                let border = '1px solid #E5E7EB';
                                let opacity = 1;

                                if (day.isHoliday) {
                                    bg = '#FEE2E2'; opacity = 0.6;
                                } else if (!day.menu) {
                                    bg = '#F3F4F6'; opacity = 0.6;
                                } else if (isSelected) {
                                    bg = '#EEF2FF'; border = '2px solid var(--primary)';
                                }
                                if (isLocked) opacity = 0.5;

                                return (
                                    <div
                                        key={day.dateStr}
                                        onClick={() => !isLocked && toggleDaySelection(day.dateStr, day.isHoliday, day.menu)}
                                        style={{
                                            background: bg, border, opacity,
                                            padding: '1rem', borderRadius: '8px', textAlign: 'center',
                                            cursor: isLocked ? 'not-allowed' : (isClickable ? 'pointer' : 'not-allowed'),
                                            transition: 'all 0.2s', position: 'relative'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{day.dayNum}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{day.dayName}</div>
                                        <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', fontWeight: '600' }}>
                                            {day.isHoliday ? 'Tatil' : day.menu ? '100 TL' : 'Menü Yok'}
                                        </div>
                                        {day.menu && !day.isHoliday && (
                                            <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3', wordBreak: 'break-word' }}>
                                                {day.menu.yemekListesi}
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>
                                                <Check size={16} style={{ margin: '0 auto' }} />
                                            </div>
                                        )}
                                        {isLocked && (
                                            <div style={{ position: 'absolute', top: '5px', right: '5px', color: '#9CA3AF', fontSize: '0.65rem' }}>
                                                Kilitli
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* ── Ödeme Özeti ───────────────────────────────────────────── */}
                    <Card title="Genel Sepet Özeti">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                            {/* Banner Gösterimi */}
                            <div style={{
                                background: hasChanges 
                                    ? (globalType === 'REFUND_REQUIRED' ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                                       : globalType === 'PAYMENT_REQUIRED' ? 'linear-gradient(135deg, var(--primary) 0%, #818CF8 100%)'
                                       : 'linear-gradient(135deg, var(--surface) 0%, #F3F4F6 100%)')
                                    : 'linear-gradient(135deg, var(--surface) 0%, #F3F4F6 100%)',
                                borderRadius: 12, padding: '1rem 1.25rem',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                border: (!hasChanges || globalType === 'NO_DIFFERENCE') ? '1px solid var(--border)' : 'none'
                            }}>
                                <div>
                                    <div style={{ 
                                        color: (!hasChanges || globalType === 'NO_DIFFERENCE') ? 'var(--text-muted)' : 'rgba(255,255,255,0.9)', 
                                        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.15rem' 
                                    }}>
                                        {hasChanges 
                                            ? (globalType === 'REFUND_REQUIRED' ? 'TOPLAM İADE EDİLECEK TUTAR' 
                                               : globalType === 'PAYMENT_REQUIRED' ? 'TOPLAM ÖDENECEK FARK' 
                                               : 'ÖDEME VEYA İADE FARKI YOK')
                                            : 'BEKLEYEN DEĞİŞİKLİK YOK'
                                        }
                                    </div>
                                    <div style={{ 
                                        color: (!hasChanges || globalType === 'NO_DIFFERENCE') ? 'var(--text-main)' : 'white', 
                                        fontSize: '2rem', fontWeight: 800, lineHeight: 1 
                                    }}>
                                        {hasChanges ? Math.abs(globalDiffAmount).toLocaleString('tr-TR') : '0'} TL
                                    </div>
                                    <div style={{ 
                                        color: (!hasChanges || globalType === 'NO_DIFFERENCE') ? 'var(--text-muted)' : 'rgba(255,255,255,0.8)', 
                                        fontSize: '0.8rem', marginTop: '0.25rem' 
                                    }}>
                                        {hasChanges && globalType !== 'NO_DIFFERENCE'
                                            ? `${globalDiffDays > 0 ? '+' : ''}${globalDiffDays} gün net fark`
                                            : 'Değişiklik yapılmadı'
                                        }
                                    </div>
                                </div>
                                <CreditCard size={38} style={{ color: (!hasChanges || globalType === 'NO_DIFFERENCE') ? '#D1D5DB' : 'rgba(255,255,255,0.35)' }} />
                            </div>

                            {/* Ay ay döküm listesi */}
                            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                                {allMonthsBreakdown.length === 0 ? (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                        Henüz gün seçilmedi.
                                    </div>
                                ) : allMonthsBreakdown.map(({ month, days: cnt, oldDays, isChanged, diffDays, existing }, idx) => {
                                    const isCur  = month === selectedMonth;
                                    const isNew  = isChanged && !existing;
                                    const isEdit = isChanged && !!existing;

                                    return (
                                        <div key={month}
                                            onClick={() => setSelectedMonth(month)}
                                            style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '0.55rem 0.85rem', 
                                                cursor: 'pointer',
                                                background: isCur ? '#EEF2FF' : 'var(--surface)',
                                                borderBottom: idx < allMonthsBreakdown.length - 1 ? '1px solid var(--border)' : 'none',
                                                transition: 'background 0.15s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.88rem', color: isCur ? 'var(--primary)' : 'var(--text-main)', fontWeight: isCur ? 700 : 400, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    {isCur && <span style={{ fontSize: '0.65rem' }}>▶</span>}
                                                    {monthName(month)}
                                                    {isNew  && <span style={{ fontSize: '0.68rem', background: '#D1FAE5', color: '#065F46', padding: '0.1rem 0.35rem', borderRadius: 99, fontWeight: 700 }}>YENİ</span>}
                                                    {isEdit && <span style={{ fontSize: '0.68rem', background: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.35rem', borderRadius: 99, fontWeight: 700 }}>DÜZENLE</span>}
                                                </span>
                                                {isEdit && diffDays !== 0 && (
                                                    <span style={{ fontSize: '0.75rem', color: diffDays > 0 ? '#DC2626' : '#059669', marginTop: '0.15rem' }}>
                                                        {oldDays} gün → {cnt} gün ({diffDays > 0 ? '+' : ''}{diffDays})
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isCur ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                {cnt}&nbsp;gün&nbsp;·&nbsp;{(cnt * 100).toLocaleString('tr-TR')}&nbsp;TL
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Seçilen Ayın Detayları */}
                            {(() => {
                                const activeItem = allMonthsBreakdown.find(x => x.month === selectedMonth);
                                if (!activeItem || !activeItem.isChanged || !activeItem.existing) return null;
                                
                                return (
                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem' }}>
                                            {monthName(selectedMonth).toUpperCase()} – DEĞİŞİKLİK ÖZETİ
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                            <span>Önceki tutar:</span><span>{(activeItem.oldDays * 100).toLocaleString('tr-TR')} TL</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                            <span>Yeni tutar:</span><span>{(activeItem.days * 100).toLocaleString('tr-TR')} TL</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.3rem', color: activeItem.diffDays < 0 ? '#059669' : activeItem.diffDays > 0 ? '#DC2626' : 'var(--text-muted)' }}>
                                            <span>Ay Bazlı Fark:</span>
                                            <span>{activeItem.diffDays > 0 ? '+' : ''}{activeItem.diffDays * 100} TL</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Global Onay Butonu */}
                            {hasChanges && (
                                <button
                                    className="btn btn-primary"
                                    style={{ 
                                        width: '100%', padding: '0.95rem', fontSize: '1.05rem', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        background: globalType === 'REFUND_REQUIRED' ? '#059669' : 'var(--primary)',
                                        border: 'none', color: 'white', marginTop: '0.5rem'
                                    }}
                                    disabled={isProcessing}
                                    onClick={handleProcessChanges}
                                >
                                    {globalType === 'REFUND_REQUIRED' ? <Check size={18} /> : <CreditCard size={18} />}
                                    {isProcessing
                                        ? 'İşleniyor...'
                                        : globalType === 'NO_DIFFERENCE' ? 'Değişiklikleri Kaydet'
                                        : globalType === 'REFUND_REQUIRED' ? `Onayla (Toplam ${Math.abs(globalDiffAmount)} TL İade)`
                                        : `Sepeti Onayla – Toplam ${globalDiffAmount} TL Öde`
                                    }
                                </button>
                            )}

                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MonthlySelection;
