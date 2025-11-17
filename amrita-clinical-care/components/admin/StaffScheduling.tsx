import React, { useEffect, useState } from 'react';
import { StaffSchedule, Staff, ShiftType, Role } from '../../types';
import { getStaffSchedules, getStaff as apiGetStaff, addStaffSchedule } from '../../services/mockApi';
import { PlusCircle } from 'lucide-react';

const ScheduleForm: React.FC<{
    onSubmit: (schedule: Omit<StaffSchedule, 'scheduleId'>) => void;
    onClose: () => void;
    staffList: Staff[];
}> = ({ onSubmit, onClose, staffList }) => {
    const [schedule, setSchedule] = useState<Omit<StaffSchedule, 'scheduleId'>>({
        staffId: 0,
        date: '',
        startTime: '',
        endTime: '',
        shiftType: ShiftType.Morning,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSchedule(prev => ({ ...prev, [name]: name === 'staffId' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(schedule.staffId === 0) {
            alert("Please select a staff member.");
            return;
        }
        onSubmit(schedule);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Shift</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="staffId" value={schedule.staffId} onChange={handleChange} className="w-full border-gray-300 rounded-md" required>
                        <option value={0}>Select Staff</option>
                        {staffList.map(s => <option key={s.staffId} value={s.staffId}>{s.name} ({s.role})</option>)}
                    </select>
                    <input name="date" type="date" value={schedule.date} onChange={handleChange} className="w-full border-gray-300 rounded-md" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="startTime" type="time" value={schedule.startTime} onChange={handleChange} className="w-full border-gray-300 rounded-md" required />
                        <input name="endTime" type="time" value={schedule.endTime} onChange={handleChange} className="w-full border-gray-300 rounded-md" required />
                    </div>
                    <select name="shiftType" value={schedule.shiftType} onChange={handleChange} className="w-full border-gray-300 rounded-md">
                        {Object.values(ShiftType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark">Add Shift</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const StaffScheduling: React.FC = () => {
    const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [showForm, setShowForm] = useState(false);

    const fetchData = async () => {
        const scheduleData = await getStaffSchedules();
        const staffData = await apiGetStaff();
        setSchedules(scheduleData);
        setStaff(staffData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSchedule = async (schedule: Omit<StaffSchedule, 'scheduleId'>) => {
        await addStaffSchedule(schedule);
        setShowForm(false);
        fetchData();
    };
    
    const getStaffName = (staffId: number) => staff.find(s => s.staffId === staffId)?.name || 'Unknown';
    const getStaffRole = (staffId: number) => staff.find(s => s.staffId === staffId)?.role || 'Unknown';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Staff Schedule</h1>
                <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-dark transition-colors">
                    <PlusCircle size={20} />
                    <span>Add Shift</span>
                </button>
            </div>

            {showForm && <ScheduleForm onSubmit={handleAddSchedule} onClose={() => setShowForm(false)} staffList={staff} />}

            <div className="bg-white rounded-xl shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Staff Name</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Shift</th>
                                <th scope="col" className="px-6 py-3">Timings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(s => (
                                <tr key={s.scheduleId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{new Date(s.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{getStaffName(s.staffId)}</td>
                                    <td className="px-6 py-4">{getStaffRole(s.staffId)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.shiftType === ShiftType.Morning ? 'bg-yellow-100 text-yellow-800' : s.shiftType === ShiftType.Evening ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>{s.shiftType}</span>
                                    </td>
                                    <td className="px-6 py-4">{s.startTime} - {s.endTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffScheduling;