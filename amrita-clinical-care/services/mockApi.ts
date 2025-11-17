
import {
  Student, Staff, Appointment, SickLeaveRequest, SymptomCheck, MedicineRequest, PatientVisit,
  Prescription, Bed, MedicineInventory, StaffSchedule, Notification, Broadcast,
  Role, AppointmentStatus, SickLeaveStatus, MedicineRequestStatus, VisitStatus,
  BedStatus, MedicineCategory, ShiftType, DoctorAvailability, AvailabilityStatus
} from '../types';
import jsPDF from 'jspdf';

// --- MOCK DATABASE ---
let students: Student[] = [
  { studentId: 1, name: 'Ravi Kumar', rollNumber: 'CB.EN.U4CSE19001', department: 'Computer Science', phone: '9876543210', email: 'ravi@amrita.edu', allergies: 'Peanuts', chronicConditions: 'Asthma', vaccinationRecords: 'Fully vaccinated (COVID-19)' },
  { studentId: 2, name: 'Priya Sharma', rollNumber: 'CB.EN.U4ECE19002', department: 'Electronics', phone: '8765432109', email: 'priya@amrita.edu', allergies: 'None', chronicConditions: 'None', vaccinationRecords: 'Fully vaccinated (COVID-19)' },
  { studentId: 3, name: 'Arjun Verma', rollNumber: 'CB.EN.U4MECH19003', department: 'Mechanical', phone: '7654321098', email: 'arjun@amrita.edu', allergies: 'Dust', chronicConditions: 'None', vaccinationRecords: 'Fully vaccinated (COVID-19)' },
];

let staff: Staff[] = [
  { staffId: 1, name: 'Dr. Anita Desai', role: Role.Doctor, phone: '1234567890', email: 'anita.d@clinic.amrita.edu', shiftTimings: '9 AM - 5 PM' },
  { staffId: 2, name: 'Dr. Vikram Singh', role: Role.Doctor, phone: '2345678901', email: 'vikram.s@clinic.amrita.edu', shiftTimings: '1 PM - 9 PM' },
  { staffId: 3, name: 'Nurse Radha Menon', role: Role.Nurse, phone: '3456789012', email: 'radha.m@clinic.amrita.edu', shiftTimings: '8 AM - 4 PM' },
];

let appointments: Appointment[] = [
  { appointmentId: 1, studentId: 1, doctorId: 1, appointmentDate: '2024-10-25', appointmentTime: '10:00', symptoms: 'Fever and cough', status: AppointmentStatus.Completed, createdTime: '2024-10-23T09:00:00Z' },
  { appointmentId: 2, studentId: 2, doctorId: 1, appointmentDate: new Date().toISOString().split('T')[0], appointmentTime: '14:30', symptoms: 'Headache', status: AppointmentStatus.Confirmed, createdTime: '2024-10-24T11:00:00Z' },
];

let sickLeaveRequests: SickLeaveRequest[] = [
    { leaveId: 1, studentId: 1, reason: 'Viral Fever', startDate: '2024-10-25', endDate: '2024-10-26', doctorRemarks: 'Advised 2 days rest.', status: SickLeaveStatus.Approved }
];

let symptomChecks: SymptomCheck[] = [];

let medicineRequests: MedicineRequest[] = [
    { requestId: 1, studentId: 2, medicineId: 1, reason: 'Mild headache', status: MedicineRequestStatus.Approved, issuedDate: '2024-10-24' }
];

let patientVisits: PatientVisit[] = [
    { visitId: 1, studentId: 1, checkinTime: '2024-10-25T10:05:00Z', symptoms: 'Fever and cough', vitals: { temperature: '101.2', pulse: '88', bloodPressure: '120/80' }, diagnosis: 'Viral Infection', treatmentProvided: 'Prescribed Paracetamol and cough syrup. Advised rest.', doctorId: 1, visitStatus: VisitStatus.Closed, followupDate: '2024-10-28' }
];

let prescriptions: Prescription[] = [
    { prescriptionId: 1, visitId: 1, studentId: 1, medicineId: 1, dosage: '1 tablet thrice a day', duration: '3 days', doctorId: 1, dateIssued: '2024-10-25' }
];

let beds: Bed[] = [
  { bedId: 1, bedNumber: 1, status: BedStatus.Available },
  { bedId: 2, bedNumber: 2, status: BedStatus.Available },
  { bedId: 3, bedNumber: 3, status: BedStatus.Occupied, assignedStudentId: 3, checkinTime: new Date().toISOString(), reason: 'Observation for food poisoning', nurseNotes: 'Patient is stable.' },
  { bedId: 4, bedNumber: 4, status: BedStatus.Available },
  { bedId: 5, bedNumber: 5, status: BedStatus.CleaningNeeded },
];

let medicineInventory: MedicineInventory[] = [
  { medicineId: 1, medicineName: 'Paracetamol 500mg', quantity: 85, expiryDate: '2025-12-31', category: MedicineCategory.Tablet, threshold: 20 },
  { medicineId: 2, medicineName: 'Cough Syrup', quantity: 30, expiryDate: '2025-06-30', category: MedicineCategory.Syrup, threshold: 10 },
  { medicineId: 3, medicineName: 'Band-Aids', quantity: 150, expiryDate: '2026-01-31', category: MedicineCategory.Other, threshold: 50 },
];

let staffSchedules: StaffSchedule[] = [
    { scheduleId: 1, staffId: 1, date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '17:00', shiftType: ShiftType.Morning },
    { scheduleId: 2, staffId: 3, date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '16:00', shiftType: ShiftType.Morning },
];

let notifications: Notification[] = [
    { notificationId: 1, title: 'Appointment Confirmed', message: 'Your appointment for tomorrow at 2:30 PM is confirmed.', recipientType: 2, sendTime: new Date().toISOString(), read: false },
];

let broadcasts: Broadcast[] = [
    { broadcastId: 1, title: 'Annual Flu Vaccination Drive', content: 'Get your free flu shot at the clinic from Oct 15th to Oct 30th. Protect yourself and the community!', postDate: '2024-10-14T09:00:00Z' }
];

let doctorAvailabilities: DoctorAvailability[] = [
  // Dr. Anita Desai (staffId: 1)
  { availabilityId: 1, doctorId: 1, date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '13:00', status: AvailabilityStatus.Available, notes: 'Morning Clinic' },
  { availabilityId: 2, doctorId: 1, date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '17:00', status: AvailabilityStatus.Available, notes: 'Afternoon Clinic' },
  { availabilityId: 3, doctorId: 1, date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], startTime: '10:00', endTime: '13:00', status: AvailabilityStatus.Available },
  // Dr. Vikram Singh (staffId: 2)
  { availabilityId: 4, doctorId: 2, date: new Date().toISOString().split('T')[0], startTime: '13:00', endTime: '17:00', status: AvailabilityStatus.Available },
  { availabilityId: 5, doctorId: 2, date: new Date().toISOString().split('T')[0], startTime: '18:00', endTime: '21:00', status: AvailabilityStatus.Busy, notes: 'On-call duty' },
];


export const SYMPTOM_OPTIONS = ['Fever', 'Cough', 'Headache', 'Sore Throat', 'Body Aches', 'Shortness of Breath', 'Nausea', 'Chest Pain', 'Dizziness'];

// --- API SIMULATION ---
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Student related
export const getStudentById = async (id: number) => { await simulateDelay(200); return students.find(s => s.studentId === id) || null; };
export const getStudents = async () => { await simulateDelay(200); return [...students]; };
export const getAppointmentsForStudent = async (studentId: number) => { await simulateDelay(300); return appointments.filter(a => a.studentId === studentId); };
export const getSickLeaveRequestsForStudent = async (studentId: number) => { await simulateDelay(300); return sickLeaveRequests.filter(s => s.studentId === studentId); };
export const getMedicineRequestsForStudent = async (studentId: number) => { await simulateDelay(300); return medicineRequests.filter(m => m.studentId === studentId); };
export const getPatientVisitsForStudent = async (studentId: number) => { await simulateDelay(300); return patientVisits.filter(p => p.studentId === studentId); };
export const getPrescriptionsForStudent = async (studentId: number) => { await simulateDelay(300); return prescriptions.filter(p => p.studentId === studentId); };

// Staff related
export const getStaffById = async (id: number) => { await simulateDelay(200); return staff.find(s => s.staffId === id) || null; };
export const getStaff = async () => { await simulateDelay(200); return [...staff]; };
export const getAppointments = async () => { await simulateDelay(300); return [...appointments]; };
export const getBeds = async () => { await simulateDelay(300); return [...beds]; };
export const getPatientVisits = async () => { await simulateDelay(300); return [...patientVisits]; };
export const getDoctorAvailabilities = async (doctorId: number) => { await simulateDelay(300); return doctorAvailabilities.filter(a => a.doctorId === doctorId); };

// Admin related
export const getMedicineInventory = async () => { await simulateDelay(400); return [...medicineInventory]; };
export const getStaffSchedules = async () => { await simulateDelay(300); return [...staffSchedules]; };
export const getBroadcasts = async () => { await simulateDelay(200); return [...broadcasts]; };

// General
export const getNotificationsForUser = async (id: number, role: Role) => {
    await simulateDelay(100);
    const isStaff = role === Role.Doctor || role === Role.Nurse;
    return notifications.filter(n =>
        n.recipientType === 'All' ||
        n.recipientType === id ||
        n.recipientType === role.toString() ||
        (isStaff && n.recipientType === 'Staff')
    );
};

// Actions / Mutations
export const bookAppointment = async (studentId: number, details: Omit<Appointment, 'appointmentId' | 'studentId' | 'createdTime' | 'status'>): Promise<{ appointment?: Appointment, error?: string }> => {
    await simulateDelay(500);

    // Prevent double booking
    const isSlotTaken = appointments.some(a => a.doctorId === details.doctorId && a.appointmentDate === details.appointmentDate && a.appointmentTime === details.appointmentTime && a.status !== AppointmentStatus.Cancelled);
    if(isSlotTaken) {
        return { error: 'This time slot is no longer available. Please select another time.' };
    }
    
    // Check if within doctor's availability
    const slotStartTime = new Date(`${details.appointmentDate}T${details.appointmentTime}`).getTime();
    const isAvailable = doctorAvailabilities.some(avail => {
        const availStartTime = new Date(`${avail.date}T${avail.startTime}`).getTime();
        const availEndTime = new Date(`${avail.date}T${avail.endTime}`).getTime();
        return avail.doctorId === details.doctorId &&
               avail.date === details.appointmentDate &&
               avail.status === AvailabilityStatus.Available &&
               slotStartTime >= availStartTime &&
               slotStartTime < availEndTime;
    });

    if (!isAvailable) {
        return { error: 'The selected time is outside the doctor\'s available hours.' };
    }

    const newAppointment: Appointment = {
        appointmentId: appointments.length + 1,
        studentId,
        ...details,
        status: AppointmentStatus.Pending,
        createdTime: new Date().toISOString(),
    };
    appointments.push(newAppointment);

    // Workflow: Notify student & doctor
    notifications.push({ notificationId: notifications.length + 1, title: 'Appointment Submitted', message: `Your appointment for ${details.appointmentDate} at ${details.appointmentTime} is pending confirmation.`, recipientType: studentId, sendTime: new Date().toISOString(), read: false });
    notifications.push({ notificationId: notifications.length + 2, title: 'New Appointment Booked', message: `A new appointment was booked by student ID ${studentId} for ${details.appointmentDate} at ${details.appointmentTime}.`, recipientType: details.doctorId, sendTime: new Date().toISOString(), read: false });
    
    return { appointment: newAppointment };
};

export const getAvailableTimeSlots = async (doctorId: number, date: string): Promise<string[]> => {
    await simulateDelay(400);
    const availabilities = doctorAvailabilities.filter(a => a.doctorId === doctorId && a.date === date && a.status === AvailabilityStatus.Available);
    const bookings = appointments.filter(a => a.doctorId === doctorId && a.appointmentDate === date && a.status !== AppointmentStatus.Cancelled);

    const slots: string[] = [];
    const slotDuration = 30; // 30 minutes

    availabilities.forEach(avail => {
        let current = new Date(`${date}T${avail.startTime}:00`);
        const end = new Date(`${date}T${avail.endTime}:00`);
        
        while(current < end) {
            const timeString = current.toTimeString().substring(0, 5);
            const isBooked = bookings.some(b => b.appointmentTime === timeString);

            if(!isBooked) {
                slots.push(timeString);
            }
            
            current.setMinutes(current.getMinutes() + slotDuration);
        }
    });
    return slots;
};


export const cancelAppointment = async (appointmentId: number) => {
    await simulateDelay(300);
    const index = appointments.findIndex(a => a.appointmentId === appointmentId);
    if(index > -1) {
        appointments[index].status = AppointmentStatus.Cancelled;
        const studentId = appointments[index].studentId;
         notifications.push({ notificationId: notifications.length + 1, title: 'Appointment Cancelled', message: `Your appointment for ${appointments[index].appointmentDate} has been cancelled.`, recipientType: studentId, sendTime: new Date().toISOString(), read: false });
    }
};

export const requestSickLeave = async (studentId: number, details: Omit<SickLeaveRequest, 'leaveId' | 'studentId' | 'doctorRemarks' | 'status'>) => {
    await simulateDelay(500);
    const newRequest: SickLeaveRequest = {
        leaveId: sickLeaveRequests.length + 1,
        studentId,
        ...details,
        doctorRemarks: '',
        status: SickLeaveStatus.Submitted,
    };
    sickLeaveRequests.push(newRequest);
    return newRequest;
};

export const addSymptomCheck = async (details: Omit<SymptomCheck, 'checkId'>) => {
    await simulateDelay(100); 
    const newCheck: SymptomCheck = { checkId: symptomChecks.length + 1, ...details };
    symptomChecks.push(newCheck);
    return newCheck;
};

export const requestMedicine = async (studentId: number, details: Omit<MedicineRequest, 'requestId' | 'studentId' | 'status' | 'issuedDate'>) => {
    await simulateDelay(400);
    const newRequest: MedicineRequest = {
        requestId: medicineRequests.length + 1,
        studentId,
        ...details,
        status: MedicineRequestStatus.Requested,
    };
    medicineRequests.push(newRequest);
    notifications.push({ notificationId: notifications.length + 1, title: 'New OTC Request', message: `Student ID ${studentId} requested medicine.`, recipientType: 'Staff', sendTime: new Date().toISOString(), read: false });
    return newRequest;
};

export const createPatientVisit = async (details: Pick<PatientVisit, 'studentId' | 'symptoms' | 'doctorId'>) => {
    await simulateDelay(400);
    const newVisit: PatientVisit = {
        visitId: patientVisits.length + 1,
        checkinTime: new Date().toISOString(),
        vitals: { temperature: '', pulse: '', bloodPressure: '' },
        diagnosis: '',
        treatmentProvided: '',
        visitStatus: VisitStatus.Open,
        ...details,
    };
    patientVisits.push(newVisit);
    return newVisit;
};

export const updateAppointmentStatus = async (appointmentId: number, status: AppointmentStatus) => {
    await simulateDelay(200);
    const app = appointments.find(a => a.appointmentId === appointmentId);
    if (app) app.status = status;
};

export const updateBed = async (bedId: number, data: Partial<Bed>) => {
    await simulateDelay(300);
    const index = beds.findIndex(b => b.bedId === bedId);
    if (index !== -1) {
        beds[index] = { ...beds[index], ...data };
    }
};

export const addMedicineToInventory = async (item: Omit<MedicineInventory, 'medicineId'>) => {
    await simulateDelay(400);
    const newItem: MedicineInventory = { medicineId: medicineInventory.length + 1, ...item };
    medicineInventory.push(newItem);
    return newItem;
};

export const updateMedicineInInventory = async (medicineId: number, data: Partial<MedicineInventory>) => {
    await simulateDelay(300);
    const index = medicineInventory.findIndex(m => m.medicineId === medicineId);
    if (index !== -1) {
        medicineInventory[index] = { ...medicineInventory[index], ...data };
    }
};

export const addStaffSchedule = async (schedule: Omit<StaffSchedule, 'scheduleId'>) => {
    await simulateDelay(400);
    const newSchedule: StaffSchedule = { scheduleId: staffSchedules.length + 1, ...schedule };
    staffSchedules.push(newSchedule);
    return newSchedule;
};

export const addBroadcast = async (broadcast: Omit<Broadcast, 'broadcastId' | 'postDate'>) => {
    await simulateDelay(400);
    const newBroadcast: Broadcast = { broadcastId: broadcasts.length + 1, postDate: new Date().toISOString(), ...broadcast };
    broadcasts.push(newBroadcast);
    notifications.push({ notificationId: notifications.length + 1, title: `Announcement: ${broadcast.title}`, message: broadcast.content.substring(0, 50) + '...', recipientType: 'All', sendTime: new Date().toISOString(), read: false });
    return newBroadcast;
};

export const createPrescription = async (prescription: Omit<Prescription, 'prescriptionId'>) => {
    await simulateDelay(200);
    const newPrescription: Prescription = { prescriptionId: prescriptions.length + 1, ...prescription };
    prescriptions.push(newPrescription);
    const medIndex = medicineInventory.findIndex(m => m.medicineId === prescription.medicineId);
    if (medIndex !== -1) {
        medicineInventory[medIndex].quantity -= 1; 
        if (medicineInventory[medIndex].quantity < medicineInventory[medIndex].threshold) {
             notifications.push({ notificationId: notifications.length + 1, title: 'Low Stock Alert', message: `${medicineInventory[medIndex].medicineName} is running low.`, recipientType: 1, sendTime: new Date().toISOString(), read: false });
        }
    }
    return newPrescription;
};

export const addDoctorAvailability = async (availability: Omit<DoctorAvailability, 'availabilityId'>) => {
    await simulateDelay(400);
    const newAvailability: DoctorAvailability = { availabilityId: doctorAvailabilities.length + 1, ...availability };
    doctorAvailabilities.push(newAvailability);
    return newAvailability;
};

export const updateDoctorAvailability = async (availabilityId: number, data: Partial<DoctorAvailability>) => {
    await simulateDelay(300);
    const index = doctorAvailabilities.findIndex(a => a.availabilityId === availabilityId);
    if (index !== -1) {
        const oldSlot = { ...doctorAvailabilities[index] };
        doctorAvailabilities[index] = { ...doctorAvailabilities[index], ...data };
        const newSlot = doctorAvailabilities[index];

        // Workflow: If a slot is made unavailable, notify students with appointments in that slot.
        if (oldSlot.status === AvailabilityStatus.Available && newSlot.status !== AvailabilityStatus.Available) {
            const affectedAppointments = appointments.filter(app => {
                const appTime = new Date(`${app.appointmentDate}T${app.appointmentTime}`).getTime();
                const slotStartTime = new Date(`${newSlot.date}T${newSlot.startTime}`).getTime();
                const slotEndTime = new Date(`${newSlot.date}T${newSlot.endTime}`).getTime();
                return app.doctorId === newSlot.doctorId &&
                       app.appointmentDate === newSlot.date &&
                       app.status === AppointmentStatus.Confirmed &&
                       appTime >= slotStartTime &&
                       appTime < slotEndTime;
            });

            affectedAppointments.forEach(app => {
                notifications.push({
                    notificationId: notifications.length + 1,
                    title: 'Appointment Reschedule Required',
                    message: `Dr. ${staff.find(s => s.staffId === newSlot.doctorId)?.name}'s availability has changed. Please reschedule your appointment for ${app.appointmentDate} at ${app.appointmentTime}.`,
                    recipientType: app.studentId,
                    sendTime: new Date().toISOString(),
                    read: false
                });
                // Optionally, auto-cancel the appointment
                // app.status = AppointmentStatus.Cancelled;
            });
        }
    }
};

export const deleteDoctorAvailability = async (availabilityId: number) => {
    await simulateDelay(300);
    doctorAvailabilities = doctorAvailabilities.filter(a => a.availabilityId !== availabilityId);
    // Note: In a real app, you'd check for conflicts before deleting.
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
    const medicine = await medicineInventory.find(m => m.medicineId === prescription.medicineId);
    doc.setFontSize(22);
    doc.text("Prescription", 20, 20);
    doc.setFontSize(12);
    doc.text(`Patient: ${student.name}`, 20, 40);
    doc.text(`Date: ${new Date(prescription.dateIssued).toLocaleDateString()}`, 150, 40);
    doc.line(20, 45, 190, 45);

    doc.setFontSize(16);
    doc.text("Rx", 20, 60);
    doc.setFontSize(12);
    doc.text(`Medicine: ${medicine?.medicineName || 'N/A'}`, 30, 70);
    doc.text(`Dosage: ${prescription.dosage}`, 30, 80);
    doc.text(`Duration: ${prescription.duration}`, 30, 90);

    doc.save(`prescription_${prescription.prescriptionId}.pdf`);
};
