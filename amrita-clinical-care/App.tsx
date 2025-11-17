
import React, { useState, useMemo } from 'react';
// Fix: Removed 'User' from import as it is not defined in types.ts
import { Role, Student, Staff, Notification } from './types';
import { getStudentById, getStaffById, getNotificationsForUser } from './services/mockApi';
import StudentDashboard from './components/student/StudentDashboard';
import StaffDashboard from './components/staff/StaffDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginScreen from './components/LoginScreen';

export const UserContext = React.createContext<{
  user: Student | Staff | { role: Role.Admin } | null;
  role: Role | null;
  logout: () => void;
  notifications: Notification[];
  markAsRead: (id: number) => void;
}>({
  user: null,
  role: null,
  logout: () => {},
  notifications: [],
  markAsRead: () => {}
});

const App: React.FC = () => {
  const [user, setUser] = useState<Student | Staff | { role: Role.Admin } | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleLogin = async (id: number, selectedRole: Role) => {
    let userData: Student | Staff | { role: Role.Admin } | null = null;
    if (selectedRole === Role.Student) {
      userData = await getStudentById(id);
    } else if (selectedRole === Role.Doctor || selectedRole === Role.Nurse) {
      userData = await getStaffById(id);
    } else if (selectedRole === Role.Admin) {
      userData = { role: Role.Admin };
    }

    if (userData) {
      setUser(userData);
      setRole(selectedRole);
      const userNotifications = await getNotificationsForUser(id, selectedRole);
      setNotifications(userNotifications);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    setNotifications([]);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, read: true } : n));
  };
  
  const userContextValue = useMemo(() => ({
    user,
    role,
    logout: handleLogout,
    notifications,
    markAsRead
  }), [user, role, notifications]);

  const renderDashboard = () => {
    switch (role) {
      case Role.Student:
        return <StudentDashboard />;
      case Role.Doctor:
      case Role.Nurse:
        return <StaffDashboard />;
      case Role.Admin:
        return <AdminDashboard />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <UserContext.Provider value={userContextValue}>
      <div className="bg-brand-gray min-h-screen font-sans">
        {renderDashboard()}
      </div>
    </UserContext.Provider>
  );
};

export default App;
