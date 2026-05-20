import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMenusByMonth, createMenu, deleteMenu } from '../services/menuService';
import Card from '../components/Card';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import { Trash2 } from 'lucide-react';

const AdminMenu = () => {
    const currentYear = 2026;
    const queryClient = useQueryClient();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [formData, setFormData] = useState({ tarih: '', yemekListesi: '' });
    const [error, setError] = useState('');

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

    const columns = [
        { field: 'gun', header: 'Gün', render: (row) => `${row.gun} ${new Date(row.yil, row.ay - 1, 1).toLocaleDateString('tr-TR', { month: 'long' })}` },
        { field: 'yemekListesi', header: 'Yemek Listesi' },
        {
            field: 'actions',
            header: 'İşlem',
            render: (row) => (
                <button className="btn btn-danger" onClick={() => handleDelete(row.id)} disabled={deleteMenuMutation.isPending}>
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
                        <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }} disabled={createMenuMutation.isPending}>
                            {createMenuMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
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
                    {menusQuery.isLoading ? <p>Yükleniyor...</p> : <Table columns={columns} data={menusQuery.data ?? []} />}
                </Card>
            </div>
        </div>
    );
};

export default AdminMenu;
