
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';
import { Appointment, Staff, AppointmentStatus, Role } from '../../types';
import { getAppointmentsForStudent, getStaff, bookAppointment as apiBookAppointment, cancelAppointment as apiCancelAppointment, getAvailableTimeSlots } from '../../services/mockApi';
import { Calendar, Clock, Stethoscope, PlusCircle, XCircle, CheckCircle, Info, Loader } from 'lucide-react';

const AppointmentForm: React.FC<{ onBook: (details: Omit<Appointment, 'appointmentId' | 'studentId' | 'createdTime' | 'status'>) => void; onClose: () => void; doctors: Staff[] }> = ({ onBook, onClose, doctors }) => {
    const [doctorId, setDoctorId] = useState<string>('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    useEffect(() => {
        if (doctorId && appointmentDate) {
            setIsLoadingSlots(true);
            setAvailableSlots([]);
            setAppointmentTime('');
            getAvailableTimeSlots(parseInt(doctorId), appointmentDate).then(slots => {
                setAvailableSlots(slots);
                setIsLoadingSlots(false);
            });
        }
    }, [doctorId, appointmentDate]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!doctorId || !appointmentDate || !appointmentTime || !symptoms) {
            alert("Please fill all fields and select a time slot.");
            return;
        }
        onBook({ doctorId: parseInt(doctorId), appointmentDate, appointmentTime, symptoms });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Book an Appointment</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">1. Select Doctor</label>
                            <select id="doctor" value={doctorId} onChange={e => setDoctorId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary">
                                <option value="">Select a Doctor</option>
                                {doctors.map(doc => <option key={doc.staffId} value={doc.staffId}>{doc.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">2. Select Date</label>
                            <input type="date" id="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" min={new Date().toISOString().split('T')[0]} disabled={!doctorId} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">3. Select Available Time Slot</label>
                        <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-[100px]">
                            {isLoadingSlots && <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-brand-primary"/></div>}
                            {!isLoadingSlots && availableSlots.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {availableSlots.map(slot => (
                                        <button type="button" key={slot} onClick={() => setAppointmentTime(slot)} className={`px-3 py-2 text-sm rounded-md transition-colors ${appointmentTime === slot ? 'bg-brand-primary text-white' : 'bg-white hover:bg-brand-primary-light'}`}>
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            )}
                             {!isLoadingSlots && availableSlots.length === 0 && doctorId && appointmentDate && (
                                <p className="text-center text-sm text-gray-500">No available slots for this doctor on the selected date. Please choose another doctor or date.</p>
                             )}
                              {!doctorId || !appointmentDate && (
                                <p className="text-center text-sm text-gray-400">Please select a doctor and date to see available slots.</p>
                              )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">4. Symptoms</label>
                        <textarea id="symptoms" value={symptoms} onChange={e => setSymptoms(e.target.value)} required rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" placeholder="Briefly describe your symptoms..."></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark" disabled={!appointmentTime}>Book Appointment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
    const statusStyles = {
        [AppointmentStatus.Pending]: 'bg-yellow-100 text-yellow-800',
        [AppointmentStatus.Confirmed]: 'bg-green-100 text-green-800',
        [AppointmentStatus.Completed]: 'bg-gray-100 text-gray-800',
        [AppointmentStatus.Cancelled]: 'bg-red-100 text-red-800',
    };
    const Icon = {
        [AppointmentStatus.Pending]: Info,
        [AppointmentStatus.Confirmed]: CheckCircle,
        [AppointmentStatus.Completed]: Stethoscope,
        [AppointmentStatus.Cancelled]: XCircle,
    }[status];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            <Icon className="mr-1.5 h-4 w-4" />
            {status}
        </span>
    );
};


const StudentAppointments: React.FC = () => {
    const { user } = useContext(UserContext);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Staff[]>([]);
    const [showForm, setShowForm] = useState(false);

    const fetchData = async () => {
        if (user && 'studentId' in user) {
            const studentAppointments = await getAppointmentsForStudent(user.studentId);
            const staff = await getStaff();
            setAppointments(studentAppointments.sort((a,b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()));
            setDoctors(staff.filter(s => s.role === Role.Doctor));
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleBookAppointment = async (details: Omit<Appointment, 'appointmentId' | 'studentId' | 'createdTime' | 'status'>) => {
        if (user && 'studentId' in user) {
            const result = await apiBookAppointment(user.studentId, details);
            if (result.error) {
                alert(`Booking failed: ${result.error}`);
            } else {
                alert("Appointment booked successfully!");
                setShowForm(false);
                fetchData();
            }
        }
    };

    const handleCancelAppointment = async (appointmentId: number) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            await apiCancelAppointment(appointmentId);
            fetchData();
        }
    };
    
    const upcomingAppointments = appointments.filter(a => new Date(a.appointmentDate) >= new Date() && a.status !== AppointmentStatus.Completed && a.status !== AppointmentStatus.Cancelled);
    const pastAppointments = appointments.filter(a => new Date(a.appointmentDate) < new Date() || a.status === AppointmentStatus.Completed || a.status === AppointmentStatus.Cancelled);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
                <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-dark transition-colors">
                    <PlusCircle size={20} />
                    <span>Book New Appointment</span>
                </button>
            </div>
            
            {showForm && <AppointmentForm onBook={handleBookAppointment} onClose={() => setShowForm(false)} doctors={doctors} />}

            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Upcoming Appointments</h2>
                {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingAppointments.map(app => (
                            <div key={app.appointmentId} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                                        <Calendar size={20} className="text-brand-primary" />
                                        <span>{new Date(app.appointmentDate).toDateString()}</span>
                                        <Clock size={20} className="text-brand-primary" />
                                        <span>{app.appointmentTime}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-brand-text mt-1">
                                        <Stethoscope size={16} />
                                        <span>{doctors.find(d => d.staffId === app.doctorId)?.name || 'Doctor'}</span>
                                    </div>
                                    <p className="text-sm text-brand-text mt-2">Symptoms: {app.symptoms}</p>
                                </div>
                                <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2 w-full md:w-auto">
                                    <StatusBadge status={app.status} />
                                    {(app.status === AppointmentStatus.Pending || app.status === AppointmentStatus.Confirmed) && (
                                        <button onClick={() => handleCancelAppointment(app.appointmentId)} className="text-xs text-brand-danger hover:underline">Cancel</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-brand-text">No upcoming appointments.</p>}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Past Appointments</h2>
                {pastAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Date & Time</th>
                                    <th scope="col" className="px-6 py-3">Doctor</th>
                                    <th scope="col" className="px-6 py-3">Symptoms</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastAppointments.map(app => (
                                    <tr key={app.appointmentId} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{new Date(app.appointmentDate).toLocaleDateString()} {app.appointmentTime}</td>
                                        <td className="px-6 py-4">{doctors.find(d => d.staffId === app.doctorId)?.name}</td>
                                        <td className="px-6 py-4 truncate max-w-xs">{app.symptoms}</td>
                                        <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-brand-text">No past appointment records.</p>}
            </div>
        </div>
    );
};

export default StudentAppointments;
