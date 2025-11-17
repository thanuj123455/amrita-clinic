import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';
import { SickLeaveRequest, SickLeaveStatus } from '../../types';
import { getSickLeaveRequestsForStudent, requestSickLeave as apiRequestSickLeave, generateLeaveCertificatePDF } from '../../services/api';
import { PlusCircle, FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';

const SickLeaveForm: React.FC<{ onSubmit: (details: Omit<SickLeaveRequest, 'leaveId' | 'studentId' | 'doctorRemarks' | 'status'>) => void; onClose: () => void }> = ({ onSubmit, onClose }) => {
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (new Date(startDate) > new Date(endDate)) {
            alert("End date cannot be before start date.");
            return;
        }
        onSubmit({ reason, startDate, endDate });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Request Sick Leave</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" min={startDate} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Leave</label>
                        <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} required rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" placeholder="Please provide a brief reason for your sick leave..."></textarea>
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

const StatusBadge: React.FC<{ status: SickLeaveStatus }> = ({ status }) => {
    const statusStyles = {
        [SickLeaveStatus.Submitted]: 'bg-yellow-100 text-yellow-800',
        [SickLeaveStatus.Approved]: 'bg-green-100 text-green-800',
        [SickLeaveStatus.Rejected]: 'bg-red-100 text-red-800',
    };
     const Icon = {
        [SickLeaveStatus.Submitted]: Clock,
        [SickLeaveStatus.Approved]: CheckCircle,
        [SickLeaveStatus.Rejected]: XCircle,
    }[status];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            <Icon className="mr-1.5 h-4 w-4" />
            {status}
        </span>
    );
};

const StudentSickLeave: React.FC = () => {
    const { user } = useContext(UserContext);
    const [requests, setRequests] = useState<SickLeaveRequest[]>([]);
    const [showForm, setShowForm] = useState(false);

    const fetchData = async () => {
        if (user && 'studentId' in user) {
            const leaveRequests = await getSickLeaveRequestsForStudent(user.studentId);
            setRequests(leaveRequests.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleSubmitRequest = async (details: Omit<SickLeaveRequest, 'leaveId' | 'studentId' | 'doctorRemarks' | 'status'>) => {
        if (user && 'studentId' in user) {
            await apiRequestSickLeave(user.studentId, details);
            setShowForm(false);
            fetchData();
        }
    };
    
    const handleDownloadCertificate = async (request: SickLeaveRequest) => {
        if(user && 'studentId' in user) {
            await generateLeaveCertificatePDF(request, user);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Sick Leave Requests</h1>
                <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-dark transition-colors">
                    <PlusCircle size={20} />
                    <span>New Leave Request</span>
                </button>
            </div>

            {showForm && <SickLeaveForm onSubmit={handleSubmitRequest} onClose={() => setShowForm(false)} />}

            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Request History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Dates</th>
                                <th scope="col" className="px-6 py-3">Reason</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Doctor's Remarks</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.leaveId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-xs">{req.reason}</td>
                                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                    <td className="px-6 py-4">{req.doctorRemarks || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        {req.status === SickLeaveStatus.Approved && (
                                            <button onClick={() => handleDownloadCertificate(req)} className="flex items-center text-sm text-brand-primary hover:underline">
                                                <Download size={16} className="mr-1" />
                                                Certificate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && <p className="text-center py-4 text-brand-text">No leave requests found.</p>}
                </div>
            </div>
        </div>
    );
};

export default StudentSickLeave;
