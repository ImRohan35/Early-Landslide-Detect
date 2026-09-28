import React, { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Image as ImageIcon,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Upload,
  User,
  Video,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { submitIncidentApi, updateIncidentStatusApi } from '../services/api';
import { translations } from '../i18n/translations';

const REPORT_TYPES = [
  'Landslide',
  'Slope Crack',
  'Road Blockage',
  'Falling Rocks',
  'Soil Movement',
  'Other',
];

const STATUS_OPTIONS = ['Pending', 'Under Review', 'Verified', 'Resolved'];

const INITIAL_INCIDENTS = [
  {
    id: 'REP-2026-842',
    location_name: 'NH-10 Mile 32 Corridor',
    district: 'East Sikkim',
    state: 'Sikkim',
    report_type: 'Landslide',
    description: 'Fresh debris slide of loose boulders and slurry mud blocking 1.5 lanes. BRO clearing operations underway with heavy machinery.',
    photo_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    reporter_name: 'Pema Bhutia (BRO Patrol Officer)',
    status: 'Verified',
    risk_priority: 'Critical',
    created_at: '27 Sep 2026, 04:15 PM IST',
  },
  {
    id: 'REP-2026-619',
    location_name: 'Haflong Hill Section Km 48',
    district: 'Dima Hasao',
    state: 'Assam',
    report_type: 'Slope Crack',
    description: 'Longitudinal ground tension cracks observed along retaining wall after continuous torrential rainfall. Potential slide hazard for railway line.',
    photo_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    reporter_name: 'R. K. Hmar (Local PWD Volunteer)',
    status: 'Under Review',
    risk_priority: 'High',
    created_at: '27 Sep 2026, 02:40 PM IST',
  },
  {
    id: 'REP-2026-405',
    location_name: 'Chumukedima Cut-Off, NH-29',
    district: 'Dimapur',
    state: 'Nagaland',
    report_type: 'Road Blockage',
    description: 'Intermittent falling rocks and mud flow onto roadway. Traffic diverted to single lane with caution flags by district administration.',
    photo_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    reporter_name: 'Traffic Police Post Chumukedima',
    status: 'Resolved',
    risk_priority: 'Moderate',
    created_at: '27 Sep 2026, 11:20 AM IST',
  },
  {
    id: 'REP-2026-312',
    location_name: 'Sohra Gorge Overlook',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    report_type: 'Soil Movement',
    description: 'Subsurface mud creep and tilting trees noticed near road culvert. Precautionary warning signs posted by local village council.',
    photo_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    reporter_name: 'M. Syiem (Dorbar Shnong)',
    status: 'Pending',
    risk_priority: 'Moderate',
    created_at: '27 Sep 2026, 09:50 AM IST',
  },
];

export default function IncidentReportsView({
  incidents = [],
  t,
  lang = 'en',
  onToast,
  theme = 'light',
}) {
  const trans = t?.incidents ? t : translations[lang] || translations.en;
  const isDark = theme === 'dark';

  const [reportList, setReportList] = useState(() => {
    return incidents && incidents.length > 0 ? incidents : INITIAL_INCIDENTS;
  });

  const [activeTab, setActiveTab] = useState('directory'); // 'directory' or 'submit'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [locationName, setLocationName] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Assam');
  const [reportType, setReportType] = useState('Landslide');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [riskPriority, setRiskPriority] = useState('High');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected report for inspection modal
  const [inspectReport, setInspectReport] = useState(null);

  const sampleImages = [
    { label: 'Mudslide', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
    { label: 'Rockfall', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80' },
    { label: 'Road Breach', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
  ];

  const handlePhotoUploadSimulation = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationName.trim() || !description.trim()) {
      onToast?.('Please provide location name and description.', 'error');
      return;
    }

    setIsSubmitting(true);
    const newReport = {
      id: `REP-2026-${Math.floor(100 + Math.random() * 900)}`,
      location_name: locationName.trim(),
      district: district.trim() || 'Central Sector',
      state: state,
      report_type: reportType,
      description: description.trim(),
      photo_url: photoUrl || sampleImages[0].url,
      reporter_name: reporterName.trim() || 'Citizen Volunteer',
      status: 'Pending',
      risk_priority: riskPriority,
      created_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST',
    };

    try {
      await submitIncidentApi(newReport);
      setReportList([newReport, ...reportList]);
      onToast?.('Incident report submitted successfully to emergency dispatch!', 'success');

      // Reset form
      setLocationName('');
      setDistrict('');
      setDescription('');
      setPhotoUrl('');
      setVideoUrl('');
      setReporterName('');
      setActiveTab('directory');
    } catch {
      onToast?.('Failed to submit incident report.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    const updated = reportList.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r));
    setReportList(updated);
    await updateIncidentStatusApi(reportId, newStatus).catch(() => {});
    onToast?.(`Report ${reportId} updated to "${newStatus}"`, 'info');
  };

  const filteredReports = reportList.filter((r) => {
    const matchStatus = selectedStatusFilter === 'All' || r.status === selectedStatusFilter;
    const matchType = selectedTypeFilter === 'All' || r.report_type === selectedTypeFilter;
    const matchSearch =
      !searchQuery.trim() ||
      r.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const getPriorityColor = (priority) => {
    if (priority === 'Critical') return '#ef4444';
    if (priority === 'High') return '#f97316';
    if (priority === 'Moderate') return '#eab308';
    return '#22c55e';
  };

  const getStatusColor = (status) => {
    if (status === 'Verified') return '#10b981';
    if (status === 'Resolved') return '#3b82f6';
    if (status === 'Under Review') return '#f59e0b';
    return '#64748b';
  };

  return (
    <div
      style={{
        background: isDark ? '#071610' : '#f8faf9',
        color: isDark ? '#f1f5f9' : '#0f172a',
        padding: '24px 28px 60px',
        minHeight: 'calc(100vh - 64px)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(234, 88, 12, 0.12)',
                color: '#ea580c',
                padding: '3px 10px',
                borderRadius: 9999,
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              <Camera size={13} />
              <span>Crowdsourced Ground Surveillance & Reporting</span>
            </div>
            <h1
              style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#0d2818',
                margin: '0 0 6px',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Community Ground Reports
            </h1>
            <p
              style={{
                fontSize: '0.92rem',
                color: isDark ? '#94a3b8' : '#64748b',
                margin: 0,
              }}
            >
              Real-time field incident alerts, slope fractures, rockfall warnings, and highway blockages submitted by local citizens and patrol units.
            </p>
          </div>

          {/* Tab Navigation Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? '#0d281e' : '#ffffff',
              padding: 4,
              borderRadius: 14,
              border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <button
              onClick={() => setActiveTab('directory')}
              style={{
                background: activeTab === 'directory' ? '#0d281e' : 'transparent',
                color: activeTab === 'directory' ? '#34d399' : isDark ? '#94a3b8' : '#64748b',
                border: activeTab === 'directory' ? '1px solid rgba(52, 211, 153, 0.4)' : 'none',
                borderRadius: 10,
                padding: '9px 18px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <FileText size={15} />
              <span>Incident Directory ({reportList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              style={{
                background: activeTab === 'submit' ? '#ea580c' : 'transparent',
                color: activeTab === 'submit' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
                border: 'none',
                borderRadius: 10,
                padding: '9px 18px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: activeTab === 'submit' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
              }}
            >
              <PlusCircle size={15} />
              <span>Submit Ground Report</span>
            </button>
          </div>
        </div>

        {activeTab === 'submit' ? (
          /* Report Submission Form */
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div
              style={{
                background: isDark ? '#0d281e' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
                borderRadius: 20,
                padding: '30px 32px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ marginBottom: 22, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`, paddingBottom: 16 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', fontFamily: "'Outfit', sans-serif" }}>
                  Submit Ground Incident Report
                </h2>
                <p style={{ fontSize: '0.84rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                  Upload verified ground evidence to alert disaster management authorities and road clearance teams.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Location Name & District */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      Location / Landmark Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near Chumukedima Gate, NH-29"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1'}`,
                        background: isDark ? '#071811' : '#f8fafc',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      District / Highway Segment
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dimapur / Kohima"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1'}`,
                        background: isDark ? '#071811' : '#f8fafc',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* State, Report Type, Priority */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1'}`,
                        background: isDark ? '#071811' : '#f8fafc',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.88rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {['Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'].map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      Incident Classification *
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1'}`,
                        background: isDark ? '#071811' : '#f8fafc',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.88rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {REPORT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      Risk Priority
                    </label>
                    <select
                      value={riskPriority}
                      onChange={(e) => setRiskPriority(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1'}`,
                        background: isDark ? '#071811' : '#f8fafc',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.88rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Critical">🔴 Critical (Immediate Threat)</option>
                      <option value="High">🟠 High (Hazardous)</option>
                      <option value="Moderate">🟡 Moderate (Watch Needed)</option>
                      <option value="Low">🟢 Low (Minor Creep)</option>
                    </select>
                  </div>
                </div>

                {/* Observation Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Observation Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe slope tension cracks, mud depth, rockfall frequency, or road blockage..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1'}`,
                      background: isDark ? '#071811' : '#f8fafc',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.88rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Photo Upload Box */}
                <div
                  style={{
                    background: isDark ? '#071811' : '#f8fafc',
                    border: `1px dashed ${isDark ? 'rgba(52, 211, 153, 0.3)' : '#cbd5e1'}`,
                    borderRadius: 14,
                    padding: '18px 20px',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 700, marginBottom: 10 }}>
                    <ImageIcon size={16} color="#ea580c" />
                    <span>Attach Photo Evidence</span>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="photo-file-input"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUploadSimulation}
                    />
                    <label
                      htmlFor="photo-file-input"
                      style={{
                        background: '#0d281e',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        color: '#34d399',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Upload size={14} /> Browse from Device
                    </label>

                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>or quick-attach sample:</span>

                    <div style={{ display: 'flex', gap: 6 }}>
                      {sampleImages.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setPhotoUrl(s.url)}
                          style={{
                            background: photoUrl === s.url ? '#ea580c' : isDark ? '#143828' : '#e2e8f0',
                            color: photoUrl === s.url ? '#fff' : isDark ? '#cbd5e1' : '#475569',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {photoUrl && (
                    <div style={{ marginTop: 14, position: 'relative', display: 'inline-block' }}>
                      <img
                        src={photoUrl}
                        alt="Preview"
                        style={{ width: 140, height: 95, borderRadius: 10, objectFit: 'cover', border: '2px solid #ea580c' }}
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          background: '#dc2626',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 22,
                          height: 22,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Reporter Name & Contact */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      Reporter Name / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John L., PWD Engineer / Citizen Patrol"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1'}`,
                        background: isDark ? '#071811' : '#f8fafc',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      Video URL / Stream Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://... video clip link"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1'}`,
                        background: isDark ? '#071811' : '#f8fafc',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Submit & Cancel Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '12px 28px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                    }}
                  >
                    <Upload size={16} />
                    <span>{isSubmitting ? 'Transmitting telemetry...' : 'Submit Ground Report'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('directory')}
                    style={{
                      background: isDark ? '#143828' : '#e2e8f0',
                      color: isDark ? '#cbd5e1' : '#475569',
                      border: 'none',
                      borderRadius: 12,
                      padding: '12px 20px',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Incident Directory & Triage Dashboard */
          <div>
            {/* Filter & Search Bar */}
            <div
              style={{
                background: isDark ? '#0d281e' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
                borderRadius: 16,
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              {/* Search Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isDark ? '#071811' : '#f8fafc',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'}`,
                  borderRadius: 10,
                  padding: '8px 14px',
                  width: 300,
                }}
              >
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search location or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.84rem',
                    width: '100%',
                  }}
                />
              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginRight: 4 }}>
                  Status:
                </span>
                {['All', ...STATUS_OPTIONS].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatusFilter(st)}
                    style={{
                      background: selectedStatusFilter === st ? '#ea580c' : isDark ? '#143828' : '#f1f5f9',
                      color: selectedStatusFilter === st ? '#ffffff' : isDark ? '#cbd5e1' : '#64748b',
                      border: 'none',
                      borderRadius: 8,
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Type Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
                  Type:
                </span>
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#cbd5e1'}`,
                    background: isDark ? '#071811' : '#f8fafc',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="All">All Types</option>
                  {REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Incident Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
              {filteredReports.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: isDark ? '#0d281e' : '#ffffff',
                    borderRadius: 18,
                    padding: 50,
                    textAlign: 'center',
                    border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
                  }}
                >
                  <ShieldCheck size={44} color="#10b981" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>No reports found</h3>
                  <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
                    Try changing the search keyword or filter options.
                  </p>
                </div>
              ) : (
                filteredReports.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: isDark ? '#0d281e' : '#ffffff',
                      border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
                      borderRadius: 18,
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                  >
                    {/* Top Photo & Badges Header */}
                    <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#000' }}>
                      <img
                        src={item.photo_url}
                        alt={item.location_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            background: 'rgba(0,0,0,0.7)',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {item.id}
                        </span>
                        <span
                          style={{
                            background: getPriorityColor(item.risk_priority),
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          }}
                        >
                          {item.risk_priority} Priority
                        </span>
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: getStatusColor(item.status),
                          color: '#ffffff',
                          padding: '3px 9px',
                          borderRadius: 6,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        }}
                      >
                        {item.status}
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          left: 12,
                          right: 12,
                          color: '#ffffff',
                          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                        }}
                      >
                        {item.report_type} &middot; {item.state}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <MapPin size={15} color="#ea580c" />
                        <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>
                          {item.location_name}
                        </h3>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 10, paddingLeft: 21 }}>
                        {item.district} &middot; {item.created_at}
                      </div>

                      <p
                        style={{
                          fontSize: '0.84rem',
                          color: isDark ? '#cbd5e1' : '#475569',
                          margin: '0 0 14px',
                          lineHeight: 1.5,
                          flex: 1,
                        }}
                      >
                        {item.description}
                      </p>

                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: '#94a3b8',
                          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                          paddingTop: 10,
                          marginBottom: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <User size={13} />
                        <span>Reported by: <b>{item.reporter_name}</b></span>
                      </div>

                      {/* Triage Status Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {item.status !== 'Verified' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'Verified')}
                            style={{
                              flex: 1,
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '7px 10px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                            }}
                          >
                            <CheckCircle2 size={13} /> Verify
                          </button>
                        )}

                        {item.status !== 'Resolved' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'Resolved')}
                            style={{
                              flex: 1,
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '7px 10px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                            }}
                          >
                            <ShieldCheck size={13} /> Resolve
                          </button>
                        )}

                        {item.status !== 'Under Review' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'Under Review')}
                            style={{
                              flex: 1,
                              background: isDark ? '#143828' : '#f1f5f9',
                              color: isDark ? '#cbd5e1' : '#475569',
                              border: 'none',
                              borderRadius: 8,
                              padding: '7px 10px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                            }}
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
