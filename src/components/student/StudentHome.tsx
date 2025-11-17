import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';
import { Student, Appointment, Staff } from '../../types';
import { getAppointmentsForStudent, getStaff } from '../../services/api';
import { Stethoscope, CalendarPlus, FileText, Pill, ShieldQuestion, User, Mail, Phone, Heart, ShieldAlert, Thermometer, Syringe } from 'lucide-react';

const StudentHealthCard: React.FC<{ student: Student }> = ({ student }) => (
    <div className="bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between h-full">
        <div>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{student.name}</h3>
                <User className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-sm opacity-90">{student.rollNumber} - {student.department}</p>
        </div>
        <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center space-x-2"><Mail size={16} /><p>{student.email}</p></div>
            <div className="flex items-center space-x-2"><Phone size={16} /><p>{student.phone}</p></div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 text-xs space-y-2">
            <div className="flex items-start space-x-2"><ShieldAlert size={14} className="mt-0.5" /><p><strong>Allergies:</strong> {student.allergies || 'None'}</p></div>
            <div className="flex items-start space-x-2"><Heart size={14} className="mt-0.5" /><p><strong>Chronic Conditions:</strong> {student.chronicConditions || 'None'}</p></div>
        </div>
    </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center space-y-2 p-4 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 text-brand-primary-dark">
    {icon}
    <span className="text-sm font-semibold text-center">{label}</span>
  </button>
);


const StudentHome: React.FC<{setActiveView: (view: string) => void}> = ({setActiveView}) => {
    const { user } = useContext(UserContext);
    const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
    const [doctor, setDoctor] = useState<Staff | null>(null);

    useEffect(() => {
        const fetchUpcomingAppointment = async () => {
            if (user && 'studentId' in user) {
                const appointments = await getAppointmentsForStudent(user.studentId);
                const upcoming = appointments
                    .filter(a => new Date(a.appointmentDate) >= new Date() && (a.status === 'Confirmed' || a.status === 'Pending'))
                    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0];
                setUpcomingAppointment(upcoming || null);
                if (upcoming) {
                    const staffList = await getStaff();
                    const doc = staffList.find(s => s.staffId === upcoming.doctorId) || null;
                    setDoctor(doc);
                }
            }
        };
        fetchUpcomingAppointment();
    }, [user]);

    if (!user || !('studentId' in user)) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <StudentHealthCard student={user as Student} />
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton icon={<CalendarPlus className="w-8 h-8 text-brand-primary" />} label="Book Appointment" onClick={() => setActiveView('appointments')} />
                        <QuickActionButton icon={<FileText className="w-8 h-8 text-brand-green" />} label="Request Leave" onClick={() => setActiveView('sick-leave')} />
                        <QuickActionButton icon={<Pill className="w-8 h-8 text-brand-warning" />} label="Request OTC" onClick={() => setActiveView('medicine-requests')} />
                        <QuickActionButton icon={<ShieldQuestion className="w-8 h-8 text-brand-danger" />} label="Symptom Check" onClick={() => setActiveView('symptom-checker')} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Appointment</h3>
                {upcomingAppointment ? (
                    <div className="bg-brand-primary-light p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-bold text-brand-primary-dark">{new Date(upcomingAppointment.appointmentDate).toDateString()} at {upcomingAppointment.appointmentTime}</p>
                            <p className="text-sm text-brand-text">With {doctor?.name || 'Doctor'}</p>
                            <p className="text-sm text-brand-text mt-1">Status: <span className="font-medium">{upcomingAppointment.status}</span></p>
                        </div>
                        <Stethoscope className="w-10 h-10 text-brand-primary opacity-50" />
                    </div>
                ) : (
                    <p className="text-brand-text">You have no upcoming appointments.</p>
                )}
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Campus Health Announcements</h3>
                 <div className="space-y-4">
                     <div className="flex items-start space-x-4 p-4 bg-brand-primary-light rounded-lg">
                        <Syringe className="w-6 h-6 text-brand-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-brand-primary-dark">Annual Flu Vaccination Drive</p>
                            <p className="text-sm text-brand-text">Get your free flu shot at the clinic from Oct 15th to Oct 30th. Protect yourself and the community!</p>
                        </div>
                     </div>
                      <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                        <Thermometer className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-green-800">Health Awareness Session: Stress Management</p>
                            <p className="text-sm text-green-700">Join us for a session on managing academic stress on Oct 22nd, 4 PM at the main auditorium.</p>
                        </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default StudentHome;
