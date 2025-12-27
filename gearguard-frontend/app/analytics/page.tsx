"use client"

import React, { useState } from 'react';
import HeatmapChart from '@/components/analytics/HeatMapChart';
import GaugeChart from '@/components/analytics/GaugeChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

// Static data
const staticRequests = [
    { id: 1, title: 'CNC Machine Overheating', team_id: 1, equipment_category: 'Machinery', status: 'In Progress', priority: 'High', equipment_id: 1, department: 'Manufacturing' },
    { id: 2, title: 'Server Fan Failure', team_id: 4, equipment_category: 'IT Equipment', status: 'New', priority: 'Critical', equipment_id: 2, department: 'IT' },
    { id: 3, title: 'HVAC Not Cooling', team_id: 3, equipment_category: 'HVAC', status: 'Repaired', priority: 'Medium', equipment_id: 3, department: 'Facilities' },
    { id: 4, title: 'Electrical Panel Inspection', team_id: 1, equipment_category: 'Electrical', status: 'New', priority: 'Low', equipment_id: null, department: 'Facilities' },
    { id: 5, title: 'Forklift Brake Issue', team_id: 2, equipment_category: 'Vehicles', status: 'Repaired', priority: 'High', equipment_id: 4, department: 'Logistics' },
    { id: 6, title: '3D Printer Calibration', team_id: 2, equipment_category: 'Machinery', status: 'In Progress', priority: 'Medium', equipment_id: 5, department: 'Manufacturing' },
    { id: 7, title: 'Network Switch Replacement', team_id: 4, equipment_category: 'IT Equipment', status: 'Scrap', priority: 'Critical', equipment_id: 6, department: 'IT' },
    { id: 8, title: 'Plumbing Leak', team_id: 5, equipment_category: 'Plumbing', status: 'Repaired', priority: 'High', equipment_id: null, department: 'Facilities' },
    { id: 9, title: 'Safety Equipment Audit', team_id: 2, equipment_category: 'Safety Equipment', status: 'New', priority: 'Medium', equipment_id: null, department: 'Operations' },
    { id: 10, title: 'Generator Maintenance', team_id: 1, equipment_category: 'Electrical', status: 'In Progress', priority: 'High', equipment_id: 7, department: 'Facilities' },
];

const staticTeams = [
    { id: 1, name: 'Electrical Team' },
    { id: 2, name: 'Mechanical Team' },
    { id: 3, name: 'HVAC Team' },
    { id: 4, name: 'IT Support' },
    { id: 5, name: 'Facilities' },
];

const staticEquipment = [
    { id: 1, name: 'CNC Machine 1', status: 'Operational', department: 'Manufacturing', category: 'Machinery' },
    { id: 2, name: 'Server Rack A', status: 'Under Maintenance', department: 'IT', category: 'IT Equipment' },
    { id: 3, name: 'HVAC Unit 1', status: 'Operational', department: 'Facilities', category: 'HVAC' },
    { id: 4, name: 'Forklift 1', status: 'Operational', department: 'Logistics', category: 'Vehicles' },
    { id: 5, name: '3D Printer', status: 'Scrapped', department: 'Manufacturing', category: 'Machinery' },
    { id: 6, name: 'Network Switch', status: 'Decommissioned', department: 'IT', category: 'IT Equipment' },
    { id: 7, name: 'Generator', status: 'Operational', department: 'Facilities', category: 'Electrical' },
    { id: 8, name: 'Conveyor Belt', status: 'Under Maintenance', department: 'Manufacturing', category: 'Machinery' },
    { id: 9, name: 'Fire Suppression', status: 'Operational', department: 'Facilities', category: 'Safety Equipment' },
    { id: 10, name: 'Office AC', status: 'Operational', department: 'Operations', category: 'HVAC' },
];

// Helper function to calculate equipment health
const calculateEquipmentHealth = (equipment: any, requests: any[]) => {
    let score = 100;

    // Deduct points based on active maintenance requests
    const activeRequests = requests.filter(r => r.equipment_id === equipment.id && r.status !== 'Repaired');
    activeRequests.forEach(req => {
        if (req.priority === 'Critical') score -= 30;
        else if (req.priority === 'High') score -= 20;
        else if (req.priority === 'Medium') score -= 10;
        else score -= 5;
    });

    // Deduct points based on equipment status
    if (equipment.status === 'Under Maintenance') score -= 25;
    else if (equipment.status === 'Scrapped') score = 0;
    else if (equipment.status === 'Decommissioned') score = 0;

    return Math.max(0, Math.min(100, score));
};

export default function Analytics() {
    // Calculate all analytics from static data
    const requests = staticRequests;
    const teams = staticTeams;
    const equipment = staticEquipment;

    // Requests per team
    const requestsByTeam = teams.map(team => ({
        name: team.name,
        requests: requests.filter(r => r.team_id === team.id).length,
    })).filter(t => t.requests > 0);

    // Requests by category
    const categories = ['Machinery', 'Electronics', 'HVAC', 'Plumbing', 'Electrical', 'Vehicles', 'IT Equipment', 'Safety Equipment', 'Other'];
    const requestsByCategory = categories.map(cat => ({
        name: cat,
        value: requests.filter(r => r.equipment_category === cat).length,
    })).filter(c => c.value > 0);

    // Requests by status
    const statuses = ['New', 'In Progress', 'Repaired', 'Scrap'];
    const requestsByStatus = statuses.map(status => ({
        name: status,
        value: requests.filter(r => r.status === status).length,
    }));

    // Requests by priority
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const requestsByPriority = priorities.map(priority => ({
        name: priority,
        value: requests.filter(r => r.priority === priority).length,
    }));

    // Equipment by status
    const equipmentStatuses = ['Operational', 'Under Maintenance', 'Scrapped', 'Decommissioned'];
    const equipmentByStatus = equipmentStatuses.map(status => ({
        name: status,
        value: equipment.filter(e => e.status === status).length,
    })).filter(e => e.value > 0);

    // Requests by department (heatmap)
    const departments = ['Manufacturing', 'Facilities', 'IT', 'Logistics', 'Operations'];
    const requestsByDepartment = departments.map(dept => ({
        department: dept,
        requests: equipment
            .filter(e => e.department === dept)
            .reduce((sum, e) => sum + requests.filter(r => r.equipment_id === e.id).length, 0)
    }));

    // Overall equipment health
    const overallHealth = equipment.length > 0
        ? Math.round(
            equipment.reduce((sum, e) => sum + calculateEquipmentHealth(e, requests), 0) / equipment.length
        )
        : 0;

    // Summary statistics
    const totalRequests = requests.length;
    const activeRequests = requests.filter(r => r.status !== 'Repaired' && r.status !== 'Scrap').length;
    const highPriorityRequests = requests.filter(r => r.priority === 'High' || r.priority === 'Critical').length;
    const completedRequests = requests.filter(r => r.status === 'Repaired').length;

    return (
        <div className="min-h-screen bg-gradient-to-br bg-black p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
                <p className="text-slate-500 mt-1">Comprehensive insights and reports on maintenance operations</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Total Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalRequests}</div>
                        <p className="text-xs text-slate-500 mt-1">All maintenance requests</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-amber-50 border-amber-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Active Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{activeRequests}</div>
                        <p className="text-xs text-slate-500 mt-1">Requiring attention</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-emerald-50 border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{completedRequests}</div>
                        <p className="text-xs text-slate-500 mt-1">Successfully resolved</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-red-50 border-red-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            High Priority
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{highPriorityRequests}</div>
                        <p className="text-xs text-slate-500 mt-1">Urgent attention needed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Equipment Health Gauge */}
            <Card className="mb-6 border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Overall Equipment Health
                    </CardTitle>
                    <CardDescription>Average health score across all equipment</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center">
                        <GaugeChart value={overallHealth} label="Health Score" />
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-sm text-slate-600">Good (80+)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                <span className="text-sm text-slate-600">Fair (60-79)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-sm text-slate-600">Poor (40-59)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-sm text-slate-600">Critical (&lt;40)</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Requests by Team */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Requests by Team</CardTitle>
                        <CardDescription>Distribution of maintenance requests across teams</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={requestsByTeam} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#64748b" />
                                    <YAxis dataKey="name" type="category" width={100} stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="requests" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests by Category */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Requests by Category</CardTitle>
                        <CardDescription>Breakdown of maintenance requests by equipment category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={requestsByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {requestsByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests by Status */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Requests by Status</CardTitle>
                        <CardDescription>Current status of maintenance requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={requestsByStatus}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests by Priority */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Requests by Priority</CardTitle>
                        <CardDescription>Priority level distribution of requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={requestsByPriority}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        <Cell fill="#94a3b8" />
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#f97316" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests by Department - Heatmap */}
                <Card className="lg:col-span-2 border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Requests by Department (Heatmap)</CardTitle>
                        <CardDescription>Maintenance request volume across departments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <HeatmapChart data={requestsByDepartment} title="Requests by Department" />
                    </CardContent>
                </Card>

                {/* Equipment by Status */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Equipment by Status</CardTitle>
                        <CardDescription>Current status of all equipment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={equipmentByStatus}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Trends */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                        <CardDescription>Request volume over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { month: 'Jan', requests: 8 },
                                    { month: 'Feb', requests: 12 },
                                    { month: 'Mar', requests: 10 },
                                    { month: 'Apr', requests: 15 },
                                    { month: 'May', requests: 18 },
                                    { month: 'Jun', requests: totalRequests },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="requests" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
