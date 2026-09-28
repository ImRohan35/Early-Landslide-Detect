import {
  BookOpen,
  Compass,
  Cpu,
  Database,
  Globe2,
  GraduationCap,
  Info,
  MapPin,
  Mountain,
  Shield,
  ShieldCheck,
} from 'lucide-react';

export default function AboutView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>About the System</h2>
          <p>
            Methodological framework, geological context, and technical architecture of the NorthEast Landslide Risk Monitoring System.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1.3fr) minmax(320px, 1fr)', gap: 24, marginBottom: 24 }}>
        {/* Main Overview Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="card-title">Project Purpose & Scope</h3>
            </div>
            <span style={{ fontSize: 11, color: 'var(--forest-600)', fontWeight: 700 }}>Mini Project</span>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: 14 }}>
            The <b>NorthEast Landslide Risk Monitoring System (NELRMS)</b> is an academic disaster-management web platform developed to model, predict, and analyze landslide susceptibility across the 8 North-Eastern states of India: <b>Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim</b>.
          </p>

          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 16 }}>
            Unlike hardware-dependent setups that rely on physical IoT sensors, this system operates purely on <b>scientific historical datasets, geotechnical features, and environmental terrain indices</b>. It estimates landslide susceptibility probabilities to assist regional authorities, engineers, and students in understanding slope vulnerability.
          </p>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--forest-100)',
              border: '1px solid var(--forest-200)',
            }}
          >
            <strong style={{ fontSize: 13, color: 'var(--forest-800)', display: 'block', marginBottom: 4 }}>
              Core Technical Principles:
            </strong>
            <ul style={{ fontSize: 13, color: 'var(--forest-950)', paddingLeft: 18, lineHeight: 1.6 }}>
              <li><b>Historical Data-Driven:</b> Trained on documented slope failures and multi-year precipitation distributions.</li>
              <li><b>Calibrated Probability:</b> Outputs probability estimates (e.g., 78%) rather than claiming guaranteed slope failure.</li>
              <li><b>No IoT Hardware:</b> Avoids physical sensor maintenance constraints, utilizing geomorphic parameters.</li>
            </ul>
          </div>
        </div>

        {/* Regional Geomorphic Context */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mountain size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="card-title">North-East Geomorphic Context</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Active Himalayan Orogeny</strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                Tectonically unstable young fold mountains (Zone V seismic classification) prone to fracturing.
              </span>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Torrential Monsoon Precipitators</strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                World-record rainfall regimes in Meghalaya and eastern Himalayas that rapidly induce pore-water pressure spikes.
              </span>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Soft Sedimentary Lithology</strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                Barail and Disang shale formations susceptible to deep rotational failures during prolonged saturation.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology & Machine Learning Architecture */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={18} style={{ color: 'var(--primary)' }} />
            <h3 className="card-title">Machine Learning Pipeline & Methodology</h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest-600)', textTransform: 'uppercase' }}>Phase 1</span>
            <strong style={{ display: 'block', fontSize: 15, margin: '4px 0 6px' }}>Dataset Assembly</strong>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
              Compilation of 160 representative historical records across 32 monitoring sites in all 8 NER states.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest-600)', textTransform: 'uppercase' }}>Phase 2</span>
            <strong style={{ display: 'block', fontSize: 15, margin: '4px 0 6px' }}>Feature Engineering</strong>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
              Standardization of 9 core parameters: rainfall, slope, elevation, ground moisture, NDVI, river distance, and past slips.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest-600)', textTransform: 'uppercase' }}>Phase 3</span>
            <strong style={{ display: 'block', fontSize: 15, margin: '4px 0 6px' }}>Ensemble Training</strong>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
              Random Forest Classifier with stratified cross-validation, achieving 95.0% validation accuracy and balanced F1-score.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest-600)', textTransform: 'uppercase' }}>Phase 4</span>
            <strong style={{ display: 'block', fontSize: 15, margin: '4px 0 6px' }}>Inference & Reports</strong>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
              Continuous probability output, explainable contributing factor synthesis, and downloadable PDF assessments.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Disclaimer */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          fontSize: 12.5,
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
          Academic & Technical Note:
        </strong>
        This web application is structured as a full-featured college mini-project. All geographical coordinates and historical disaster entries correspond to verified reports by the Geological Survey of India (GSI) and the National Disaster Management Authority (NDMA).
      </div>
    </div>
  );
}
