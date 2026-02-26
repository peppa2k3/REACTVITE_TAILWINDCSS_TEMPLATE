import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  Users,
  MessageCircle,
  Building2,
  Settings as SettingsIcon,
  Shield,
  Menu,
  X,
  Home as HomeIcon,
} from 'lucide-react';

import Newsfeed from './Newsfeed';
import Chat from './Chat';
import FriendsPage from './Friends';
import { FriendProvider } from '../contexts/FriendContext';
import Groups from './Groups';
import Settings from './Settings';
import ProfilePage from './ProfilePage.demo'; // Dùng demo sẵn có trong thư mục pages
import { SettingsProvider } from '../contexts/SettingsContext';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('newsfeed');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'newsfeed', label: 'Bảng tin', icon: HomeIcon },
    { id: 'profile', label: 'Trang cá nhân', icon: User },
    { id: 'friends', label: 'Bạn bè', icon: Users },
    { id: 'chat', label: 'Tin nhắn', icon: MessageCircle },
    { id: 'groups', label: 'Nhóm', icon: Building2 },
    { id: 'settings', label: 'Cài đặt', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'newsfeed':
        return <Newsfeed />;
      case 'chat':
        return <Chat />;
      case 'friends':
        return (
          <FriendProvider>
            <FriendsPage />
          </FriendProvider>
        );
      case 'groups':
        return <Groups />;
      case 'settings':
        return (
          <SettingsProvider>
            <Settings />
          </SettingsProvider>
        );
      case 'profile':
        return <ProfilePage />;
      default:
        return <Newsfeed />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Sidebar Desktop (lg trở lên) */}
      <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Vie Social
          </h1>
        </div>

        <nav className="flex-1 px-4 py-8 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`group flex items-center gap-3.5 px-6 py-4 mb-1.5 rounded-3xl cursor-pointer transition-all duration-200 text-[15.5px] font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon
                  size={24}
                  className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'}
                />
                {item.label}
              </div>
            );
          })}
        </nav>

        {/* User mini card ở sidebar */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 rounded-3xl p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={26} className="text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
        <div
          className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-6 border-b flex items-center justify-between">
            <h1 className="text-3xl font-bold text-indigo-600">Vie Social</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl hover:bg-gray-100"
            >
              <X size={28} />
            </button>
          </div>

          <nav className="px-4 py-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3.5 px-6 py-4 mb-1.5 rounded-3xl cursor-pointer text-[15.5px] font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={24} />
                  {item.label}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Top */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition"
            >
              <Menu size={26} />
            </button>

            {/* Logo mobile */}
            <div className="lg:hidden text-2xl font-bold text-indigo-600">Vie Social</div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Panel */}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/users')}
                className="hidden sm:flex items-center gap-2 px-5 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 rounded-2xl transition"
              >
                <Shield size={19} />
                Admin Panel
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-2xl transition"
            >
              <LogOut size={19} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>

            {/* Avatar nhỏ */}
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl overflow-hidden ring-2 ring-white/70">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <User size={22} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Nội dung chính - căn giữa, responsive */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 bg-transparent">
          <div className="max-w-[1100px] mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default Home;
