

import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { DoctorAvailability, Staff, Role, AvailabilityStatus } from '../../types';
import { getStaff, getDoctorAvailabilities, addDoctorAvailability, updateDoctorAvailability, deleteDoctorAvailability } from '../../services/mockApi';
import { PlusCircle, Edit, Trash2, X, Calendar, Clock } from 'lucide-react';

const AvailabilityForm: React.FC<{
    onSubmit: (slot: Omit<DoctorAvailability, 'availabilityId'> | DoctorAvailability) => void;
    onClose: () => void;
    slotToEdit?: DoctorAvailability | null;
    doctorId: number;
}> = ({ onSubmit, onClose, slotToEdit, doctorId }) => {
    const [slot, setSlot] = useState<Omit<DoctorAvailability, 'availabilityId' | 'doctorId'>>({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        status: AvailabilityStatus.Available,
        notes: '',
    });

    useEffect(() => {
        if (slotToEdit) {
            setSlot(slotToEdit);
        }
    }, [slotToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSlot(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (slot.startTime >= slot.endTime) {
            alert("End time must be after start time.");
            return;
        }
        onSubmit(slotToEdit ? { ...slot, availabilityId: slotToEdit.availabilityId, doctorId } : { ...slot, doctorId });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{slotToEdit ? 'Edit Slot' : 'Add New Slot'}</h2>
                    <button onClick={onClose}><X size={24} className="text-gray-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="date" type="date" value={slot.date} onChange={handleChange} className="w-full border-gray-300 rounded-md" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="startTime" type="time" value={slot.startTime} onChange={handleChange} className="w-full border-gray-300 rounded-md" required />
                        <input name="endTime" type="time" value={slot.endTime} onChange={handleChange} className="w-full border-gray-300 rounded-md" required />
                    </div>
                    <select name="status" value={slot.status} onChange={handleChange} className="w-full border-gray-300 rounded-md">
                        {Object.values(AvailabilityStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <textarea name="notes" value={slot.notes} onChange={handleChange} placeholder="Notes (optional)" className="w-full border-gray-300 rounded-md" rows={2} />
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const DoctorAvailabilityManager: React.FC = () => {
    const { user, role } = useContext(UserContext);
    const [doctors, setDoctors] = useState<Staff[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
    const [availabilities, setAvailabilities] = useState<DoctorAvailability[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [slotToEdit, setSlotToEdit] = useState<DoctorAvailability | null>(null);

    const isReadOnly = role === Role.Nurse;

    useEffect(() => {
// Fix: Replaced `apiGetStaff` with the correctly imported `getStaff` function to resolve the 'Cannot find name' error.
        getStaff().then(staffList => {
            const doctorList = staffList.filter(s => s.role === Role.Doctor);
            setDoctors(doctorList);
            if (role === Role.Admin && doctorList.length > 0) {
                setSelectedDoctorId(doctorList[0].staffId);
            } else if (role === Role.Doctor && user && 'staffId' in user) {
                setSelectedDoctorId(user.staffId);
            } else if (role === Role.Nurse && doctorList.length > 0) {
                setSelectedDoctorId(doctorList[0].staffId);
            }
        });
    }, [role, user]);

    useEffect(() => {
        if (selectedDoctorId) {
            fetchData(selectedDoctorId);
        }
    }, [selectedDoctorId]);

    const fetchData = async (doctorId: number) => {
        const data = await getDoctorAvailabilities(doctorId);
        setAvailabilities(data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime)));
    };

    const handleFormSubmit = async (slot: Omit<DoctorAvailability, 'availabilityId'> | DoctorAvailability) => {
        if ('availabilityId' in slot) {
            await updateDoctorAvailability(slot.availabilityId, slot);
        } else {
            await addDoctorAvailability(slot);
        }
        setShowForm(false);
        setSlotToEdit(null);
        if (selectedDoctorId) fetchData(selectedDoctorId);
    };

    const handleDelete = async (availabilityId: number) => {
        if(window.confirm("Are you sure you want to delete this slot? This cannot be undone.")) {
            await deleteDoctorAvailability(availabilityId);
            if (selectedDoctorId) fetchData(selectedDoctorId);
        }
    };
    
    const openEditForm = (slot: DoctorAvailability) => {
        setSlotToEdit(slot);
        setShowForm(true);
    };

    const statusColors: { [key in AvailabilityStatus]: string } = {
        [AvailabilityStatus.Available]: 'bg-green-100 text-green-800',
        [AvailabilityStatus.Unavailable]: 'bg-red-100 text-red-800',
        [AvailabilityStatus.Busy]: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Doctor Availability</h1>
                {!isReadOnly && (
                    <button onClick={() => { setSlotToEdit(null); setShowForm(true); }} disabled={!selectedDoctorId} className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-dark transition-colors disabled:bg-gray-400">
                        <PlusCircle size={20} />
                        <span>Add New Slot</span>
                    </button>
                )}
            </div>
            
            {(role === Role.Admin || role === Role.Nurse) && (
                <div className="bg-white p-4 rounded-xl shadow">
                     <label htmlFor="doctor-select" className="block text-sm font-medium text-gray-700">Select Doctor</label>
                    <select id="doctor-select" value={selectedDoctorId || ''} onChange={(e) => setSelectedDoctorId(parseInt(e.target.value))} className="mt-1 block w-full md:w-1/3 border-gray-300 rounded-md shadow-sm">
                        {doctors.map(d => <option key={d.staffId} value={d.staffId}>{d.name}</option>)}
                    </select>
                </div>
            )}

            {showForm && selectedDoctorId && <AvailabilityForm onSubmit={handleFormSubmit} onClose={() => { setShowForm(false); setSlotToEdit(null); }} slotToEdit={slotToEdit} doctorId={selectedDoctorId} />}
            
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4">
                    Schedule for {doctors.find(d => d.staffId === selectedDoctorId)?.name || '...'}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Notes</th>
                                {!isReadOnly && <th className="px-6 py-3">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {availabilities.map(slot => (
                                <tr key={slot.availabilityId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2"><Calendar size={16} />{new Date(slot.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 flex items-center gap-2"><Clock size={16} />{slot.startTime} - {slot.endTime}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[slot.status]}`}>{slot.status}</span>
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-xs">{slot.notes}</td>
                                    {!isReadOnly && (
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <button onClick={() => openEditForm(slot)} className="text-brand-primary hover:text-brand-primary-dark"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(slot.availabilityId)} className="text-brand-danger hover:text-red-700"><Trash2 size={18} /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {availabilities.length === 0 && selectedDoctorId && (
                        <p className="text-center py-4 text-brand-text">No availability slots found for this doctor.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorAvailabilityManager;