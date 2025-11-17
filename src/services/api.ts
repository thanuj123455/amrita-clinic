import {
  Student, Staff, Appointment, SickLeaveRequest, SymptomCheck, MedicineRequest, PatientVisit,
  Prescription, Bed, MedicineInventory, StaffSchedule, Notification, Broadcast,
  Role, AppointmentStatus, SickLeaveStatus, MedicineRequestStatus, VisitStatus,
// FIX: Added DoctorAvailability to the import list to resolve multiple 'Cannot find name' errors.
  BedStatus, AvailabilityStatus, DoctorAvailability
} from '../types';
import jsPDF from 'jspdf';
import { db } from './firebase';
import { collection, getDocs, query, where, addDoc, doc, updateDoc, getDoc, deleteDoc, Timestamp, writeBatch } from 'firebase/firestore';

// --- HELPER FUNCTIONS ---
const docWithId = <T>(docSnap: any): T => ({ ...docSnap.data(), id: docSnap.id } as T);
const docsWithIds = <T>(querySnapshot: any): T[] => querySnapshot.docs.map((doc: any) => docWithId<T>(doc));

const findDocByField = async <T>(collectionName: string, fieldName: string, value: any): Promise<(T & { id: string }) | null> => {
    const q = query(collection(db, collectionName), where(fieldName, "==", value));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return docWithId<T & { id: string }>(querySnapshot.docs[0]);
};


export const SYMPTOM_OPTIONS = ['Fever', 'Cough', 'Headache', 'Sore Throat', 'Body Aches', 'Shortness of Breath', 'Nausea', 'Chest Pain', 'Dizziness'];

// --- API IMPLEMENTATION ---

// Student related
export const getStudentById = async (id: number): Promise<Student | null> => findDocByField<Student>('students', 'studentId', id);
export const getStudents = async (): Promise<Student[]> => docsWithIds<Student>(await getDocs(collection(db, "students")));

export const getAppointmentsForStudent = async (studentId: number): Promise<Appointment[]> => {
    const q = query(collection(db, "appointments"), where("studentId", "==", studentId));
    return docsWithIds<Appointment>(await getDocs(q));
};

export const getSickLeaveRequestsForStudent = async (studentId: number): Promise<SickLeaveRequest[]> => {
    const q = query(collection(db, "sickLeaveRequests"), where("studentId", "==", studentId));
    return docsWithIds<SickLeaveRequest>(await getDocs(q));
};
export const getMedicineRequestsForStudent = async (studentId: number): Promise<MedicineRequest[]> => {
    const q = query(collection(db, "medicineRequests"), where("studentId", "==", studentId));
    return docsWithIds<MedicineRequest>(await getDocs(q));
};
export const getPatientVisitsForStudent = async (studentId: number): Promise<PatientVisit[]> => {
    const q = query(collection(db, "patientVisits"), where("studentId", "==", studentId));
    return docsWithIds<PatientVisit>(await getDocs(q));
};
export const getPrescriptionsForStudent = async (studentId: number): Promise<Prescription[]> => {
    const q = query(collection(db, "prescriptions"), where("studentId", "==", studentId));
    return docsWithIds<Prescription>(await getDocs(q));
};

// Staff related
export const getStaffById = async (id: number): Promise<Staff | null> => findDocByField<Staff>('staff', 'staffId', id);
export const getStaff = async (): Promise<Staff[]> => docsWithIds<Staff>(await getDocs(collection(db, "staff")));
export const getAppointments = async (): Promise<Appointment[]> => docsWithIds<Appointment>(await getDocs(collection(db, "appointments")));
export const getBeds = async (): Promise<Bed[]> => docsWithIds<Bed>(await getDocs(collection(db, "beds")));
export const getPatientVisits = async (): Promise<PatientVisit[]> => docsWithIds<PatientVisit>(await getDocs(collection(db, "patientVisits")));
export const getDoctorAvailabilities = async (doctorId: number): Promise<DoctorAvailability[]> => {
    const q = query(collection(db, "doctorAvailabilities"), where("doctorId", "==", doctorId));
    return docsWithIds<DoctorAvailability>(await getDocs(q));
};

// Admin related
export const getMedicineInventory = async (): Promise<MedicineInventory[]> => docsWithIds<MedicineInventory>(await getDocs(collection(db, "medicineInventory")));
export const getStaffSchedules = async (): Promise<StaffSchedule[]> => docsWithIds<StaffSchedule>(await getDocs(collection(db, "staffSchedules")));
export const getBroadcasts = async (): Promise<Broadcast[]> => docsWithIds<Broadcast>(await getDocs(collection(db, "broadcasts")));

// General
export const getNotificationsForUser = async (id: number, role: Role): Promise<Notification[]> => {
    const q = query(collection(db, "notifications"), where("recipientType", "in", ['All', role, id]));
    return docsWithIds<Notification>(await getDocs(q));
};

// --- Mutations ---
export const bookAppointment = async (studentId: number, details: Omit<Appointment, 'appointmentId' | 'studentId' | 'createdTime' | 'status'>): Promise<{ appointment?: Appointment & {id: string}, error?: string }> => {
    const q = query(collection(db, "appointments"), 
        where("doctorId", "==", details.doctorId),
        where("appointmentDate", "==", details.appointmentDate),
        where("appointmentTime", "==", details.appointmentTime),
        where("status", "!=", AppointmentStatus.Cancelled)
    );
    const existingBooking = await getDocs(q);
    if (!existingBooking.empty) {
        return { error: 'This time slot is no longer available. Please select another time.' };
    }

    const newAppointmentData = {
        ...details,
        studentId,
        status: AppointmentStatus.Pending,
        createdTime: Timestamp.now(),
        appointmentId: Date.now() // Simple unique ID
    };
    const docRef = await addDoc(collection(db, "appointments"), newAppointmentData);
    return { appointment: { ...newAppointmentData, id: docRef.id } };
};

export const getAvailableTimeSlots = async (doctorId: number, date: string): Promise<string[]> => {
    const availQuery = query(collection(db, "doctorAvailabilities"),
        where("doctorId", "==", doctorId),
        where("date", "==", date),
        where("status", "==", AvailabilityStatus.Available)
    );
    const bookingsQuery = query(collection(db, "appointments"),
        where("doctorId", "==", doctorId),
        where("appointmentDate", "==", date),
        where("status", "!=", AppointmentStatus.Cancelled)
    );

    const [availSnapshot, bookingsSnapshot] = await Promise.all([getDocs(availQuery), getDocs(bookingsQuery)]);
    
    const availabilities = docsWithIds<DoctorAvailability>(availSnapshot);
    const bookings = docsWithIds<Appointment>(bookingsSnapshot);
    const bookedTimes = new Set(bookings.map(b => b.appointmentTime));

    const slots: string[] = [];
    const slotDuration = 30; // 30 minutes

    availabilities.forEach(avail => {
        let current = new Date(`${date}T${avail.startTime}:00`);
        const end = new Date(`${date}T${avail.endTime}:00`);
        
        while(current < end) {
            const timeString = current.toTimeString().substring(0, 5);
            if(!bookedTimes.has(timeString)) {
                slots.push(timeString);
            }
            current.setMinutes(current.getMinutes() + slotDuration);
        }
    });
    return slots;
};

export const cancelAppointment = async (docId: string): Promise<void> => {
    const appDocRef = doc(db, "appointments", docId);
    await updateDoc(appDocRef, { status: AppointmentStatus.Cancelled });
};

export const requestSickLeave = async (studentId: number, details: Omit<SickLeaveRequest, 'leaveId' | 'studentId' | 'doctorRemarks' | 'status'>): Promise<void> => {
    await addDoc(collection(db, "sickLeaveRequests"), {
        ...details,
        studentId,
        status: SickLeaveStatus.Submitted,
        doctorRemarks: '',
        leaveId: Date.now(),
    });
};

export const addSymptomCheck = async (details: Omit<SymptomCheck, 'checkId'>): Promise<void> => {
    await addDoc(collection(db, "symptomChecks"), { ...details, checkId: Date.now() });
};

export const requestMedicine = async (studentId: number, details: Omit<MedicineRequest, 'requestId' | 'studentId' | 'status' | 'issuedDate'>): Promise<void> => {
    await addDoc(collection(db, "medicineRequests"), {
        ...details,
        studentId,
        status: MedicineRequestStatus.Requested,
        requestId: Date.now(),
    });
};

export const createPatientVisit = async (details: Pick<PatientVisit, 'studentId' | 'symptoms' | 'doctorId'>): Promise<PatientVisit & {id: string}> => {
    const newVisit = {
        ...details,
        checkinTime: Timestamp.now(),
        vitals: { temperature: '', pulse: '', bloodPressure: '' },
        diagnosis: '',
        treatmentProvided: '',
        visitStatus: VisitStatus.Open,
        visitId: Date.now(),
    };
    const docRef = await addDoc(collection(db, "patientVisits"), newVisit);
    return { ...newVisit, id: docRef.id };
};

export const updateAppointmentStatus = async (docId: string, status: AppointmentStatus): Promise<void> => {
    await updateDoc(doc(db, "appointments", docId), { status });
};

export const updateBed = async (docId: string, data: Partial<Bed>): Promise<void> => {
    await updateDoc(doc(db, "beds", docId), data);
};

export const addMedicineToInventory = async (item: Omit<MedicineInventory, 'medicineId'>): Promise<void> => {
    await addDoc(collection(db, "medicineInventory"), { ...item, medicineId: Date.now() });
};

export const updateMedicineInInventory = async (docId: string, data: Partial<MedicineInventory>): Promise<void> => {
    await updateDoc(doc(db, "medicineInventory", docId), data);
};

export const addStaffSchedule = async (schedule: Omit<StaffSchedule, 'scheduleId'>): Promise<void> => {
    await addDoc(collection(db, "staffSchedules"), { ...schedule, scheduleId: Date.now() });
};

export const addBroadcast = async (broadcast: Omit<Broadcast, 'broadcastId' | 'postDate'>): Promise<void> => {
    await addDoc(collection(db, "broadcasts"), { ...broadcast, postDate: Timestamp.now(), broadcastId: Date.now() });
};

export const createPrescription = async (prescription: Omit<Prescription, 'prescriptionId'>): Promise<void> => {
    await addDoc(collection(db, "prescriptions"), { ...prescription, prescriptionId: Date.now(), dateIssued: Timestamp.now() });
};

export const addDoctorAvailability = async (availability: Omit<DoctorAvailability, 'availabilityId'>): Promise<void> => {
    await addDoc(collection(db, "doctorAvailabilities"), { ...availability, availabilityId: Date.now() });
};

export const updateDoctorAvailability = async (docId: string, data: Partial<DoctorAvailability>): Promise<void> => {
    await updateDoc(doc(db, "doctorAvailabilities", docId), data);
};

export const deleteDoctorAvailability = async (docId: string): Promise<void> => {
    await deleteDoc(doc(db, "doctorAvailabilities", docId));
};

// PDF Generation
export const generateLeaveCertificatePDF = async (request: SickLeaveRequest, student: Student) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Amrita Clinical Care - Medical Certificate", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 30);
    doc.line(20, 35, 190, 35);
    
    doc.text(`This is to certify that ${student.name} (Roll No: ${student.rollNumber}) was examined at the clinic.`, 20, 50);
    doc.text(`He/She was suffering from: ${request.reason}.`, 20, 60);
    doc.text(`He/She has been advised to take rest from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}.`, 20, 70);
    doc.text(`Doctor's Remarks: ${request.doctorRemarks}`, 20, 80);
    
    doc.text("Clinic Seal & Doctor's Signature", 120, 120);
    doc.save(`leave_certificate_${student.rollNumber}.pdf`);
};

export const generateVisitSummaryPDF = async (visit: PatientVisit, student: Student) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Visit Summary", 20, 20);
    doc.setFontSize(12);
    doc.text(`Patient: ${student.name}`, 20, 40);
    doc.text(`Visit Date: ${new Date(visit.checkinTime).toLocaleString()}`, 20, 50);
    doc.line(20, 55, 190, 55);
    
    doc.text(`Symptoms: ${visit.symptoms}`, 20, 65);
    doc.text(`Vitals: T:${visit.vitals.temperature}, P:${visit.vitals.pulse}, BP:${visit.vitals.bloodPressure}`, 20, 75);
    doc.text(`Diagnosis: ${visit.diagnosis}`, 20, 85);
    doc.text(`Treatment: ${visit.treatmentProvided}`, 20, 95);
    
    doc.save(`visit_summary_${visit.visitId}.pdf`);
};

export const generatePrescriptionPDF = async (prescription: Prescription, student: Student) => {
    const doc = new jsPDF();
    const medDoc = await findDocByField<MedicineInventory>('medicineInventory', 'medicineId', prescription.medicineId);
    const medicineName = medDoc?.medicineName || 'N/A';
    doc.setFontSize(22);
    doc.text("Prescription", 20, 20);
    doc.setFontSize(12);
    doc.text(`Patient: ${student.name}`, 20, 40);
    doc.text(`Date: ${new Date(prescription.dateIssued).toLocaleDateString()}`, 150, 40);
    doc.line(20, 45, 190, 45);

    doc.setFontSize(16);
    doc.text("Rx", 20, 60);
    doc.setFontSize(12);
    doc.text(`Medicine: ${medicineName}`, 30, 70);
    doc.text(`Dosage: ${prescription.dosage}`, 30, 80);
    doc.text(`Duration: ${prescription.duration}`, 30, 90);

    doc.save(`prescription_${prescription.prescriptionId}.pdf`);
};