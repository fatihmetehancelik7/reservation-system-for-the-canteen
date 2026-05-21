import { useEffect, useState } from 'react';
import {
    BarChart2, TrendingUp, Users, DollarSign, RefreshCcw,
    CalendarOff, Utensils, CalendarDays, AlertTriangle, CheckCircle2
} from 'lucide-react';
import {
    getAdminStatisticsOverview,
    getMostReservedDays,
    getFavoriteMenus,
    getMonthlyReservationStatistics,
    getPaymentSummary,
    getRefundSummary,
} from '../services/statisticsService';

// ─── Helper Components ─────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--primary)', bg = '#EEF2FF' }) => (
    <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: '1px solid var(--border)',
    }}>
        <div style={{ background: bg, padding: '0.85rem', borderRadius: '50%', color, flexShrink: 0 }}>
            <Icon size={22} />
        </div>
        <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{value}</div>
            {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
        </div>
    </div>
);

const SectionTitle = ({ icon: Icon, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <Icon size={20} color="var(--primary)" />
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{children}</h2>
    </div>
);

const Card = ({ children, style }) => (
    <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        ...style
    }}>
        {children}
    </div>
);

const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div style={{
            width: 36, height: 36, border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }} />
    </div>
);

const EmptyState = ({ message }) => (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        <BarChart2 size={36} style={{ opacity: 0.25, marginBottom: '0.5rem' }} />
        <p style={{ fontSize: '0.9rem' }}>{message}</p>
    </div>
);

const ErrorState = ({ message }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: '#FEF2F2', borderRadius: 8, color: '#991B1B' }}>
        <AlertTriangle size={18} />
        <span style={{ fontSize: '0.9rem' }}>{message}</span>
    </div>
);

// ─── Inline Bar Chart (SVG) ────────────────────────────────────────────────────

const BarChartSvg = ({ data, valueKey, labelKey, color = '#4F46E5', height = 160 }) => {
    if (!data || data.length === 0) return <EmptyState message="Gösterilecek veri yok." />;
    const max = Math.max(...data.map(d => d[valueKey]));
    const barW = Math.max(20, Math.floor(440 / data.length) - 6);

    return (
        <div style={{ overflowX: 'auto' }}>
            <svg width={Math.max(440, data.length * (barW + 6) + 40)} height={height + 40} style={{ display: 'block' }}>
                {data.map((d, i) => {
                    const barH = max > 0 ? Math.max(4, Math.round((d[valueKey] / max) * height)) : 4;
                    const x = 20 + i * (barW + 6);
                    const y = height - barH;
                    return (
                        <g key={i}>
                            <rect x={x} y={y} width={barW} height={barH} fill={color} rx={4} opacity={0.85} />
                            <text x={x + barW / 2} y={height + 14} textAnchor="middle"
                                fontSize={10} fill="var(--text-muted)" fontFamily="Outfit,sans-serif">
                                {d[labelKey]?.toString().slice(-5)}
                            </text>
                            <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                                fontSize={10} fill={color} fontWeight="700" fontFamily="Outfit,sans-serif">
                                {d[valueKey]}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// ─── Inline Donut Chart (SVG) ──────────────────────────────────────────────────

const DonutChart = ({ segments, size = 140 }) => {
    const cx = size / 2, cy = size / 2, r = size * 0.36, stroke = size * 0.18;
    const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
    let startAngle = -Math.PI / 2;

    const arcs = segments.map(seg => {
        const frac = total > 0 ? seg.value / total : 0;
        const angle = frac * 2 * Math.PI;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        startAngle += angle;
        const x2 = cx + r * Math.cos(startAngle);
        const y2 = cy + r * Math.sin(startAngle);
        const large = angle > Math.PI ? 1 : 0;
        return { ...seg, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, frac };
    });

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <svg width={size} height={size} style={{ flexShrink: 0 }}>
                {total === 0
                    ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
                    : arcs.map((arc, i) => (
                        <path key={i} d={arc.d} fill={arc.color} opacity={0.85} />
                    ))
                }
                <circle cx={cx} cy={cy} r={r - stroke / 2} fill="white" />
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize={13} fontWeight="700" fill="var(--text-main)" fontFamily="Outfit,sans-serif">
                    {total > 0 ? total : '—'}
                </text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {segments.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            {s.label}: <strong>{s.value.toLocaleString('tr-TR')} {s.unit || ''}</strong>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AdminStatistics = () => {
    const [overview, setOverview]         = useState(null);
    const [topDays, setTopDays]           = useState([]);
    const [menus, setMenus]               = useState([]);
    const [monthly, setMonthly]           = useState([]);
    const [payment, setPayment]           = useState(null);
    const [refund, setRefund]             = useState(null);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [ov, days, mn, mo, pay, ref] = await Promise.all([
                    getAdminStatisticsOverview(),
                    getMostReservedDays(10),
                    getFavoriteMenus(10),
                    getMonthlyReservationStatistics(),
                    getPaymentSummary(),
                    getRefundSummary(),
                ]);
                setOverview(ov);
                setTopDays(days);
                setMenus(mn);
                setMonthly(mo);
                setPayment(pay);
                setRefund(ref);
            } catch (e) {
                console.error(e);
                setError('İstatistikler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const fmt = (n) => typeof n === 'number' ? n.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '—';
    const fmtTL = (n) => typeof n === 'number' ? n.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' ₺' : '—';

    if (error) return (
        <div className="fade-in">
            <h1 className="page-title">İstatistikler</h1>
            <ErrorState message={error} />
        </div>
    );

    return (
        <div className="fade-in">
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h1 className="page-title">İstatistikler ve Raporlama</h1>

            {/* ── Spin-up loader ─────────────────────────────────────────────── */}
            {loading ? <LoadingSpinner /> : (
                <>
                    {/* ── Overview cards ───────────────────────────────────────── */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <StatCard icon={CalendarDays}  label="Toplam Rezervasyon"   value={fmt(overview?.totalReservations)}     color="#4F46E5" bg="#EEF2FF" />
                        <StatCard icon={TrendingUp}    label="Bu Ayki Rezervasyon"  value={fmt(overview?.thisMonthReservations)} color="#0891B2" bg="#E0F2FE" />
                        <StatCard icon={CheckCircle2}  label="Bugünkü Rezervasyon"  value={fmt(overview?.todayReservations)}     color="#059669" bg="#D1FAE5" />
                        <StatCard icon={DollarSign}    label="Toplam Gelir"         value={fmtTL(overview?.totalRevenue)}        color="#D97706" bg="#FEF3C7" />
                        <StatCard icon={RefreshCcw}    label="Toplam İade"          value={fmtTL(overview?.totalRefundAmount)}   color="#DC2626" bg="#FEE2E2" />
                        <StatCard icon={TrendingUp}    label="Net Gelir"            value={fmtTL(overview?.netRevenue)}          color="#059669" bg="#D1FAE5" />
                        <StatCard icon={Users}         label="Aktif Kullanıcı"      value={fmt(overview?.activeUserCount)}       color="#7C3AED" bg="#EDE9FE" />
                        <StatCard icon={CalendarOff}   label="Tatil Günü"           value={fmt(overview?.holidayCount)}          color="#9CA3AF" bg="#F3F4F6" />
                    </div>

                    {/* ── Row: Most Reserved Days + Payment Donut ──────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <Card>
                            <SectionTitle icon={BarChart2}>En Çok Rezerve Edilen Günler</SectionTitle>
                            {topDays.length === 0
                                ? <EmptyState message="Henüz istatistik oluşturacak rezervasyon bulunmuyor." />
                                : <BarChartSvg data={topDays} valueKey="reservationCount" labelKey="reservationDate" color="#4F46E5" />
                            }
                            {topDays.length > 0 && (
                                <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                {['Tarih', 'Gün', 'Rezervasyon', 'Tahmini Gelir'].map(h => (
                                                    <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topDays.map((d, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.4rem 0.6rem' }}>{new Date(d.reservationDate).toLocaleDateString('tr-TR')}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)' }}>{d.dayOfWeek}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', fontWeight: 700, color: 'var(--primary)' }}>{d.reservationCount}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', color: '#059669', fontWeight: 600 }}>{fmtTL(d.estimatedRevenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Payment donut */}
                            <Card>
                                <SectionTitle icon={DollarSign}>Ödeme Özeti</SectionTitle>
                                {!payment || (payment.paidReservationCount === 0 && payment.pendingReservationCount === 0)
                                    ? <EmptyState message="Ödeme kaydı bulunamadı." />
                                    : <>
                                        <DonutChart segments={[
                                            { label: 'Ödendi',   value: payment.paidReservationCount,    color: '#10B981', unit: 'kayıt' },
                                            { label: 'Bekliyor', value: payment.pendingReservationCount, color: '#F59E0B', unit: 'kayıt' },
                                        ]} />
                                        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            {[
                                                { l: 'Toplam Gelir',  v: fmtTL(payment.totalRevenue),      c: '#059669' },
                                                { l: 'Toplam İade',   v: fmtTL(payment.totalRefundAmount), c: '#DC2626' },
                                                { l: 'Net Gelir',     v: fmtTL(payment.netRevenue),        c: '#4F46E5' },
                                            ].map(({ l, v, c }) => (
                                                <div key={l} style={{ background: 'var(--background)', borderRadius: 8, padding: '0.6rem 0.8rem' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l}</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: c }}>{v}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                }
                            </Card>

                            {/* Refund summary */}
                            <Card>
                                <SectionTitle icon={RefreshCcw}>İade Özeti</SectionTitle>
                                {!refund || refund.totalRefundRecords === 0
                                    ? <EmptyState message="Seçili dönem için iade kaydı yok." />
                                    : <>
                                        <DonutChart size={120} segments={[
                                            { label: 'Tatil İadesi', value: refund.holidayRefundCount,                               color: '#EF4444', unit: 'kişi' },
                                            { label: 'Diğer',        value: refund.totalRefundRecords - refund.holidayRefundCount,   color: '#9CA3AF', unit: 'kişi' },
                                        ]} />
                                        <div style={{ marginTop: '0.75rem', background: 'var(--background)', borderRadius: 8, padding: '0.6rem 0.8rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toplam İade Tutarı</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#DC2626' }}>{fmtTL(refund.totalRefundAmount)}</div>
                                        </div>
                                    </>
                                }
                            </Card>
                        </div>
                    </div>

                    {/* ── Monthly Trend ────────────────────────────────────────── */}
                    <Card style={{ marginBottom: '1.5rem' }}>
                        <SectionTitle icon={TrendingUp}>Aylık Rezervasyon Trendi</SectionTitle>
                        {monthly.length === 0
                            ? <EmptyState message="Henüz istatistik oluşturacak rezervasyon bulunmuyor." />
                            : <>
                                <BarChartSvg
                                    data={monthly.map(m => ({ ...m, label: m.monthName?.slice(0, 3) }))}
                                    valueKey="reservationCount"
                                    labelKey="label"
                                    color="#0891B2"
                                    height={140}
                                />
                                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                {['Ay', 'Toplam Rezerve Gün', 'Gelir', 'İade', 'Net Gelir'].map(h => (
                                                    <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthly.map((m, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>{m.monthName} {m.year}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', color: 'var(--primary)', fontWeight: 700 }}>{m.reservationCount}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', color: '#059669' }}>{fmtTL(m.revenue)}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', color: '#DC2626' }}>{fmtTL(m.refundAmount)}</td>
                                                    <td style={{ padding: '0.4rem 0.6rem', fontWeight: 700, color: m.netRevenue >= 0 ? '#059669' : '#DC2626' }}>{fmtTL(m.netRevenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        }
                    </Card>

                    {/* ── Favorite Menus ───────────────────────────────────────── */}
                    <Card>
                        <SectionTitle icon={Utensils}>En Çok Rezerve Edilen Menüler</SectionTitle>
                        {menus.length === 0
                            ? <EmptyState message="Menü istatistiği için rezervasyon bulunamadı." />
                            : <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                            {['#', 'Menü İçeriği', 'Servis Tarihi', 'Rezervasyon', 'Gelir', 'Pay (%)'].map(h => (
                                                <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menus.map((m, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>{i + 1}</td>
                                                <td style={{ padding: '0.4rem 0.6rem', maxWidth: 280 }}>
                                                    <span title={m.menuName} style={{
                                                        display: 'block', overflow: 'hidden',
                                                        textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                    }}>{m.menuName}</span>
                                                </td>
                                                <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)' }}>
                                                    {m.serviceDate ? new Date(m.serviceDate).toLocaleDateString('tr-TR') : '—'}
                                                </td>
                                                <td style={{ padding: '0.4rem 0.6rem', fontWeight: 700, color: 'var(--primary)' }}>{m.reservationCount}</td>
                                                <td style={{ padding: '0.4rem 0.6rem', color: '#059669' }}>{fmtTL(m.totalRevenue)}</td>
                                                <td style={{ padding: '0.4rem 0.6rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <div style={{
                                                            height: 6, width: `${Math.min(100, m.percentageShare * 4)}px`,
                                                            background: 'var(--primary)', borderRadius: 3, minWidth: 4
                                                        }} />
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.percentageShare}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }

                        {/* Refund top days */}
                        {refund?.mostRefundedDays?.length > 0 && (
                            <>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0 1rem' }} />
                                <SectionTitle icon={CalendarOff}>En Çok İade Oluşan Günler (Tatil)</SectionTitle>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {refund.mostRefundedDays.map((d, i) => (
                                        <div key={i} style={{
                                            background: '#FEF2F2', border: '1px solid #FECACA',
                                            borderRadius: 8, padding: '0.4rem 0.8rem',
                                            fontSize: '0.85rem', color: '#991B1B'
                                        }}>
                                            📅 {new Date(d.reservationDate).toLocaleDateString('tr-TR')} — <strong>{d.reservationCount} iade</strong>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
};

export default AdminStatistics;
