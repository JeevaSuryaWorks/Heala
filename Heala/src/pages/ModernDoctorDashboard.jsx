import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import HealaLoader from '../components/HealaLoader';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Modern Doctor Dashboard (Heala)
 * 
 * A self-contained, production-grade React component.
 * Features: 6 Functional Pages, Chart.js integration (CDN), Collapsible Sidebar, 
 * Deep Navy Theme, Custom CSS Design System.
 */

const ModernDoctorDashboard = ({ initialPage = 'dashboard' }) => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    // Initialize active page from URL, or default to initialPage
    const [activePage, _setActivePage] = useState(searchParams.get('tab') || initialPage);

    // Wrapper to update both local state and URL without full reload
    const setActivePage = (page) => {
        _setActivePage(page);
        setSearchParams({ tab: page });
    };

    const [chartsLoaded, setChartsLoaded] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        recoveryRate: 0,
        criticalCases: 0
    });
    const [patientList, setPatientList] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [historyApts, setHistoryApts] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [workLogs, setWorkLogs] = useState([]);
    const [chartData, setChartData] = useState({});
    const [patientFilter, setPatientFilter] = useState('All');
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [news, setNews] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnreadNews, setHasUnreadNews] = useState(false);
    const [prescriptionModal, setPrescriptionModal] = useState({ isOpen: false, appointmentId: null, patientId: null });
    const [prescriptionData, setPrescriptionData] = useState({ diagnosis: '', medications: [{ name: '', duration: '', food: 'After Food', timings: 'Morning' }], extraNotes: '', signature: '' });

    // Health Vault State
    const [vaultDocs, setVaultDocs] = useState([]);
    const [selectedVaultPatient, setSelectedVaultPatient] = useState('');
    const [isUploadingVault, setIsUploadingVault] = useState(false);
    const [isVaultDropdownOpen, setIsVaultDropdownOpen] = useState(false);

    const chartInstances = useRef({});
    const containerRef = useRef(null);

    // --- Navigation Config ---
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { id: 'patients', label: 'Patients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', badge: stats.totalPatients },
        { id: 'schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'workhours', label: 'Work Hours', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { id: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'healthvault', label: 'Health Vault', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
    ];

    // --- Supabase Data Fetcher ---
    useEffect(() => {
        if (!user) return;

        const fetchData = async (isFirstLoad = false) => {
            if (isFirstLoad) setIsInitialLoading(true);
            else setSyncing(true);
            
            try {
                // 1. Fetch Stats (Total Patients from profiles)
                const { count: patientCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'patient');

                // 2. Fetch All Appointments
                const todayObj = new Date();
                const today = new Date(todayObj.getTime() - (todayObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                let aptQuery = supabase
                    .from('appointments')
                    .select('*, patient:profiles!appointments_patient_id_fkey(name)')
                    .order('appointment_date', { ascending: false })
                    .order('appointment_time', { ascending: false });
                
                // If the user has a doctor profile, filter by their ID.
                // If not, and they are an admin, let them see all appointments for testing.
                if (user.doctorData?.id) {
                    aptQuery = aptQuery.eq('doctor_id', user.doctorData.id);
                } else if (user.role !== 'admin') {
                    // Prevent crash by searching an impossible UUID if neither admin nor doctor
                    aptQuery = aptQuery.eq('doctor_id', '00000000-0000-0000-0000-000000000000'); 
                }

                const { data: allApts, error: aptError } = await aptQuery;
                if (aptError) console.error("Appointments fetch error:", aptError);

                const activeApts = [];
                const pastApts = [];
                let todayCount = 0;
                
                if (allApts) {
                    allApts.forEach(apt => {
                        if (apt.appointment_date === today) todayCount++;
                        if (apt.status === 'completed') {
                            pastApts.push(apt);
                        } else {
                            activeApts.push(apt);
                        }
                    });
                }
                
                // Active apts we want ascending, so sort them ascending
                activeApts.sort((a,b) => new Date(a.appointment_date + 'T' + a.appointment_time) - new Date(b.appointment_date + 'T' + b.appointment_time));
                
                // 3. Fetch Critical Cases
                const { count: criticalCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('outcome', 'Critical');

                // 4. Fetch Patient List with latest clinical data
                const { data: patients } = await supabase
                    .from('profiles')
                    .select('*, appointments(appointment_type, outcome, appointment_date)')
                    .eq('role', 'patient')
                    .limit(10);

                // 5. Fetch Vitals (Mocking latest records for now, if table exists)
                const { data: latestVitals } = await supabase.from('patient_vitals').select('*').order('recorded_at', { ascending: false }).limit(4);

                // 6. Fetch Work Logs
                const { data: logs } = await supabase.from('work_logs').select('*').limit(30);

                setStats({
                    totalPatients: patientCount || 0,
                    todayAppointments: todayCount || 0,
                    recoveryRate: 94.2, 
                    criticalCases: criticalCount || 0
                });
                setSchedule(activeApts || []);
                setHistoryApts(pastApts || []);
                setPatientList(patients || []);
                setVitals(latestVitals || []);
                setWorkLogs(logs || []);

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setIsInitialLoading(false);
                setSyncing(false);
            }
        };

        const fetchNews = async () => {
            try {
                const { data } = await supabase
                    .from('news')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);
                setNews(data || []);
                if (data && data.length > 0) setHasUnreadNews(true);
            } catch (err) {
                console.error("Error fetching news:", err);
            }
        };

        fetchData(true);
        fetchNews();

        // Health Vault Effect
        const fetchVault = async () => {
            if (!selectedVaultPatient || !user?.doctorData?.id) return;
            try {
                const { data, error } = await supabase
                    .from('patient_documents')
                    .select('*')
                    .eq('doctor_id', user.doctorData.id)
                    .eq('patient_id', selectedVaultPatient)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setVaultDocs(data || []);
            } catch (error) {
                console.error('Error fetching documents:', error.message);
            }
        };
        fetchVault();

        // Subscription for real-time updates
        const channel = supabase.channel('dashboard-updates')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'appointments',
                filter: user.doctorData?.id ? `doctor_id=eq.${user.doctorData.id}` : undefined
            }, () => fetchData())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, (payload) => {
                setNews(prev => [payload.new, ...prev].slice(0, 5));
                setHasUnreadNews(true);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // --- Chart.js Dynamic Loader ---
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
        script.async = true;
        script.onload = () => setChartsLoaded(true);
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    // --- Chart Controller ---
    useEffect(() => {
        if (!chartsLoaded) return;

        // Cleanup existing charts
        Object.values(chartInstances.current).forEach(chart => chart?.destroy());
        chartInstances.current = {};

        const initCharts = () => {
            const ctxArr = document.querySelectorAll('canvas[data-chart]');
            ctxArr.forEach(canvas => {
                const type = canvas.getAttribute('data-chart-type');
                const id = canvas.getAttribute('id');

                // Only init if visible or active page
                if (chartInstances.current[id]) return;

                const config = getChartConfig(type, id);
                if (config) {
                    chartInstances.current[id] = new window.Chart(canvas, config);
                }
            });
        };

        initCharts();
    }, [chartsLoaded, activePage]);

    const getChartConfig = (type, id) => {
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: type !== 'doughnut' && type !== 'radar' ? {
                x: { 
                    grid: { display: false }, 
                    ticks: { color: '#475569', font: { size: 10, weight: '600' } } 
                },
                y: { 
                    grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }, 
                    ticks: { color: '#475569', font: { size: 10, weight: '600' } } 
                }
            } : {}
        };

        if (id === 'patientTrend') {
            return {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        { label: 'Outpatient', data: [450, 520, 480, 610, 590, 720], borderColor: '#14b8a6', tension: 0.4, fill: false },
                        { label: 'Inpatient', data: [120, 150, 140, 180, 210, 190], borderColor: '#3b82f6', tension: 0.4, fill: false }
                    ]
                },
                options: defaultOptions
            };
        }

        if (id === 'diagnosisDoughnut') {
            return {
                type: 'doughnut',
                data: {
                    labels: ['Cardiac', 'Hypertension', 'Diabetes', 'Other'],
                    datasets: [{
                        data: [35, 25, 20, 20],
                        backgroundColor: ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: defaultOptions
            };
        }

        if (id === 'patientOutcomes') {
            return {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        { label: 'Recovered', data: [65, 78, 82, 75, 90, 85], backgroundColor: '#14b8a6' },
                        { label: 'Ongoing', data: [25, 15, 10, 20, 5, 10], backgroundColor: '#3b82f6' },
                        { label: 'Critical', data: [10, 7, 8, 5, 5, 5], backgroundColor: '#ef4444' }
                    ]
                },
                options: { ...defaultOptions, scales: { ...defaultOptions.scales, x: { stacked: true }, y: { stacked: true } } }
            };
        }

        if (id === 'performanceRadar') {
            return {
                type: 'radar',
                data: {
                    labels: ['Care', 'Diagnostics', 'Surgery', 'Research', 'Teaching', 'Admin'],
                    datasets: [
                        { label: 'Current', data: [95, 88, 75, 80, 70, 65], borderColor: '#14b8a6', backgroundColor: 'rgba(20, 184, 166, 0.2)' },
                        { label: 'Target', data: [90, 85, 80, 85, 85, 80], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                    ]
                },
                options: {
                    ...defaultOptions,
                    scales: {
                        r: { 
                            grid: { color: 'rgba(0,0,0,0.05)' }, 
                            angleLines: { color: 'rgba(0,0,0,0.05)' }, 
                            pointLabels: { 
                                color: '#0f172a', 
                                font: { size: 12, weight: '700', family: '"DM Sans", sans-serif' }
                            }, 
                            ticks: { display: false } 
                        }
                    }
                }
            };
        }

        if (id === 'hoursOverview') {
            return {
                type: 'bar',
                data: {
                    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'],
                    datasets: [{
                        label: 'Hours',
                        data: [8, 9, 11, 8, 10, 4, 0, 9, 12, 8, 11, 10, 5, 2],
                        backgroundColor: (ctx) => ctx.raw > 10 ? '#ef4444' : '#14b8a6',
                        borderRadius: 6
                    }]
                },
                options: defaultOptions
            };
        }

        if (id === 'annualReports') {
            return {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                        { label: 'Consultations', data: [620, 580, 710, 640, 800, 750, 820, 790, 850, 900, 870, 950], backgroundColor: '#14b8a6' },
                        { label: 'Procedures', data: [45, 38, 52, 48, 60, 55, 62, 59, 65, 70, 68, 75], backgroundColor: '#3b82f6' }
                    ]
                },
                options: defaultOptions
            };
        }

        return null;
    };

    // --- Render Helpers ---
    const Icon = ({ path, className = "" }) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px' }} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );

    const PageHeader = ({ title, subtitle }) => (
        <div style={{ padding: '2rem 3rem 0.5rem 3rem' }}>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>{title}</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{subtitle}</p>
        </div>
    );

    const StatCard = ({ label, value, trend, icon, color }) => (
        <div className="stat-card" style={{
            background: 'var(--color-surface)',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '0.5px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'transform 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
                    <Icon path={icon} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: trend > 0 ? '#10b981' : '#ef4444' }}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </div>
            </div>
            <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>{label}</p>
                <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</h3>
            </div>
        </div>
    );

    // --- Sub-Pages ---
    const renderDashboard = () => (
        <div className="animate-in" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '1.5rem', 
            padding: '1rem 3rem 2rem 3rem' 
        }}>
            <StatCard label="Total Patients" value={stats.totalPatients.toLocaleString()} trend={12} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" color="20, 184, 166" />
            <StatCard label="Upcoming Appointments" value={stats.todayAppointments} trend={-5} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="59, 130, 246" />
            <StatCard label="Recovery Rate" value={`${stats.recoveryRate}%`} trend={2} icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" color="16, 185, 129" />
            <StatCard label="Critical Cases" value={stats.criticalCases.toString().padStart(2, '0')} trend={8} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" color="239, 68, 68" />

            <div style={{ 
                gridColumn: 'span 3', 
                height: '400px', 
                padding: '2rem', 
                background: 'var(--color-surface)', 
                border: '0.5px solid var(--border)', 
                borderRadius: '14px' 
            }}>
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-[1.1rem]">Patient Trends</h4>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-[2px] bg-[#14b8a6]"></div><span className="text-[10px] text-[var(--color-text-muted)] font-bold">Outpatient</span></div>
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-[2px] bg-[#3b82f6]"></div><span className="text-[10px] text-[var(--color-text-muted)] font-bold">Inpatient</span></div>
                    </div>
                </div>
                <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                    <canvas id="patientTrend" data-chart data-chart-type="line"></canvas>
                </div>
            </div>

            <div style={{ 
                padding: '2rem', 
                background: 'var(--color-surface)', 
                border: '0.5px solid var(--border)', 
                borderRadius: '14px' 
            }}>
                <h4 className="font-bold text-[1.1rem] mb-6">Upcoming Schedule</h4>
                <div className="flex flex-col gap-4">
                    {schedule.length > 0 ? schedule.slice(0, 3).map((apt, i) => (
                        <div key={apt.id} className="flex flex-col gap-2 p-4 bg-[rgba(0,0,0,0.02)] rounded-[12px] border-[0.5px] border-[var(--border)]">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[0.95rem]">{apt.patient?.name || 'Unknown'}</span>
                                <span style={{
                                    fontSize: '10px',
                                    background: `${apt.status === 'urgent' ? '#ef4444' : '#14b8a6'}20`,
                                    color: apt.status === 'urgent' ? '#ef4444' : '#14b8a6',
                                    padding: '2px 8px', borderRadius: '4px', fontWeight: 800
                                }}>{apt.status?.toUpperCase() || 'SCHEDULED'}</span>
                            </div>
                            <div className="flex justify-between text-[0.8rem] text-[var(--color-text-muted)] font-semibold">
                                <span>{apt.appointment_type || 'Consultation'}</span>
                                <span>{apt.appointment_time}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-[var(--color-text-muted)] text-[0.8rem]">No upcoming appointments</div>
                    )}
                </div>
            </div>

            <div style={{ 
                gridColumn: 'span 2', 
                padding: '2rem', 
                background: 'var(--color-surface)', 
                border: '0.5px solid var(--border)', 
                borderRadius: '14px' 
            }}>
                <h4 className="font-bold text-[1.1rem] mb-6">Diagnosis Distribution</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                    <div style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0 }}>
                        <canvas id="diagnosisDoughnut" data-chart data-chart-type="doughnut"></canvas>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {['Cardiac', 'Hypertension', 'Diabetes', 'Other'].map((label, idx) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444'][idx] }}></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{label}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>{[35, 25, 20, 20][idx]}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ gridColumn: 'span 2', padding: '2rem', background: 'var(--color-surface)', border: '0.5px solid var(--border)', borderRadius: '14px' }}>
                <h4 className="font-bold text-[1.1rem] mb-6">Real-time Vitals</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {vitals.length > 0 ? vitals.map(v => (
                        <div key={v.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Vital Reading</span>
                                <span style={{ color: 'var(--color-accent)', fontWeight: 900 }}>{v.heart_rate || v.bp_systolic || v.spo2}</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '70%', background: 'var(--color-accent)', borderRadius: '10px' }}></div>
                            </div>
                        </div>
                    )) : (
                        ['Heart Rate', 'Blood Pressure', 'SpO2', 'Temperature'].map((label, i) => (
                            <div key={label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{label}</span>
                                    <span style={{ color: i % 2 === 0 ? '#14b8a6' : '#3b82f6', fontWeight: 900 }}>{[72, '120/80', 98, 36.6][i]}</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: ['72%', '60%', '98%', '85%'][i], background: i % 2 === 0 ? '#14b8a6' : '#3b82f6', borderRadius: '10px' }}></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
    
    // --- PDF Export Logic ---
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        
        // Header Background
        doc.setFillColor(26, 10, 78); // Deep Plum/Navy from Heala palette
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        // Branding - Platform Name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("playfair", "italic");
        doc.text("Heala", 15, 25);
        
        // Clinic Info - Right Aligned
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text((user?.doctorData?.clinic_name || "HEALA WELLNESS CLINIC").toUpperCase(), pageWidth - 15, 20, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Practitioner: ${user?.name || "Verified Practitioner"}`, pageWidth - 15, 30, { align: 'right' });
        
        // Title
        doc.setTextColor(26, 10, 78);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Clinical Patient Report", 15, 55);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 62);
        doc.text(`Case Filter: ${patientFilter}`, 15, 68);

        // Map Filtered Patients for Table
        const filtered = patientFilter === 'All' 
            ? patientList 
            : patientList.filter(p => (p.appointments?.[0]?.outcome || 'Stable') === patientFilter);

        const tableData = filtered.map(p => [
            p.name || 'Anonymous',
            p.phone || 'N/A',
            p.appointments?.[0]?.appointment_type || 'General Checkup',
            (p.appointments?.[0]?.outcome || 'Stable').toUpperCase(),
            p.appointments?.[0]?.appointment_date || 'N/A'
        ]);

        autoTable(doc, {
            startY: 75,
            head: [['Patient Name', 'Contact', 'Case Type', 'Status', 'Last Activity']],
            body: tableData,
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { 
                fillColor: [20, 184, 166], // Teal from Heala palette
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 15, right: 15 }
        });

        // Watermark / Footer
        const finalY = doc.lastAutoTable.finalY || 150;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("This report is strictly confidential and for medical use only.", pageWidth / 2, finalY + 20, { align: 'center' });
        
        // Watermark at the very bottom
        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 200, 200);
        doc.text("Tuned by JS Corporations", pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

        doc.save(`Heala_Patients_Report_${patientFilter}_${new Date().getTime()}.pdf`);
    };

    const renderPatients = () => {
        const filteredPatients = patientList.filter(p => {
            const matchesTab = patientFilter === 'All' || (p.appointments?.[0]?.outcome || 'Stable') === patientFilter;
            const query = patientSearchQuery.toLowerCase();
            const matchesSearch = p.name?.toLowerCase().includes(query) || 
                                 p.id?.toLowerCase().includes(query) || 
                                 (p.appointments?.[0]?.appointment_type || '').toLowerCase().includes(query);
            return matchesTab && matchesSearch;
        });

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 3rem', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            padding: '6px', 
                            background: 'rgba(0,0,0,0.03)', 
                            borderRadius: '16px', 
                            border: '0.5px solid var(--border)', 
                            backdropFilter: 'blur(8px)' 
                        }}>
                            {['All', 'Critical', 'Stable', 'Discharged'].map(tab => (
                                <button 
                                    key={tab} 
                                    onClick={() => setPatientFilter(tab)}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 900,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        background: patientFilter === tab ? 'var(--color-accent)' : 'transparent',
                                        color: patientFilter === tab ? 'white' : 'var(--color-text-muted)',
                                        boxShadow: patientFilter === tab ? '0 10px 20px rgba(20,184,166,0.15)' : 'none'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-4 h-4 text-[var(--color-text-muted)] absolute left-4" />
                            <input
                                placeholder="Search Name, ID or Clinical Issue..."
                                value={patientSearchQuery}
                                onChange={(e) => setPatientSearchQuery(e.target.value)}
                                style={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    padding: '0.75rem 1rem 0.75rem 2.8rem',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.85rem',
                                    width: '320px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleExportPDF}
                        style={{
                            padding: '12px 28px',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >Export Clinical Report</button>
                </div>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ 
                        flex: '3', 
                        minWidth: '600px',
                        background: 'var(--color-surface)', 
                        border: '0.5px solid var(--border)', 
                        borderRadius: '20px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        overflow: 'hidden'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.01)' }}>
                                    <th style={{ padding: '24px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1.5px solid var(--border)' }}>Patient Profile</th>
                                    <th style={{ padding: '24px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1.5px solid var(--border)' }}>Medical Record</th>
                                    <th style={{ padding: '24px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1.5px solid var(--border)' }}>Clinical Status</th>
                                    <th style={{ padding: '24px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1.5px solid var(--border)' }}>Last Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.length > 0 ? filteredPatients.map((p, i) => {
                                    const latestApt = p.appointments?.[0] || {};
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '0.5px solid var(--border)', transition: 'background 0.2s ease' }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ 
                                                        width: '48px', 
                                                        height: '48px', 
                                                        borderRadius: '14px', 
                                                        background: 'var(--gradient-primary)', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 900,
                                                        fontSize: '1.2rem',
                                                        flexShrink: 0,
                                                        boxShadow: '0 4px 10px rgba(26,10,46,0.1)'
                                                    }}>
                                                        {p.name?.[0] || 'P'}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{p.name || 'Anonymous'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{p.phone || 'No contact info'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{latestApt.appointment_type || 'General Checkup'}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 900, opacity: 0.6 }}>ID: {p.id.slice(0, 8)}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{ 
                                                    display: 'inline-block',
                                                    fontSize: '10px', 
                                                    background: latestApt.outcome === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(20, 184, 166, 0.1)', 
                                                    color: latestApt.outcome === 'Critical' ? '#ef4444' : '#14b8a6', 
                                                    padding: '6px 14px', 
                                                    borderRadius: '8px', 
                                                    fontWeight: 900,
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {(latestApt.outcome || 'STABLE').toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                <div style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                                                    {latestApt.appointment_date ? new Date(latestApt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Recorded Outpatient</div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="4" style={{ padding: '80px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>No patient records available for this filter.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ flex: '1.2', minWidth: '340px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ 
                            padding: '2rem', 
                            background: 'var(--color-surface)', 
                            border: '0.5px solid var(--border)', 
                            borderRadius: '20px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h4 style={{ fontWeight: 900, fontSize: '1.1rem', margin: 0 }}>Recovery Trends</h4>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(20, 184, 166, 0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
                                    <Icon path="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" className="text-[var(--color-accent)] w-5 h-5 mx-auto" />
                                </div>
                            </div>
                            <div style={{ position: 'relative', width: '100%', height: '320px' }}>
                                <canvas id="patientOutcomes" data-chart data-chart-type="bar"></canvas>
                            </div>
                            <div style={{ 
                                marginTop: '2rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                padding: '1.5rem', 
                                background: 'rgba(0,0,0,0.02)', 
                                borderRadius: '16px' 
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Efficiency</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-accent)' }}>94.2%</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Gain</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6' }}>+12.5%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleStatusChange = async (aptId, newStatus, patientId) => {
        if (newStatus === 'completed') {
            setPrescriptionModal({ isOpen: true, appointmentId: aptId, patientId });
            return;
        }
        
        try {
            const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', aptId);
            if (error) throw error;
            // Optimistic update
            setSchedule(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a));
        } catch (err) {
            console.error("Status update error:", err);
            alert("Failed to update status");
        }
    };

    const submitPrescription = async (skip = false) => {
        try {
            if (!skip && prescriptionModal.appointmentId) {
                const { error } = await supabase.from('prescriptions').insert([{
                    appointment_id: prescriptionModal.appointmentId,
                    doctor_id: user.doctorData.id,
                    patient_id: prescriptionModal.patientId,
                    diagnosis: prescriptionData.diagnosis,
                    medications: prescriptionData.medications,
                    extra_notes: prescriptionData.extraNotes,
                    digital_signature: prescriptionData.signature
                }]);
                if (error) throw error;
            }
            
            // Mark appointment as completed
            if (prescriptionModal.appointmentId) {
                await supabase.from('appointments').update({ status: 'completed' }).eq('id', prescriptionModal.appointmentId);
                setSchedule(prev => prev.map(a => a.id === prescriptionModal.appointmentId ? { ...a, status: 'completed' } : a));
            }
            
            setPrescriptionModal({ isOpen: false, appointmentId: null, patientId: null });
            setPrescriptionData({ diagnosis: '', medications: [{ name: '', duration: '', food: 'After Food', timings: 'Morning' }], extraNotes: '', signature: '' });
            
        } catch (err) {
            console.error("Prescription error:", err);
            alert("Failed to process completion.");
        }
    };

    const renderSchedule = () => (
        <div className="animate-in" style={{ padding: '1rem 3rem 2rem 3rem' }}>
            <div style={{ 
                background: 'var(--color-surface)', 
                border: '0.5px solid var(--border)', 
                borderRadius: '14px', 
                overflow: 'hidden' 
            }}>
                {schedule.length > 0 ? schedule.map((item, i) => (
                    <div key={item.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '2rem', 
                        padding: '2rem', 
                        borderBottom: '0.5px solid var(--border)',
                        transition: 'background 0.2s ease'
                    }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: '120px', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: '"Playfair Display", serif' }}>{item.appointment_time}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{new Date(item.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div style={{ height: '40px', width: '6px', borderRadius: '10px', background: item.status === 'urgent' ? '#ef4444' : item.status === 'completed' ? '#10b981' : '#14b8a6' }}></div>
                        <div style={{ flex: 1 }}>
                            <h5 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 4px 0' }}>{item.patient?.name || 'Anonymous'}</h5>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{item.appointment_type || 'General Consultation'} • 30m</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select 
                                value={item.status || 'pending'} 
                                onChange={(e) => handleStatusChange(item.id, e.target.value, item.patient_id)}
                                disabled={item.status === 'completed'}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--color-surface)',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: item.status === 'completed' ? 'not-allowed' : 'pointer',
                                    outline: 'none',
                                    color: item.status === 'completed' ? '#10b981' : 'var(--color-text-primary)'
                                }}
                            >
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="arrived">Patient Arrived</option>
                                <option value="completed">Completed</option>
                                <option value="urgent">Urgent</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            
                            {item.status === 'completed' && (
                                <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '8px', fontWeight: 900 }}>COMPLETED</span>
                            )}
                        </div>
                    </div>
                )) : (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>No appointments recorded.</div>
                )}
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="animate-in" style={{ padding: '1rem 3rem 2rem 3rem' }}>
            <div style={{ 
                background: 'var(--color-surface)', 
                border: '0.5px solid var(--border)', 
                borderRadius: '14px', 
                overflow: 'hidden' 
            }}>
                {historyApts.length > 0 ? historyApts.map((item, i) => (
                    <div key={item.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '2rem', 
                        padding: '2rem', 
                        borderBottom: '0.5px solid var(--border)',
                        transition: 'background 0.2s ease'
                    }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: '120px', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: '"Playfair Display", serif' }}>{item.appointment_time}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{new Date(item.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div style={{ height: '40px', width: '6px', borderRadius: '10px', background: '#10b981' }}></div>
                        <div style={{ flex: 1 }}>
                            <h5 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 4px 0' }}>{item.patient?.name || 'Anonymous'}</h5>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{item.appointment_type || 'General Consultation'} • 30m</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '8px', fontWeight: 900 }}>COMPLETED</span>
                        </div>
                    </div>
                )) : (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>No completed appointments in history.</div>
                )}
            </div>
        </div>
    );

    const renderWorkHours = () => (
        <div style={{ padding: '0 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <StatCard label="Hours This Week" value="48.5" trend={15} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="20, 184, 166" />
            <StatCard label="Hours This Month" value="184" trend={5} icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" color="59, 130, 246" />
            <StatCard label="Days On-Call" value="04" trend={0} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" color="245, 158, 11" />
            <StatCard label="Leave Remaining" value="12" trend={-10} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="16, 185, 129" />

            <div style={{ 
                gridColumn: 'span 3', 
                padding: '2.5rem', 
                background: 'var(--color-surface)', 
                border: '0.5px solid var(--border)', 
                borderRadius: '20px',
                minWidth: '700px'
            }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '2rem', margin: 0 }}>Weekly Heatmap</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '2rem' }}>
                        {['08:00', '10:00', '12:00', '14:00', '16:00'].map(t => (
                            <div key={t} style={{ height: '40px', display: 'flex', alignItems: 'center', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 900 }}>{t}</div>
                        ))}
                    </div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => (
                        <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{day}</div>
                            {[0, 1, 2, 3, 4].map((slot, i) => {
                                const hasLog = workLogs.some(log => {
                                    const date = new Date(log.logged_date);
                                    return (date.getDay() === (dIdx + 1) % 7);
                                });
                                return (
                                    <div key={i} style={{ 
                                        height: '40px', 
                                        borderRadius: '10px', 
                                        background: hasLog && i < 3 ? 'var(--color-accent)' : 'rgba(0,0,0,0.03)',
                                        opacity: hasLog && i < 3 ? 0.2 + (i * 0.2) : 1,
                                        border: '0.5px solid var(--border)',
                                        transition: 'all 0.3s ease'
                                    }}></div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ 
                    padding: '2rem', 
                    background: 'var(--color-surface)', 
                    border: '0.5px solid var(--border)', 
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', margin: 0 }}>Category Split</h4>
                    <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                        <canvas id="categoryDistribution" data-chart data-chart-type="doughnut"></canvas>
                    </div>
                </div>
            </div>

            <div style={{ 
                gridColumn: 'span 4', 
                padding: '2.5rem', 
                background: 'var(--color-surface)', 
                border: '0.5px solid var(--border)', 
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '2rem', margin: 0 }}>14-Day Activity Trail</h4>
                <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                    <canvas id="activityTrail" data-chart data-chart-type="bar"></canvas>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div style={{ padding: '0 3rem', display: 'flex', flexDirection: 'column', gap: '3rem', animation: 'fadeIn 0.6s ease-out' }}>
            <div style={{ padding: '3rem', background: 'var(--color-surface)', border: '0.5px solid var(--border)', borderRadius: '24px', display: 'flex', gap: '3rem', alignItems: 'center' }}>
                <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '3rem', flexShrink: 0, fontFamily: '"Playfair Display", serif' }}>
                    {user?.name?.[0] || 'D'}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{user?.name || 'Verified Practitioner'}</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--color-accent)', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>{user?.doctorData?.specialization || 'Clinical Specialist'}</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ padding: '8px 20px', borderRadius: '50px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{user?.doctorData?.clinic_name || 'Heala Health Center'}</span>
                        <span style={{ padding: '8px 20px', borderRadius: '50px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Surgical Board Certified</span>
                        <span style={{ padding: '8px 20px', borderRadius: '50px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Verified Expert</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {[
                        { label: 'Years Exp.', val: (user?.doctorData?.experience || '5') + '+' },
                        { label: 'Total Treated', val: stats.totalPatients },
                        { label: 'Satisfact. %', val: '99%' }
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: '"Playfair Display", serif' }}>{s.val}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div className="p-10 bg-[var(--color-surface)] border-[0.5px] border-[var(--border)] rounded-[24px]">
                    <h4 className="font-bold text-[1.4rem] mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>Professional Background</h4>
                    <div className="flex flex-col gap-8">
                        {[
                            { title: user?.doctorData?.qualification || 'Consultant Specialist', inst: user?.doctorData?.clinic_name || 'Heala Medical Institute', year: 'Active' },
                            { title: user?.doctorData?.specialization || 'Clinical Excellence', inst: 'Regulated Practitioner', year: 'Verified' }
                        ].map((edu, i) => (
                            <div key={i} className="flex gap-6 items-start">
                                <div className="mt-2 w-2 h-2 rounded-full bg-[var(--color-accent)]"></div>
                                <div>
                                    <p className="font-black text-[1.1rem] text-[var(--color-text-primary)]">{edu.title}</p>
                                    <p className="text-[0.9rem] text-[var(--color-text-muted)] font-bold">{edu.inst} • {edu.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-10 bg-[var(--color-surface)] border-[0.5px] border-[var(--border)] rounded-[24px]">
                    <h4 className="font-bold text-[1.4rem] mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>Competency Matrix</h4>
                    <div style={{ position: 'relative', width: '100%', height: '350px' }}>
                        <canvas id="performanceRadar" data-chart data-chart-type="radar"></canvas>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="animate-in" style={{ padding: '1rem 3rem 2rem 3rem' }}>
            <div style={{ 
                padding: '2.5rem', 
                background: 'var(--color-surface)', 
                border: '0.5px solid var(--border)', 
                borderRadius: '24px' 
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2.5rem' 
                }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1.4rem', fontFamily: '"Playfair Display", serif', margin: 0 }}>Annual Clinical Performance</h4>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#14b8a6' }}></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Consultations</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6' }}></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Procedures</span>
                        </div>
                    </div>
                </div>
                <div style={{ position: 'relative', width: '100%', height: '500px' }}>
                    <canvas id="annualReports" data-chart data-chart-type="bar"></canvas>
                </div>
            </div>
        </div>
    );

    const fetchVaultDocuments = async (patientId) => {
        if (!patientId) return;
        try {
            const { data, error } = await supabase
                .from('patient_documents')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVaultDocs(data);
        } catch (error) {
            console.error('Error fetching vault documents:', error.message);
            setVaultDocs([]);
        }
    };

    const handleVaultUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedVaultPatient) return;

        setIsUploadingVault(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${selectedVaultPatient}/${Math.random()}.${fileExt}`;
            const filePath = `vault/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('health-vault')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { error: metaError } = await supabase
                .from('patient_documents')
                .insert({
                    doctor_id: user.doctorData.id,
                    patient_id: selectedVaultPatient,
                    file_name: file.name,
                    file_path: filePath,
                    file_type: file.type,
                    file_size: file.size
                });

            if (metaError) throw metaError;

            // Trigger re-fetch logic slightly decoupled but using state reload is fine. 
            // In a real app we might just run the fetch directly here. We will just append to state for immediate UI feedback.
            setVaultDocs(prev => [{
                id: Math.random(), file_name: file.name, file_path: filePath, file_type: file.type, file_size: file.size, created_at: new Date().toISOString()
            }, ...prev]);
            
            alert('Document uploaded successfully to the patient vault!');
        } catch (error) {
            console.error('Upload Error:', error.message);
            alert('Failed to upload document. ' + error.message);
        } finally {
            setIsUploadingVault(false);
        }
    };

    const deleteVaultDocument = async (id, filePath) => {
        if (!confirm('Are you sure you want to remove this document?')) return;

        try {
            await supabase.storage.from('health-vault').remove([filePath]);
            
            const { error } = await supabase.from('patient_documents').delete().eq('id', id);
            if (error) throw error;

            setVaultDocs(prev => prev.filter(doc => doc.id !== id));
        } catch (error) {
            console.error('Delete Error:', error.message);
        }
    };

    const renderHealthVault = () => (
        <div className="animate-in" style={{ padding: '1rem 3rem 2rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '2rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>Secure Patient Documents</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Select Patient</label>
                        <div style={{ position: 'relative' }}>
                            <div 
                                onClick={() => setIsVaultDropdownOpen(!isVaultDropdownOpen)}
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', 
                                    background: 'var(--color-surface)', color: 'var(--color-text-primary)', 
                                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    fontWeight: 600, fontSize: '0.9rem'
                                }}
                            >
                                {selectedVaultPatient ? 
                                    (patientList.find(p => p.id === selectedVaultPatient)?.name || 'Unknown Patient') + ` (${patientList.find(p => p.id === selectedVaultPatient)?.email || ''})`
                                    : '-- Choose a patient --'}
                                <Icon path="M19 9l-7 7-7-7" className={`w-4 h-4 transition-transform ${isVaultDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                            
                            {isVaultDropdownOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                                    background: 'var(--color-surface)', border: '1px solid var(--border)', borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: '250px', overflowY: 'auto'
                                }}>
                                    <div 
                                        onClick={() => {
                                            setSelectedVaultPatient('');
                                            setVaultDocs([]);
                                            setIsVaultDropdownOpen(false);
                                        }}
                                        style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}
                                    >
                                        -- Choose a patient --
                                    </div>
                                    {patientList.map(p => (
                                        <div 
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedVaultPatient(p.id);
                                                fetchVaultDocuments(p.id);
                                                setIsVaultDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '12px 16px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                                                background: selectedVaultPatient === p.id ? 'var(--color-accent)' : 'transparent',
                                                color: selectedVaultPatient === p.id ? 'white' : 'var(--color-text-primary)',
                                                borderBottom: '1px solid var(--border)'
                                            }}
                                            onMouseOver={(e) => {
                                                if (selectedVaultPatient !== p.id) e.currentTarget.style.background = 'var(--color-bg-secondary)';
                                            }}
                                            onMouseOut={(e) => {
                                                if (selectedVaultPatient !== p.id) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {p.name} <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({p.email})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {selectedVaultPatient && (
                        <label style={{ 
                            background: 'var(--color-primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', 
                            fontWeight: 700, cursor: isUploadingVault ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: isUploadingVault ? 0.7 : 1
                        }}>
                            {isUploadingVault ? 'Uploading...' : '+ Upload File'}
                            <input type="file" onChange={handleVaultUpload} style={{ display: 'none' }} disabled={isUploadingVault} />
                        </label>
                    )}
                </div>
            </div>

            {selectedVaultPatient && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {vaultDocs.length === 0 ? (
                         <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', background: 'var(--color-surface)', border: '1px dashed var(--border)', borderRadius: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                             No documents uploaded for this patient yet.
                         </div>
                    ) : (
                        vaultDocs.map(doc => (
                            <div key={doc.id} style={{ background: 'var(--color-surface)', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {doc.file_type?.includes('pdf') ? '📄' : '📷'}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <h5 style={{ margin: 0, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.file_name}</h5>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{(doc.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                    <button 
                                        onClick={async () => {
                                            const { data, error } = await supabase.storage.from('health-vault').createSignedUrl(doc.file_path, 60);
                                            if (data) window.open(data.signedUrl, '_blank');
                                        }}
                                        style={{ flex: 1, padding: '0.6rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer' }}
                                    >View</button>
                                    <button 
                                        onClick={() => deleteVaultDocument(doc.id, doc.file_path)}
                                        style={{ padding: '0.6rem', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}
                                    >🗑️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );

    // --- Main Layout ---
    if (isInitialLoading && !chartsLoaded) {
        return (
            <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HealaLoader fullScreen={false} />
            </div>
        );
    }

    return (
        <div id="dashboard-root" style={{
            '--color-bg': '#f8fafc',
            '--color-surface': '#ffffff',
            '--color-accent': '#14b8a6',
            '--color-text-primary': '#0f172a',
            '--color-text-muted': '#64748b',
            '--border': '#e2e8f0',
            '--gradient-primary': 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
            background: 'var(--color-bg)',
            color: 'var(--color-text-primary)',
            minHeight: '100vh',
            fontFamily: '"DM Sans", sans-serif',
            display: 'flex',
            overflow: 'hidden'
        }}>
            {/* Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@500;600;800&display=swap');
                
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
                ::-webkit-scrollbar-track { background: transparent; }

                .stat-card:hover { transform: translateY(-3px); }
                .nav-item {
                    isolation: isolate;
                    overflow: hidden;
                    border-radius: 12px;
                    margin: 0 0.75rem;
                    width: calc(100% - 1.5rem) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .nav-item:hover { background: rgba(0,0,0,0.03); }
                .nav-item.active { 
                    background: var(--gradient-primary); 
                    color: white !important;
                    box-shadow: 0 10px 20px rgba(8, 145, 178, 0.2);
                }
                .nav-item.collapsed-active {
                    width: 54px !important;
                    height: 54px !important;
                    border-radius: 16px !important;
                    background: var(--gradient-primary);
                    color: white !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    margin: 0 auto !important;
                    box-shadow: 0 8px 16px rgba(8, 145, 178, 0.2);
                }
                .nav-item.active svg { color: white !important; }
                .nav-item.active div { color: white !important; }
                
                @keyframes slideRight {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .brand-text { animation: slideRight 0.4s ease-out; }
                
                .glass-sidebar {
                    background: rgba(255, 255, 255, 0.8) !important;
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border-right: 1px solid rgba(255, 255, 255, 0.4) !important;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>

            {/* Sidebar */}
            <aside className="glass-sidebar" style={{
                width: sidebarCollapsed ? '100px' : '280px',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 100,
                flexShrink: 0,
                position: 'relative',
                boxShadow: '10px 0 40px rgba(0,0,0,0.03)'
            }}>
                <div style={{
                    padding: '2rem 1.5rem',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'all 0.4s ease'
                    }}>
                        <div style={{ 
                            width: '44px',
                            height: '44px',
                            background: 'var(--gradient-primary)', 
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(8, 145, 178, 0.25)',
                            flexShrink: 0,
                            transform: sidebarCollapsed ? 'scale(1.1)' : 'scale(1)'
                        }}>
                            <Icon path="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" className="text-white w-6 h-6" />
                        </div>
                        {!sidebarCollapsed && (
                            <span className="brand-text" style={{ 
                                fontWeight: 900, 
                                fontSize: '1.4rem', 
                                letterSpacing: '-1px',
                                color: 'var(--color-text-primary)',
                                fontFamily: '"Playfair Display", serif'
                            }}>Heala</span>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', scrollbarWidth: 'none' }}>
                    {['Overview', 'Clinical', 'Management'].map((section, idx) => (
                        <div key={section} style={{ marginBottom: '2rem' }}>
                            {!sidebarCollapsed && (
                                <p style={{
                                    padding: '0 2.25rem',
                                    marginBottom: '1rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 900,
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    opacity: 0.6
                                }}>{section}</p>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {navItems.slice(idx === 0 ? 0 : (idx === 1 ? 2 : 4), idx === 0 ? 2 : (idx === 1 ? 4 : 6)).map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActivePage(item.id)}
                                        className={`nav-item group ${activePage === item.id ? (sidebarCollapsed ? 'collapsed-active' : 'active') : ''}`}
                                        title={sidebarCollapsed ? item.label : ""}
                                        style={{
                                            height: '54px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                            gap: '1rem',
                                            background: activePage === item.id ? '' : 'transparent',
                                            border: 'none',
                                            color: activePage === item.id ? 'white' : 'var(--color-text-muted)',
                                            cursor: 'pointer',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ minWidth: '24px', transition: 'all 0.3s ease', transform: activePage === item.id ? 'scale(1.1)' : 'scale(1)' }}>
                                            <Icon path={item.icon} />
                                        </div>
                                        {!sidebarCollapsed && (
                                            <span style={{
                                                fontWeight: activePage === item.id ? 700 : 500,
                                                fontSize: '0.95rem',
                                                whiteSpace: 'nowrap'
                                            }}>{item.label}</span>
                                        )}
                                        {item.badge && (
                                            <div style={{ 
                                                position: sidebarCollapsed ? 'absolute' : 'static',
                                                top: sidebarCollapsed ? '10px' : 'auto',
                                                right: sidebarCollapsed ? '25px' : 'auto',
                                                marginLeft: sidebarCollapsed ? 0 : 'auto', 
                                                background: activePage === item.id ? 'white' : '#ef4444', 
                                                color: activePage === item.id ? 'var(--color-primary)' : 'white', 
                                                fontSize: sidebarCollapsed ? '8px' : '10px', 
                                                fontWeight: 900, 
                                                minWidth: sidebarCollapsed ? '16px' : 'auto',
                                                height: sidebarCollapsed ? '16px' : 'auto',
                                                padding: sidebarCollapsed ? '0' : '2px 8px', 
                                                borderRadius: '50px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)',
                                                border: sidebarCollapsed ? '2px solid white' : 'none'
                                            }}>{item.badge}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    padding: '1.5rem 1.25rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    background: sidebarCollapsed ? 'transparent' : 'rgba(0,0,20,0.02)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                    }}>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '14px', 
                            background: 'var(--gradient-primary)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 900, 
                            color: 'white', 
                            fontSize: '1rem', 
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)'
                        }} className="animate-pulse">
                            {(user?.name?.[0] || 'D')}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="brand-text" style={{ flex: 1, overflow: 'hidden' }}>
                                <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                                <p style={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0 }}>Clinical Admin</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Toggle Floating Button */}
                <button 
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    style={{
                        position: 'absolute',
                        right: '-16px',
                        top: '44px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'white',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        zIndex: 110,
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                >
                    <Icon 
                        path={sidebarCollapsed ? "M8.25 4.5l7.5 7.5-7.5 7.5" : "M15.75 19.5L8.25 12l7.5-7.5"} 
                        style={{ width: '14px', height: '14px', transition: 'transform 0.4s' }} 
                    />
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100vh', 
                position: 'relative',
                minWidth: 0,
                background: 'var(--color-bg)'
            }}>
                {/* Topbar */}
                <header style={{
                    height: '60px',
                    minHeight: '60px',
                    background: 'var(--color-bg)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 3rem',
                    zIndex: 40
                }}>
                    <div style={{ display: 'flex', flexDir: 'column' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
                            {navItems.find(i => i.id === activePage)?.label}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--color-text-muted)', position: 'relative' }}>
                            <div 
                                className="relative cursor-pointer hover:text-white transition-all duration-300"
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setHasUnreadNews(false);
                                }}
                                style={{ 
                                    padding: '8px', 
                                    borderRadius: '10px', 
                                    background: showNotifications ? 'rgba(8, 145, 178, 0.1)' : 'transparent',
                                    color: showNotifications ? 'var(--color-primary)' : 'inherit'
                                }}
                            >
                                <Icon path="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" className="w-6 h-6" />
                                {hasUnreadNews && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '6px', 
                                        right: '6px', 
                                        width: '10px', 
                                        height: '10px', 
                                        background: '#ef4444', 
                                        borderRadius: '50%',
                                        border: '2px solid var(--color-bg)',
                                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                                    }}></div>
                                )}
                            </div>

                            {/* Notification Panel */}
                            {showNotifications && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    marginTop: '1.5rem',
                                    width: '320px',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '18px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                    zIndex: 1000,
                                    overflow: 'hidden',
                                    animation: 'slideInTop 0.3s ease-out'
                                }}>
                                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(20, 184, 166, 0.05)' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Clinical Updates</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Real-time news from Admin</p>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {news.length > 0 ? news.map((item) => (
                                            <div key={item.id} style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-[rgba(0,0,0,0.02)]">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.category || 'NEWS'}</span>
                                                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h5 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 700 }}>{item.title}</h5>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{item.content}</p>
                                            </div>
                                        )) : (
                                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No clinical updates today.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <PageHeader
                        title={activePage === 'dashboard' ? 'Overview Analytics' : `${navItems.find(i => i.id === activePage)?.label} Portal`}
                        subtitle={activePage === 'dashboard' ? `Welcome back, ${user?.name || 'Practitioner'}. Here is your practice performance today.` : `Managing ${activePage} workflows and data.`}
                    />

                    {activePage === 'dashboard' && renderDashboard()}
                    {activePage === 'patients' && renderPatients()}
                    {activePage === 'schedule' && renderSchedule()}
                    {activePage === 'history' && renderHistory()}
                    {activePage === 'workhours' && renderWorkHours()}
                    {activePage === 'reports' && renderReports()}
                    {activePage === 'healthvault' && renderHealthVault()}
                    {activePage === 'profile' && renderProfile()}
                </div>
                
                {/* Prescription Modal */}
                {prescriptionModal.isOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
                        <div className="animate-in" style={{ width: '100%', maxWidth: '600px', background: 'var(--color-surface)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Playfair Display", serif', marginBottom: '1.5rem' }}>Write a Prescription?</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Diagnosis / Cause</label>
                                    <input value={prescriptionData.diagnosis} onChange={e => setPrescriptionData({...prescriptionData, diagnosis: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontWeight: 600 }} placeholder="E.g., Viral Fever" />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Medications</label>
                                    {prescriptionData.medications.map((med, idx) => (
                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <input value={med.name} onChange={e => { const m = [...prescriptionData.medications]; m[idx].name = e.target.value; setPrescriptionData({...prescriptionData, medications: m})}} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }} placeholder="Medicine Name" />
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <input value={med.duration} onChange={e => { const m = [...prescriptionData.medications]; m[idx].duration = e.target.value; setPrescriptionData({...prescriptionData, medications: m})}} style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }} placeholder="Days (e.g. 2)" />
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 2, minWidth: '240px' }}>
                                                    {['Morning', 'Afternoon', 'Evening', 'Night', '1-1-1', '1-0-1'].map(time => {
                                                        const isSelected = med.timings && med.timings.split(', ').includes(time);
                                                        return (
                                                            <button
                                                                key={time}
                                                                onClick={() => {
                                                                   const m = [...prescriptionData.medications];
                                                                   let timingsArr = m[idx].timings ? m[idx].timings.split(', ').filter(Boolean) : [];
                                                                   if (isSelected) timingsArr = timingsArr.filter(t => t !== time);
                                                                   else timingsArr.push(time);
                                                                   m[idx].timings = timingsArr.join(', ');
                                                                   setPrescriptionData({...prescriptionData, medications: m});
                                                                }}
                                                                style={{
                                                                    padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                                                                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--border)',
                                                                    background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                                                                    color: isSelected ? 'white' : 'var(--color-text-muted)'
                                                                }}
                                                            >{time}</button>
                                                        );
                                                    })}
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1, minWidth: '150px' }}>
                                                    {['After Food', 'Before Food'].map(f => {
                                                        const isSelected = med.food === f;
                                                        return (
                                                            <button
                                                                key={f}
                                                                onClick={() => {
                                                                   const m = [...prescriptionData.medications];
                                                                   m[idx].food = isSelected ? '' : f;
                                                                   setPrescriptionData({...prescriptionData, medications: m});
                                                                }}
                                                                style={{
                                                                    padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                                                                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--border)',
                                                                    background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                                                                    color: isSelected ? 'white' : 'var(--color-text-muted)'
                                                                }}
                                                            >{f}</button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setPrescriptionData({...prescriptionData, medications: [...prescriptionData.medications, { name: '', duration: '', food: 'After Food', timings: 'Morning' }]})} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>+ Add Medicine</button>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Extra Notes / Restrictions</label>
                                    <textarea value={prescriptionData.extraNotes} onChange={e => setPrescriptionData({...prescriptionData, extraNotes: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontWeight: 600, minHeight: '80px' }} placeholder="E.g., Drink plenty of water" />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Digital Signature (Doctor Name)</label>
                                    <input value={prescriptionData.signature} onChange={e => setPrescriptionData({...prescriptionData, signature: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontWeight: 600, fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }} placeholder={user?.name || "Dr. Signature"} />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => submitPrescription(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', fontWeight: 700, cursor: 'pointer', color: 'var(--color-text-muted)' }}>Skip (No Prescription)</button>
                                <button onClick={() => submitPrescription(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)' }}>Complete & Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModernDoctorDashboard;
