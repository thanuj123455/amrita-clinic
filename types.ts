export enum Role {
  Student = 'Student',
  Doctor = 'Doctor',
  Nurse = 'Nurse',
  Admin = 'Admin',
}

export enum AppointmentStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum SickLeaveStatus {
  Submitted = 'Submitted',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum MedicineRequestStatus {
  Requested = 'Requested',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum VisitStatus {
  Open = 'Open',
  Closed = 'Closed',
}

export enum BedStatus {
  Available = 'Available',
  Occupied = 'Occupied',
  CleaningNeeded = 'Cleaning Needed',
}

export enum MedicineCategory {
  Tablet = 'Tablet',
  Syrup = 'Syrup',
  Injection = 'Injection',
  Other = 'Other',
}

export enum ShiftType {
  Morning = 'Morning',
  Evening = 'Evening',
  Night = 'Night',
}

export enum AvailabilityStatus {
  Available = 'Available',
  Unavailable = 'Unavailable',
  Busy = 'Busy',
}

export interface Student {
  studentId: number;
  name: string;
  rollNumber: string;
  department: string;
  phone: string;
  email: string;
  allergies: string;
  chronicConditions: string;
  vaccinationRecords: string;
}

export interface Staff {
  staffId: number;
  name: string;
  role: Role.Doctor | Role.Nurse;
  phone: string;
  email: string;
  shiftTimings: string;
}

export interface Appointment {
  appointmentId: number;
  studentId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  symptoms: string;
  status: AppointmentStatus;
  createdTime: string;
}

export interface SickLeaveRequest {
  leaveId: number;
  studentId: number;
  reason: string;
  startDate: string;
  endDate: string;
  doctorRemarks: string;
  status: SickLeaveStatus;
}

export interface SymptomCheck {
  checkId: number;
  studentId: number;
  symptomsSelected: string[];
  priorityLevel: 'Low' | 'Medium' | 'High';
  suggestedAction: string;
}

export interface MedicineRequest {
  requestId: number;
  studentId: number;
  medicineId: number;
  reason: string;
  status: MedicineRequestStatus;
  issuedDate?: string;
}

export interface Vital {
  temperature: string;
  pulse: string;
  bloodPressure: string;
}

export interface PatientVisit {
  visitId: number;
  studentId: number;
  checkinTime: string;
  symptoms: string;
  vitals: Vital;
  diagnosis: string;
  treatmentProvided: string;
  doctorId: number;
  followupDate?: string;
  visitStatus: VisitStatus;
}

export interface Prescription {
  prescriptionId: number;
  visitId: number;
  studentId: number;
  medicineId: number;
  dosage: string;
  duration: string;
  doctorId: number;
  dateIssued: string;
}

export interface Bed {
  bedId: number;
  bedNumber: number;
  assignedStudentId?: number;
  checkinTime?: string;
  checkoutTime?: string;
  reason?: string;
  nurseNotes?: string;
  status: BedStatus;
}

export interface MedicineInventory {
  medicineId: number;
  medicineName: string;
  quantity: number;
  expiryDate: string;
  category: MedicineCategory;
  threshold: number;
}

export interface StaffSchedule {
  scheduleId: number;
  staffId: number;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: ShiftType;
}

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  recipientType: 'Student' | 'Staff' | 'All' | number; // number for specific student/staff ID
  sendTime: string;
  read: boolean;
}

export interface Broadcast {
  broadcastId: number;
  title: string;
  content: string;
  postDate: string;
}

export interface DoctorAvailability {
  availabilityId: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: AvailabilityStatus;
  notes?: string;
}