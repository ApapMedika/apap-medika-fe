'use client';

import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { 
  Heart, 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  Building2, 
  Pill, 
  Shield, 
  CreditCard,
  FileText,
  LogOut,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'patient'],
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    name: 'Appointments',
    href: '/dashboard/appointments',
    icon: Calendar,
    roles: ['admin', 'doctor', 'nurse', 'patient'],
  },
  {
    name: 'Reservations',
    href: '/dashboard/reservations',
    icon: Building2,
    roles: ['admin', 'nurse', 'patient'],
  },
  {
    name: 'Medicines',
    href: '/dashboard/medicines',
    icon: Pill,
    roles: ['admin', 'pharmacist', 'doctor', 'nurse'],
  },
  {
    name: 'Prescriptions',
    href: '/dashboard/prescriptions',
    icon: FileText,
    roles: ['pharmacist', 'patient'],
  },
  {
    name: 'Policies',
    href: '/dashboard/policies',
    icon: Shield,
    roles: ['admin', 'patient'],
  },
  {
    name: 'Bills',
    href: '/dashboard/bills',
    icon: CreditCard,
    roles: ['patient'],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (!user) {
    return null; // Auth provider will handle redirect
  }

  const userNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  const NavLink = ({ item }: { item: NavigationItem }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          isActive
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold gradient-text">ApapMedika</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {userNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          <div className="border-t p-4 space-y-2">
            <Link
              href="/dashboard/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-blue-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-6 border-b">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold gradient-text">ApapMedika</span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {userNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          <div className="border-t p-4 space-y-2">
            <Link
              href="/dashboard/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-blue-700 hover:bg-gray-50 rounded-lg"
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}