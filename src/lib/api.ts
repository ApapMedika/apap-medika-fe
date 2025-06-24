import axios, { AxiosInstance, AxiosResponse } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get(url: string, params?: any): Promise<any> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post(url: string, data?: any): Promise<any> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put(url: string, data?: any): Promise<any> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch(url: string, data?: any): Promise<any> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete(url: string): Promise<any> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Profile/Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.client.post('/login/', credentials);
    return response.data;
  }

  async signup(userData: any) {
    const response = await this.client.post('/signup/', userData);
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/logout/');
    return response.data;
  }

  async getJWT(oauthData: any) {
    const response = await this.client.post('/jwt/', oauthData);
    return response.data;
  }

  // User endpoints
  async getUsers(params?: any) {
    const response = await this.client.get('/profile/users/', { params });
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.client.get(`/profile/users/${id}/`);
    return response.data;
  }

  async getUserProfile() {
    const response = await this.client.get('/profile/users/me/');
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

  async searchPatient(params: any) {
    const response = await this.client.get('/profile/patients/search/', { params });
    return response.data;
  }

  async upgradePatientClass(data: any) {
    const response = await this.client.put('/profile/patients/upgrade-class/', data);
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

  async updateAppointmentStatus(id: string, action: string) {
    const response = await this.client.put(`/appointment/appointments/${id}/status/${action}/`);
    return response.data;
  }

  async updateAppointmentDiagnosis(id: string, data: any) {
    const response = await this.client.put(`/appointment/appointments/${id}/diagnosis/`, data);
    return response.data;
  }

  async deleteAppointment(id: string) {
    const response = await this.client.delete(`/appointment/appointments/${id}/`);
    return response.data;
  }

  async getAppointmentsByDoctor(doctorId: string, params?: any) {
    const response = await this.client.get(`/appointment/appointments/doctor/${doctorId}/`, { params });
    return response.data;
  }

  async getAppointmentsByPatient(patientId: string, params?: any) {
    const response = await this.client.get(`/appointment/appointments/patient/${patientId}/`, { params });
    return response.data;
  }

  async getAppointmentsByDateRange(params: any) {
    const response = await this.client.get('/appointment/appointments/date-range/count/', { params });
    return response.data;
  }

  async getTodayAppointments() {
    const response = await this.client.get('/appointment/appointments/today/count/');
    return response.data;
  }

  async getAppointmentStatistics(params?: any) {
    const response = await this.client.get('/appointment/appointments/statistics/', { params });
    return response.data;
  }

  async getAppointmentChartData(params?: any) {
    const response = await this.client.get('/appointment/appointments/statistics/chart/', { params });
    return response.data;
  }

  // Treatment endpoints
  async getTreatments() {
    const response = await this.client.get('/appointment/treatments/');
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

  async deleteMedicine(id: string) {
    const response = await this.client.delete(`/pharmacy/medicines/${id}/`);
    return response.data;
  }

  async updateMedicineStock(id: string, data: any) {
    const response = await this.client.put(`/pharmacy/medicines/${id}/update-stock/`, data);
    return response.data;
  }

  async restockMedicines(data: any) {
    const response = await this.client.put('/pharmacy/medicines/restock/', data);
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

  async processPrescription(id: string, data?: any) {
    const response = await this.client.put(`/pharmacy/prescriptions/${id}/process/`, data);
    return response.data;
  }

  async cancelPrescription(id: string) {
    const response = await this.client.delete(`/pharmacy/prescriptions/${id}/`);
    return response.data;
  }

  async getPrescriptionStatistics(params?: any) {
    const response = await this.client.get('/pharmacy/prescriptions/statistics/', { params });
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

  async createRoom(data: any) {
    const response = await this.client.post('/hospitalization/rooms/', data);
    return response.data;
  }

  async updateRoom(id: string, data: any) {
    const response = await this.client.put(`/hospitalization/rooms/${id}/`, data);
    return response.data;
  }

  async deleteRoom(id: string) {
    const response = await this.client.delete(`/hospitalization/rooms/${id}/`);
    return response.data;
  }

  // Facility endpoints
  async getFacilities(params?: any) {
    const response = await this.client.get('/hospitalization/facilities/', { params });
    return response.data;
  }

  async getFacilityById(id: string) {
    const response = await this.client.get(`/hospitalization/facilities/${id}/`);
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

  async updateReservationRoom(id: string, data: any) {
    const response = await this.client.put(`/hospitalization/reservations/${id}/update-room/`, data);
    return response.data;
  }

  async updateReservationFacilities(id: string, data: any) {
    const response = await this.client.put(`/hospitalization/reservations/${id}/update-facilities/`, data);
    return response.data;
  }

  async deleteReservation(id: string) {
    const response = await this.client.delete(`/hospitalization/reservations/${id}/`);
    return response.data;
  }

  async getReservationStatistics(params?: any) {
    const response = await this.client.get('/hospitalization/reservations/statistics/', { params });
    return response.data;
  }

  async getReservationChartData(params?: any) {
    const response = await this.client.get('/hospitalization/reservations/statistics/chart/', { params });
    return response.data;
  }

  // Insurance/Policy endpoints
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

  async updatePolicyExpiry(id: string, data: any) {
    const response = await this.client.put(`/insurance/policies/${id}/`, data);
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

  async getPolicyStatistics(params?: any) {
    const response = await this.client.get('/insurance/policies/statistics/', { params });
    return response.data;
  }

  async getPolicyChartData(params?: any) {
    const response = await this.client.get('/insurance/policies/statistics/chart/', { params });
    return response.data;
  }

  // Coverage endpoints
  async getCoverages() {
    const response = await this.client.get('/insurance/coverages/');
    return response.data;
  }

  // Company endpoints
  async getCompanies(params?: any) {
    const response = await this.client.get('/insurance/companies/', { params });
    return response.data;
  }

  async getCompanyById(id: string) {
    const response = await this.client.get(`/insurance/companies/${id}/`);
    return response.data;
  }

  async createCompany(data: any) {
    const response = await this.client.post('/insurance/companies/', data);
    return response.data;
  }

  async updateCompany(id: string, data: any) {
    const response = await this.client.put(`/insurance/companies/${id}/`, data);
    return response.data;
  }

  async deleteCompany(id: string) {
    const response = await this.client.delete(`/insurance/companies/${id}/`);
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

  async createBill(data: any) {
    const response = await this.client.post('/bill/bills/', data);
    return response.data;
  }

  async updateBill(id: string, data: any) {
    const response = await this.client.put(`/bill/bills/${id}/`, data);
    return response.data;
  }

  async payBill(id: string, data?: any) {
    const response = await this.client.post('/bill/bills/pay/', { bill_id: id, ...data });
    return response.data;
  }

  async getBillStatistics(params?: any) {
    const response = await this.client.get('/bill/bills/statistics/', { params });
    return response.data;
  }

  async getBillChartData(params?: any) {
    const response = await this.client.get('/bill/bills/statistics/chart/', { params });
    return response.data;
  }

  async getUnpaidBills(params?: any) {
    const response = await this.client.get('/bill/bills/unpaid/', { params });
    return response.data;
  }

  async getBillsByPatient(patientId: string, params?: any) {
    const response = await this.client.get(`/bill/bills/patient/${patientId}/`, { params });
    return response.data;
  }
}

export const apiClient = new ApiClient();