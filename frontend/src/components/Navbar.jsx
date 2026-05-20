import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="navbar">
            <div className="navbar-search">
                {/* Boş */}
            </div>
            <div className="navbar-user">
                <div className="user-info">
                    <div className="user-avatar">
                        <User size={20} />
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.ad} {user?.soyad}</span>
                        <span className="user-role">{user?.rol}</span>
                    </div>
                </div>
                <button onClick={logout} className="btn-logout" title="Çıkış Yap">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
