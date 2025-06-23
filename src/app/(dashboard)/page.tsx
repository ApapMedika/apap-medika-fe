'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Pill, 
  Building2, 
  Shield, 
  CreditCard, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with actual API calls
const getStatsForRole = (role: string) => {
  switch (role) {
    case 'admin':
      return [
        { title: 'Total Users', value: '1,234', icon: Users, color: 'text-blue-600' },
        { title: 'Active Appointments', value: '87', icon: Calendar, color: 'text-green-600' },
        { title: 'Total Medicines', value: '456', icon: Pill, color: 'text-purple-600' },
        { title: 'Active Policies', value: '789', icon: Shield, color: 'text-orange-600' },
      ];
    case 'doctor':
      return [
        { title: 'Today\'s Appointments', value: '12', icon: Calendar, color: 'text-blue-600' },
        { title: 'This Week', value: '58', icon: Activity, color: 'text-green-600' },
        { title: 'Completed Today', value: '8', icon: CheckCircle, color: 'text-purple-600' },
        { title: 'Pending', value: '4', icon: Clock, color: 'text-orange-600' },
      ];
    case 'nurse':
      return [
        { title: 'Active Reservations', value: '23', icon: Building2, color: 'text-blue-600' },
        { title: 'Today\'s Check-ins', value: '7', icon: Activity, color: 'text-green-600' },
        { title: 'Available Rooms', value: '15', icon: Building2, color: 'text-purple-600' },
        { title: 'Pending Tasks', value: '5', icon: Clock, color: 'text-orange-600' },
      ];
    case 'pharmacist':
      return [
        { title: 'Pending Prescriptions', value: '18', icon: Pill, color: 'text-blue-600' },
        { title: 'Low Stock Items', value: '5', icon: TrendingUp, color: 'text-red-600' },
        { title: 'Processed Today', value: '42', icon: CheckCircle, color: 'text-green-600' },
        { title: 'Total Medicines', value: '234', icon: Pill, color: 'text-purple-600' },
      ];
    case 'patient':
      return [
        { title: 'Upcoming Appointments', value: '2', icon: Calendar, color: 'text-blue-600' },
        { title: 'Active Prescriptions', value: '1', icon: Pill, color: 'text-green-600' },
        { title: 'Unpaid Bills', value: '1', icon: CreditCard, color: 'text-red-600' },
        { title: 'Insurance Policies', value: '2', icon: Shield, color: 'text-purple-600' },
      ];
    default:
      return [];
  }
};

const getQuickActionsForRole = (role: string) => {
  switch (role) {
    case 'admin':
      return [
        { title: 'Manage Users', href: '/dashboard/users', icon: Users },
        { title: 'View Appointments', href: '/dashboard/appointments', icon: Calendar },
        { title: 'System Settings', href: '/dashboard/settings', icon: Activity },
      ];
    case 'doctor':
      return [
        { title: 'View Appointments', href: '/dashboard/appointments', icon: Calendar },
        { title: 'Create Prescription', href: '/dashboard/prescriptions/create', icon: Pill },
        { title: 'Patient Records', href: '/dashboard/patients', icon: Users },
      ];
    case 'nurse':
      return [
        { title: 'Manage Reservations', href: '/dashboard/reservations', icon: Building2 },
        { title: 'Room Management', href: '/dashboard/rooms', icon: Building2 },
        { title: 'Patient Check-in', href: '/dashboard/checkin', icon: Activity },
      ];
    case 'pharmacist':
      return [
        { title: 'Process Prescriptions', href: '/dashboard/prescriptions', icon: Pill },
        { title: 'Manage Inventory', href: '/dashboard/medicines', icon: Pill },
        { title: 'Restock Medicines', href: '/dashboard/medicines/restock', icon: TrendingUp },
      ];
    case 'patient':
      return [
        { title: 'Book Appointment', href: '/dashboard/appointments/book', icon: Calendar },
        { title: 'View Prescriptions', href: '/dashboard/prescriptions', icon: Pill },
        { title: 'Pay Bills', href: '/dashboard/bills', icon: CreditCard },
      ];
    default:
      return [];
  }
};

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const stats = getStatsForRole(user.role);
  const quickActions = getQuickActionsForRole(user.role);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-blue-100">
          {user.role === 'admin' && 'Manage your hospital operations efficiently.'}
          {user.role === 'doctor' && 'Check your appointments and manage patient care.'}
          {user.role === 'nurse' && 'Oversee patient care and room management.'}
          {user.role === 'pharmacist' && 'Handle prescriptions and manage inventory.'}
          {user.role === 'patient' && 'Access your healthcare services and information.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used features for your role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button variant="outline" className="w-full justify-start">
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.title}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.role === 'admin' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm">New user registration: Dr. Sarah Johnson</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm">System backup completed successfully</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm">5 medicines require restocking</p>
                  </div>
                </>
              )}
              {user.role === 'doctor' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm">Appointment completed: John Doe</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm">New appointment scheduled for tomorrow</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm">Prescription updated for patient ID: P001</p>
                  </div>
                </>
              )}
              {user.role === 'patient' && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm">Appointment confirmed for next week</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm">Prescription ready for pickup</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-sm">Bill payment due: $125.00</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}