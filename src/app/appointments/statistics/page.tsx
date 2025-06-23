'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import {
  ChartBarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface StatisticData {
  period: string;
  count: number;
}

export default function AppointmentStatisticsPage() {
  const router = useRouter();
  const [statisticsData, setStatisticsData] = useState<StatisticData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'monthly',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchStatistics();
  }, [filters.period, filters.year]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAppointmentStatistics(filters.period, filters.year);
      setStatisticsData(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      toast.error('Failed to load appointment statistics');
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...statisticsData.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="btn-outline btn-sm"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Statistics</h1>
            <p className="text-gray-600">View appointment trends and analytics</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Period</label>
            <select
              className="form-select"
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="form-label">Year</label>
            <select
              className="form-select"
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: Number(e.target.value) }))}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Appointments {filters.period === 'monthly' ? 'per Month' : 'per Quarter'} - {filters.year}
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : statisticsData.length > 0 ? (
          <div className="space-y-4">
            {/* Bar Chart */}
            <div className="space-y-3">
              {statisticsData.map((data, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium text-gray-700">
                    {data.period}
                  </div>
                  <div className="flex-1 relative">
                    <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${(data.count / maxCount) * 100}%` }}
                      >
                        {data.count > 0 && (
                          <span className="text-white text-sm font-medium">
                            {data.count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600">
                    {data.count} apps
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Total Appointments</p>
                <p className="text-2xl font-bold text-blue-900">
                  {statisticsData.reduce((sum, data) => sum + data.count, 0)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">Average per Period</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(statisticsData.reduce((sum, data) => sum + data.count, 0) / statisticsData.length)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-600">Peak Period</p>
                <p className="text-lg font-bold text-purple-900">
                  {statisticsData.reduce((max, data) => data.count > max.count ? data : max, { period: 'N/A', count: 0 }).period}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointment data available for the selected period</p>
          </div>
        )}
      </div>
    </div>
  );
}