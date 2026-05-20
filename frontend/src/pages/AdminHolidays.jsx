import React, { useEffect, useState } from 'react';
import { getAllHolidays, createHoliday, deleteHoliday } from '../services/holidayService';
import Card from '../components/Card';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import { Plus, Trash2 } from 'lucide-react';

const AdminHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ tarih: '', aciklama: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllHolidays();
            setHolidays(data.sort((a, b) => new Date(a.tarih) - new Date(b.tarih)));
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
            await createHoliday(formData);
            setFormData({ tarih: '', aciklama: '' });
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu tatil gününü silmek istediğinize emin misiniz?')) return;
        try {
            await deleteHoliday(id);
            loadData();
        } catch (err) {
            alert('Hata oluştu');
        }
    };

    const columns = [
        { field: 'tarih', header: 'Tarih', render: (row) => new Date(row.tarih).toLocaleDateString('tr-TR') },
        { field: 'aciklama', header: 'Açıklama' },
        {
            field: 'actions',
            header: 'İşlemler',
            render: (row) => (
                <button className="btn btn-danger" onClick={() => handleDelete(row.id)}>
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
                        <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }}>
                            <Plus size={20} className="inline me-2" /> Ekle
                        </button>
                    </form>
                </Card>

                <Card title="Tanımlı Tatil Günleri">
                    {loading ? <p>Yükleniyor...</p> : <Table columns={columns} data={holidays} />}
                </Card>
            </div>
        </div>
    );
};

export default AdminHolidays;
