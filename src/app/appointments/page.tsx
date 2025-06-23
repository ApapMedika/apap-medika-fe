'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  User,
  Stethoscope,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  patient: {
    user: { name: string };
    nik: string;
  };
  doctor: {
    user: { name: string };
    specialization: number;
  };
  date: string;
  status: number;
  diagnosis?: string;
  total_fee: number;
  created_at: string;
}

const statusMap = {
  0: { label: 'Created', color: 'bg-blue-100 text-blue-800' },
  1: { label: 'Done', color: 'bg-green-100 text-green-800' },
  2: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, fromDate, toDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter) params.status = statusFilter;
      if (fromDate && toDate) {
        params.from_date = fromDate;
        params.to_date = toDate;
      }

      const response = await apiClient.getAppointments(params);
      setAppointments(response.results || response);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.patient.user.name.toLowerCase().includes(searchLower) ||
      appointment.doctor.user.name.toLowerCase().includes(searchLower) ||
      appointment.id.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const canCreateAppointment = user?.role === 'admin';
  const canViewAll = ['admin', 'nurse'].includes(user?.role || '');
  const canEdit = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">
            {user?.role === 'doctor' && 'Manage your patient appointments'}
            {user?.role === 'admin' && 'Manage all appointments in the system'}
            {user?.role === 'nurse' && 'View and monitor patient appointments'}
            {user?.role === 'patient' && 'View your scheduled appointments'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowStatistics(true)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Show Statistics
          </Button>
          
          {canCreateAppointment && (
            <Link href="/dashboard/appointments/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Appointment
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by patient, doctor, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="0">Created</SelectItem>
                  <SelectItem value="1">Done</SelectItem>
                  <SelectItem value="2">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Appointments ({filteredAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900">ID</th>
                    <th className="text-left p-3 font-medium text-gray-900">Patient</th>
                    <th className="text-left p-3 font-medium text-gray-900">Doctor</th>
                    <th className="text-left p-3 font-medium text-gray-900">Date</th>
                    <th className="text-left p-3 font-medium text-gray-900">Status</th>
                    <th className="text-left p-3 font-medium text-gray-900">Fee</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{appointment.id}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{appointment.patient.user.name}</p>
                          <p className="text-sm text-gray-500">NIK: {appointment.patient.nik}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                          <span>{appointment.doctor.user.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(appointment.date)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusMap[appointment.status as keyof typeof statusMap]?.color
                        }`}>
                          {statusMap[appointment.status as keyof typeof statusMap]?.label}
                        </span>
                      </td>
                      <td className="p-3 font-medium">
                        {formatCurrency(appointment.total_fee)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/appointments/${appointment.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {canEdit && appointment.status === 0 && (
                            <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Modal */}
      <Dialog open={showStatistics} onOpenChange={setShowStatistics}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Appointment Statistics</DialogTitle>
          </DialogHeader>
          <AppointmentStatistics />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Statistics Component
function AppointmentStatistics() {
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAppointmentStatistics(period, parseInt(year));
      setStats(response);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period, year]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4">
        <div className="space-y-2">
          <Label>Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const yr = new Date().getFullYear() - 2 + i;
                return (
                  <SelectItem key={yr} value={yr.toString()}>
                    {yr}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Display */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed || 0}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending || 0}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-red-900">{stats.cancelled || 0}</p>
            </div>
          </div>
          
          {/* Chart placeholder - you can integrate Chart.js here */}
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">Chart visualization would go here</p>
            <p className="text-sm text-gray-400">Integrate with Chart.js for detailed analytics</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No statistics available</p>
      )}
    </div>
  );
}