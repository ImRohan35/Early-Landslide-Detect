import { useState, useEffect } from 'react';
import { ArrowRight, Globe2, MapPin, Search, ShieldAlert } from 'lucide-react';
import { getStates } from '../services/api';

export default function StatesView({ onSelectState }) {
  const [states, setStates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStates().then((res) => {
      setStates(res);
      setLoading(false);
    });
  }, []);

  const filteredStates = states.filter((st) =>
    st.state.toLowerCase().includes(search.toLowerCase()) ||
    (st.capital || '').toLowerCase().includes(search.toLowerCase()) ||
    (st.vulnerable_corridors || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>North-Eastern States</h2>
          <p>
            Regional susceptibility monitoring, geological profiles, and historical records across all 8 North-Eastern states.
          </p>
        </div>

        {/* State Search Input */}
        <div style={{ position: 'relative', width: 280 }}>
          <div className="search-box">
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by state or corridor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="states-filter-search-input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p>Loading North-Eastern state profiles...</p>
        </div>
      ) : filteredStates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--risk-high)', fontWeight: 600 }}>
            No states found matching "{search}".
          </p>
          <small style={{ color: 'var(--text-muted)' }}>
            Please select one of the 8 North-Eastern states: Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Sikkim, or Tripura.
          </small>
        </div>
      ) : (
        <div className="states-grid">
          {filteredStates.map((st) => (
            <div
              key={st.state}
              className="state-card"
              onClick={() => onSelectState(st.state)}
              role="button"
              tabIndex={0}
              id={`state-card-${st.state.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="state-card-top">
                <div>
                  <h3>{st.state}</h3>
                  <small>Capital: {st.capital || 'Regional Center'}</small>
                </div>
                <span
                  className={`badge ${
                    st.high_risk_count > 1 ? 'badge-critical' : st.high_risk_count === 1 ? 'badge-high' : 'badge-moderate'
                  }`}
                >
                  {st.high_risk_count > 1 ? 'High Risk' : st.high_risk_count === 1 ? 'Moderate' : 'Stable'}
                </span>
              </div>

              <p className="state-card-desc">{st.description}</p>

              <div className="state-stats-row">
                <div className="state-stat-col">
                  <small>Locations</small>
                  <b>{st.location_count}</b>
                </div>
                <div className="state-stat-col">
                  <small>High/Crit</small>
                  <b style={{ color: st.high_risk_count > 0 ? 'var(--risk-critical)' : 'inherit' }}>
                    {st.high_risk_count}
                  </b>
                </div>
                <div className="state-stat-col">
                  <small>Past Events</small>
                  <b>{st.historical_events_count}</b>
                </div>
              </div>

              {st.vulnerable_corridors && (
                <div style={{ marginBottom: 14, fontSize: 11.5, color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Vulnerable Sectors: </strong>
                  {st.vulnerable_corridors}
                </div>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 'auto', justifyContent: 'space-between' }}
              >
                <span>View State Analysis</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
