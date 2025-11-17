import { mysqlTable, mysqlEnum, int, varchar, text, timestamp, primaryKey, boolean, json, uniqueIndex, unique } from 'drizzle-orm/mysql-core';

export const roles = mysqlEnum('roles', ['Student', 'Doctor', 'Nurse', 'Admin']);
export const appointmentStatus = mysqlEnum('appointmentStatus', ['Pending', 'Confirmed', 'Completed', 'Cancelled']);
export const sickLeaveStatus = mysqlEnum('sickLeaveStatus', ['Submitted', 'Approved', 'Rejected']);
export const medicineRequestStatus = mysqlEnum('medicineRequestStatus', ['Requested', 'Approved', 'Rejected']);
export const visitStatus = mysqlEnum('visitStatus', ['Open', 'Closed']);
export const bedStatus = mysqlEnum('bedStatus', ['Available', 'Occupied', 'Cleaning Needed']);
export const medicineCategory = mysqlEnum('medicineCategory', ['Tablet', 'Syrup', 'Injection', 'Other']);
export const shiftType = mysqlEnum('shiftType', ['Morning', 'Evening', 'Night']);
export const availabilityStatus = mysqlEnum('availabilityStatus', ['Available', 'Unavailable', 'Busy']);
export const priorityLevel = mysqlEnum('priorityLevel', ['Low', 'Medium', 'High']);


export const students = mysqlTable('students', {
  studentId: int('studentId').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  rollNumber: varchar('rollNumber', { length: 255 }).notNull().unique(),
  department: varchar('department', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  allergies: text('allergies'),
  chronicConditions: text('chronicConditions'),
  vaccinationRecords: text('vaccinationRecords'),
});

export const staff = mysqlTable('staff', {
  staffId: int('staffId').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roles.notNull(),
  phone: varchar('phone', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  shiftTimings: varchar('shiftTimings', { length: 255 }).notNull(),
});

export const appointments = mysqlTable('appointments', {
    appointmentId: int('appointmentId').autoincrement().primaryKey(),
    studentId: int('studentId').notNull(),
    doctorId: int('doctorId').notNull(),
    appointmentDate: varchar('appointmentDate', { length: 255 }).notNull(),
    appointmentTime: varchar('appointmentTime', { length: 255 }).notNull(),
    symptoms: text('symptoms').notNull(),
    status: appointmentStatus.notNull(),
    createdTime: timestamp('createdTime').notNull().defaultNow(),
});

export const sickLeaveRequests = mysqlTable('sick_leave_requests', {
    leaveId: int('leaveId').autoincrement().primaryKey(),
    studentId: int('studentId').notNull(),
    reason: text('reason').notNull(),
    startDate: varchar('startDate', { length: 255 }).notNull(),
    endDate: varchar('endDate', { length: 255 }).notNull(),
    doctorRemarks: text('doctorRemarks'),
    status: sickLeaveStatus.notNull(),
});

export const symptomChecks = mysqlTable('symptom_checks', {
    checkId: int('checkId').autoincrement().primaryKey(),
    studentId: int('studentId').notNull(),
    symptomsSelected: json('symptomsSelected').notNull(),
    priorityLevel: priorityLevel.notNull(),
    suggestedAction: text('suggestedAction').notNull(),
});

export const medicineRequests = mysqlTable('medicine_requests', {
    requestId: int('requestId').autoincrement().primaryKey(),
    studentId: int('studentId').notNull(),
    medicineId: int('medicineId').notNull(),
    reason: text('reason').notNull(),
    status: medicineRequestStatus.notNull(),
    issuedDate: timestamp('issuedDate'),
});

export const patientVisits = mysqlTable('patient_visits', {
    visitId: int('visitId').autoincrement().primaryKey(),
    studentId: int('studentId').notNull(),
    checkinTime: timestamp('checkinTime').notNull().defaultNow(),
    symptoms: text('symptoms').notNull(),
    vitals_temperature: varchar('vitals_temperature', { length: 255 }).notNull(),
    vitals_pulse: varchar('vitals_pulse', { length: 255 }).notNull(),
    vitals_bloodPressure: varchar('vitals_bloodPressure', { length: 255 }).notNull(),
    diagnosis: text('diagnosis').notNull(),
    treatmentProvided: text('treatmentProvided').notNull(),
    doctorId: int('doctorId').notNull(),
    followupDate: timestamp('followupDate'),
    visitStatus: visitStatus.notNull(),
});

export const prescriptions = mysqlTable('prescriptions', {
    prescriptionId: int('prescriptionId').autoincrement().primaryKey(),
    visitId: int('visitId').notNull(),
    studentId: int('studentId').notNull(),
    medicineId: int('medicineId').notNull(),
    dosage: varchar('dosage', { length: 255 }).notNull(),
    duration: varchar('duration', { length: 255 }).notNull(),
    doctorId: int('doctorId').notNull(),
    dateIssued: timestamp('dateIssued').notNull().defaultNow(),
});

export const beds = mysqlTable('beds', {
    bedId: int('bedId').autoincrement().primaryKey(),
    bedNumber: int('bedNumber').notNull().unique(),
    assignedStudentId: int('assignedStudentId'),
    checkinTime: timestamp('checkinTime'),
    checkoutTime: timestamp('checkoutTime'),
    reason: varchar('reason', { length: 255 }),
    nurseNotes: text('nurseNotes'),
    status: bedStatus.notNull(),
});

export const medicineInventory = mysqlTable('medicine_inventory', {
    medicineId: int('medicineId').autoincrement().primaryKey(),
    medicineName: varchar('medicineName', { length: 255 }).notNull(),
    quantity: int('quantity').notNull(),
    expiryDate: varchar('expiryDate', { length: 255 }).notNull(),
    category: medicineCategory.notNull(),
    threshold: int('threshold').notNull(),
});

export const staffSchedules = mysqlTable('staff_schedules', {
    scheduleId: int('scheduleId').autoincrement().primaryKey(),
    staffId: int('staffId').notNull(),
    date: varchar('date', { length: 255 }).notNull(),
    startTime: varchar('startTime', { length: 255 }).notNull(),
    endTime: varchar('endTime', { length: 255 }).notNull(),
    shiftType: shiftType.notNull(),
});

export const notifications = mysqlTable('notifications', {
    notificationId: int('notificationId').autoincrement().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    recipientType: varchar('recipientType', { length: 255 }).notNull(), // Can be 'All', 'Student', 'Staff', or a specific ID
    sendTime: timestamp('sendTime').notNull().defaultNow(),
    read: boolean('read').notNull().default(false),
});

export const broadcasts = mysqlTable('broadcasts', {
    broadcastId: int('broadcastId').autoincrement().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    postDate: timestamp('postDate').notNull().defaultNow(),
});

export const doctorAvailabilities = mysqlTable('doctor_availabilities', {
    availabilityId: int('availabilityId').autoincrement().primaryKey(),
    doctorId: int('doctorId').notNull(),
    date: varchar('date', { length: 255 }).notNull(),
    startTime: varchar('startTime', { length: 255 }).notNull(),
    endTime: varchar('endTime', { length: 255 }).notNull(),
    status: availabilityStatus.notNull(),
    notes: text('notes'),
});
