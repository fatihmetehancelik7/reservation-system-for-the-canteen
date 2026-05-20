import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllHolidays, createHoliday, deleteHoliday } from '../services/holidayService';
import Card from '../components/Card';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import { Plus, Trash2 } from 'lucide-react';

const AdminHolidays = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ tarih: '', aciklama: '' });
    const [error, setError] = useState('');

    const holidaysQuery = useQuery({
        queryKey: ['holidays'],
        queryFn: getAllHolidays,
        select: (data) => [...data].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)),
    });

    const createHolidayMutation = useMutation({
        mutationFn: createHoliday,
        onSuccess: () => {
            setFormData({ tarih: '', aciklama: '' });
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            queryClient.invalidateQueries({ queryKey: ['refunds'] });
        },
        onError: (err) => {
            setError(err.response?.data?.error || 'Hata oluştu');
        },
    });

    const deleteHolidayMutation = useMutation({
        mutationFn: deleteHoliday,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
            queryClient.invalidateQueries({ queryKey: ['refunds'] });
        },
        onError: () => {
            alert('Hata oluştu');
        },
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        createHolidayMutation.mutate(formData);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Bu tatil gününü silmek istediğinize emin misiniz?')) return;
        deleteHolidayMutation.mutate(id);
    };

    const columns = [
        { field: 'tarih', header: 'Tarih', render: (row) => new Date(row.tarih).toLocaleDateString('tr-TR') },
        { field: 'aciklama', header: 'Açıklama' },
        {
            field: 'actions',
            header: 'İşlemler',
            render: (row) => (
                <button className="btn btn-danger" onClick={() => handleDelete(row.id)} disabled={deleteHolidayMutation.isPending}>
                    <Trash2 size={16} />
                </button>
            )
        }
    ];

    return (
        <div className="fade-in">
            <h1 className="page-title">Tatil Günleri Yönetimi (2026)</h1>

            <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
                <Card title="Yeni Tatil Ekle">
                    {error && <div className="text-danger mb-4">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <FormInput label="Tarih" type="date" name="tarih" value={formData.tarih} onChange={handleInputChange} required />
                        <FormInput label="Açıklama" name="aciklama" value={formData.aciklama} onChange={handleInputChange} required />
                        <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }} disabled={createHolidayMutation.isPending}>
                            <Plus size={20} className="inline me-2" /> {createHolidayMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
                        </button>
                    </form>
                </Card>

                <Card title="Tanımlı Tatil Günleri">
                    {holidaysQuery.isLoading ? <p>Yükleniyor...</p> : <Table columns={columns} data={holidaysQuery.data ?? []} />}
                </Card>
            </div>
        </div>
    );
};

export default AdminHolidays;
