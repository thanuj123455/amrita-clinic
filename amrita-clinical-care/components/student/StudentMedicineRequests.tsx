import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';
import { MedicineRequest, MedicineRequestStatus, MedicineInventory } from '../../types';
import { getMedicineRequestsForStudent, getMedicineInventory, requestMedicine as apiRequestMedicine } from '../../services/mockApi';
import { PlusCircle, Pill, CheckCircle, XCircle, Clock } from 'lucide-react';

const MedicineRequestForm: React.FC<{ onSubmit: (details: Omit<MedicineRequest, 'requestId' | 'studentId' | 'status' | 'issuedDate'>) => void; onClose: () => void; medicines: MedicineInventory[] }> = ({ onSubmit, onClose, medicines }) => {
    const [medicineId, setMedicineId] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!medicineId) {
            alert("Please select a medicine.");
            return;
        }
        onSubmit({ medicineId: parseInt(medicineId), reason });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Request OTC Medicine</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="medicine" className="block text-sm font-medium text-gray-700">Medicine</label>
                        <select id="medicine" value={medicineId} onChange={e => setMedicineId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary">
                            <option value="">Select Medicine</option>
                            {medicines.filter(m => m.quantity > 0).map(med => <option key={med.medicineId} value={med.medicineId}>{med.medicineName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Request</label>
                        <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} required rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" placeholder="e.g., Headache, mild fever..."></textarea>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: MedicineRequestStatus }> = ({ status }) => {
    const statusStyles = {
        [MedicineRequestStatus.Requested]: 'bg-yellow-100 text-yellow-800',
        [MedicineRequestStatus.Approved]: 'bg-green-100 text-green-800',
        [MedicineRequestStatus.Rejected]: 'bg-red-100 text-red-800',
    };
     const Icon = {
        [MedicineRequestStatus.Requested]: Clock,
        [MedicineRequestStatus.Approved]: CheckCircle,
        [MedicineRequestStatus.Rejected]: XCircle,
    }[status];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            <Icon className="mr-1.5 h-4 w-4" />
            {status}
        </span>
    );
};

const StudentMedicineRequests: React.FC = () => {
    const { user } = useContext(UserContext);
    const [requests, setRequests] = useState<MedicineRequest[]>([]);
    const [medicines, setMedicines] = useState<MedicineInventory[]>([]);
    const [showForm, setShowForm] = useState(false);

    const fetchData = async () => {
        if (user && 'studentId' in user) {
            const medRequests = await getMedicineRequestsForStudent(user.studentId);
            const inventory = await getMedicineInventory();
            setRequests(medRequests.sort((a,b) => b.requestId - a.requestId));
            setMedicines(inventory);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleSubmitRequest = async (details: Omit<MedicineRequest, 'requestId' | 'studentId' | 'status' | 'issuedDate'>) => {
        if (user && 'studentId' in user) {
            await apiRequestMedicine(user.studentId, details);
            setShowForm(false);
            fetchData();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">OTC Medicine Requests</h1>
                <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-dark transition-colors">
                    <PlusCircle size={20} />
                    <span>New Medicine Request</span>
                </button>
            </div>

            {showForm && <MedicineRequestForm onSubmit={handleSubmitRequest} onClose={() => setShowForm(false)} medicines={medicines} />}
            
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Request History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Request ID</th>
                                <th scope="col" className="px-6 py-3">Medicine</th>
                                <th scope="col" className="px-6 py-3">Reason</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Issued Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.requestId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">#{req.requestId}</td>
                                    <td className="px-6 py-4">{medicines.find(m => m.medicineId === req.medicineId)?.medicineName}</td>
                                    <td className="px-6 py-4 truncate max-w-xs">{req.reason}</td>
                                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                    <td className="px-6 py-4">{req.issuedDate ? new Date(req.issuedDate).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {requests.length === 0 && <p className="text-center py-4 text-brand-text">No medicine requests found.</p>}
                </div>
            </div>
        </div>
    );
};

export default StudentMedicineRequests;