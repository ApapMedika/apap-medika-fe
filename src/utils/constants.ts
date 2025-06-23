export const USER_ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    PHARMACIST: 'pharmacist',
    PATIENT: 'patient',
} as const;
  
export const APPOINTMENT_STATUS = {
    CREATED: 0,
    DONE: 1,
    CANCELLED: 2,
} as const;
  
export const PRESCRIPTION_STATUS = {
    CREATED: 0,
    WAITING_FOR_STOCK: 1,
    DONE: 2,
    CANCELLED: 3,
} as const;
  
export const POLICY_STATUS = {
    CREATED: 0,
    PARTIALLY_CLAIMED: 1,
    FULLY_CLAIMED: 2,
    EXPIRED: 3,
    CANCELLED: 4,
} as const;
  
export const PATIENT_CLASSES = {
    1: { name: 'Class 1', limit: 100000000 },
    2: { name: 'Class 2', limit: 50000000 },
    3: { name: 'Class 3', limit: 25000000 },
} as const;