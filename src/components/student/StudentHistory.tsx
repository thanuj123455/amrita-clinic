

import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';
import { PatientVisit, Prescription, Staff, MedicineInventory } from '../../types';
import { getPatientVisitsForStudent, getPrescriptionsForStudent, getStaff, getMedicineInventory } from '../../services/api';
import { FileText, Pill, Stethoscope, User, Calendar, Thermometer } from 'lucide-react';

export const StudentHistory: React.FC = () => {
    const { user } = useContext(UserContext);
    const [visits, setVisits] = useState<PatientVisit[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [medicines, setMedicines] = useState<MedicineInventory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user && 'studentId' in user) {
                setLoading(true);
                const [visitData, prescriptionData, staffData, medicineData] = await Promise.all([
                    getPatientVisitsForStudent(user.studentId),
                    getPrescriptionsForStudent(user.studentId),
                    getStaff(),
                    getMedicineInventory()
                ]);
                setVisits(visitData.sort((a, b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime()));
                setPrescriptions(prescriptionData);
                setStaff(staffData);
                setMedicines(medicineData);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const getDoctorName = (doctorId: number) => staff.find(s => s.staffId === doctorId)?.name || 'Unknown Doctor';
    const getMedicineName = (medicineId: number) => medicines.find(m => m.medicineId === medicineId)?.medicineName || 'Unknown Medicine';

    if (loading) {
        return <div className="text-center p-8">Loading medical history...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Medical History</h1>

            {visits.length === 0 ? (
                 <div className="bg-white rounded-xl shadow p-6 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">No History Found</h2>
                    <p className="text-brand-text mt-2">You have no past visit records at the clinic.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {visits.map(visit => {
                        const visitPrescriptions = prescriptions.filter(p => p.visitId === visit.visitId);
                        return (
                            <div key={visit.visitId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6 bg-brand-primary-light border-b-2 border-brand-primary">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-brand-primary-dark flex items-center gap-2">
                                            <Calendar size={20} />
                                            Visit on {new Date(visit.checkinTime).toLocaleDateString()}
                                        </h2>
                                        <p className="text-sm font-medium text-brand-text flex items-center gap-2">
                                            <User size={16} /> Dr. {getDoctorName(visit.doctorId)}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Stethoscope size={18} /> Diagnosis & Treatment</h3>
                                        <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-3">
                                            <p><strong className="text-brand-text">Symptoms:</strong> {visit.symptoms}</p>
                                            <p><strong className="text-brand-text">Diagnosis:</strong> {visit.diagnosis}</p>
                                            <p><strong className="text-brand-text">Treatment:</strong> {visit.treatmentProvided}</p>
                                            {visit.followupDate && <p><strong className="text-brand-text">Follow-up:</strong> {new Date(visit.followupDate).toLocaleDateString()}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Thermometer size={18} /> Vitals</h3>
                                        <ul className="list-disc list-inside p-4 bg-gray-50 rounded-lg text-sm space-y-1">
                                            <li><strong>Temperature:</strong> {visit.vitals.temperature} °F</li>
                                            <li><strong>Pulse:</strong> {visit.vitals.pulse} BPM</li>
                                            <li><strong>Blood Pressure:</strong> {visit.vitals.bloodPressure}</li>
                                        </ul>
                                    </div>
                                    <div className="md:col-span-2">
                                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Pill size={18} /> Prescriptions</h3>
                                        {visitPrescriptions.length > 0 ? (
                                            <div className="overflow-x-auto border rounded-lg">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="p-3 text-left font-medium text-gray-600">Medicine</th>
                                                            <th className="p-3 text-left font-medium text-gray-600">Dosage</th>
                                                            <th className="p-3 text-left font-medium text-gray-600">Duration</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {visitPrescriptions.map(p => (
                                                            <tr key={p.prescriptionId} className="border-t">
                                                                <td className="p-3">{getMedicineName(p.medicineId)}</td>
                                                                <td className="p-3">{p.dosage}</td>
                                                                <td className="p-3">{p.duration}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="p-4 bg-gray-50 rounded-lg text-sm text-brand-text">No prescriptions were issued for this visit.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
