import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMenusByMonth, createMenu, deleteMenu, createMenusBatch, updateMenu } from '../services/menuService';
import * as XLSX from 'xlsx';
import Card from '../components/Card';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import { Trash2, Edit } from 'lucide-react';

const EditMenuModal = ({ menu, onClose, onSuccess }) => {
    const [yemekListesi, setYemekListesi] = useState(menu.yemekListesi);
    const [error, setError] = useState('');
    
    const mutation = useMutation({
        mutationFn: (data) => updateMenu(menu.id, data),
        onSuccess: () => {
            onSuccess();
        },
        onError: (err) => {
            setError(err.response?.data?.error || 'Güncellenirken hata oluştu.');
        }
    });

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 16, width: '100%', maxWidth: 400 }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Menü Düzenle ({menu.tarih})</h3>
                {error && <div className="text-danger mb-4">{error}</div>}
                <div className="form-group">
                    <label className="form-label">Yemek Listesi</label>
                    <textarea 
                        className="form-control" 
                        value={yemekListesi} 
                        onChange={(e) => setYemekListesi(e.target.value)} 
                        rows={3} 
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>İptal</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} disabled={mutation.isPending} onClick={() => mutation.mutate({ tarih: menu.tarih, yemekListesi })}>
                        {mutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminMenu = () => {
    const currentYear = 2026;
    const queryClient = useQueryClient();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [formData, setFormData] = useState({ tarih: '', yemekListesi: '' });
    const [error, setError] = useState('');
    const [batchError, setBatchError] = useState('');
    const [batchSuccess, setBatchSuccess] = useState('');
    const [editingMenu, setEditingMenu] = useState(null);
    const fileInputRef = useRef(null);

    const menusQuery = useQuery({
        queryKey: ['menus', currentYear, selectedMonth],
        queryFn: () => getMenusByMonth(currentYear, selectedMonth),
    });

    const createMenuMutation = useMutation({
        mutationFn: createMenu,
        onSuccess: () => {
            setFormData({ tarih: '', yemekListesi: '' });
            queryClient.invalidateQueries({ queryKey: ['menus'] });
        },
        onError: (err) => {
            setError(err.response?.data?.error || 'Hata oluştu');
        },
    });

    const deleteMenuMutation = useMutation({
        mutationFn: deleteMenu,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
        },
        onError: () => {
            alert('Hata');
        },
    });

    const createMenusBatchMutation = useMutation({
        mutationFn: createMenusBatch,
        onSuccess: () => {
            setBatchSuccess('Toplu menüler başarıyla eklendi.');
            setBatchError('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            queryClient.invalidateQueries({ queryKey: ['menus'] });
        },
        onError: (err) => {
            setBatchError(err.response?.data?.error || 'Toplu yükleme sırasında hata oluştu');
            setBatchSuccess('');
        },
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        createMenuMutation.mutate(formData);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
        deleteMenuMutation.mutate(id);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setBatchError('');
        setBatchSuccess('');

        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                let parsedMenus = [];

                if (file.name.endsWith('.txt')) {
                    const text = evt.target.result;
                    const lines = text.split('\n').filter(l => l.trim() !== '');
                    for (let line of lines) {
                        const parts = line.split('|');
                        if (parts.length >= 2) {
                            parsedMenus.push({
                                tarih: parts[0].trim(),
                                yemekListesi: parts[1].trim()
                            });
                        }
                    }
                } else if (file.name.endsWith('.xlsx')) {
                    const data = evt.target.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    
                    // Varsayım: İlk satır başlık olabilir. Veriler 2 sütunlu: Tarih, Yemek Listesi
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        if (row.length >= 2 && i !== 0) { // İlk satırı başlık varsayıp atlıyoruz
                            let dateVal = row[0];
                            // Excel tarihi sayıysa dönüştür
                            if (typeof dateVal === 'number') {
                                const dateInfo = XLSX.SSF.parse_date_code(dateVal);
                                dateVal = `${dateInfo.y}-${String(dateInfo.m).padStart(2, '0')}-${String(dateInfo.d).padStart(2, '0')}`;
                            } else if (typeof dateVal === 'string') {
                                dateVal = dateVal.trim();
                                // Eğer format D.M.YYYY veya DD.MM.YYYY ise dönüştür
                                const match = dateVal.match(/^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{4})$/);
                                if (match) {
                                    dateVal = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
                                }
                            }
                            
                            parsedMenus.push({
                                tarih: dateVal,
                                yemekListesi: row[1]
                            });
                        }
                    }
                } else {
                    setBatchError('Sadece .txt ve .xlsx dosyaları desteklenir.');
                    return;
                }

                if (parsedMenus.length === 0) {
                    setBatchError('Dosyada geçerli menü verisi bulunamadı.');
                    return;
                }

                createMenusBatchMutation.mutate(parsedMenus);
            } catch (err) {
                console.error(err);
                setBatchError('Dosya okunurken bir hata oluştu. Formatı kontrol edin.');
            }
        };

        if (file.name.endsWith('.xlsx')) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsText(file);
        }
    };

    const columns = [
        { field: 'gun', header: 'Gün', render: (row) => `${row.gun} ${new Date(row.yil, row.ay - 1, 1).toLocaleDateString('tr-TR', { month: 'long' })}` },
        { field: 'yemekListesi', header: 'Yemek Listesi' },
        {
            field: 'actions',
            header: 'İşlem',
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#0ea5e9' }} onClick={() => setEditingMenu(row)}>
                        <Edit size={16} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => handleDelete(row.id)} disabled={deleteMenuMutation.isPending}>
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="fade-in">
            <h1 className="page-title">Aylık Menü Yönetimi</h1>

            <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
                <Card title="Güne Menü Ekle">
                    {error && <div className="text-danger mb-4">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <FormInput label="Tarih" type="date" name="tarih" value={formData.tarih} onChange={handleInputChange} required />
                        <FormInput label="Yemek Listesi (Virgülle ayırın)" name="yemekListesi" value={formData.yemekListesi} onChange={handleInputChange} required placeholder="Çorba, Tavuk, Pilav" />
                        <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }} disabled={createMenuMutation.isPending}>
                            {createMenuMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </form>
                </Card>

                <Card title="Toplu Menü Yükle (Excel/TXT)">
                    {batchError && <div className="text-danger mb-4">{batchError}</div>}
                    {batchSuccess && <div className="text-success mb-4">{batchSuccess}</div>}
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>
                        <strong>Excel:</strong> 1. Sütun: Tarih (YYYY-MM-DD), 2. Sütun: Yemek Listesi (Başlık satırı olmalıdır).<br/>
                        <strong>TXT:</strong> Her satır: <code>YYYY-MM-DD | Yemek, Yemek...</code>
                    </p>
                    <input 
                        type="file" 
                        accept=".xlsx, .txt" 
                        onChange={handleFileUpload} 
                        ref={fileInputRef}
                        className="form-control"
                    />
                    {createMenusBatchMutation.isPending && <p className="mt-4">Yükleniyor...</p>}
                </Card>
            </div>
            
            <div className="grid-1 mt-8">
                <Card title="Aylık Menü Listesi">
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label>Ay:</label>
                        <select className="form-control" style={{ width: '150px' }} value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(2026, m - 1, 1).toLocaleDateString('tr-TR', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    {menusQuery.isError ? (
                        <div className="text-danger">Menüler yüklenirken hata oluştu.</div>
                    ) : menusQuery.isLoading ? (
                        <p>Yükleniyor...</p>
                    ) : (
                        <Table columns={columns} data={menusQuery.data ?? []} />
                    )}
                </Card>
            </div>
            
            {editingMenu && (
                <EditMenuModal 
                    menu={editingMenu} 
                    onClose={() => setEditingMenu(null)} 
                    onSuccess={() => {
                        setEditingMenu(null);
                        queryClient.invalidateQueries({ queryKey: ['menus'] });
                    }} 
                />
            )}
        </div>
    );
};

export default AdminMenu;
