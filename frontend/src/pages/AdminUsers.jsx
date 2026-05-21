import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Mail, Lock, User, Shield, CheckCircle2,
    AlertTriangle, Eye, EyeOff, X, Search, FileText, Edit, Trash2
} from 'lucide-react';
import { getAllUsers, createUser, createUsersBatch, updateUser, deleteUser } from '../services/userService';
import * as XLSX from 'xlsx';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const RoleBadge = ({ rol }) => {
    const isAdmin = rol === 'ADMIN';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.7rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
            background: isAdmin ? '#EDE9FE' : '#D1FAE5',
            color: isAdmin ? '#6D28D9' : '#065F46',
        }}>
            {isAdmin ? <Shield size={12} /> : <User size={12} />}
            {isAdmin ? 'Admin' : 'Kullanıcı'}
        </span>
    );
};

const Avatar = ({ name, size = 40, color = '#4F46E5' }) => {
    const initials = name?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?';
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: size * 0.35,
        }}>
            {initials}
        </div>
    );
};

const avatarColors = [
    '#4F46E5', '#0891B2', '#059669', '#D97706', '#DC2626',
    '#7C3AED', '#DB2777', '#2563EB', '#16A34A', '#EA580C',
];

// ─── Field (module-level — must NOT be defined inside a component) ────────────

const Field = ({ id, label, icon: Icon, type = 'text', value, onChange, error, rightEl }) => (
    <div className="form-group">
        <label className="form-label" htmlFor={id}>{label}</label>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                <Icon size={16} />
            </div>
            <input
                id={id}
                type={type}
                className="form-control"
                style={{ paddingLeft: '2.4rem', paddingRight: rightEl ? '2.8rem' : undefined, borderColor: error ? '#EF4444' : undefined }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {rightEl && (
                <div style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {rightEl}
                </div>
            )}
        </div>
        {error && <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.3rem' }}>{error}</div>}
    </div>
);

// ─── Add User Modal ────────────────────────────────────────────────────────────

const AddUserModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ ad: '', soyad: '', email: '', sifre: '123456', rol: 'KULLANICI' });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: createUser,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onSuccess(data);
        },
        onError: (err) => {
            setServerError(err.response?.data?.error || 'Kullanıcı eklenemedi.');
        },
    });

    const validate = () => {
        const e = {};
        if (!form.ad.trim())    e.ad    = 'Ad zorunludur.';
        if (!form.soyad.trim()) e.soyad = 'Soyad zorunludur.';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = 'Geçerli bir e-posta giriniz.';
        if (!form.sifre || form.sifre.length < 6)
            e.sifre = 'Şifre en az 6 karakter olmalıdır.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setServerError('');
        if (!validate()) return;
        mutation.mutate(form);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 480,
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden',
                animation: 'slideUp 0.25s ease-out',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1E1B4B 0%, var(--primary-dark) 100%)',
                    padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
                        <UserPlus size={22} />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Yeni Kullanıcı Ekle</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem' }}>
                    {serverError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: '1rem', color: '#991B1B', fontSize: '0.9rem' }}>
                            <AlertTriangle size={16} /> {serverError}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <Field id="ad"    label="Ad"    icon={User}  value={form.ad}    onChange={v => setForm(f => ({...f, ad: v}))}    error={errors.ad} />
                        <Field id="soyad" label="Soyad" icon={User}  value={form.soyad} onChange={v => setForm(f => ({...f, soyad: v}))} error={errors.soyad} />
                    </div>

                    <Field id="email" label="E-posta" icon={Mail} type="email"
                        value={form.email} onChange={v => setForm(f => ({...f, email: v}))} error={errors.email} />

                    <Field id="sifre" label="Şifre" icon={Lock}
                        type={showPass ? 'text' : 'password'}
                        value={form.sifre}
                        onChange={v => setForm(f => ({...f, sifre: v}))}
                        error={errors.sifre}
                        rightEl={
                            <span onClick={() => setShowPass(p => !p)}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </span>
                        }
                    />

                    {/* Role selector */}
                    <div className="form-group">
                        <label className="form-label">Rol</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {[
                                { val: 'KULLANICI', label: 'Kullanıcı', icon: User,   bg: '#D1FAE5', color: '#065F46', activeBg: '#059669' },
                                { val: 'ADMIN',     label: 'Admin',     icon: Shield, bg: '#EDE9FE', color: '#6D28D9', activeBg: '#7C3AED' },
                            ].map(r => {
                                const active = form.rol === r.val;
                                return (
                                    <button key={r.val} type="button"
                                        onClick={() => setForm(f => ({...f, rol: r.val}))}
                                        style={{
                                            flex: 1, padding: '0.75rem', border: active ? `2px solid ${r.activeBg}` : '2px solid var(--border)',
                                            borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '0.5rem', fontWeight: 600,
                                            background: active ? r.bg : 'var(--background)',
                                            color: active ? r.color : 'var(--text-muted)',
                                            transition: 'all 0.2s', fontFamily: 'inherit',
                                        }}>
                                        <r.icon size={16} />{r.label}
                                        {active && <CheckCircle2 size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={mutation.isPending}>
                            {mutation.isPending ? (
                                <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Ekleniyor...</>
                            ) : (
                                <><UserPlus size={16} /> Kullanıcı Ekle</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Edit User Modal ────────────────────────────────────────────────────────────

const EditUserModal = ({ user, onClose, onSuccess }) => {
    const [form, setForm] = useState({ 
        ad: user.ad || '', 
        soyad: user.soyad || '', 
        email: user.email || '', 
        sifre: user.sifre || '', 
        rol: user.rol || 'KULLANICI' 
    });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (data) => updateUser(user.id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onSuccess(data);
        },
        onError: (err) => {
            setServerError(err.response?.data?.error || 'Kullanıcı güncellenemedi.');
        },
    });

    const validate = () => {
        const e = {};
        if (!form.ad.trim())    e.ad    = 'Ad zorunludur.';
        if (!form.soyad.trim()) e.soyad = 'Soyad zorunludur.';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = 'Geçerli bir e-posta giriniz.';
        if (!form.sifre || form.sifre.length < 6)
            e.sifre = 'Şifre en az 6 karakter olmalıdır.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setServerError('');
        if (!validate()) return;
        mutation.mutate(form);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 480,
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden',
                animation: 'slideUp 0.25s ease-out',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
                        <Edit size={22} />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Kullanıcı Düzenle</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem' }}>
                    {serverError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: '1rem', color: '#991B1B', fontSize: '0.9rem' }}>
                            <AlertTriangle size={16} /> {serverError}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <Field id="edit-ad"    label="Ad"    icon={User}  value={form.ad}    onChange={v => setForm(f => ({...f, ad: v}))}    error={errors.ad} />
                        <Field id="edit-soyad" label="Soyad" icon={User}  value={form.soyad} onChange={v => setForm(f => ({...f, soyad: v}))} error={errors.soyad} />
                    </div>

                    <Field id="edit-email" label="E-posta" icon={Mail} type="email"
                        value={form.email} onChange={v => setForm(f => ({...f, email: v}))} error={errors.email} />

                    <Field id="edit-sifre" label="Şifre" icon={Lock}
                        type={showPass ? 'text' : 'password'}
                        value={form.sifre}
                        onChange={v => setForm(f => ({...f, sifre: v}))}
                        error={errors.sifre}
                        rightEl={
                            <span onClick={() => setShowPass(p => !p)}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </span>
                        }
                    />

                    <div className="form-group">
                        <label className="form-label">Rol</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {[
                                { val: 'KULLANICI', label: 'Kullanıcı', icon: User,   bg: '#D1FAE5', color: '#065F46', activeBg: '#059669' },
                                { val: 'ADMIN',     label: 'Admin',     icon: Shield, bg: '#EDE9FE', color: '#6D28D9', activeBg: '#7C3AED' },
                            ].map(r => {
                                const active = form.rol === r.val;
                                return (
                                    <button key={r.val} type="button"
                                        onClick={() => setForm(f => ({...f, rol: r.val}))}
                                        style={{
                                            flex: 1, padding: '0.75rem', border: active ? `2px solid ${r.activeBg}` : '2px solid var(--border)',
                                            borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '0.5rem', fontWeight: 600,
                                            background: active ? r.bg : 'var(--background)',
                                            color: active ? r.color : 'var(--text-muted)',
                                            transition: 'all 0.2s', fontFamily: 'inherit',
                                        }}>
                                        <r.icon size={16} />{r.label}
                                        {active && <CheckCircle2 size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, background: '#059669', borderColor: '#059669' }} disabled={mutation.isPending}>
                            {mutation.isPending ? 'Güncelleniyor...' : <><Edit size={16} /> Güncelle</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Bulk Add User Modal ───────────────────────────────────────────────────────

const BulkAddUserModal = ({ onClose, onSuccess }) => {
    const [text, setText] = useState('');
    const [serverError, setServerError] = useState('');
    const [errors, setErrors] = useState('');
    const fileInputRef = useRef(null);

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: createUsersBatch,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onSuccess(data);
        },
        onError: (err) => {
            setServerError(err.response?.data?.error || 'Toplu kullanıcı eklenemedi.');
        },
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setServerError('');
        setErrors('');

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = evt.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                
                let extractedText = '';
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    if (i === 0) continue; // İlk satırı başlık varsayıp atlıyoruz
                    
                    if (row.length === 1 && typeof row[0] === 'string' && row[0].includes(',')) {
                        // All data in a single comma-separated cell (Column A)
                        const parts = row[0].split(',').map(p => p.trim());
                        if (parts.length >= 3) {
                            const ad = parts[0];
                            const soyad = parts[1];
                            const email = parts[2];
                            const sifre = parts[3] || '123456';
                            extractedText += `${ad}, ${soyad}, ${email}, ${sifre}\n`;
                        }
                    } else if (row.length >= 3) {
                        // Data properly separated in columns
                        const ad = row[0] || '';
                        const soyad = row[1] || '';
                        const email = row[2] || '';
                        const sifre = row[3] || '123456';
                        extractedText += `${ad}, ${soyad}, ${email}, ${sifre}\n`;
                    }
                }

                if (!extractedText) {
                    setErrors('Dosyada geçerli kullanıcı verisi bulunamadı.');
                } else {
                    setText(prev => prev + (prev && !prev.endsWith('\n') ? '\n' : '') + extractedText);
                }
            } catch (err) {
                console.error(err);
                setErrors('Dosya okunurken bir hata oluştu.');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        if (file.name.endsWith('.xlsx')) {
            reader.readAsBinaryString(file);
        } else {
            setErrors('Lütfen sadece .xlsx uzantılı Excel dosyası yükleyin.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setServerError('');
        setErrors('');

        if (!text.trim()) {
            setErrors('Lütfen en az bir kullanıcı bilgisi girin.');
            return;
        }

        const lines = text.split('\n').filter(l => l.trim() !== '');
        const parsedUsers = [];

        for (let i = 0; i < lines.length; i++) {
            const parts = lines[i].split(',').map(p => p.trim());
            if (parts.length < 3) {
                setErrors(`Satır ${i + 1} eksik bilgi içeriyor. Format: Ad, Soyad, Email, (Opsiyonel Şifre)`);
                return;
            }
            parsedUsers.push({
                ad: parts[0],
                soyad: parts[1],
                email: parts[2],
                sifre: parts[3] || '123456',
                rol: 'KULLANICI' // Varsayılan olarak KULLANICI
            });
        }

        mutation.mutate(parsedUsers);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 520,
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden',
                animation: 'slideUp 0.25s ease-out',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #1E1B4B 0%, var(--primary-dark) 100%)',
                    padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
                        <Users size={22} />
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Toplu Kullanıcı Ekle</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem' }}>
                    {serverError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: '1rem', color: '#991B1B', fontSize: '0.9rem' }}>
                            <AlertTriangle size={16} /> {serverError}
                        </div>
                    )}
                    {errors && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: '1rem', color: '#991B1B', fontSize: '0.9rem' }}>
                            <AlertTriangle size={16} /> {errors}
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Kullanıcı Bilgileri</label>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Excel dosyanızı (Başlık satırı: Ad, Soyad, Email, Sifre) yükleyebilir veya aşağıya virgülle ayırarak girebilirsiniz:<br/>
                            <code>Ad, Soyad, Email, Sifre(Opsiyonel)</code>
                        </p>
                        
                        <input 
                            type="file" 
                            accept=".xlsx" 
                            onChange={handleFileUpload} 
                            ref={fileInputRef}
                            className="form-control"
                            style={{ marginBottom: '1rem', padding: '0.5rem' }}
                        />

                        <textarea
                            className="form-control"
                            style={{ minHeight: '150px', fontFamily: 'monospace', padding: '1rem' }}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Ahmet, Yılmaz, ahmet@ornek.com, sifre123&#10;Ayşe, Demir, ayse@ornek.com"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={mutation.isPending}>
                            {mutation.isPending ? 'Ekleniyor...' : 'Kullanıcıları Ekle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Success Toast ─────────────────────────────────────────────────────────────

const Toast = ({ name, onClose }) => (
    <div style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000,
        background: 'white', borderRadius: 12, padding: '1rem 1.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #D1FAE5',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        animation: 'slideUp 0.3s ease-out',
    }}>
        <div style={{ background: '#D1FAE5', borderRadius: '50%', padding: '0.4rem', color: '#059669' }}>
            <CheckCircle2 size={20} />
        </div>
        <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{name} eklendi!</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kullanıcı başarıyla oluşturuldu.</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            <X size={16} />
        </button>
    </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AdminUsers = () => {
    const [showModal, setShowModal]   = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [toast, setToast]           = useState(null);   // { name, action }
    const [search, setSearch]         = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    const queryClient = useQueryClient();

    const { data: users = [], isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setToast({ name: 'Kullanıcı başarıyla silindi!', action: 'silindi' });
            setTimeout(() => setToast(null), 4000);
        },
        onError: (err) => {
            alert(err.response?.data?.error || 'Kullanıcı silinemedi.');
        },
    });

    const handleDelete = (user) => {
        if (window.confirm(`${user.ad} ${user.soyad} adlı kullanıcıyı silmek istediğinize emin misiniz?\n\nBu işlem, kullanıcının tüm rezervasyon, ödeme ve iade geçmişini kalıcı olarak sistemden silecektir. Bu işlem geri alınamaz!`)) {
            deleteMutation.mutate(user.id);
        }
    };

    const handleEditSuccess = (data) => {
        setEditingUser(null);
        setToast({ name: `${data.ad} ${data.soyad}`, action: 'güncellendi' });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSuccess = (data) => {
        setShowModal(false);
        setToast({ name: `${data.ad} ${data.soyad}`, action: 'eklendi' });
        setTimeout(() => setToast(null), 4000);
    };

    const handleBulkSuccess = (dataArray) => {
        setShowBulkModal(false);
        setToast({ name: `${dataArray.length} kullanıcı`, action: 'eklendi' });
        setTimeout(() => setToast(null), 4000);
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || `${u.ad} ${u.soyad} ${u.email}`.toLowerCase().includes(q);
        const matchRole   = roleFilter === 'ALL' || u.rol === roleFilter;
        return matchSearch && matchRole;
    });

    const adminCount = users.filter(u => u.rol === 'ADMIN').length;
    const userCount  = users.filter(u => u.rol === 'KULLANICI').length;

    return (
        <div className="fade-in">
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* ── Page header ─────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Kullanıcı Yönetimi</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                        onClick={() => setShowBulkModal(true)}
                    >
                        <FileText size={18} /> Toplu Ekle
                    </button>
                    <button
                        id="btn-add-user"
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                        onClick={() => setShowModal(true)}
                    >
                        <UserPlus size={18} /> Yeni Kullanıcı
                    </button>
                </div>
            </div>

            {/* ── Summary cards ───────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Toplam Kullanıcı', value: users.length, icon: Users,  color: '#4F46E5', bg: '#EEF2FF' },
                    { label: 'Admin',            value: adminCount,   icon: Shield, color: '#7C3AED', bg: '#EDE9FE' },
                    { label: 'Kullanıcı',        value: userCount,    icon: User,   color: '#059669', bg: '#D1FAE5' },
                ].map(card => (
                    <div key={card.label} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                        <div style={{ background: card.bg, padding: '0.75rem', borderRadius: '50%', color: card.color, flexShrink: 0 }}>
                            <card.icon size={20} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>{card.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{isLoading ? '…' : card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                        id="user-search"
                        type="text"
                        placeholder="Ad, soyad veya e-posta ara..."
                        className="form-control"
                        style={{ paddingLeft: '2.4rem', margin: 0 }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[['ALL','Tümü'], ['KULLANICI','Kullanıcılar'], ['ADMIN','Adminler']].map(([val, label]) => (
                        <button key={val} type="button"
                            onClick={() => setRoleFilter(val)}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem',
                                background: roleFilter === val ? 'var(--primary)' : 'var(--background)',
                                color: roleFilter === val ? 'white' : 'var(--text-muted)',
                                transition: 'all 0.2s',
                            }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {isError ? (
                    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991B1B' }}>
                        <AlertTriangle size={18} /> Kullanıcılar yüklenirken hata oluştu.
                    </div>
                ) : isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Kullanıcılar yükleniyor...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={40} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                        <p>{search ? `"${search}" için sonuç bulunamadı.` : 'Henüz kullanıcı eklenmemiş.'}</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Kullanıcı</th>
                                <th>E-posta</th>
                                <th>Rol</th>
                                <th>ID</th>
                                <th style={{ textAlign: 'right' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, i) => (
                                <tr key={u.id} style={{ transition: 'background 0.15s' }}>
                                    <td style={{ color: 'var(--text-muted)', fontWeight: 600, width: 40 }}>{i + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                            <Avatar name={`${u.ad} ${u.soyad}`} size={38} color={avatarColors[u.id % avatarColors.length]} />
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{u.ad} {u.soyad}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                                            <Mail size={14} />
                                            <span style={{ fontSize: '0.9rem' }}>{u.email}</span>
                                        </div>
                                    </td>
                                    <td><RoleBadge rol={u.rol} /></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>#{u.id}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button 
                                                className="btn" 
                                                style={{ padding: '0.4rem', background: '#FEF3C7', color: '#D97706', border: 'none' }}
                                                onClick={() => setEditingUser(u)}
                                                title="Düzenle"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                className="btn" 
                                                style={{ padding: '0.4rem', background: '#FEE2E2', color: '#DC2626', border: 'none' }}
                                                onClick={() => handleDelete(u)}
                                                disabled={deleteMutation.isPending}
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Footer */}
                {!isLoading && !isError && (
                    <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span>{filtered.length} / {users.length} kullanıcı gösteriliyor</span>
                        <button id="btn-add-user-bottom" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowModal(true)}>
                            <UserPlus size={14} /> Yeni Ekle
                        </button>
                    </div>
                )}
            </div>

            {/* ── Modal & Toast ─────────────────────────────────────────────── */}
            {showModal && <AddUserModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
            {showBulkModal && <BulkAddUserModal onClose={() => setShowBulkModal(false)} onSuccess={handleBulkSuccess} />}
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSuccess={handleEditSuccess} />}
            {toast     && <Toast name={`${toast.name} ${toast.action || ''}`} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminUsers;
