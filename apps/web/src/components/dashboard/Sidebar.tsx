import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Sidebar() {
  const location = useLocation();
  const { user, organization, subscription, clearAuth } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Projects', href: '/dashboard/projects', icon: '📁' },
    { name: 'Team', href: '/dashboard/team', icon: '👥', requiresPlan: ['teams', 'enterprise'] },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
    { name: 'Billing', href: '/dashboard/billing', icon: '💳' },
  ];

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const canAccess = (item: any) => {
    if (!item.requiresPlan) return true;
    return item.requiresPlan.includes(subscription?.plan);
  };

  return (
    <div className="h-full bg-gray-900 text-white w-64 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="text-3xl">🎨</span>
          <div>
            <h1 className="text-xl font-bold">DragNDrop</h1>
            <p className="text-xs text-gray-400">{organization?.name}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          if (!canAccess(item)) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 px-4 py-3 text-gray-500 cursor-not-allowed"
                title={`Requiere plan ${item.requiresPlan?.join(' o ')}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
                <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded">Pro</span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
