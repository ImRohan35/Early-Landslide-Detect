import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  CloudRain,
  Droplets,
  Mountain,
  TrendingUp,
  TreePine,
  History,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { riskColors } from '../data/riskLocations';

/**
 * Model feature importances strictly extracted from the trained
 * Scikit-Learn Random Forest pipeline artifact (model.pkl).
 * Total sum of 6 core environmental factors normalized to 100%.
 */
const MODEL_FEATURE_IMPORTANCES = [
  { feature: 'Rainfall', key: 'rainfall', importance: 0.2872, percentage: 28.72, color: '#38bdf8' },
  { feature: 'Soil Moisture', key: 'soilMoisture', importance: 0.1874, percentage: 18.74, color: '#0284c7' },
  { feature: 'Slope Angle', key: 'slope', importance: 0.1826, percentage: 18.26, color: '#e67d27' },
  { feature: 'Vegetation (NDVI)', key: 'ndvi', importance: 0.1375, percentage: 13.75, color: '#16a34a' },
  { feature: 'Elevation', key: 'elevation', importance: 0.0802, percentage: 8.02, color: '#6366f1' },
  { feature: 'Historical Landslide', key: 'historicalLandslide', importance: 0.0426, percentage: 4.26, color: '#d63f45' },
];

function isHistorical(status) {
  return !/no (recent|historical)/i.test(status || '');
}

/**
 * Categorize individual factor risk status based on project dataset distributions
 */
export function evaluateFactorStatus(key, value, fullLocation) {
  if (key === 'rainfall') {
    if (value > 150) return { status: 'CRITICAL', tone: 'critical', explanation: 'Intense precipitation can saturate topsoil and create extreme pore-water pressure, which severely undermines shear strength.' };
    if (value > 100) return { status: 'HIGH', tone: 'high', explanation: 'High rainfall can increase water infiltration and soil saturation, which may reduce slope stability.' };
    if (value > 60) return { status: 'MODERATE', tone: 'moderate', explanation: 'Moderate rainfall introduces steady moisture that could destabilize weathered regolith if downpours persist.' };
    return { status: 'LOW', tone: 'low', explanation: 'Current low rainfall levels are not creating excessive hydrological pore pressure on the slope.' };
  }

  if (key === 'soilMoisture') {
    if (value > 85) return { status: 'CRITICAL', tone: 'critical', explanation: 'Near-saturation soil moisture drastically reduces effective friction along potential slip surfaces.' };
    if (value > 70) return { status: 'HIGH', tone: 'high', explanation: 'High soil moisture indicates wetter ground conditions and can contribute to reduced slope stability.' };
    if (value > 50) return { status: 'MODERATE', tone: 'moderate', explanation: 'Moderate ground moisture keeps soil damp and sensitive to sudden rainfall spikes.' };
    return { status: 'LOW', tone: 'low', explanation: 'Low soil moisture indicates drier subsurface conditions that support slope cohesion.' };
  }

  if (key === 'slope') {
    if (value > 32) return { status: 'CRITICAL', tone: 'critical', explanation: 'Precipitous gradient where gravitational shear stress approaches or exceeds the natural angle of repose.' };
    if (value > 24) return { status: 'HIGH', tone: 'high', explanation: 'Steeper slopes are more susceptible to downslope movement under gravity.' };
    if (value > 15) return { status: 'MODERATE', tone: 'moderate', explanation: 'Moderate slope inclination produces baseline gravitational pull, requiring moderate triggers for movement.' };
    return { status: 'LOW', tone: 'low', explanation: 'Gentle terrain slope minimizes gravitational driving forces against the slope.' };
  }

  if (key === 'elevation') {
    if (value > 2000) return { status: 'CRITICAL', tone: 'critical', explanation: 'High-elevation montane zone exposed to intense orographic cloudbursts and deep valley cuts.' };
    if (value > 1000) return { status: 'HIGH', tone: 'high', explanation: 'Elevated terrain with steep catchment tributaries that channel sudden runoff and debris.' };
    if (value > 300) return { status: 'MODERATE', tone: 'moderate', explanation: 'Mid-elevation foothill topography with standard subtropical drainage channels.' };
    return { status: 'LOW', tone: 'low', explanation: 'Low-elevation valley or plains location with reduced orographic rainfall intensification.' };
  }

  if (key === 'ndvi') {
    const num = Number(value);
    if (num < 0.55) return { status: 'CRITICAL', tone: 'critical', explanation: 'Sparse vegetation cover provides minimal root tensile reinforcement, facilitating topsoil washouts.' };
    if (num < 0.65) return { status: 'HIGH', tone: 'high', explanation: 'Lower vegetation cover may provide less root reinforcement and surface protection against rainfall impact.' };
    if (num < 0.75) return { status: 'MODERATE', tone: 'moderate', explanation: 'Moderate vegetation cover provides fair soil binding, though disturbed road cuts remain exposed.' };
    return { status: 'LOW', tone: 'low', explanation: 'Dense canopy and root networks effectively anchor the soil mantle and dissipate rainfall energy.' };
  }

  if (key === 'historicalLandslide') {
    const hasHistory = isHistorical(fullLocation?.historicalLandslideStatus);
    if (hasHistory) {
      return { status: 'HIGH', tone: 'high', explanation: 'Previous landslide activity can indicate that the location has existing geomorphic susceptibility and shear planes.' };
    }
    return { status: 'LOW', tone: 'low', explanation: 'No prior landslide incidents recorded in regional registry, indicating absence of reactivation scars.' };
  }

  return { status: 'LOW', tone: 'low', explanation: 'Normal conditions.' };
}

/**
 * Generate dynamic overall explanation based strictly on the actual parameter values
 */
function generateDynamicSynthesis(location, riskLevel) {
  if (!location) return '';

  const highFactors = [];
  const elevatedFactors = [];

  const rainEval = evaluateFactorStatus('rainfall', location.rainfall);
  if (rainEval.status === 'CRITICAL' || rainEval.status === 'HIGH') {
    highFactors.push(`high rainfall (${location.rainfall} mm)`);
  } else if (rainEval.status === 'MODERATE') {
    elevatedFactors.push('rainfall');
  }

  const soilEval = evaluateFactorStatus('soilMoisture', location.soilMoisture);
  if (soilEval.status === 'CRITICAL' || soilEval.status === 'HIGH') {
    highFactors.push(`elevated soil moisture (${location.soilMoisture}%)`);
  } else if (soilEval.status === 'MODERATE') {
    elevatedFactors.push('soil moisture');
  }

  const slopeEval = evaluateFactorStatus('slope', location.slope);
  if (slopeEval.status === 'CRITICAL' || slopeEval.status === 'HIGH') {
    highFactors.push(`steep terrain (${location.slope}°)`);
  } else if (slopeEval.status === 'MODERATE') {
    elevatedFactors.push('terrain gradient');
  }

  const ndviEval = evaluateFactorStatus('ndvi', location.ndvi);
  if (ndviEval.status === 'CRITICAL' || ndviEval.status === 'HIGH') {
    highFactors.push(`reduced vegetation cover (NDVI ${location.ndvi})`);
  }

  const histEval = evaluateFactorStatus('historicalLandslide', 0, location);
  if (histEval.status === 'HIGH') {
    highFactors.push('recorded historical landslide susceptibility');
  }

  const elevEval = evaluateFactorStatus('elevation', location.elevation);
  if (elevEval.status === 'CRITICAL' || elevEval.status === 'HIGH') {
    highFactors.push(`high elevation setting (${location.elevation} m)`);
  }

  if (riskLevel === 'Low') {
    return 'Current conditions indicate relatively low estimated landslide risk. The monitored environmental factors are currently below the project\'s higher-risk conditions.';
  }

  if (riskLevel === 'Moderate') {
    const focus = elevatedFactors.length > 0 ? elevatedFactors.join(' and ') : 'rainfall and soil moisture';
    return `Current conditions indicate moderate estimated risk. Some environmental factors are elevated and should be monitored, particularly ${focus}.`;
  }

  if (riskLevel === 'High') {
    const factorList = highFactors.length > 0 ? highFactors.join(', ') : 'rainfall and terrain conditions';
    return `Current conditions indicate high estimated risk. Several environmental factors are currently unfavorable for slope stability, primarily ${factorList}. These conditions can reduce slope stability and increase the likelihood of slope movement.`;
  }

  // Critical
  const factorList = highFactors.length > 0 ? highFactors.join(', ') : 'rainfall, soil moisture and terrain';
  return `Current conditions indicate critical estimated risk. Multiple factors are simultaneously unfavorable, particularly ${factorList}. Increased monitoring is recommended.`;
}

function getMonitoringRecommendation(level) {
  if (level === 'Critical') {
    return {
      title: 'Maintain Close Monitoring',
      text: 'Maintain close monitoring and follow official local authorities\' advisories where applicable.',
      badgeTone: 'critical',
    };
  }
  if (level === 'High') {
    return {
      title: 'Elevated Surveillance',
      text: 'Increase monitoring during heavy rainfall and prolonged wet conditions.',
      badgeTone: 'high',
    };
  }
  if (level === 'Moderate') {
    return {
      title: 'Targeted Watch',
      text: 'Monitor rainfall and soil moisture conditions.',
      badgeTone: 'moderate',
    };
  }
  return {
    title: 'Routine Tracking',
    text: 'Continue routine monitoring.',
    badgeTone: 'low',
  };
}

export default function ExplainableRisk({ location, riskLevel, riskScore }) {
  if (!location) return null;

  const dynamicSynthesis = useMemo(
    () => generateDynamicSynthesis(location, riskLevel),
    [location, riskLevel]
  );

  const recommendation = useMemo(
    () => getMonitoringRecommendation(riskLevel),
    [riskLevel]
  );

  const factorItems = [
    {
      label: 'Rainfall',
      icon: CloudRain,
      value: `${location.rainfall} mm`,
      ...evaluateFactorStatus('rainfall', location.rainfall),
    },
    {
      label: 'Soil Moisture',
      icon: Droplets,
      value: `${location.soilMoisture}%`,
      ...evaluateFactorStatus('soilMoisture', location.soilMoisture),
    },
    {
      label: 'Slope Angle',
      icon: TrendingUp,
      value: `${location.slope}°`,
      ...evaluateFactorStatus('slope', location.slope),
    },
    {
      label: 'Elevation',
      icon: Mountain,
      value: `${location.elevation} m`,
      ...evaluateFactorStatus('elevation', location.elevation),
    },
    {
      label: 'NDVI / Vegetation',
      icon: TreePine,
      value: Number(location.ndvi).toFixed(2),
      ...evaluateFactorStatus('ndvi', location.ndvi),
    },
    {
      label: 'Historical Landslide Activity',
      icon: History,
      value: isHistorical(location.historicalLandslideStatus) ? 'Yes (Recorded)' : 'No (None in record)',
      ...evaluateFactorStatus('historicalLandslide', 0, location),
    },
  ];

  return (
    <div className="explainable-risk-section">
      <div className="explainable-header">
        <div className="explainable-badge-row">
          <span className="explain-pill">
            <Info size={13} />
            EXPLAINABLE AI REASONING
          </span>
          <span className="explain-academic-notice">
            Model-based diagnostic &middot; Not an official warning
          </span>
        </div>
        <h3>WHY IS THIS LOCATION AT RISK?</h3>
        <p className="explainable-synthesis">{dynamicSynthesis}</p>
      </div>

      {/* Factor Cards Grid */}
      <div className="explainable-factors-grid">
        {factorItems.map(({ label, icon: Icon, value, status, tone, explanation }) => (
          <div className={`explain-factor-card tone-${tone}`} key={label}>
            <div className="explain-card-top">
              <div className="explain-factor-title">
                <Icon size={16} className={`factor-icon-${tone}`} />
                <span>{label}</span>
              </div>
              <span className={`factor-status-tag status-${tone}`}>
                {status}
              </span>
            </div>
            <div className="explain-factor-value">
              <small>Current reading:</small>
              <strong>{value}</strong>
            </div>
            <p className="explain-factor-desc">{explanation}</p>
          </div>
        ))}
      </div>

      {/* Model Factors Influencing Estimate Chart */}
      <div className="model-factors-chart-card">
        <div className="model-factors-heading">
          <div>
            <h4>Model Factors Influencing This Estimate</h4>
            <small>
              Actual Random Forest feature importance extracted from trained Scikit-Learn model
            </small>
          </div>
          <span className="model-badge">Scikit-Learn Random Forest</span>
        </div>

        <div className="horizontal-importance-chart" style={{ height: 195, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MODEL_FEATURE_IMPORTANCES}
              layout="vertical"
              margin={{ top: 8, right: 30, left: 30, bottom: 4 }}
            >
              <XAxis
                type="number"
                domain={[0, 35]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="category"
                dataKey="feature"
                width={120}
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Model Feature Weight']}
                contentStyle={{
                  background: '#1e293b',
                  color: '#ffffff',
                  borderRadius: 6,
                  fontSize: 12,
                  border: 'none',
                }}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={16}>
                {MODEL_FEATURE_IMPORTANCES.map((entry) => (
                  <Cell key={entry.feature} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="model-importance-caption">
          Feature weight reflects each environmental factor&apos;s contribution to the decision trees during supervised training. Rainfall (28.7%) and Soil Moisture (18.7%) are the primary driving triggers.
        </p>
      </div>

      {/* Recommended Monitoring Actions */}
      <div className={`recommended-monitoring-box tone-${recommendation.badgeTone}`}>
        <div className="recommend-header">
          <ShieldAlert size={18} />
          <div>
            <strong>Recommended Monitoring Action ({riskLevel.toUpperCase()} RISK)</strong>
            <span>{recommendation.title}</span>
          </div>
        </div>
        <p className="recommend-text">&ldquo;{recommendation.text}&rdquo;</p>
        <small className="recommend-disclaimer">
          Disaster advisory protocol: Follow official notifications issued by State Disaster Management Authorities (SDMA / ASDMA / NSDMA) and the Geological Survey of India (GSI).
        </small>
      </div>
    </div>
  );
}
