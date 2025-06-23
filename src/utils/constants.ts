// Appointment status constants
export const APPOINTMENT_STATUS = {
    CREATED: 0,
    DONE: 1,
    CANCELLED: 2,
} as const;
  
export const APPOINTMENT_STATUS_LABELS = {
    [APPOINTMENT_STATUS.CREATED]: 'Created',
    [APPOINTMENT_STATUS.DONE]: 'Done',
    [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled',
} as const;
  
// Prescription status constants
export const PRESCRIPTION_STATUS = {
    CREATED: 0,
    WAITING_FOR_STOCK: 1,
    DONE: 2,
    CANCELLED: 3,
} as const;
  
export const PRESCRIPTION_STATUS_LABELS = {
    [PRESCRIPTION_STATUS.CREATED]: 'Created',
    [PRESCRIPTION_STATUS.WAITING_FOR_STOCK]: 'Waiting for Stock',
    [PRESCRIPTION_STATUS.DONE]: 'Done',
    [PRESCRIPTION_STATUS.CANCELLED]: 'Cancelled',
} as const;
  
// Bill status constants
export const BILL_STATUS = {
    TREATMENT_IN_PROGRESS: 'TREATMENT_IN_PROGRESS',
    UNPAID: 'UNPAID',
    PAID: 'PAID',
} as const;
  
export const BILL_STATUS_LABELS = {
    [BILL_STATUS.TREATMENT_IN_PROGRESS]: 'Treatment in Progress',
    [BILL_STATUS.UNPAID]: 'Unpaid',
    [BILL_STATUS.PAID]: 'Paid',
} as const;
  
// Policy status constants
export const POLICY_STATUS = {
    CREATED: 0,
    PARTIALLY_CLAIMED: 1,
    FULLY_CLAIMED: 2,
    EXPIRED: 3,
    CANCELLED: 4,
} as const;
  
export const POLICY_STATUS_LABELS = {
    [POLICY_STATUS.CREATED]: 'Created',
    [POLICY_STATUS.PARTIALLY_CLAIMED]: 'Partially Claimed',
    [POLICY_STATUS.FULLY_CLAIMED]: 'Fully Claimed',
    [POLICY_STATUS.EXPIRED]: 'Expired',
    [POLICY_STATUS.CANCELLED]: 'Cancelled',
} as const;
  
// User roles
export const USER_ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    PHARMACIST: 'pharmacist',
    PATIENT: 'patient',
} as const;
  
// Doctor specializations
export const DOCTOR_SPECIALIZATIONS = {
    0: 'General Practitioner',
    1: 'Dentist',
    2: 'Pediatrician',
    3: 'Surgery',
    4: 'Plastic, Reconstructive, and Aesthetic Surgery',
    5: 'Heart and Blood Vessels',
    6: 'Skin and Venereal Diseases',
    7: 'Eyes',
    8: 'Obstetrics and Gynecology',
    9: 'Internal Medicine',
    10: 'Lungs',
    11: 'Ear, Nose, Throat, Head and Neck Surgery',
    12: 'Radiology',
    13: 'Mental Health',
    14: 'Anesthesia',
    15: 'Neurology',
    16: 'Urology',
} as const;
  
export const DOCTOR_SPECIALIZATION_CODES = {
    0: 'UMM', // General Practitioner
    1: 'GGI', // Dentist
    2: 'ANK', // Pediatrician
    3: 'BDH', // Surgery
    4: 'PRE', // Plastic, Reconstructive, and Aesthetic Surgery
    5: 'JPD', // Heart and Blood Vessels
    6: 'KKL', // Skin and Venereal Diseases
    7: 'MTA', // Eyes
    8: 'OBG', // Obstetrics and Gynecology
    9: 'PDL', // Internal Medicine
    10: 'PRU', // Lungs
    11: 'ENT', // Ear, Nose, Throat, Head and Neck Surgery
    12: 'RAD', // Radiology
    13: 'KSJ', // Mental Health
    14: 'ANS', // Anesthesia
    15: 'NRO', // Neurology
    16: 'URO', // Urology
} as const;
  
// Patient classes
export const PATIENT_CLASSES = {
    1: {
      label: 'Class 1',
      limit: 100000000, // Rp 100,000,000
      description: 'Premium coverage with Rp 100,000,000 limit'
    },
    2: {
      label: 'Class 2',
      limit: 50000000, // Rp 50,000,000
      description: 'Standard coverage with Rp 50,000,000 limit'
    },
    3: {
      label: 'Class 3',
      limit: 25000000, // Rp 25,000,000
      description: 'Basic coverage with Rp 25,000,000 limit'
    },
} as const;
  
// Days of week
export const DAYS_OF_WEEK = [
    { value: 0, label: 'Monday', short: 'Mon' },
    { value: 1, label: 'Tuesday', short: 'Tue' },
    { value: 2, label: 'Wednesday', short: 'Wed' },
    { value: 3, label: 'Thursday', short: 'Thu' },
    { value: 4, label: 'Friday', short: 'Fri' },
    { value: 5, label: 'Saturday', short: 'Sat' },
    { value: 6, label: 'Sunday', short: 'Sun' },
  ] as const;
  
// Reservation status (derived)
export const RESERVATION_STATUS = {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    DONE: 'done',
} as const;
  
export const RESERVATION_STATUS_LABELS = {
    [RESERVATION_STATUS.UPCOMING]: 'Upcoming',
    [RESERVATION_STATUS.ONGOING]: 'Ongoing',
    [RESERVATION_STATUS.DONE]: 'Done',
} as const;
  
// Chart periods for statistics
export const CHART_PERIODS = {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
} as const;
  
export const CHART_PERIOD_LABELS = {
    [CHART_PERIODS.MONTHLY]: 'Monthly',
    [CHART_PERIODS.QUARTERLY]: 'Quarterly',
} as const;
  
// API endpoints base paths
export const API_ENDPOINTS = {
    PROFILE: '/profile',
    APPOINTMENT: '/appointment',
    PHARMACY: '/pharmacy',
    HOSPITALIZATION: '/hospitalization',
    INSURANCE: '/insurance',
    BILL: '/bill',
} as const;
  
// File upload limits
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const;
  
// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;
  
// Currency formatter
export const CURRENCY_FORMAT = {
    LOCALE: 'id-ID',
    CURRENCY: 'IDR',
    MINIMUM_FRACTION_DIGITS: 0,
    MAXIMUM_FRACTION_DIGITS: 0,
} as const;
  
// Date formats
export const DATE_FORMATS = {
    DISPLAY: 'DD MMM YYYY',
    DISPLAY_WITH_TIME: 'DD MMM YYYY HH:mm',
    INPUT: 'YYYY-MM-DD',
    API: 'YYYY-MM-DD',
} as const;
  
// Validation rules
export const VALIDATION = {
    NIK_LENGTH: 16,
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    NAME_MIN_LENGTH: 2,
} as const;
  
// Treatment data (from backend)
export const TREATMENTS = [
    { id: 1, name: 'X-ray', price: 150000 },
    { id: 2, name: 'CT Scan', price: 1000000 },
    { id: 3, name: 'MRI', price: 2500000 },
    { id: 4, name: 'Ultrasound', price: 300000 },
    { id: 5, name: 'Blood Clotting Test', price: 50000 },
    { id: 6, name: 'Blood Glucose Test', price: 30000 },
    { id: 7, name: 'Liver Function Test', price: 75000 },
    { id: 8, name: 'Complete Blood Count', price: 50000 },
    { id: 9, name: 'Urinalysis', price: 40000 },
    { id: 10, name: 'COVID-19 testing', price: 150000 },
    { id: 11, name: 'Cholesterol Test', price: 60000 },
    { id: 12, name: 'Inpatient care', price: 1000000 },
    { id: 13, name: 'Surgery', price: 7000000 },
    { id: 14, name: 'ICU', price: 2000000 },
    { id: 15, name: 'ER', price: 500000 },
    { id: 16, name: 'Flu shot', price: 100000 },
    { id: 17, name: 'Hepatitis vaccine', price: 200000 },
    { id: 18, name: 'COVID-19 Vaccine', price: 200000 },
    { id: 19, name: 'MMR Vaccine', price: 350000 },
    { id: 20, name: 'HPV Vaccine', price: 800000 },
    { id: 21, name: 'Pneumococcal Vaccine', price: 900000 },
    { id: 22, name: 'Herpes Zoster Vaccine', price: 1500000 },
    { id: 23, name: 'Physical exam', price: 250000 },
    { id: 24, name: 'Mammogram', price: 500000 },
    { id: 25, name: 'Colonoscopy', price: 3000000 },
    { id: 26, name: 'Dental X-ray', price: 200000 },
    { id: 27, name: 'Fillings', price: 400000 },
    { id: 28, name: 'Dental scaling', price: 500000 },
    { id: 29, name: 'Physical therapy', price: 250000 },
    { id: 30, name: 'Occupational therapy', price: 300000 },
    { id: 31, name: 'Speech therapy', price: 300000 },
    { id: 32, name: 'Psychiatric evaluation', price: 600000 },
    { id: 33, name: 'Natural delivery', price: 3500000 },
    { id: 34, name: 'C-section', price: 12000000 },
] as const;