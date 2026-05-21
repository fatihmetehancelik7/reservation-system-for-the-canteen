import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CalendarDays, Wallet, CalendarClock, Utensils, Users, BarChart2 } from 'lucide-react';

const Sidebar = () => {
    const { user } = useAuth();
    const isAdmin = user?.rol === 'ADMIN';

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Yemekhane 2026</h2>
            </div>
            
            <ul className="sidebar-nav">
                <li>
                    <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <LayoutDashboard size={20} />
                        <span>Panel</span>
                    </NavLink>
                </li>
                
                {!isAdmin && (
                    <>
                        <li>
                            <NavLink to="/monthly-selection" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <CalendarDays size={20} />
                                <span>Aylık Seçim ve Ödeme</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/my-payments" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <Wallet size={20} />
                                <span>Ödemelerim</span>
                            </NavLink>
                        </li>
                    </>
                )}

                {isAdmin && (
                    <>
                        <li className="nav-group">YÖNETİM</li>
                        <li>
                            <NavLink to="/admin/menus" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <Utensils size={20} />
                                <span>Aylık Menüler</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/holidays" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <CalendarClock size={20} />
                                <span>Tatil Günleri</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/reservations" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <Users size={20} />
                                <span>Tüm Rezervasyonlar</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/statistics" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <BarChart2 size={20} />
                                <span>İstatistikler</span>
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;
