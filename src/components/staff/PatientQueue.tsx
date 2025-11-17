import React, { useEffect, useState, useContext } from 'react';
import { Appointment, Student, Staff, AppointmentStatus, PatientVisit, Vital, Prescription, VisitStatus } from '../../types';
import { getAppointments, getStudents, createPatientVisit, updateAppointmentStatus, getStaff, getMedicineInventory, createPrescription as apiCreatePrescription, generateVisitSummaryPDF, generatePrescriptionPDF } from '../../services/api';
import { UserContext } from '../../App';
import { Clock, User, LogIn, Thermometer, Heart, Activity, FileText, Pill, Calendar, Download } from 'lucide-react';

const PatientVisitModal: React.FC<{ visit: PatientVisit, student: Student, onSave: (visit: PatientVisit, prescriptions: Omit<Prescription, 'prescriptionId'>[]) => void, onClose: () => void }> = ({ visit, student, onSave, onClose }) => {
    const { user } = useContext(UserContext);
    const [currentVisit, setCurrentVisit] = useState(visit);
    const [vitals, setVitals] = useState<Vital>(visit.vitals || { temperature: '', pulse: '', bloodPressure: '' });
    const [prescriptions, setPrescriptions] = useState<Omit<Prescription, 'prescriptionId'>[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);

    useEffect(() => {
        getMedicineInventory().then(setMedicines);
    }, []);

    const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVitals({ ...vitals, [e.target.name]: e.target.value });
    };
    
    const handleVisitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCurrentVisit({ ...currentVisit, [e.target.name]: e.target.value });
    };

    const addPrescription = () => {
        if(user && ('staffId' in user)) {
            setPrescriptions([...prescriptions, { visitId: visit.visitId, studentId: student.studentId, medicineId: 0, dosage: '', duration: '', doctorId: user.staffId, dateIssued: new Date().toISOString().split('T')[0] }]);
        }
    };
    
    const handlePrescriptionChange = (index: number, field: string, value: string | number) => {
        const newPrescriptions = [...prescriptions];
        (newPrescriptions[index] as any)[field] = value;
        setPrescriptions(newPrescriptions);
    };

    const handleSaveAndClose = async () => {
        const finalVisit = { ...currentVisit, vitals, visitStatus: VisitStatus.Closed };
        onSave(finalVisit, prescriptions);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Patient Visit: {student.name} ({student.rollNumber})</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><Thermometer size={20} />Vitals</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <input name="temperature" value={vitals.temperature} onChange={handleVitalChange} placeholder="Temperature (°F)" className="border-gray-300 rounded-md"/>
                <input name="pulse" value={vitals.pulse} onChange={handleVitalChange} placeholder="Pulse (BPM)" className="border-gray-300 rounded-md"/>
                <input name="bloodPressure" value={vitals.bloodPressure} onChange={handleVitalChange} placeholder="Blood Pressure" className="border-gray-300 rounded-md"/>
              </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><Activity size={20} />Diagnosis & Treatment</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <textarea name="symptoms" value={currentVisit.symptoms} readOnly className="w-full border-gray-300 rounded-md bg-gray-200" rows={2} placeholder="Symptoms (from appointment)"/>
                    <textarea name="diagnosis" value={currentVisit.diagnosis} onChange={handleVisitChange} className="w-full border-gray-300 rounded-md" rows={3} placeholder="Diagnosis"/>
                    <textarea name="treatmentProvided" value={currentVisit.treatmentProvided} onChange={handleVisitChange} className="w-full border-gray-300 rounded-md" rows={3} placeholder="Treatment Provided"/>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
                        <input type="date" name="followupDate" value={currentVisit.followupDate?.split('T')[0] || ''} onChange={handleVisitChange} className="w-full md:w-1/2 border-gray-300 rounded-md" />
                    </div>
                </div>
            </div>
            
            <div>
                 <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><Pill size={20} />Prescriptions</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    {prescriptions.map((p, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <select value={p.medicineId} onChange={(e) => handlePrescriptionChange(index, 'medicineId', parseInt(e.target.value))} className="border-gray-300 rounded-md">
                                <option>Select Medicine</option>
                                {medicines.map(m => <option key={m.medicineId} value={m.medicineId}>{m.medicineName}</option>)}
                            </select>
                            <input value={p.dosage} onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)} placeholder="Dosage (e.g., 1 tablet twice a day)" className="border-gray-300 rounded-md"/>
                            <input value={p.duration} onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)} placeholder="Duration (e.g., 5 days)" className="border-gray-300 rounded-md"/>
                        </div>
                    ))}
                    <button onClick={addPrescription} className="text-sm text-brand-primary hover:underline">+ Add Prescription</button>
                </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="button" onClick={handleSaveAndClose} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark">Save & Close Visit</button>
          </div>
        </div>
      </div>
    );
};

const PatientQueue: React.FC = () => {
    const { user } = useContext(UserContext);
    const [queue, setQueue] = useState<(Appointment & { student: Student })[]>([]);
    // FIX: Modified state to include appointmentId to correctly update appointment status later.
    const [activeVisit, setActiveVisit] = useState<{visit: PatientVisit, student: Student, appointmentId: string} | null>(null);

    const fetchQueue = async () => {
        const appointments = await getAppointments();
        const students = await getStudents();
        const today = new Date().toISOString().split('T')[0];
        
        const todaysQueue = appointments
            .filter(a => a.appointmentDate === today && a.status === AppointmentStatus.Confirmed)
            .map(a => ({
                ...a,
                student: students.find(s => s.studentId === a.studentId)!
            }))
            .filter(a => a.student)
            .sort((a,b) => a.appointmentTime.localeCompare(b.appointmentTime));
        setQueue(todaysQueue);
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);
    
    const handleCheckIn = async (appointment: Appointment & {student: Student}) => {
        if(user && 'staffId' in user) {
            const newVisit = await createPatientVisit({
                studentId: appointment.studentId,
                symptoms: appointment.symptoms,
                doctorId: user.staffId // Assuming current staff is the doctor
            });
            // FIX: Storing appointment.id to correctly update its status upon visit completion.
            setActiveVisit({visit: newVisit, student: appointment.student, appointmentId: appointment.id!});
        }
    };
    
    const handleSaveVisit = async (visit: PatientVisit, prescriptions: Omit<Prescription, 'prescriptionId'>[]) => {
        // Here you would save the visit details and prescriptions to the backend.
        // For now, we just close the modal and refresh the queue.
        console.log("Saving visit", visit);
        console.log("Saving prescriptions", prescriptions);

        // Simulate creating prescriptions
        for(const p of prescriptions) {
            await apiCreatePrescription(p);
        }

        // FIX: Passing the correct appointment document ID (string) instead of studentId (number).
        await updateAppointmentStatus(activeVisit!.appointmentId, AppointmentStatus.Completed);

        const student = (await getStudents()).find(s => s.studentId === visit.studentId);
        if (student) {
            await generateVisitSummaryPDF(visit, student);
        }
        
        for (const p of prescriptions) {
            if (student) {
                const fullP = { ...p, prescriptionId: Math.random()}; // mock id
                await generatePrescriptionPDF(fullP, student);
            }
        }

        setActiveVisit(null);
        fetchQueue();
        alert("Visit saved and summary/prescriptions are ready for download.");
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Today's Patient Queue</h1>

            {activeVisit && <PatientVisitModal visit={activeVisit.visit} student={activeVisit.student} onSave={handleSaveVisit} onClose={() => setActiveVisit(null)} />}

            <div className="bg-white rounded-xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Time</th>
                                <th scope="col" className="px-6 py-3">Student Name</th>
                                <th scope="col" className="px-6 py-3">Roll Number</th>
                                <th scope="col" className="px-6 py-3">Symptoms</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queue.map(item => (
                                <tr key={item.appointmentId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2"><Clock size={16}/> {item.appointmentTime}</td>
                                    <td className="px-6 py-4 flex items-center gap-2"><User size={16}/> {item.student.name}</td>
                                    <td className="px-6 py-4">{item.student.rollNumber}</td>
                                    <td className="px-6 py-4 truncate max-w-sm">{item.symptoms}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleCheckIn(item)} className="flex items-center gap-2 text-sm text-white bg-brand-green hover:bg-green-600 px-3 py-1 rounded-md">
                                            <LogIn size={16}/> Check In
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {queue.length === 0 && <p className="text-center py-4 text-brand-text">No confirmed appointments for today.</p>}
                </div>
            </div>
        </div>
    );
};

export default PatientQueue;