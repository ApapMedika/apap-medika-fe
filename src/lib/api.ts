import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          Cookies.remove('token');
          Cookies.remove('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action');
        } else if (error.response?.status === 500) {
          toast.error('Server error. Please try again later.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/profile/login/', { email, password });
    return response.data;
  }

  async signup(data: any) {
    const response = await this.client.post('/profile/signup/', data);
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/profile/logout/');
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/profile/users/me/');
    return response.data;
  }

  // User management
  async getUsers(params?: any) {
    const response = await this.client.get('/profile/users/', { params });
    return response.data;
  }

  async upgradePatientClass(patientId: string, newClass: number) {
    const response = await this.client.put('/profile/patients/upgrade-class/', {
      patient_id: patientId,
      new_class: newClass,
    });
    return response.data;
  }

  // Patient endpoints
  async getPatients(params?: any) {
    const response = await this.client.get('/profile/patients/', { params });
    return response.data;
  }

  async getPatientByNik(nik: string) {
    const response = await this.client.get(`/profile/patients/${nik}/`);
    return response.data;
  }

  async searchPatient(nik: string) {
    const response = await this.client.post('/profile/patients/search/', { nik });
    return response.data;
  }

  // Doctor endpoints
  async getDoctors(params?: any) {
    const response = await this.client.get('/profile/doctors/', { params });
    return response.data;
  }

  async getDoctorById(id: string) {
    const response = await this.client.get(`/profile/doctors/${id}/`);
    return response.data;
  }

  async getDoctorSchedule(doctorId: string) {
    const response = await this.client.get(`/profile/doctors/${doctorId}/schedule/`);
    return response.data;
  }

  // Appointment endpoints
  async getAppointments(params?: any) {
    const response = await this.client.get('/appointment/appointments/', { params });
    return response.data;
  }

  async getAppointmentById(id: string) {
    const response = await this.client.get(`/appointment/appointments/${id}/`);
    return response.data;
  }

  async createAppointment(data: any) {
    const response = await this.client.post('/appointment/appointments/', data);
    return response.data;
  }

  async updateAppointment(id: string, data: any) {
    const response = await this.client.put(`/appointment/appointments/${id}/`, data);
    return response.data;
  }

  async updateAppointmentStatus(id: string, status: number) {
    const response = await this.client.put(`/appointment/appointments/${id}/status/`, { status });
    return response.data;
  }

  async updateAppointmentNote(id: string, diagnosis: string, treatments: number[]) {
    const response = await this.client.put(`/appointment/appointments/${id}/note/`, {
      diagnosis,
      treatments,
    });
    return response.data;
  }

  async deleteAppointment(id: string) {
    const response = await this.client.delete(`/appointment/appointments/${id}/`);
    return response.data;
  }

  async getAppointmentStatistics(period: string, year: number) {
    const response = await this.client.get('/appointment/appointments/statistics/', {
      params: { period, year },
    });
    return response.data;
  }

  // Medicine endpoints
  async getMedicines(params?: any) {
    const response = await this.client.get('/pharmacy/medicines/', { params });
    return response.data;
  }

  async getMedicineById(id: string) {
    const response = await this.client.get(`/pharmacy/medicines/${id}/`);
    return response.data;
  }

  async createMedicine(data: any) {
    const response = await this.client.post('/pharmacy/medicines/', data);
    return response.data;
  }

  async updateMedicine(id: string, data: any) {
    const response = await this.client.put(`/pharmacy/medicines/${id}/`, data);
    return response.data;
  }

  async updateMedicineStock(id: string, quantity: number) {
    const response = await this.client.put(`/pharmacy/medicines/${id}/stock/`, { quantity });
    return response.data;
  }

  async restockMedicines(data: any) {
    const response = await this.client.put('/pharmacy/medicines/restock/', data);
    return response.data;
  }

  async deleteMedicine(id: string) {
    const response = await this.client.delete(`/pharmacy/medicines/${id}/`);
    return response.data;
  }

  // Prescription endpoints
  async getPrescriptions(params?: any) {
    const response = await this.client.get('/pharmacy/prescriptions/', { params });
    return response.data;
  }

  async getPrescriptionById(id: string) {
    const response = await this.client.get(`/pharmacy/prescriptions/${id}/`);
    return response.data;
  }

  async createPrescription(data: any) {
    const response = await this.client.post('/pharmacy/prescriptions/', data);
    return response.data;
  }

  async updatePrescription(id: string, data: any) {
    const response = await this.client.put(`/pharmacy/prescriptions/${id}/`, data);
    return response.data;
  }

  async updatePrescriptionStatus(id: string, pharmacistId: string) {
    const response = await this.client.put(`/pharmacy/prescriptions/${id}/status/`, {
      pharmacist_id: pharmacistId,
    });
    return response.data;
  }

  async cancelPrescription(id: string) {
    const response = await this.client.put(`/pharmacy/prescriptions/${id}/cancel/`);
    return response.data;
  }

  // Insurance endpoints
  async getPolicies(params?: any) {
    const response = await this.client.get('/insurance/policies/', { params });
    return response.data;
  }

  async getPolicyById(id: string) {
    const response = await this.client.get(`/insurance/policies/${id}/`);
    return response.data;
  }

  async createPolicy(data: any) {
    const response = await this.client.post('/insurance/policies/', data);
    return response.data;
  }

  async updatePolicyExpiry(id: string, expiryDate: string) {
    const response = await this.client.put(`/insurance/policies/${id}/expiry/`, {
      expiry_date: expiryDate,
    });
    return response.data;
  }

  async cancelPolicy(id: string) {
    const response = await this.client.put(`/insurance/policies/${id}/cancel/`);
    return response.data;
  }

  async deletePolicy(id: string) {
    const response = await this.client.delete(`/insurance/policies/${id}/`);
    return response.data;
  }

  // Bill endpoints
  async getBills(params?: any) {
    const response = await this.client.get('/bill/bills/', { params });
    return response.data;
  }

  async getBillById(id: string) {
    const response = await this.client.get(`/bill/bills/${id}/`);
    return response.data;
  }

  async updateBill(id: string, data: any) {
    const response = await this.client.put(`/bill/bills/${id}/`, data);
    return response.data;
  }

  async payBill(id: string) {
    const response = await this.client.put(`/bill/bills/${id}/pay/`);
    return response.data;
  }

  // Reservation endpoints
  async getReservations(params?: any) {
    const response = await this.client.get('/hospitalization/reservations/', { params });
    return response.data;
  }

  async getReservationById(id: string) {
    const response = await this.client.get(`/hospitalization/reservations/${id}/`);
    return response.data;
  }

  async createReservation(data: any) {
    const response = await this.client.post('/hospitalization/reservations/', data);
    return response.data;
  }

  async updateReservation(id: string, data: any) {
    const response = await this.client.put(`/hospitalization/reservations/${id}/`, data);
    return response.data;
  }

  async deleteReservation(id: string) {
    const response = await this.client.delete(`/hospitalization/reservations/${id}/`);
    return response.data;
  }

  // Room endpoints
  async getRooms(params?: any) {
    const response = await this.client.get('/hospitalization/rooms/', { params });
    return response.data;
  }

  async getRoomById(id: string) {
    const response = await this.client.get(`/hospitalization/rooms/${id}/`);
    return response.data;
  }
}

export const apiClient = new ApiClient();