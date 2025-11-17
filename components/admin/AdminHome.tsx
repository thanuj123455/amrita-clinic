import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getPatientVisits, getMedicineInventory, getAppointments, getBeds } from '../../services/mockApi';
import { MedicineInventory, PatientVisit, Bed, Appointment, BedStatus, AppointmentStatus } from '../../types';
import { Users, Pill, BedDouble, AlertTriangle } from 'lucide-react';

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            {children}
        </div>
    </div>
);

const AdminHome: React.FC = () => {
    const [visits, setVisits] = useState<PatientVisit[]>([]);
    const [inventory, setInventory] = useState<MedicineInventory[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [beds, setBeds] = useState<Bed[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [visitData, inventoryData, appointmentData, bedData] = await Promise.all([
                getPatientVisits(),
                getMedicineInventory(),
                getAppointments(),
                getBeds()
            ]);
            setVisits(visitData);
            setInventory(inventoryData);
            setAppointments(appointmentData);
            setBeds(bedData);
        };
        fetchData();
    }, []);

    const weeklyVisitsData = visits.reduce((acc, visit) => {
        const day = new Date(visit.checkinTime).toLocaleDateString('en-US', { weekday: 'short' });
        const existing = acc.find(item => item.name === day);
        if (existing) {
            existing.visits++;
        } else {
            acc.push({ name: day, visits: 1 });
        }
        return acc;
    }, [] as { name: string; visits: number }[]);

    const commonIllnessesData = visits.reduce((acc, visit) => {
        const illness = visit.diagnosis.split(',')[0].trim(); // Simple parsing
        const existing = acc.find(item => item.name === illness);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: illness, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).slice(0, 5);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    const lowStockItems = inventory.filter(item => item.quantity < item.threshold);
    
    const bedOccupancy = beds.filter(b => b.status === BedStatus.Occupied).length;
    
    const appointmentsToday = appointments.filter(a => a.appointmentDate === new Date().toISOString().split('T')[0] && a.status !== AppointmentStatus.Cancelled).length;


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-brand-primary-light"><Users size={24} className="text-brand-primary-dark" /></div>
                    <div><p className="text-sm text-brand-text">Appointments Today</p><p className="text-2xl font-bold text-gray-800">{appointmentsToday}</p></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-red-100"><BedDouble size={24} className="text-red-800" /></div>
                    <div><p className="text-sm text-brand-text">Bed Occupancy</p><p className="text-2xl font-bold text-gray-800">{bedOccupancy} / {beds.length}</p></div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-yellow-100"><AlertTriangle size={24} className="text-yellow-800" /></div>
                    <div><p className="text-sm text-brand-text">Low Stock Items</p><p className="text-2xl font-bold text-gray-800">{lowStockItems.length}</p></div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-green-100"><Pill size={24} className="text-green-800" /></div>
                    <div><p className="text-sm text-brand-text">Total Medicine Types</p><p className="text-2xl font-bold text-gray-800">{inventory.length}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Weekly Patient Visits">
                    <ResponsiveContainer>
                        <BarChart data={weeklyVisitsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="visits" fill="#B41F45" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Most Common Illnesses">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={commonIllnessesData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={(entry) => entry.name}>
                                {commonIllnessesData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    );
};

export default AdminHome;