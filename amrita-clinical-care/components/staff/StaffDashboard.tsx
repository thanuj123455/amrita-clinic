
import React, { useState } from 'react';
import Layout from '../Layout';
import { List, Bed, CalendarCheck, Home } from 'lucide-react';
import StaffHome from './StaffHome';
import PatientQueue from './PatientQueue';
import BedManagement from './BedManagement';
import DoctorAvailabilityManager from './DoctorAvailabilityManager';

const StaffDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('home');

  const sidebarItems = [
    { icon: <Home size={20} />, label: 'Dashboard', view: 'home' },
    { icon: <List size={20} />, label: 'Patient Queue', view: 'patient-queue' },
    { icon: <Bed size={20} />, label: 'Bed Management', view: 'bed-management' },
    { icon: <CalendarCheck size={20} />, label: 'Availability', view: 'availability' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <StaffHome />;
      case 'patient-queue':
        return <PatientQueue />;
      case 'bed-management':
        return <BedManagement />;
      case 'availability':
        return <DoctorAvailabilityManager />;
      default:
        return <StaffHome />;
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

export default StaffDashboard;
