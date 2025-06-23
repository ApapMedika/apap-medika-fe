// User and Authentication Types
export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  gender: boolean | number; // true/1: Female, false/0: Male
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  name: string;
  gender: string; // '0' or '1'
  role: UserRole;
  // Patient specific fields
  nik?: string;
  birth_place?: string;
  birth_date?: string;
  p_class?: string; // '1', '2', or '3'
  // Doctor specific fields
  specialization?: string;
  years_of_experience?: string;
  fee?: string;
  schedules?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Patient Types
export interface Patient extends User {
  nik: string;
  birthPlace: string;
  birthDate: string;
  pClass: number; // 1, 2, or 3
  insuranceLimit: number;
}

// Doctor Types
export interface Doctor extends User {
  id: string;
  specialization: number;
  specializationDisplay: string;
  yearsOfExperience: number;
  fee: number;
  schedules: string[];
}

// Appointment Types
export type AppointmentStatus = 0 | 1 | 2; // 0: Created, 1: Done, 2: Cancelled

export interface Appointment {
  id: string;
  patient: Patient;
  doctor: Doctor;
  appointmentDate: string;
  status: AppointmentStatus;
  diagnosis?: string;
  treatments?: Treatment[];
  totalFee: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Treatment {
  id: number;
  name: string;
  price: number;
}

// Medicine Types
export interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
}

// Prescription Types
export type PrescriptionStatus = 0 | 1 | 2 | 3; // 0: Created, 1: Waiting for stock, 2: Done, 3: Cancelled

export interface Prescription {
  id: string;
  patient: Patient;
  appointment?: Appointment;
  status: PrescriptionStatus;
  totalPrice: number;
  medicines: PrescriptionMedicine[];
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface PrescriptionMedicine {
  medicine: Medicine;
  quantity: number;
  fulfilledQuantity: number;
  price: number;
}

// Room and Reservation Types
export interface Room {
  id: string;
  name: string;
  description: string;
  maxCapacity: number;
  pricePerDay: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Facility {
  id: string;
  name: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  patient: Patient;
  room: Room;
  nurse: User;
  dateIn: string;
  dateOut: string;
  facilities: Facility[];
  totalFee: number;
  status?: 'ongoing' | 'upcoming' | 'done';
  appointment?: Appointment;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

// Insurance Types
export interface Coverage {
  id: number;
  name: string;
  coverageAmount: number;
}

export interface Company {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  coverages: Coverage[];
  totalCoverage: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type PolicyStatus = 0 | 1 | 2 | 3 | 4; // 0: Created, 1: Partially Claimed, 2: Fully Claimed, 3: Expired, 4: Cancelled

export interface Policy {
  id: string;
  company: Company;
  patient: Patient;
  status: PolicyStatus;
  expiryDate: string;
  totalCoverage: number;
  totalCovered: number;
  coverages: PolicyCoverage[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface PolicyCoverage extends Coverage {
  used: boolean;
}

// Bill Types
export type BillStatus = 'TREATMENT_IN_PROGRESS' | 'UNPAID' | 'PAID';

export interface Bill {
  id: string;
  patient: Patient;
  appointment?: Appointment;
  prescription?: Prescription;
  reservation?: Reservation;
  appointmentTotalFee: number;
  prescriptionTotalPrice: number;
  reservationTotalFee: number;
  subtotal: number;
  policy?: Policy;
  coveragesUsed?: Coverage[];
  totalAmountDue: number;
  status: BillStatus;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Form Types
export interface SelectOption {
  value: string;
  label: string;
}

// Dashboard Types
export interface DashboardStats {
  appointments?: number;
  patients?: number;
  medicines?: number;
  reservations?: number;
  policies?: number;
  prescriptions?: number;
  bills?: number;
  todayAppointments?: number;
  pendingPrescriptions?: number;
  pendingBills?: number;
}

// Table Column Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

// Filter Types
export interface AppointmentFilters {
  status?: AppointmentStatus;
  doctor?: string;
  patient?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PrescriptionFilters {
  status?: PrescriptionStatus;
  patient?: string;
}

export interface ReservationFilters {
  status?: 'ongoing' | 'upcoming' | 'done';
  dateIn?: string;
  dateOut?: string;
}

export interface PolicyFilters {
  status?: PolicyStatus;
  minCoverage?: number;
  maxCoverage?: number;
}