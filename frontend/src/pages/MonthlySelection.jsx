import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMenusByMonth } from '../services/menuService';
import { createReservation, updateReservation, getUserReservations } from '../services/reservationService';
import { getAllHolidays } from '../services/holidayService';
import Card from '../components/Card';
import { Check, X, CreditCard, AlertCircle } from 'lucide-react';

const MonthlySelection = () => {
    const { user } = useAuth();
    const currentYear = 2026;
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [menus, setMenus] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [existingReservation, setExistingReservation] = useState(null);

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        setSelectedDays([]);
        setExistingReservation(null);
        try {
            const [menusData, holidaysData, reservationsData] = await Promise.all([
                getMenusByMonth(currentYear, selectedMonth),
                getAllHolidays(),
                getUserReservations(user.id)
            ]);
            setMenus(menusData);
            setHolidays(holidaysData.map(h => h.tarih));
            
            const existing = reservationsData.find(r => r.yil === currentYear && r.ay === selectedMonth);
            if (existing) {
                setExistingReservation(existing);
                if (existing.secilenGunler) {
                    setSelectedDays(existing.secilenGunler);
                }
            }
        } catch (err) {
            console.error(err);
            setError('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Ayın günlerini oluştur (Sadece hafta içi)
    const getDaysInMonth = () => {
        const date = new Date(currentYear, selectedMonth - 1, 1);
        const days = [];
        while (date.getMonth() === selectedMonth - 1) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Hafta sonu hariç
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

        // Geçmişteki veya bugünkü rezervasyonlar değiştirilemez
        const now = new Date();
        const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
        const todayStr = localNow.toISOString().split('T')[0];
        
        if (existingReservation && dateStr <= todayStr) {
            return;
        }

        setSelectedDays(prev => {
            if (prev.includes(dateStr)) {
                return prev.filter(d => d !== dateStr);
            } else {
                return [...prev, dateStr];
            }
        });
    };

    const handlePayment = async () => {
        if (selectedDays.length === 0 && !existingReservation) return;
        
        try {
            if (existingReservation) {
                // Güncelleme Modu
                if (!window.confirm(`Rezervasyonunuzu güncellemek istediğinize emin misiniz?`)) return;
                await updateReservation(existingReservation.id, {
                    userId: user.id,
                    yil: currentYear,
                    ay: selectedMonth,
                    secilenGunler: selectedDays
                });
                alert('Rezervasyonunuz başarıyla güncellendi!');
            } else {
                // Yeni Kayıt
                if (!window.confirm(`Seçilen ${selectedDays.length} gün için toplam ${selectedDays.length * 100} TL ödeme yapılacaktır. Onaylıyor musunuz?`)) return;
                await createReservation({
                    userId: user.id,
                    yil: currentYear,
                    ay: selectedMonth,
                    secilenGunler: selectedDays
                });
                alert('Ödeme başarıyla alındı ve rezervasyonlarınız oluşturuldu!');
            }
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'İşlem başarısız.');
        }
    };

    const days = getDaysInMonth();
    const isUpdateMode = !!existingReservation;
    const oldTotalPrice = existingReservation ? existingReservation.toplamTutar : 0;
    const totalPrice = selectedDays.length * 100;
    const difference = totalPrice - oldTotalPrice;

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
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(2026, m - 1, 1).toLocaleDateString('tr-TR', { month: 'long' })}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {error && <div className="alert" style={{ background: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

            {loading ? (
                <p>Takvim yükleniyor...</p>
            ) : (
                <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <Card title="Gün Seçimi (Sadece Hafta İçi)">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                            {days.map(day => {
                                const isSelected = selectedDays.includes(day.dateStr);
                                const isClickable = !day.isHoliday && day.menu;
                                
                                const now = new Date();
                                const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
                                const todayStr = localNow.toISOString().split('T')[0];
                                
                                const isPastOrToday = day.dateStr <= todayStr;
                                const isLocked = isUpdateMode && isPastOrToday;
                                
                                let bg = '#F9FAFB';
                                let border = '1px solid #E5E7EB';
                                let opacity = 1;

                                if (day.isHoliday) {
                                    bg = '#FEE2E2'; // red
                                    opacity = 0.6;
                                } else if (!day.menu) {
                                    bg = '#F3F4F6'; // gray
                                    opacity = 0.6;
                                } else if (isSelected) {
                                    bg = '#EEF2FF'; // primary light
                                    border = '2px solid var(--primary)';
                                }
                                
                                if (isLocked) {
                                    opacity = 0.5;
                                }

                                return (
                                    <div 
                                        key={day.dateStr}
                                        onClick={() => !isLocked && toggleDaySelection(day.dateStr, day.isHoliday, day.menu)}
                                        style={{
                                            background: bg,
                                            border: border,
                                            opacity: opacity,
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            cursor: isLocked ? 'not-allowed' : (isClickable ? 'pointer' : 'not-allowed'),
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{day.dayNum}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{day.dayName}</div>
                                        
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                            {day.isHoliday ? 'Tatil' : day.menu ? '100 TL' : 'Menü Yok'}
                                        </div>
                                        {isSelected && (
                                            <div style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>
                                                <Check size={16} style={{ margin: '0 auto' }} />
                                            </div>
                                        )}
                                        {isLocked && (
                                            <div style={{ position: 'absolute', top: '5px', right: '5px', color: '#9CA3AF' }}>
                                                🔒
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card title={isUpdateMode ? "Güncelleme Özeti" : "Ödeme Özeti"}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                <span>Seçilen Gün:</span>
                                <strong>{selectedDays.length}</strong>
                            </div>
                            
                            {isUpdateMode && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                                        <span>Önceki Tutar:</span>
                                        <span>{oldTotalPrice} TL</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: difference < 0 ? '#10B981' : (difference > 0 ? '#EF4444' : 'var(--text-muted)') }}>
                                        <span>Fark:</span>
                                        <strong>{difference > 0 ? `+${difference} TL` : `${difference} TL`}</strong>
                                    </div>
                                    {difference < 0 && <small style={{ color: '#10B981' }}>* İade edilecek tutar</small>}
                                    {difference > 0 && <small style={{ color: '#EF4444' }}>* Ek ödeme alınacaktır</small>}
                                </>
                            )}
                            
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                <span>Yeni Toplam:</span>
                                <span>{totalPrice} TL</span>
                            </div>

                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                disabled={selectedDays.length === 0}
                                onClick={handlePayment}
                            >
                                <CreditCard size={20} />
                                {isUpdateMode ? 'Güncelle' : (totalPrice > 0 ? `${totalPrice} TL Öde` : 'Seçim Yapın')}
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MonthlySelection;
