

import React, { useEffect, useState } from 'react';
import { Appointment, Bed, PatientVisit, AppointmentStatus, BedStatus, Student } from '../../types';
import { getAppointments, getBeds, getPatientVisits, getStudents } from '../../services/api';
import { Users, BedDouble, Activity, Clock, User, Calendar } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-brand-text">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AppointmentList: React.FC<{ title: string; appointments: (Appointment & { studentName: string })[] }> = ({ title, appointments }) => (
    <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">{title}</h2>
        {appointments.length > 0 ? (
            <ul className="space-y-3">
                {appointments.map(app => (
                    <li key={app.appointmentId} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800 flex items-center gap-2"><User size={16} />{app.studentName}</p>
                            <p className="text-sm text-brand-text truncate max-w-xs">{app.symptoms}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-brand-primary flex items-center gap-2"><Clock size={16} />{app.appointmentTime}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${app.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{app.status}</span>
                        </div>
                    </li>
                ))}
            </ul>
        ) : <p className="text-brand-text">No appointments scheduled.</p>}
    </div>
);


const StaffHome: React.FC = () => {
    const [stats, setStats] = useState({
        todayAppointments: 0,
        occupiedBeds: 0,
        totalBeds: 0,
        completedVisitsToday: 0,
    });
    const [todayAppointments, setTodayAppointments] = useState<(Appointment & { studentName: string })[]>([]);
    const [tomorrowAppointments, setTomorrowAppointments] = useState<(Appointment & { studentName: string })[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);

            const todayStr = today.toISOString().split('T')[0];
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            
            const [appointments, beds, visits, students] = await Promise.all([
                getAppointments(),
                getBeds(),
                getPatientVisits(),
                getStudents(),
            ]);
            
            const studentMap = new Map(students.map(s => [s.studentId, s.name]));

            const enrichAppointment = (app: Appointment) => ({
                ...app,
                studentName: studentMap.get(app.studentId) || 'Unknown Student',
            });

            const todays = appointments
                .filter(a => a.appointmentDate === todayStr && a.status !== AppointmentStatus.Cancelled)
                .map(enrichAppointment)
                .sort((a,b) => a.appointmentTime.localeCompare(b.appointmentTime));

            const tomorrows = appointments
                .filter(a => a.appointmentDate === tomorrowStr && a.status !== AppointmentStatus.Cancelled)
                .map(enrichAppointment)
                .sort((a,b) => a.appointmentTime.localeCompare(b.appointmentTime));

            setTodayAppointments(todays);
            setTomorrowAppointments(tomorrows);

            const occupiedBeds = beds.filter(b => b.status === BedStatus.Occupied).length;
            const completedVisitsToday = visits.filter(v => new Date(v.checkinTime).toISOString().split('T')[0] === todayStr).length;

            setStats({
                todayAppointments: todays.length,
                occupiedBeds,
                totalBeds: beds.length,
                completedVisitsToday,
            });

        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Clinic Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Today's Appointments" 
                    value={stats.todayAppointments} 
                    icon={<Users size={24} className="text-brand-primary-dark" />} 
                    color="bg-brand-primary-light" 
                />
                <StatCard 
                    title="Occupied Beds" 
                    value={`${stats.occupiedBeds} / ${stats.totalBeds}`}
                    icon={<BedDouble size={24} className="text-red-800" />} 
                    color="bg-red-100" 
                />
                <StatCard 
                    title="Patients Seen Today" 
                    value={stats.completedVisitsToday} 
                    icon={<Activity size={24} className="text-green-800" />} 
                    color="bg-green-100" 
                />
                 <StatCard 
                    title="Current Time" 
                    value={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    icon={<Clock size={24} className="text-yellow-800" />} 
                    color="bg-yellow-100" 
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AppointmentList title="Today's Schedule" appointments={todayAppointments} />
                <AppointmentList title="Tomorrow's Schedule" appointments={tomorrowAppointments} />
            </div>
        </div>
    );
};

export default StaffHome;
