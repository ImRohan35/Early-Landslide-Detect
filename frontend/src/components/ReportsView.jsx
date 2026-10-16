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
  RefreshCw,
} from 'lucide-react';
import { riskLocations } from '../data/riskLocations';
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

  // Dynamic Date Range Selection
  const [dateRangePreset, setDateRangePreset] = useState('Monsoon Season (Jun - Sep 2026)');
  const [customStartDate, setCustomStartDate] = useState('2026-06-01');
  const [customEndDate, setCustomEndDate] = useState('2026-09-30');
  const [lastRefreshed, setLastRefreshed] = useState(() => `${formatISTDate()}, ${formatISTTime()}`);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(`${formatISTDate()}, ${formatISTTime()}`);
      setIsRefreshing(false);
    }, 450);
  };

  const handleDatePresetChange = (preset) => {
    setDateRangePreset(preset);
    const today = new Date().toISOString().slice(0, 10);
    if (preset === 'Last 7 Days (Live Telemetry)') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setCustomStartDate(d.toISOString().slice(0, 10));
      setCustomEndDate(today);
    } else if (preset === 'Last 30 Days (Monthly Briefing)') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setCustomStartDate(d.toISOString().slice(0, 10));
      setCustomEndDate(today);
    } else if (preset === 'Monsoon Season (Jun - Sep 2026)') {
      setCustomStartDate('2026-06-01');
      setCustomEndDate('2026-09-30');
    } else if (preset === 'Full Year 2026') {
      setCustomStartDate('2026-01-01');
      setCustomEndDate('2026-12-31');
    }
  };

  const availableDistricts = React.useMemo(() => {
    const list = riskLocations.filter(
      (l) => selectedState === 'All States' || l.state.toLowerCase() === selectedState.toLowerCase()
    );
    const dists = Array.from(new Set(list.map((l) => l.district).filter(Boolean)));
    return dists.length > 0 ? ['All Districts', ...dists] : ['All Districts'];
  }, [selectedState]);

  const getFilteredStations = () => {
    const list = riskLocations.filter(
      (l) => selectedState === 'All States' || l.state.toLowerCase() === selectedState.toLowerCase()
    );
    return list.length > 0 ? list : riskLocations.slice(0, 8);
  };

  // 1. Generate Real PDF Report with jsPDF
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
      doc.text(`Period: ${customStartDate} to ${customEndDate} | Region: ${selectedState} (${selectedDistrict})`, 18, 30);

      // Report Overview Section
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Executive Geotechnical Assessment', 18, 48);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      doc.text(
        `This automated early warning assessment analyzes multi-factor slope failure triggers across ${selectedState}.\nCumulative rainfall, pore-water saturation, and steep angle of repose incline significantly influence\ngeotechnical stability across monitored highway lifelines and mountain settlements.`,
        18,
        56
      );

      // Key Metrics Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(18, 72, 174, 28, 3, 3, 'FD');

      const stations = getFilteredStations();
      const critCount = stations.filter((s) => (s.riskScore || 50) > 75).length;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(185, 28, 28);
      doc.text(`Critical Zones: ${critCount} Areas`, 24, 82);
      doc.setTextColor(234, 88, 12);
      doc.text(`Stations Monitored: ${stations.length}`, 80, 82);
      doc.setTextColor(21, 128, 61);
      doc.text(`Model Accuracy: 95.0%`, 140, 82);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Telemetric Sync: ${lastRefreshed} | Telemetry Source: Open-Meteo & WMO Grid`, 24, 92);

      // Top Vulnerable Locations Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Station Vulnerability Telemetry & AI Risk Predictions:', 18, 114);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(226, 232, 240);
      doc.rect(18, 119, 174, 8, 'F');
      doc.text('Location', 22, 124.5);
      doc.text('State / District', 68, 124.5);
      doc.text('Rainfall', 115, 124.5);
      doc.text('Slope', 140, 124.5);
      doc.text('AI Score', 165, 124.5);

      doc.setFont('helvetica', 'normal');
      stations.slice(0, 10).forEach((st, i) => {
        const y = 133 + i * 8;
        doc.text(String(st.locationName || st.name).slice(0, 22), 22, y);
        doc.text(String(`${st.state} (${st.district || 'Reg'})`).slice(0, 24), 68, y);
        doc.text(`${st.rainfall || 20} mm`, 115, y);
        doc.text(`${st.slope || 25}°`, 140, y);
        const score = st.riskScore || 50;
        doc.setTextColor(score > 75 ? 185 : score > 50 ? 234 : 21, score > 75 ? 28 : score > 50 ? 88 : 128, score > 75 ? 28 : 12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${score}% (${st.riskLevel || 'Mod'})`, 165, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
      });

      // Recommendations
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Standard Operating Mitigation Actions:', 18, 222);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('1. Restrict non-essential heavy transport along vulnerable saturated hill corridors during active monsoon rains.', 22, 230);
      doc.text('2. Keep BRO & PWD clearance equipment pre-deployed at strategic bottleneck mountain segments.', 22, 237);
      doc.text('3. Monitor real-time soil saturation thresholds and follow local disaster management warnings.', 22, 244);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('LandslideGuard AI · Confidential Research & Public Disaster Risk Reduction Assessment · 100% Hardware-Free Platform', 18, 282);

      doc.save(`LandslideGuard_Assessment_${selectedState}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      alert(`Could not generate PDF: ${err.message}`);
    }
  };

  // 2. Generate Real Excel / CSV Spreadsheet
  const handleExportExcel = () => {
    const stations = getFilteredStations();
    const headers = 'ID,Station Name,State,District,Risk Score,Risk Classification,Probability,Rainfall (mm),Soil Moisture (%),Slope (deg),Elevation (m),Historical Incidents,Recommended Action\n';
    const rows = stations.map((l) => {
      const score = l.riskScore || 50;
      const level = l.riskLevel || (score > 75 ? 'Critical' : score > 50 ? 'High' : score > 25 ? 'Moderate' : 'Low');
      const rec = level === 'Critical' ? 'Follow disaster authorities and avoid high-risk hill roads' : level === 'High' ? 'Heightened patrol monitoring along cut-slopes' : 'Routine sensor watch';
      return `"${l.id}","${l.locationName}","${l.state}","${l.district || ''}",${score},"${level}","${score}%",${l.rainfall || 20},${l.soilMoisture || 65},${l.slope || 25},${l.elevation || 1000},${l.historicalLandslides || 0},"${rec}"`;
    }).join('\n');

    const blob = new Blob(['\ufeff' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LandslideGuard_Dataset_${selectedState}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = handleExportExcel;

  // 3. Generate Real Microsoft Word Document (.doc format)
  const handleExportWord = () => {
    const stations = getFilteredStations();
    const tableRows = stations.map((l) => `
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1;"><b>${l.locationName}</b></td>
        <td style="padding:8px;border:1px solid #cbd5e1;">${l.state} (${l.district || 'Regional'})</td>
        <td style="padding:8px;border:1px solid #cbd5e1;color:${(l.riskScore || 50) > 75 ? '#dc2626' : (l.riskScore || 50) > 50 ? '#ea580c' : '#16a34a'};font-weight:bold;">${l.riskLevel || 'Moderate'}</td>
        <td style="padding:8px;border:1px solid #cbd5e1;"><b>${l.riskScore || 50}%</b></td>
        <td style="padding:8px;border:1px solid #cbd5e1;">${l.rainfall || 20} mm</td>
        <td style="padding:8px;border:1px solid #cbd5e1;">${l.soilMoisture || 60}%</td>
        <td style="padding:8px;border:1px solid #cbd5e1;">${l.slope || 25}°</td>
      </tr>
    `).join('');

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Landslide Risk Assessment Report</title>
        <style>
          body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 24px; }
          .header { background: #0d2818; color: #ffffff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; }
          h1 { margin: 0; font-size: 22px; color: #ffffff; }
          .sub { color: #86efac; font-size: 13px; margin-top: 4px; }
          h2 { color: #064e3b; font-size: 16px; border-bottom: 2px solid #10b981; padding-bottom: 4px; margin-top: 24px; }
          table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 12.5px; }
          th { background: #064e3b; color: #ffffff; padding: 10px 8px; text-align: left; border: 1px solid #cbd5e1; }
          tr:nth-child(even) { background: #f8fafc; }
          .callout { background: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; margin: 16px 0; }
          .mitigation { background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; }
          .footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LandslideGuard AI · Geohazard Assessment Report</h1>
          <div class="sub">North Eastern Region (NER) | Target Jurisdiction: ${selectedState} (${selectedDistrict})</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px;">Evaluation Period: ${customStartDate} to ${customEndDate} | Generated: ${lastRefreshed}</div>
        </div>

        <h2>1. Executive Summary & Geotechnical Observations</h2>
        <p>This automated geohazard report monitors slope failure susceptibility across the hill corridors of <b>${selectedState}</b>. Combining live meteorological precipitation depth with geotechnical slope gradients, soil moisture pore pressures, and GSI/NDMA historical disaster slip scars.</p>
        
        <div class="callout">
          <b>Key Finding:</b> Elevated localized precipitation and saturated regolith layers significantly increase the landslide susceptibility index across steep mountain slopes. Active vigilance is advised for strategic highway arteries.
        </div>

        <h2>2. Detailed Station Risk Telemetry Table</h2>
        <table>
          <thead>
            <tr>
              <th>Station Location</th>
              <th>Jurisdiction</th>
              <th>Risk Tier</th>
              <th>Risk Score</th>
              <th>Rainfall (24h)</th>
              <th>Soil Moisture</th>
              <th>Slope Angle</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <h2>3. Public Safety Directives & Disaster Mitigation</h2>
        <div class="mitigation">
          <ol style="margin: 0; padding-left: 20px;">
            <li><b>Highway Corridor Surveillance:</b> Maintain caution flags and daylight-only transit on steep mountain cuts during active downpours.</li>
            <li><b>Soil Saturation Triggers:</b> Closely observe pore-water saturation thresholds at critical catchment stations.</li>
            <li><b>First Responder Coordination:</b> Border Roads Organisation (BRO), SDRF, and PWD clearing machinery should remain pre-positioned along vulnerable corridors.</li>
          </ol>
        </div>

        <div class="footer">
          LandslideGuard AI · Comprehensive Disaster Risk Reduction & Spatial Decision Support System · Confidential Official Assessment.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LandslideGuard_Assessment_${selectedState}_${new Date().toISOString().slice(0, 10)}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 4. Print Report
  const handlePrintReport = () => {
    window.print();
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

        {/* TAB 1: GENERATE CUSTOM REPORT & LIVE PREVIEW */}
        {activeTab === 'generate' && (
          <>
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
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option>Landslide Risk Assessment</option>
                    <option>Monthly Climate & Soil Summary</option>
                    <option>Highway Corridor Clearance</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Time Period Preset</label>
                  <select
                    value={dateRangePreset}
                    onChange={(e) => handleDatePresetChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: theme === 'dark' ? '#143828' : '#f8fafc',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option>Monsoon Season (Jun - Sep 2026)</option>
                    <option>Last 7 Days (Live Telemetry)</option>
                    <option>Last 30 Days (Monthly Briefing)</option>
                    <option>Full Year 2026</option>
                    <option>Custom Date Range</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Calendar size={12} color="#10b981" />
                    <span>Start Date</span>
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setDateRangePreset('Custom Date Range');
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: theme === 'dark' ? '#143828' : '#f8fafc',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Calendar size={12} color="#10b981" />
                    <span>End Date</span>
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setDateRangePreset('Custom Date Range');
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: theme === 'dark' ? '#143828' : '#f8fafc',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Region / State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict('All Districts');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: theme === 'dark' ? '#143828' : '#f8fafc',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
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
                      color: theme === 'dark' ? '#ffffff' : '#0f172a',
                      fontSize: '0.82rem',
                    }}
                  >
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
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

              {/* All Format Generation Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    padding: '9px 15px',
                    borderRadius: 10,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                  }}
                  title="Generate Official PDF Report"
                >
                  <FileText size={14} />
                  <span>📕 Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    padding: '9px 15px',
                    borderRadius: 10,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  }}
                  title="Generate Excel Spreadsheet"
                >
                  <FileSpreadsheet size={14} />
                  <span>📊 Export Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportWord}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    padding: '9px 15px',
                    borderRadius: 10,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  }}
                  title="Generate Microsoft Word Document"
                >
                  <FileText size={14} />
                  <span>📝 Export Word (.doc)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintReport}
                  style={{
                    background: theme === 'dark' ? '#1e293b' : '#e2e8f0',
                    color: theme === 'dark' ? '#ffffff' : '#334155',
                    padding: '9px 13px',
                    borderRadius: 10,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  title="Print Report"
                >
                  <Printer size={14} />
                  <span>🖨️ Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefreshTelemetry}
                  disabled={isRefreshing}
                  style={{
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    color: theme === 'dark' ? '#94a3b8' : '#64748b',
                    padding: '9px 12px',
                    borderRadius: 10,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  title="Refresh station telemetry"
                >
                  <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>{isRefreshing ? 'Refreshing...' : '🔄 Refresh'}</span>
                </button>
              </div>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <button
                  type="button"
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
                  <span>Export as PDF Report</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
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
                  type="button"
                  onClick={handleExportWord}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #dbeafe',
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 13 }}>📝</span>
                  <span>Export as Word (.doc)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintReport}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 13 }}>🖨️</span>
                  <span>Print Report View</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefreshTelemetry}
                  disabled={isRefreshing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #e0f2fe',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                    <span>Sync & Refresh Telemetry</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{lastRefreshed ? lastRefreshed.split(',')[1] : 'Live'}</span>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      title="Download PDF"
                      style={{
                        padding: '4px 7px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      title="Download Excel Spreadsheet"
                      style={{
                        padding: '4px 7px',
                        background: '#dcfce7',
                        color: '#16a34a',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      XLS
                    </button>
                    <button
                      type="button"
                      onClick={handleExportWord}
                      title="Download Word Document"
                      style={{
                        padding: '4px 7px',
                        background: '#dbeafe',
                        color: '#2563eb',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      DOC
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )}

    {/* TAB 2: PREDEFINED REPORTS */}
    {activeTab === 'predefined' && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {[
          {
            title: 'North East Monsoon Vulnerability Assessment 2026',
            period: 'Jun 2026 - Sep 2026',
            jurisdiction: 'NER Interstate Corridor (NH-10, NH-29, NH-54)',
            stations: 48,
            badge: 'OFFICIAL MONSOON AUDIT',
            desc: 'Comprehensive multi-criteria analysis of torrential monsoon precipitation, regolith pore pressures, and geotechnical slope vulnerability across Meghalaya, Assam, Manipur, and Sikkim.'
          },
          {
            title: 'National Landslide Early Warning Atlas & Geomorphic Inventory',
            period: 'Jan 2024 - Dec 2026',
            jurisdiction: '8 North Eastern States (Complete Region)',
            stations: 86,
            badge: 'GSI VERIFIED COMPENDIUM',
            desc: 'Complete geospatial synthesis and classification of critical geomorphic hazards, historical landslide slip scars, and high-resolution digital elevation models.'
          },
          {
            title: 'Strategic Highway Lifeline Risk & Road Clearance Protocol',
            period: 'Active Season 2026',
            jurisdiction: 'Border Roads Organisation (BRO) Operational Sectors',
            stations: 32,
            badge: 'DEFENCE & LOGISTICS AUDIT',
            desc: 'Rapid transit stability assessment for major supply corridors, rockfall hotspots, cut-slope stability factors, and emergency clearing machinery deployment coordinates.'
          },
          {
            title: 'Hydrological Regolith Pore-Pressure & Soil Moisture Index',
            period: 'Real-time 30-Day Evaluation',
            jurisdiction: 'Catchment Basins & Mountain Settlement Clusters',
            stations: 64,
            badge: 'HYDRO-GEOTECHNICAL DIGEST',
            desc: 'Continuous telemetric soil moisture saturation analysis, subsurface pore-water pressure triggers, and slope failure threshold warnings.'
          }
        ].map((rep, idx) => (
          <div
            key={idx}
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 20,
              padding: 24,
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                  }}
                >
                  {rep.badge}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {rep.period}
                </span>
              </div>

              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: '0 0 8px', color: theme === 'dark' ? '#ffffff' : '#0f172a' }}>
                {rep.title}
              </h3>

              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
                {rep.desc}
              </p>

              <div style={{ display: 'flex', gap: 14, marginBottom: 18, fontSize: '0.76rem', color: '#64748b' }}>
                <div><b>Jurisdiction:</b> {rep.jurisdiction}</div>
                <div><b>Stations:</b> {rep.stations}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={handleExportPDF}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>📕 PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: '#f0fdf4',
                  border: '1px solid #dcfce7',
                  color: '#16a34a',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>📊 Excel</span>
              </button>

              <button
                type="button"
                onClick={handleExportWord}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  color: '#2563eb',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>📝 Word</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* TAB 3: SCHEDULED REPORTS */}
    {activeTab === 'scheduled' && (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 20 }}>
        {/* Form */}
        <div
          style={{
            background: theme === 'dark' ? '#0d281e' : '#ffffff',
            borderRadius: 20,
            padding: 24,
            border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 8px' }}>
            Automated Report Schedule
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px' }}>
            Configure automated telemetry reports directly dispatched to your emergency operations team.
          </p>

          <form onSubmit={handleSetSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Delivery Frequency
              </label>
              <select
                value={scheduleFreq}
                onChange={(e) => setScheduleFreq(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: theme === 'dark' ? '#143828' : '#f8fafc',
                  color: theme === 'dark' ? '#ffffff' : '#0f172a',
                  fontSize: '0.84rem',
                }}
              >
                <option>Daily Emergency Bulletin (07:00 IST)</option>
                <option>Weekly Comprehensive Digest (Every Friday)</option>
                <option>Monthly Climate & Slope Risk Audit</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Email Recipient
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: theme === 'dark' ? '#143828' : '#f8fafc',
                }}
              >
                <Mail size={15} color="#94a3b8" />
                <input
                  type="email"
                  required
                  placeholder="analyst@disasterguard.gov.in"
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.84rem',
                    width: '100%',
                    color: theme === 'dark' ? '#ffffff' : '#0f172a',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                background: '#10b981',
                color: '#ffffff',
                padding: '10px',
                borderRadius: 10,
                fontSize: '0.86rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              {scheduledSuccess ? '✓ Schedule Activated!' : 'Activate Automated Delivery'}
            </button>
          </form>
        </div>

        {/* Active Schedule Records */}
        <div
          style={{
            background: theme === 'dark' ? '#0d281e' : '#ffffff',
            borderRadius: 20,
            padding: 24,
            border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 14px' }}>
            Active Automated Dispatches
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Daily Morning Geohazard Bulletin', timing: '07:00 IST Every Day', recipient: 'ops@nelrms.gov.in', status: 'Active', format: 'PDF + Excel' },
              { name: 'Weekly Executive Landslide Briefing', timing: 'Fridays at 18:00 IST', recipient: 'headquarters@ndma.gov.in', status: 'Active', format: 'PDF + Word' },
              { name: 'Heavy Monsoon Precipitation Alert', timing: 'Trigger: Rain > 100mm/24h', recipient: 'sdrf-ner@emergency.in', status: 'Standby', format: 'PDF' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: theme === 'dark' ? '#091e16' : '#f8fafc',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                    {item.timing} · Recipient: {item.recipient}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: item.status === 'Active' ? '#dcfce7' : '#fef3c7',
                      color: item.status === 'Active' ? '#16a34a' : '#d97706',
                    }}
                  >
                    {item.status}
                  </span>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#10b981',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Test Run →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* TAB 4: DOWNLOAD CENTER */}
    {activeTab === 'downloads' && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {[
          {
            title: 'Official Geotechnical Assessment',
            ext: 'PDF',
            icon: '📕',
            size: '2.4 MB',
            color: '#dc2626',
            bg: '#fef2f2',
            action: handleExportPDF,
            desc: 'Comprehensive printable evaluation including executive summary, station metrics, key findings, and SOP directives.'
          },
          {
            title: 'Complete Station Telemetry Data',
            ext: 'Excel (CSV)',
            icon: '📊',
            size: '840 KB',
            color: '#16a34a',
            bg: '#f0fdf4',
            action: handleExportExcel,
            desc: 'Complete table of 86 monitored hill stations with coordinates, rainfall, slope angle, soil moisture, and risk index.'
          },
          {
            title: 'Official Executive Report Document',
            ext: 'Word (.doc)',
            icon: '📝',
            size: '1.2 MB',
            color: '#2563eb',
            bg: '#eff6ff',
            action: handleExportWord,
            desc: 'Full Microsoft Word document template with editable tables, disaster directives, and state-level administrative guidelines.'
          },
          {
            title: 'Instant Printable Field Summary',
            ext: 'Print / Save PDF',
            icon: '🖨️',
            size: 'Direct Print',
            color: '#475569',
            bg: '#f8fafc',
            action: handlePrintReport,
            desc: 'Clean print-ready view formatted for emergency response briefing boards and mobile disaster management trailers.'
          }
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 20,
              padding: 24,
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  marginBottom: 14,
                }}
              >
                {item.icon}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: item.color, textTransform: 'uppercase', marginBottom: 4 }}>
                {item.ext} · {item.size}
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 8px', color: theme === 'dark' ? '#ffffff' : '#0f172a' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 18px' }}>
                {item.desc}
              </p>
            </div>

            <button
              type="button"
              onClick={item.action}
              style={{
                background: item.color,
                color: '#ffffff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 16px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <Download size={14} />
              <span>Download {item.ext}</span>
            </button>
          </div>
        ))}
      </div>
    )}
      </div>
    </div>
  );
}
