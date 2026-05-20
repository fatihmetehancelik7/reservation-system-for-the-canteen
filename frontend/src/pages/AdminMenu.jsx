import React, { useEffect, useState } from 'react';
import { getMenusByMonth, createMenu, deleteMenu } from '../services/menuService';
import Card from '../components/Card';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import { Trash2 } from 'lucide-react';

const AdminMenu = () => {
    const currentYear = 2026;
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ tarih: '', yemekListesi: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getMenusByMonth(currentYear, selectedMonth);
            setMenus(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createMenu(formData);
            setFormData({ tarih: '', yemekListesi: '' });
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await deleteMenu(id);
            loadData();
        } catch (err) {
            alert('Hata');
        }
    };

    const columns = [
        { field: 'gun', header: 'Gün', render: (row) => `${row.gun} ${new Date(row.yil, row.ay-1, 1).toLocaleDateString('tr-TR', {month: 'long'})}` },
        { field: 'yemekListesi', header: 'Yemek Listesi' },
        {
            field: 'actions',
            header: 'İşlem',
            render: (row) => (
                <button className="btn btn-danger" onClick={() => handleDelete(row.id)}>
                    <Trash2 size={16} />
                </button>
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
                        <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }}>Kaydet</button>
                    </form>
                </Card>

                <Card title="Aylık Menü Listesi">
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label>Ay:</label>
                        <select className="form-control" style={{ width: '150px' }} value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(2026, m - 1, 1).toLocaleDateString('tr-TR', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    {loading ? <p>Yükleniyor...</p> : <Table columns={columns} data={menus} />}
                </Card>
            </div>
        </div>
    );
};

export default AdminMenu;
