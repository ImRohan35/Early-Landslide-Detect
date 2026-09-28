import { CircleAlert, CircleCheckBig, TriangleAlert } from 'lucide-react';
import { riskLocations } from '../data/riskLocations';

const riskCards = [
  { title: 'LOW', level: 'Low', icon: CircleCheckBig, detail: 'Risk Level: Minimal', tone: 'low' },
  { title: 'MODERATE', level: 'Moderate', icon: TriangleAlert, detail: 'Risk Level: Low-Mid', tone: 'moderate' },
  { title: 'HIGH', level: 'High', icon: TriangleAlert, detail: 'Risk Level: Elevated', tone: 'high' },
  { title: 'CRITICAL', level: 'Critical', icon: CircleAlert, detail: 'Risk Level: High-Severe', tone: 'critical' },
];

export default function RiskSummary({ selectedLocation }) {
  const counts = riskLocations.reduce((total, location) => {
    total[location.riskLevel] += 1;
    return total;
  }, { Low: 0, Moderate: 0, High: 0, Critical: 0 });

  return (
    <section className="risk-summary" aria-label="Regional risk summary">
      {riskCards.map(({ icon: Icon, title, level, detail, tone }) => (
        <article className={`risk-card ${tone}`} key={title}>
          <div className="risk-card-title"><span className="risk-icon"><Icon size={21} strokeWidth={2.8} /></span><h2>{title}</h2></div>
          <div className="risk-card-details"><p>{detail}</p><p><b>{counts[level]}</b> monitored locations</p><p>{selectedLocation?.riskLevel === level ? 'Selected location' : 'Regional inventory'}</p></div>
        </article>
      ))}
    </section>
  );
}
