import React, { useContext, useState, ReactNode } from 'react';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { UserContext } from '../App';
import { Role } from '../types';

interface LayoutProps {
  children: ReactNode;
  sidebarItems: { icon: ReactNode; label: string; view: string }[];
  activeView: string;
  setActiveView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebarItems, activeView, setActiveView }) => {
  const { user, role, logout, notifications, markAsRead } = useContext(UserContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const userName = user ? ('name' in user ? user.name : 'Admin') : 'Guest';

  return (
    <div className="flex h-screen bg-brand-gray">
      {/* Sidebar */}
      <aside className={`bg-brand-primary-dark text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30`}>
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-extrabold">AmritaCare</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white">
            <X size={24} />
          </button>
        </div>
        <nav>
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveView(item.view);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors duration-200 ${activeView === item.view ? 'bg-brand-primary text-white' : 'hover:bg-brand-primary hover:text-white'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm flex items-center justify-between p-4 z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 md:hidden mr-4">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {sidebarItems.find(item => item.view === activeView)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative text-gray-600 hover:text-brand-primary">
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-danger text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20">
                  <div className="py-2 px-4 border-b font-bold text-gray-700">Notifications</div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.notificationId} className={`p-4 border-b hover:bg-gray-50 ${n.read ? 'opacity-60' : ''}`} onClick={() => markAsRead(n.notificationId)}>
                        <p className="font-semibold text-sm">{n.title}</p>
                        <p className="text-xs text-brand-text">{n.message}</p>
                        <p className="text-right text-xs text-gray-400 mt-1">{new Date(n.sendTime).toLocaleString()}</p>
                      </div>
                    )) : <p className="p-4 text-sm text-brand-text">No new notifications.</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="font-semibold text-gray-800 text-sm">{userName}</p>
                <p className="text-xs text-brand-text">{role}</p>
              </div>
               <button onClick={logout} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-brand-danger" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
