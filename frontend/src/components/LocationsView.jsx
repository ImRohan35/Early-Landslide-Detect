import { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Filter,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import LocationDetails from './LocationDetails';
import { riskColors } from '../data/riskLocations';

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

const RISK_TIERS = ['All', 'Critical', 'High', 'Moderate', 'Low'];

export default function LocationsView({
  locations = [],
  selectedLocation,
  onSelectLocation,
  t,
  lang,
  onToast,
  onOpenWhatIf,
  initialSearch = '',
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');

  // If initialSearch changes from header quick-search, update local query
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch =
        !searchQuery.trim() ||
        loc.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.village && loc.village.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesState = selectedState === 'All' || loc.state.toLowerCase() === selectedState.toLowerCase();
      const matchesRisk = selectedRisk === 'All' || loc.riskLevel.toLowerCase() === selectedRisk.toLowerCase();

      return matchesSearch && matchesState && matchesRisk;
    });
  }, [locations, searchQuery, selectedState, selectedRisk]);

  // Auto-select first matching location if search matches uniquely
  useEffect(() => {
    if (searchQuery.trim() && filteredLocations.length === 1 && selectedLocation?.id !== filteredLocations[0].id) {
      onSelectLocation(filteredLocations[0]);
    }
  }, [searchQuery, filteredLocations, selectedLocation, onSelectLocation]);

  return (
    <div className="locations-page-shell">
      {/* Top Search & Filter Bar */}
      <div className="locations-search-header">
        <div className="search-bar-primary">
          <Search size={20} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-primary"
            placeholder={t.locations.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* State Filter Pills */}
        <div className="filter-row state-filters">
          <span className="filter-label">
            <Filter size={14} /> {t.locations.filterState}:
          </span>
          <div className="filter-pills-scroll">
            {NER_STATES.map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-pill ${selectedState === st ? 'active' : ''}`}
                onClick={() => setSelectedState(st)}
              >
                {st === 'All' ? t.locations.allStates : st}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level Filter Pills */}
        <div className="filter-row risk-filters">
          <span className="filter-label">{t.locations.filterRisk}:</span>
          <div className="filter-pills-scroll">
            {RISK_TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                className={`filter-pill risk-pill ${selectedRisk === tier ? 'active' : ''}`}
                onClick={() => setSelectedRisk(tier)}
              >
                {tier !== 'All' && (
                  <span
                    className="risk-dot"
                    style={{ background: riskColors[tier] || '#64748b' }}
                  />
                )}
                {tier === 'All' ? t.locations.allRisks : t.riskLevels[tier] || tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left List of Stations + Right Full Detailed Analysis */}
      <div className="locations-body-grid">
        {/* Left: Station Directory List */}
        <div className="locations-list-column">
          <div className="list-column-heading">
            <h4>{t.locations.locationsCount} ({filteredLocations.length})</h4>
          </div>

          <div className="locations-scroll-list">
            {filteredLocations.length === 0 ? (
              <div className="empty-locations-state">
                <Compass size={32} color="#94a3b8" />
                <p>No stations match &ldquo;{searchQuery}&rdquo;</p>
                <button
                  type="button"
                  className="reset-filter-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedState('All');
                    setSelectedRisk('All');
                  }}
                >
                  {t.common.reset}
                </button>
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                const rColor = riskColors[loc.riskLevel] || '#e0bd23';

                return (
                  <div
                    key={loc.id}
                    className={`location-card-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectLocation(loc)}
                    role="button"
                    tabIndex={0}
                    style={{ borderLeftColor: rColor }}
                  >
                    <div className="loc-card-top">
                      <strong className="loc-card-name">{loc.locationName}</strong>
                      <span className="loc-card-tier" style={{ background: `${rColor}20`, color: rColor }}>
                        {t.riskLevels[loc.riskLevel]}
                      </span>
                    </div>

                    <div className="loc-card-meta">
                      <span><MapPin size={12} /> {loc.district}, {loc.state}</span>
                    </div>

                    <div className="loc-card-stats">
                      <span>Rain: <b>{loc.rainfall}mm</b></span>
                      <span>Slope: <b>{loc.slope}°</b></span>
                      <span>Risk: <b style={{ color: rColor }}>{Math.round(loc.riskScore)}%</b></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Location View with Current Condition & AI Risk Analysis */}
        <div className="locations-detail-column">
          {selectedLocation ? (
            <LocationDetails
              location={selectedLocation}
              t={t}
              lang={lang}
              onToast={onToast}
              onOpenWhatIf={onOpenWhatIf}
            />
          ) : (
            <div className="no-selection-placeholder">
              <ShieldAlert size={48} color="#94a3b8" />
              <h3>Select a location from the left to view detailed risk analysis</h3>
              <p>Or search for any city, village, or district like Gangtok, Haflong, Aizawl, Sohra...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
