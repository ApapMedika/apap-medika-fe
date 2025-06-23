// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '@/contexts/auth-context';
// import { 
//   HeartIcon,
//   UserCircleIcon,
//   CalendarDaysIcon,
//   ClipboardDocumentListIcon,
//   BuildingOfficeIcon,
//   ShieldCheckIcon,
//   CurrencyDollarIcon,
//   UsersIcon,
//   Bars3Icon,
//   XMarkIcon,
//   ArrowRightOnRectangleIcon,
//   BeakerIcon
// } from '@heroicons/react/24/outline';

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const pathname = usePathname();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const getNavItems = () => {
//     if (!user) return [];

//     switch (user.role) {
//       case 'ADMIN':
//         return [
//           { href: '/users', label: 'Users', icon: UsersIcon },
//           { href: '/appointment/all', label: 'Appointments', icon: CalendarDaysIcon },
//           { href: '/pharmacy/medicines', label: 'Medicines', icon: BeakerIcon },
//           { href: '/insurance/policies', label: 'Policies', icon: ShieldCheckIcon },
//           { href: '/hospitalization/reservations', label: 'Reservations', icon: BuildingOfficeIcon },
//         ];
//       case 'DOCTOR':
//         return [
//           { href: '/appointment/my', label: 'My Appointments', icon: CalendarDaysIcon },
//         ];
//       case 'NURSE':
//         return [
//           { href: '/appointment/all', label: 'Appointments', icon: CalendarDaysIcon },
//           { href: '/hospitalization/reservations', label: 'Reservations', icon: BuildingOfficeIcon },
//         ];
//       case 'PHARMACIST':
//         return [
//           { href: '/pharmacy/medicines', label: 'Medicines', icon: BeakerIcon },
//           { href: '/pharmacy/prescriptions', label: 'Prescriptions', icon: ClipboardDocumentListIcon },
//         ];
//       case 'PATIENT':
//         return [
//           { href: '/appointment/my', label: 'My Appointments', icon: CalendarDaysIcon },
//           { href: '/insurance/my-policies', label: 'My Policies', icon: ShieldCheckIcon },
//           { href: '/hospitalization/my-reservations', label: 'My Reservations', icon: BuildingOfficeIcon },
//           { href: '/pharmacy/my-prescriptions', label: 'My Prescriptions', icon: ClipboardDocumentListIcon },
//           { href: '/bill/my-bills', label: 'My Bills', icon: CurrencyDollarIcon },
//         ];
//       default:
//         return [];
//     }
//   };

//   const navItems = getNavItems();

//   return (
//     <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
//       isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
//     }`}>
//       <div className="container mx-auto px-6">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-3">
//             <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
//               <HeartIcon className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//               ApapMedika
//             </span>
//           </Link>

//           {/* Desktop Navigation */}
//           {user && (
//             <div className="hidden md:flex items-center space-x-1">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
//                     pathname.startsWith(item.href)
//                       ? 'bg-blue-50 text-blue-600'
//                       : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <item.icon className="w-5 h-5" />
//                   <span className="text-sm font-medium">{item.label}</span>
//                 </Link>
//               ))}
//             </div>
//           )}

//           {/* User Menu */}
//           <div className="flex items-center space-x-4">
//             {user ? (
//               <div className="relative">
//                 <button
//                   onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
//                   className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
//                     <span className="text-white text-sm font-medium">
//                       {user.name.charAt(0).toUpperCase()}
//                     </span>
//                   </div>
//                   <div className="hidden md:block text-left">
//                     <p className="text-sm font-medium text-gray-900">{user.name}</p>
//                     <p className="text-xs text-gray-500">{user.role}</p>
//                   </div>
//                 </button>

//                 {profileDropdownOpen && (
//                   <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 border">
//                     <Link
//                       href="/profile"
//                       className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                     >
//                       <UserCircleIcon className="w-5 h-5" />
//                       <span>My Profile</span>
//                     </Link>
//                     <hr className="my-1" />
//                     <button
//                       onClick={logout}
//                       className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
//                     >
//                       <ArrowRightOnRectangleIcon className="w-5 h-5" />
//                       <span>Logout</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="hidden md:flex items-center space-x-4">
//                 <Link
//                   href="/login"
//                   className="px-5 py-2 text-gray-700 hover:text-blue-600 transition-colors"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   href="/signup"
//                   className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
//                 >
//                   Get Started
//                 </Link>
//               </div>
//             )}

//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="md:hidden p-2"
//             >
//               {mobileMenuOpen ? (
//                 <XMarkIcon className="w-6 h-6 text-gray-700" />
//               ) : (
//                 <Bars3Icon className="w-6 h-6 text-gray-700" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <div className="md:hidden bg-white rounded-lg shadow-lg p-4 mt-2">
//             {user ? (
//               <>
//                 <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
//                   <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
//                     <span className="text-white font-medium">
//                       {user.name.charAt(0).toUpperCase()}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">{user.name}</p>
//                     <p className="text-sm text-gray-500">{user.role}</p>
//                   </div>
//                 </div>
//                 <div className="space-y-1">
//                   {navItems.map((item) => (
//                     <Link
//                       key={item.href}
//                       href={item.href}
//                       className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
//                         pathname.startsWith(item.href)
//                           ? 'bg-blue-50 text-blue-600'
//                           : 'text-gray-700 hover:bg-gray-50'
//                       }`}
//                     >
//                       <item.icon className="w-5 h-5" />
//                       <span className="text-sm font-medium">{item.label}</span>
//                     </Link>
//                   ))}
//                   <hr className="my-2" />
//                   <Link
//                     href="/profile"
//                     className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
//                   >
//                     <UserCircleIcon className="w-5 h-5" />
//                     <span className="text-sm font-medium">My Profile</span>
//                   </Link>
//                   <button
//                     onClick={logout}
//                     className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 w-full text-left"
//                   >
//                     <ArrowRightOnRectangleIcon className="w-5 h-5" />
//                     <span className="text-sm font-medium">Logout</span>
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <div className="space-y-2">
//                 <Link
//                   href="/login"
//                   className="block w-full text-center px-5 py-2 text-gray-700 hover:text-blue-600 transition-colors"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   href="/signup"
//                   className="block w-full text-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg transition-all duration-200"
//                 >
//                   Get Started
//                 </Link>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }