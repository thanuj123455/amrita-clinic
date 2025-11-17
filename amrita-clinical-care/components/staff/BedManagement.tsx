
import React, { useEffect, useState } from 'react';
import { Bed as BedType, BedStatus, Student } from '../../types';
import { getBeds, getStudents, updateBed } from '../../services/mockApi';
import { BedDouble, User, Check, X, Clock } from 'lucide-react';

const BedCard: React.FC<{ bed: BedType; student?: Student; onUpdate: (bed: BedType) => void }> = ({ bed, student, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(bed.nurseNotes || '');

    const handleCheckout = () => {
        const updatedBed = {
            ...bed,
            status: BedStatus.CleaningNeeded,
            checkoutTime: new Date().toISOString(),
            nurseNotes: notes,
        };
        onUpdate(updatedBed);
        setIsEditing(false);
    };

    const handleCleaned = () => {
        const updatedBed = {
            ...bed,
            status: BedStatus.Available,
            assignedStudentId: undefined,
            checkinTime: undefined,
            checkoutTime: undefined,
            reason: undefined,
            nurseNotes: undefined,
        };
        onUpdate(updatedBed);
    };

    const cardStyles = {
        [BedStatus.Available]: 'bg-green-100 border-green-500',
        [BedStatus.Occupied]: 'bg-red-100 border-red-500',
        [BedStatus.CleaningNeeded]: 'bg-yellow-100 border-yellow-500',
    };
    
    const textStyles = {
        [BedStatus.Available]: 'text-green-800',
        [BedStatus.Occupied]: 'text-red-800',
        [BedStatus.CleaningNeeded]: 'text-yellow-800',
    };

    return (
        <div className={`rounded-xl shadow-md p-6 border-l-4 ${cardStyles[bed.status]}`}>
            <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${textStyles[bed.status]}`}>
                    <BedDouble /> Bed {bed.bedNumber}
                </h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${cardStyles[bed.status].replace('border-', 'bg-').replace('-100', '-200')} ${textStyles[bed.status]}`}>
                    {bed.status}
                </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
                {bed.status === BedStatus.Occupied && student && (
                    <>
                        <p className="flex items-center gap-2"><User /> <strong>Patient:</strong> {student.name}</p>
                        <p className="flex items-center gap-2"><Clock /> <strong>Checked-in:</strong> {new Date(bed.checkinTime!).toLocaleString()}</p>
                        <p><strong>Reason:</strong> {bed.reason}</p>
                        <div>
                            <label className="font-semibold">Nurse Notes:</label>
                            {isEditing ? (
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full mt-1 border-gray-300 rounded-md"
                                    rows={2}
                                />
                            ) : (
                                <p className="p-2 bg-white rounded">{notes || 'No notes yet.'}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                    <button onClick={handleCheckout} className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">Confirm Checkout</button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="text-sm px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600">Update Notes / Checkout</button>
                            )}
                        </div>
                    </>
                )}
                {bed.status === BedStatus.CleaningNeeded && (
                    <div className="text-center py-4">
                        <button onClick={handleCleaned} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 mx-auto">
                            <Check /> Mark as Clean & Available
                        </button>
                    </div>
                )}
                 {bed.status === BedStatus.Available && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">This bed is ready for a new patient.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const BedManagement: React.FC = () => {
    const [beds, setBeds] = useState<BedType[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const fetchData = async () => {
        const bedData = await getBeds();
        const studentData = await getStudents();
        setBeds(bedData.sort((a,b) => a.bedNumber - b.bedNumber));
        setStudents(studentData);
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleUpdateBed = async (bed: BedType) => {
        await updateBed(bed.bedId, bed);
        fetchData();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Bed Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {beds.map(bed => (
                    <BedCard 
                        key={bed.bedId} 
                        bed={bed} 
                        student={students.find(s => s.studentId === bed.assignedStudentId)}
                        onUpdate={handleUpdateBed}
                    />
                ))}
            </div>
        </div>
    );
};

export default BedManagement;
