"use client"

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import RequestForm from '@/components/requests/RequestForm';
import axios from '@/lib/axios';

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  equipment_id: number;
  equipment_category: string;
  team_id: number;
  priority: string;
  status: string;
  department: string;
  created_at: string;
  updated_at: string;
  scheduled_date?: string;
  type?: string;
}

interface Equipment {
  id: number;
  name: string;
  serial_number: string;
  category: string;
  status: string;
  department: string;
  health_score: number;
  installation_date: string;
  last_maintenance_date: string;
  next_maintenance_date: string;
}

interface MaintenanceTeam {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

// Static fallback data
const staticRequests: MaintenanceRequest[] = [
  {
    id: 1,
    title: 'CNC Machine Monthly Check',
    description: 'Routine monthly maintenance for CNC machine',
    equipment_id: 1,
    equipment_category: 'Machinery',
    team_id: 1,
    priority: 'Medium',
    status: 'New',
    department: 'Manufacturing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    type: 'Preventive'
  },
  {
    id: 2,
    title: 'HVAC Filter Replacement',
    description: 'Replace air filters in HVAC system',
    equipment_id: 3,
    equipment_category: 'HVAC',
    team_id: 3,
    priority: 'High',
    status: 'In Progress',
    department: 'Facilities',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    type: 'Preventive'
  },
  {
    id: 3,
    title: 'Server Room Inspection',
    description: 'Monthly server room inspection and cleaning',
    equipment_id: 2,
    equipment_category: 'IT Equipment',
    team_id: 4,
    priority: 'Medium',
    status: 'Repaired',
    department: 'IT',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    type: 'Preventive'
  },
];

const staticEquipment: Equipment[] = [
  {
    id: 1,
    name: 'CNC Machine 1',
    serial_number: 'CNC-001',
    category: 'Machinery',
    status: 'Operational',
    department: 'Manufacturing',
    health_score: 85,
    installation_date: '2023-01-15',
    last_maintenance_date: '2024-01-10',
    next_maintenance_date: '2024-07-10'
  },
  {
    id: 2,
    name: 'Server Rack A',
    serial_number: 'SRV-001',
    category: 'IT Equipment',
    status: 'Under Maintenance',
    department: 'IT',
    health_score: 60,
    installation_date: '2022-06-10',
    last_maintenance_date: '2023-12-01',
    next_maintenance_date: '2024-06-01'
  },
  {
    id: 3,
    name: 'HVAC Unit 1',
    serial_number: 'HVAC-001',
    category: 'HVAC',
    status: 'Operational',
    department: 'Facilities',
    health_score: 75,
    installation_date: '2021-03-20',
    last_maintenance_date: '2024-01-05',
    next_maintenance_date: '2024-07-05'
  }
];

const staticTeams: MaintenanceTeam[] = [
  {
    id: 1,
    name: 'Electrical Team',
    description: 'Handles electrical maintenance',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Mechanical Team',
    description: 'Handles mechanical maintenance',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'HVAC Team',
    description: 'Handles HVAC systems',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'IT Support',
    description: 'Handles IT equipment',
    created_at: new Date().toISOString()
  }
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

  // State for data
  const [requests, setRequests] = useState<MaintenanceRequest[]>(staticRequests);
  const [equipment, setEquipment] = useState<Equipment[]>(staticEquipment);
  const [teams, setTeams] = useState<MaintenanceTeam[]>(staticTeams);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch requests
        const requestsResponse = await axios.get('/api/requests');
        if (requestsResponse.data) {
          setRequests(requestsResponse.data);
        }

        // Fetch equipment
        const equipmentResponse = await axios.get('/api/equipment');
        if (equipmentResponse.data) {
          setEquipment(equipmentResponse.data);
        }

        // Fetch teams
        const teamsResponse = await axios.get('/api/teams');
        if (teamsResponse.data) {
          setTeams(teamsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data from backend:', error);
        // Silently use static data if backend fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter for preventive maintenance requests with scheduled dates
  const preventiveRequests = requests.filter((r: MaintenanceRequest) =>
    r.scheduled_date && (!r.type || r.type === 'Preventive')
  );

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate padding days for the first week
  const startDayOfWeek = monthStart.getDay();
  const prevMonthDays = Array(startDayOfWeek).fill(null);

  // Get requests for a specific day
  const getRequestsForDay = (date: Date) => {
    return preventiveRequests.filter((r: MaintenanceRequest) => {
      if (!r.scheduled_date) return false;
      try {
        const requestDate = parseISO(r.scheduled_date);
        return isSameDay(requestDate, date);
      } catch (error) {
        return false;
      }
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setSelectedRequest(null);
    setShowForm(true);
  };

  const handleRequestClick = (request: MaintenanceRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRequest(request);
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      const formattedData = {
        ...data,
        scheduled_date: data.scheduled_date || selectedDate,
        type: 'Preventive'
      };

      if (selectedRequest) {
        try {
          await axios.put(`/api/requests/${selectedRequest.id}`, formattedData);
        } catch (error) {
          console.error('Failed to update on backend:', error);
        }

        // Update local state
        setRequests(prev => prev.map(req =>
          req.id === selectedRequest.id
            ? { ...req, ...formattedData, id: selectedRequest.id, updated_at: new Date().toISOString() }
            : req
        ));
      } else {
        try {
          const response = await axios.post('/api/requests', formattedData);

          // Update local state with response data
          setRequests(prev => [...prev, response.data.request || response.data]);
        } catch (error) {
          console.error('Failed to create on backend:', error);
          // Create new request locally
          const newRequest: MaintenanceRequest = {
            id: Date.now(),
            title: formattedData.title,
            description: formattedData.description || '',
            equipment_id: formattedData.equipment_id || null,
            equipment_category: formattedData.equipment_category || '',
            team_id: formattedData.team_id || null,
            priority: formattedData.priority || 'Medium',
            status: formattedData.status || 'New',
            department: formattedData.department || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            scheduled_date: formattedData.scheduled_date,
            type: 'Preventive'
          };

          setRequests(prev => [...prev, newRequest]);
        }
      }

      setShowForm(false);
      setSelectedRequest(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving request:', error);
      alert('Failed to save request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-700 border border-blue-200',
    'In Progress': 'bg-amber-100 text-amber-700 border border-amber-200',
    'Repaired': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'Scrap': 'bg-slate-800 text-white border border-slate-700',
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading calendar...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Preventive Maintenance Calendar</h1>
          <p className="text-muted-foreground mt-1">Schedule and track preventive maintenance</p>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                setSelectedRequest(null);
                setShowForm(true);
              }}
              disabled={submitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="overflow-hidden border shadow-sm">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month start */}
            {prevMonthDays.map((_, index) => (
              <div
                key={`empty-${index}`}
                className="min-h-[120px] p-2 border-b border-r last:border-r-0 bg-muted/30"
              />
            ))}

            {/* Month days */}
            {monthDays.map((day) => {
              const dayRequests = getRequestsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <motion.div
                  key={day.toString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "min-h-[120px] p-2 border-b border-r last:border-r-0 cursor-pointer transition-all hover:bg-muted/50 relative",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    isTodayDate && "bg-primary/10"
                  )}
                >
                  {/* Today indicator */}
                  {isTodayDate && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                  )}

                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mb-2 mx-auto",
                    isTodayDate && "bg-primary text-primary-foreground font-bold",
                    !isTodayDate && "text-foreground"
                  )}>
                    {format(day, 'd')}
                  </div>

                  <div className="space-y-1">
                    {dayRequests.slice(0, 3).map((request: MaintenanceRequest) => (
                      <motion.div
                        key={request.id}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => handleRequestClick(request, e)}
                        className={cn(
                          "text-xs p-1.5 rounded-md truncate cursor-pointer hover:opacity-90 transition-all border",
                          statusColors[request.status] || "bg-muted text-muted-foreground border-muted"
                        )}
                      >
                        <div className="font-medium truncate">{request.title}</div>
                        <div className="flex items-center justify-between mt-1">
                          {request.equipment_category && (
                            <span className="text-xs opacity-75 truncate">{request.equipment_category}</span>
                          )}
                          <span className="text-xs px-1.5 py-0.5 rounded bg-white/50">
                            {request.priority}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {dayRequests.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-1">
                        +{dayRequests.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Request Status Legend</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusColors).map(([status, colorClass]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", colorClass.split(' ')[0])} />
                <span className="text-sm text-muted-foreground">{status}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
          </div>
        </Card>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Preventive Maintenance Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {preventiveRequests.length} scheduled maintenance tasks
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <CalendarIcon className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card className="text-center p-4 rounded-lg border shadow-sm bg-gradient-to-br from-blue-50 to-white">
                <div className="text-2xl font-bold text-blue-600">{preventiveRequests.filter((r: MaintenanceRequest) => r.status === 'New').length}</div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </Card>
              <Card className="text-center p-4 rounded-lg border shadow-sm bg-gradient-to-br from-amber-50 to-white">
                <div className="text-2xl font-bold text-amber-600">{preventiveRequests.filter((r: MaintenanceRequest) => r.status === 'In Progress').length}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </Card>
              <Card className="text-center p-4 rounded-lg border shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                <div className="text-2xl font-bold text-emerald-600">{preventiveRequests.filter((r: MaintenanceRequest) => r.status === 'Repaired').length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </Card>
              <Card className="text-center p-4 rounded-lg border shadow-sm bg-gradient-to-br from-red-50 to-white">
                <div className="text-2xl font-bold text-red-600">{preventiveRequests.filter((r: MaintenanceRequest) => r.priority === 'High' || r.priority === 'Critical').length}</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </Card>
            </div>
          </Card>
        </motion.div>

        {/* Request Form Modal */}
        <RequestForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedRequest(null);
            setSelectedDate(null);
          }}
          request={selectedRequest}
          equipment={equipment}
          teams={teams}
          members={[]}
          onSubmit={handleSubmit}
          defaultDate={selectedDate}
          isLoading={submitting}
          isEdit={!!selectedRequest}
        />
      </div>
    </DashboardLayout>
  );
}
