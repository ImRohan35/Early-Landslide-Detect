import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  MapPin,
  Milestone,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { riskColors } from '../data/riskLocations';
import { updateRoadStatusApi } from '../services/api';

const NER_STATES = [
  'All',
  'Assam',
  'Arunachal Pradesh',
  'Meghalaya',
  'Manipur',
  'Mizoram',
  'Nagaland',
  'Tripura',
  'Sikkim',
];

const ROAD_STATUSES = ['All', 'Open', 'Caution', 'Blocked'];

export default function RoadMonitoringView({
  roads = [],
  t,
  lang,
  onToast,
  onSelectLocationByName,
}) {
  const [roadList, setRoadList] = useState(roads);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredRoads = useMemo(() => {
    return roadList.filter((r) => {
      const matchState = selectedState === 'All' || r.state.toLowerCase() === selectedState.toLowerCase();
      const matchStatus = selectedStatus === 'All' || r.status.toLowerCase() === selectedStatus.toLowerCase();
      return matchState && matchStatus;
    });
  }, [roadList, selectedState, selectedStatus]);

  // Counts
  const counts = useMemo(() => {
    const total = roadList.length;
    const open = roadList.filter((r) => r.status === 'Open').length;
    const caution = roadList.filter((r) => r.status === 'Caution').length;
    const blocked = roadList.filter((r) => r.status === 'Blocked').length;
    return { total, open, caution, blocked };
  }, [roadList]);

  // Interactive status toggle for demonstration
  const handleCycleStatus = async (roadId) => {
    const road = roadList.find((r) => r.id === roadId);
    if (!road) return;

    const nextStatus = road.status === 'Open' ? 'Caution' : road.status === 'Caution' ? 'Blocked' : 'Open';
    const updated = roadList.map((r) => (r.id === roadId ? { ...r, status: nextStatus, lastUpdate: 'Just now' } : r));
    setRoadList(updated);

    await updateRoadStatusApi(roadId, nextStatus).catch(() => {});
    onToast?.(`Updated ${road.roadName} connectivity status to ${nextStatus}`, 'info');
  };

  const getStatusColor = (status) => {
    if (status === 'Open') return '#22c55e';
    if (status === 'Caution') return '#eab308';
    return '#ef4444';
  };

  const getStatusIcon = (status) => {
    if (status === 'Open') return <CheckCircle2 size={16} color="#22c55e" />;
    if (status === 'Caution') return <AlertTriangle size={16} color="#eab308" />;
    return <XCircle size={16} color="#ef4444" />;
  };

  return (
    <div className="roads-page-container">
      {/* Header Bar */}
      <div className="roads-header-bar">
        <div>
          <div className="roads-eyebrow">
            <Car size={15} />
            <span>INTERSTATE CONNECTIVITY & HIGHWAY LIFELINE MONITOR</span>
          </div>
          <h2>{t.roads.title}</h2>
          <p>{t.roads.subtitle}</p>
        </div>
      </div>

      {/* KPI Counters Bar */}
      <div className="roads-kpi-grid">
        <div className="road-kpi-card total">
          <Milestone size={22} color="#3b82f6" />
          <div>
            <strong>{counts.total}</strong>
            <span>Monitored Corridors</span>
          </div>
        </div>

        <div className="road-kpi-card open">
          <CheckCircle2 size={22} color="#22c55e" />
          <div>
            <strong>{counts.open}</strong>
            <span>🟢 Open / Clear Lanes</span>
          </div>
        </div>

        <div className="road-kpi-card caution">
          <AlertTriangle size={22} color="#eab308" />
          <div>
            <strong>{counts.caution}</strong>
            <span>🟡 Caution / Single Lane</span>
          </div>
        </div>

        <div className="road-kpi-card blocked">
          <XCircle size={22} color="#ef4444" />
          <div>
            <strong>{counts.blocked}</strong>
            <span>🔴 Blocked / Washouts</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="roads-filters-card">
        <div className="filter-group">
          <label>
            <Filter size={14} /> {t.roads.filterStatus}:
          </label>
          <div className="filter-chips">
            {ROAD_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-chip ${selectedStatus === st ? 'active' : ''}`}
                onClick={() => setSelectedStatus(st)}
              >
                {st !== 'All' && (
                  <span
                    className="status-dot"
                    style={{ background: getStatusColor(st) }}
                  />
                )}
                {st === 'All' ? t.common.all : t.status[st.toLowerCase()] || st}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>
            <MapPin size={14} /> {t.locations.filterState}:
          </label>
          <div className="filter-chips">
            {NER_STATES.map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-chip ${selectedState === st ? 'active' : ''}`}
                onClick={() => setSelectedState(st)}
              >
                {st === 'All' ? t.locations.allStates : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Road Cards / Table Grid */}
      <div className="roads-grid-cards">
        {filteredRoads.length === 0 ? (
          <div className="roads-empty-state">
            <Milestone size={44} color="#94a3b8" />
            <h3>No highway corridors match the selected filter</h3>
          </div>
        ) : (
          filteredRoads.map((road) => {
            const statusColor = getStatusColor(road.status);
            const riskColor = riskColors[road.riskLevel] || '#e0bd23';

            return (
              <div
                key={road.id}
                className={`road-status-card-full ${road.status.toLowerCase()}`}
                style={{ borderLeftColor: statusColor }}
              >
                <div className="road-card-topbar">
                  <div className="road-badge-wrap">
                    <span className="road-status-badge" style={{ background: `${statusColor}22`, color: statusColor, borderColor: statusColor }}>
                      {getStatusIcon(road.status)}
                      <b>{road.status.toUpperCase()}</b>
                    </span>
                    <span className="road-risk-pill" style={{ background: `${riskColor}22`, color: riskColor }}>
                      {road.riskLevel} Risk
                    </span>
                  </div>

                  <span className="road-state-badge">{road.state}</span>
                </div>

                <h3 className="road-name-title">{road.roadName}</h3>
                <p className="road-corridor-desc">
                  <b>Corridor:</b> {road.corridor}
                </p>

                <div className="road-notes-box">
                  <p>{road.conditionNotes || road.condition_notes || 'Routine traffic monitoring maintained.'}</p>
                </div>

                <div className="road-footer-row">
                  <span className="road-timestamp">
                    <Clock size={13} /> {road.lastUpdate || road.updated_at || 'Recent telemetry'}
                  </span>

                  <div className="road-actions">
                    <button
                      type="button"
                      className="cycle-status-btn"
                      onClick={() => handleCycleStatus(road.id)}
                      title="Click to toggle Open/Caution/Blocked status"
                    >
                      <RefreshCw size={13} />
                      <span>Cycle Status</span>
                    </button>

                    {road.nearestStation && onSelectLocationByName && (
                      <button
                        type="button"
                        className="road-inspect-btn"
                        onClick={() => onSelectLocationByName(road.nearestStation)}
                        title="Inspect terrain risk for this corridor"
                      >
                        <ExternalLink size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
