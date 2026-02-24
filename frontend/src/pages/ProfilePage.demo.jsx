import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', avatar: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });

  // Giả sử lấy profile khi mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await axios.get('/api/users/profile');
    setUser(data);
    setFormData({ fullName: data.fullName, phone: data.phone || '', avatar: data.avatar || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', formData);
      toast.success('Cập nhật thành công!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Avatar & Info Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center">
          <div className="relative group">
            <img
              src={user?.avatar || 'https://via.placeholder.com/150'}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
            />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-800">{user?.fullName}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full uppercase font-semibold">
            {user?.role}
          </span>
        </div>

        {/* Right Col: Tabs/Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-indigo-600 hover:underline text-sm font-medium"
              >
                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
              </button>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70"
                />
              </div>
              {isEditing && (
                <button className="md:col-span-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                  Lưu thay đổi
                </button>
              )}
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold mb-6">Bảo mật</h3>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Mật khẩu</p>
                  <p className="text-sm text-gray-500">
                    Thay đổi mật khẩu định kỳ để bảo mật tài khoản
                  </p>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
