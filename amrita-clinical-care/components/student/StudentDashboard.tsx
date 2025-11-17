

import React, { useState } from 'react';
import Layout from '../Layout';
import { Stethoscope, HeartPulse, FileText, Pill, ShieldQuestion, Home } from 'lucide-react';
import StudentHome from './StudentHome';
import StudentAppointments from './StudentAppointments';
import StudentSickLeave from './StudentSickLeave';
import StudentMedicineRequests from './StudentMedicineRequests';
import StudentSymptomChecker from './StudentSymptomChecker';
// FIX: Changed to a named import to resolve a module loading error.
import { StudentHistory } from './StudentHistory';

const StudentDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('home');

  const sidebarItems = [
    { icon: <Home size={20} />, label: 'Home', view: 'home' },
    { icon: <Stethoscope size={20} />, label: 'Appointments', view: 'appointments' },
    { icon: <FileText size={20} />, label: 'Sick Leave', view: 'sick-leave' },
    { icon: <Pill size={20} />, label: 'Medicine Requests', view: 'medicine-requests' },
    { icon: <ShieldQuestion size={20} />, label: 'Symptom Checker', view: 'symptom-checker' },
    { icon: <HeartPulse size={20} />, label: 'Medical History', view: 'history' },
  ];
  
  const renderContent = () => {
    switch(activeView) {
      case 'home':
        return <StudentHome setActiveView={setActiveView} />;
      case 'appointments':
        return <StudentAppointments />;
      case 'sick-leave':
        return <StudentSickLeave />;
      case 'medicine-requests':
        return <StudentMedicineRequests />;
      case 'symptom-checker':
        return <StudentSymptomChecker />;
       case 'history':
        return <StudentHistory />;
      default:
        return <StudentHome setActiveView={setActiveView} />;
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

export default StudentDashboard;