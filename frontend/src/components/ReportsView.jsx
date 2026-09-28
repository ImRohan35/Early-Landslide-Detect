import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  MapPin,
  Download,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Printer,
  Share2,
  Clock,
  Layers,
  BarChart3,
  FileSpreadsheet,
  Image,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts';
import { jsPDF } from 'jspdf';
import { formatISTDate, formatISTTime } from '../services/weather';

// Safe constructor for jsPDF in both ESM and CJS bundle environments
function createPdfDoc(options) {
  if (typeof jsPDF === 'function') {
    return new jsPDF(options);
  }
  if (jsPDF && typeof jsPDF.jsPDF === 'function') {
    return new jsPDF.jsPDF(options);
  }
  if (jsPDF && typeof jsPDF.default === 'function') {
    return new jsPDF.default(options);
  }
  throw new Error('jsPDF library constructor is unavailable');
}

// Donut data matching Image 7
const DONUT_DATA = [
  { name: 'Low', count: 35, pct: '51%', color: '#10b981' },
  { name: 'Moderate', count: 18, pct: '26%', color: '#eab308' },
  { name: 'High', count: 10, pct: '15%', color: '#f97316' },
  { name: 'Critical', count: 5, pct: '8%', color: '#ef4444' },
];

// Top 5 High-Risk Locations matching Image 7
const TOP_5_LOCS = [
  { name: 'Cherrapunji', score: 92, color: '#ef4444' },
  { name: 'Mawsynram', score: 88, color: '#ef4444' },
  { name: 'Nongstoin', score: 76, color: '#f97316' },
  { name: 'Tura', score: 68, color: '#f97316' },
  { name: 'Jowai', score: 62, color: '#eab308' },
];

// Rainfall vs Risk Trend matching Image 7
const RAIN_VS_RISK = [
  { month: 'Jun', rain: 120, risk: 45 },
  { month: 'Jul', rain: 210, risk: 65 },
  { month: 'Aug', rain: 260, risk: 85 },
  { month: 'Sep', rain: 180, risk: 72 },
];

export default function ReportsView({
  theme = 'light',
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'predefined' | 'scheduled' | 'downloads'
  const [previewTab, setPreviewTab] = useState('Summary');
  const [reportType, setReportType] = useState('Landslide Risk Assessment');
  const [selectedState, setSelectedState] = useState('Meghalaya');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [scheduleFreq, setScheduleFreq] = useState('Weekly Report');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  // Checkbox states
  const [includeData, setIncludeData] = useState({
    weather: true,
    soil: true,
    slope: true,
    history: true,
    prediction: true,
    maps: true,
  });

  const handleToggleInclude = (key) => {
    setIncludeData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Generate Real PDF Report with jsPDF
  const handleExportPDF = () => {
    try {
      const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      // Header Banner
      doc.setFillColor(13, 40, 24);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('LandslideGuard AI', 18, 16);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(134, 239, 172);
      doc.text('Early Warning & Geohazard Risk Assessment · North East India', 18, 23);

      doc.setTextColor(203, 213, 225);
      doc.text(`Generated: ${formatISTDate()} | Region: ${selectedState} (${selectedDistrict})`, 18, 30);

      // Report Overview Section
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Executive Risk Summary', 18, 50);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(
        'Continuous torrential orographic precipitation and acute soil saturation have significantly elevated\nlandslide hazard across steep cut-slopes, primarily along Cherrapunji, Mawsynram, and Nongstoin escarpments.',
        18,
        58
      );

      // Key Metrics Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(18, 72, 174, 30, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(185, 28, 28);
      doc.text('High-Risk Clusters: 12 Areas', 24, 82);
      doc.setTextColor(234, 88, 12);
      doc.text('Districts Monitored: 4 Covered', 80, 82);
      doc.setTextColor(21, 128, 61);
      doc.text('System Completeness: 98.5%', 140, 82);

      // Top Vulnerable Locations Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Top 5 High-Risk Stations:', 18, 118);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(226, 232, 240);
      doc.rect(18, 124, 174, 8, 'F');
      doc.text('Location', 22, 129);
      doc.text('State', 70, 129);
      doc.text('Risk Score', 115, 129);
      doc.text('Hazard Classification', 150, 129);

      const tableData = [
        ['Cherrapunji', 'Meghalaya', '92 / 100', 'CRITICAL'],
        ['Mawsynram', 'Meghalaya', '88 / 100', 'CRITICAL'],
        ['Nongstoin', 'Meghalaya', '76 / 100', 'HIGH'],
        ['Tura Escarpment', 'Meghalaya', '68 / 100', 'HIGH'],
        ['Jowai Bypass', 'Meghalaya', '62 / 100', 'MODERATE'],
      ];

      doc.setFont('helvetica', 'normal');
      tableData.forEach((row, i) => {
        const y = 138 + i * 8;
        doc.text(row[0], 22, y);
        doc.text(row[1], 70, y);
        doc.text(row[2], 115, y);
        doc.text(row[3], 150, y);
      });

      // Recommendations
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Recommended Actions & Mitigation:', 18, 188);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text('1. Restrict non-essential vehicular movement along saturated highway slopes (NH-6 & NH-10).', 22, 196);
      doc.text('2. Activate SDRF & village community disaster surveillance volunteers in critical talus zones.', 22, 203);
      doc.text('3. Monitor real-time pore-water pressure changes with automated piezometric telemetry.', 22, 210);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('LandslideGuard AI · Confidential Research & Public Disaster Risk Reduction Assessment', 18, 280);

      doc.save(`Landslide_Risk_Report_${selectedState}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      alert(`Could not generate PDF: ${err.message}`);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent =
      'Location,State,RiskScore,Classification,Rainfall_mm,Soil_Moisture_pct\n' +
      'Cherrapunji,Meghalaya,92,CRITICAL,380,95\n' +
      'Mawsynram,Meghalaya,88,CRITICAL,360,92\n' +
      'Nongstoin,Meghalaya,76,HIGH,210,84\n' +
      'Tura,Meghalaya,68,HIGH,180,82\n' +
      'Jowai,Meghalaya,62,MODERATE,140,75\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Landslide_Risk_Data_${selectedState}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetSchedule = (e) => {
    e.preventDefault();
    if (!scheduleEmail) {
      alert('Please enter a valid email address.');
      return;
    }
    setScheduledSuccess(true);
    setTimeout(() => setScheduledSuccess(false), 4000);
  };

  return (
    <div
      style={{
        background: theme === 'dark' ? '#071610' : '#f8faf9',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        padding: '24px 28px 48px',
        minHeight: 'calc(100vh - 64px)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        {/* Header Row with Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: theme === 'dark' ? '#ffffff' : '#0d2818',
                margin: '0 0 4px',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Reports & <span style={{ color: '#10b981' }}>Insights</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
              Generate detailed reports on landslide risk, environmental data and analysis results.
            </p>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('Home')}>Home</span> &gt; <span style={{ color: '#10b981', fontWeight: 600 }}>Reports</span>
          </div>
        </div>

        {/* Segmented Top Bar Matching Image 7 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
            padding: 4,
            borderRadius: 12,
            marginBottom: 20,
            width: 'fit-content',
          }}
        >
          {[
            { id: 'generate', label: 'Generate Report', icon: FileText },
            { id: 'predefined', label: 'Predefined Reports', icon: FileSpreadsheet },
            { id: 'scheduled', label: 'Scheduled Reports', icon: Clock },
            { id: 'downloads', label: 'Download Center', icon: Download },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: isActive ? '#2d6a4f' : 'transparent',
                  color: isActive ? '#ffffff' : theme === 'dark' ? '#cbd5e1' : '#475569',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(45, 106, 79, 0.4)' : 'none',
                }}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Top Section: Generate Custom Report (Left) + Quick Export & Scheduled Reports (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 380px)',
            gap: 20,
            marginBottom: 24,
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {/* Generate Custom Report Box */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 20,
              padding: '22px 24px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(180px, 220px)',
              gap: 20,
              alignItems: 'center',
            }}
          >
            {/* Form Left */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <FileText size={18} color="#10b981" />
                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0 }}>
                  Generate Custom Report
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: theme === 'dark' ? '#143828' : '#f8fafc',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option>Landslide Risk Assessment</option>
                    <option>Monthly Climate & Soil Summary</option>
                    <option>Highway Corridor Clearance</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Time Period</label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: theme === 'dark' ? '#143828' : '#f8fafc',
                      fontSize: '0.8rem',
                    }}
                  >
                    <Calendar size={13} color="#10b981" />
                    <span>01 Jun 2026 - 30 Sep 2026</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Region / Location</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: theme === 'dark' ? '#143828' : '#f8fafc',
                      fontSize: '0.82rem',
                    }}
                  >
                    {['Meghalaya', 'Assam', 'Arunachal Pradesh', 'Manipur', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: theme === 'dark' ? '#143828' : '#f8fafc',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option>All Districts</option>
                    <option>East Khasi Hills</option>
                    <option>West Khasi Hills</option>
                    <option>Ri Bhoi</option>
                    <option>Garo Hills</option>
                  </select>
                </div>
              </div>

              {/* Include Data Checkboxes */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>Include Data</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: '0.74rem' }}>
                  {[
                    { key: 'weather', label: 'Weather Data' },
                    { key: 'soil', label: 'Soil Moisture' },
                    { key: 'slope', label: 'Slope & Terrain' },
                    { key: 'history', label: 'Historical Events' },
                    { key: 'prediction', label: 'Risk Prediction' },
                    { key: 'maps', label: 'Maps & Visualizations' },
                  ].map((chk) => (
                    <label key={chk.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={includeData[chk.key]}
                        onChange={() => handleToggleInclude(chk.key)}
                        style={{ accentColor: '#10b981' }}
                      />
                      <span>{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate CTA Button */}
              <button
                onClick={handleExportPDF}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  padding: '10px 22px',
                  borderRadius: 10,
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
              >
                <FileText size={15} />
                <span>Generate Report →</span>
              </button>
            </div>

            {/* Document Preview Mockup Illustration matching Image 7 */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 175,
                  margin: '0 auto',
                  background: '#ffffff',
                  borderRadius: 12,
                  boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                  border: '1px solid #cbd5e1',
                  overflow: 'hidden',
                  textAlign: 'left',
                }}
              >
                {/* Document Cover Header */}
                <div style={{ padding: '8px 12px', background: '#0d2818', color: '#ffffff', fontSize: '0.62rem', fontWeight: 800 }}>
                  LandslideGuard AI
                </div>

                {/* Scenic Mountain Image */}
                <div
                  style={{
                    height: 85,
                    backgroundImage: `url('/meghalaya-hills.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />

                {/* Document Title */}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    Landslide Risk Analysis Report
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: 4 }}>
                    Meghalaya, North Eastern Region
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: 2 }}>
                    Jun 2026 - Sep 2026
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Export (Top) + Scheduled Reports (Bottom) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick Export Card */}
            <div
              style={{
                background: theme === 'dark' ? '#0d281e' : '#ffffff',
                borderRadius: 20,
                padding: '18px 20px',
                border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Download size={16} color="#10b981" />
                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0 }}>
                  Quick Export
                </h3>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: '#64748b' }}>
                Download reports in your preferred format.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={handleExportPDF}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 13 }}>📕</span>
                  <span>Export as PDF</span>
                </button>

                <button
                  onClick={handleDownloadCSV}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #dcfce7',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 13 }}>📊</span>
                  <span>Export as Excel (CSV)</span>
                </button>

                <button
                  onClick={() => alert('Exporting spatial map imagery...')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #e0f2fe',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 13 }}>🖼️</span>
                  <span>Export Maps as Image</span>
                </button>

                <button
                  onClick={() => alert('Exporting charts as PNG...')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #ffedd5',
                    background: '#fff7ed',
                    color: '#ea580c',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 13 }}>📈</span>
                  <span>Export Charts (PNG)</span>
                </button>
              </div>
            </div>

            {/* Scheduled Reports Card */}
            <div
              style={{
                background: theme === 'dark' ? '#0d281e' : '#ffffff',
                borderRadius: 20,
                padding: '18px 20px',
                border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Clock size={16} color="#10b981" />
                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0 }}>
                  Scheduled Reports
                </h3>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: '#64748b' }}>
                Set up automatic reports via email.
              </p>

              <form onSubmit={handleSetSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  value={scheduleFreq}
                  onChange={(e) => setScheduleFreq(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: theme === 'dark' ? '#143828' : '#f8fafc',
                    fontSize: '0.8rem',
                  }}
                >
                  <option>Weekly Report</option>
                  <option>Daily Emergency Bulletin</option>
                  <option>Monthly Climate Digest</option>
                </select>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: theme === 'dark' ? '#143828' : '#f8fafc',
                  }}
                >
                  <Mail size={14} color="#94a3b8" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={scheduleEmail}
                    onChange={(e) => setScheduleEmail(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '0.8rem',
                      width: '100%',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#2d6a4f',
                    color: '#ffffff',
                    padding: '8px',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {scheduledSuccess ? '✓ Schedule Activated!' : 'Set Schedule'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section: Report Preview (Left) + Recent Reports (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 380px)',
            gap: 20,
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {/* Report Preview Card */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 20,
              padding: '22px 24px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            {/* Top Row with Pills & Timestamp */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {['Summary', 'Risk Map', 'Charts', 'Key Findings', 'Recommendations'].map((p) => {
                  const isSel = previewTab === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPreviewTab(p)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: isSel ? '#2d6a4f' : 'transparent',
                        color: isSel ? '#ffffff' : '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: isSel ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Last Updated: {formatISTDate()}, {formatISTTime()}
              </div>
            </div>

            {/* 4 Mini KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div style={{ background: theme === 'dark' ? '#091e16' : '#f8fafc', padding: '10px 12px', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444' }}>
                  <AlertTriangle size={15} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>12</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>High Risk Areas</div>
              </div>

              <div style={{ background: theme === 'dark' ? '#091e16' : '#f8fafc', padding: '10px 12px', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
                  <MapPin size={15} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>4</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Districts Covered</div>
              </div>

              <div style={{ background: theme === 'dark' ? '#091e16' : '#f8fafc', padding: '10px 12px', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3b82f6' }}>
                  <Layers size={15} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>86</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Locations Analyzed</div>
              </div>

              <div style={{ background: theme === 'dark' ? '#091e16' : '#f8fafc', padding: '10px 12px', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}>
                  <CheckCircle2 size={15} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>98.5%</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Data Completeness</div>
              </div>
            </div>

            {/* 3 Mini Charts Grid Matching Image 7 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 0.9fr) minmax(180px, 1.1fr) minmax(180px, 1.1fr)',
                gap: 12,
                marginBottom: 14,
              }}
            >
              {/* Risk Distribution Donut */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>Risk Distribution</div>
                <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DONUT_DATA} dataKey="count" innerRadius={28} outerRadius={42} paddingAngle={2}>
                        {DONUT_DATA.map((e, idx) => (
                          <Cell key={idx} fill={e.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.92rem', fontWeight: 900 }}>68</span>
                    <span style={{ fontSize: '0.52rem', color: '#94a3b8' }}>Total Locations</span>
                  </div>
                </div>
              </div>

              {/* Top 5 High-Risk Locations */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>Top 5 High-Risk Locations</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {TOP_5_LOCS.map((loc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.7rem' }}>
                      <span style={{ width: 65, color: '#64748b', whiteSpace: 'nowrap' }}>{loc.name}</span>
                      <div style={{ flex: 1, background: '#f1f5f9', height: 7, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${loc.score}%`, height: '100%', background: loc.color }} />
                      </div>
                      <span style={{ fontWeight: 800, width: 20, textAlign: 'right' }}>{loc.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rainfall vs Risk Trend */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>Rainfall vs Risk Trend</div>
                <div style={{ width: '100%', height: 90 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={RAIN_VS_RISK} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 8 }} />
                      <Bar dataKey="rain" fill="#93c5fd" radius={[2, 2, 0, 0]} barSize={10} />
                      <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Key Insight Callout Box */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <Lightbulb size={17} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#92400e', marginRight: 6 }}>
                  Key Insight
                </span>
                <span style={{ fontSize: '0.74rem', color: '#b45309', lineHeight: 1.4 }}>
                  Continuous heavy rainfall and high soil moisture levels in Meghalaya have significantly increased the landslide risk, particularly in Cherrapunji and Mawsynram. Monitoring and early warning measures are strongly recommended.
                </span>
              </div>
            </div>
          </div>

          {/* Recent Reports List */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 20,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#10b981', fontSize: '1rem' }}>📑</span>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0 }}>
                  Recent Reports
                </h3>
              </div>
              <button
                onClick={handleExportPDF}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View All →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { title: 'Meghalaya Risk Analysis', date: '17 Sep 2026', type: 'pdf' },
                { title: 'NER Monthly Summary', date: '01 Sep 2026', type: 'excel' },
                { title: 'Heavy Rainfall Impact', date: '20 Aug 2026', type: 'pdf' },
                { title: 'District-wise Risk Map', date: '05 Aug 2026', type: 'excel' },
                { title: 'Historical Trend Analysis', date: '01 Jul 2026', type: 'pdf' },
              ].map((rep, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: theme === 'dark' ? '#091e16' : '#f8fafc',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: rep.type === 'pdf' ? '#fee2e2' : '#dcfce7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      {rep.type === 'pdf' ? '📕' : '📊'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{rep.title}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{rep.date}</div>
                    </div>
                  </div>

                  <button
                    onClick={rep.type === 'pdf' ? handleExportPDF : handleDownloadCSV}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'transparent',
                      border: 'none',
                      color: '#ea580c',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
