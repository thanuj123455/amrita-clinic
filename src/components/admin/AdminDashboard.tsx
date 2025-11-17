
import React, { useState } from 'react';
import Layout from '../Layout';
import { BarChart2, Package, Calendar, Megaphone, Home, CalendarClock } from 'lucide-react';
import AdminHome from './AdminHome';
import InventoryManagement from './InventoryManagement';
import StaffScheduling from './StaffScheduling';
import Broadcasts from './Broadcasts';
import DoctorAvailabilityManager from '../staff/DoctorAvailabilityManager';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('home');

  const sidebarItems = [
    { icon: <Home size={20} />, label: 'Dashboard', view: 'home' },
    { icon: <Package size={20} />, label: 'Inventory', view: 'inventory' },
    { icon: <Calendar size={20} />, label: 'Staff Schedule', view: 'scheduling' },
    { icon: <CalendarClock size={20} />, label: 'Doctor Availability', view: 'doctor-availability' },
    { icon: <Megaphone size={20} />, label: 'Broadcasts', view: 'broadcasts' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <AdminHome />;
      case 'inventory':
        return <InventoryManagement />;
      case 'scheduling':
        return <StaffScheduling />;
       case 'doctor-availability':
        return <DoctorAvailabilityManager />;
      case 'broadcasts':
        return <Broadcasts />;
      default:
        return <AdminHome />;
    }
  };

  return (
    <Layout
      sidebarItems={sidebarItems}
      activeView={activeView}
      setActiveView={setActiveView}
    >
      {renderContent()}
    </Layout>
  );
};

export default AdminDashboard;
