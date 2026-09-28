import { jsPDF } from 'jspdf';
import { getFactorStatus, riskColors } from '../data/riskLocations';

function isHistoricalRisk(status) {
  return !/no recent|no historical/i.test(status);
}

function getWarning(level) {
  if (level === 'Critical') return 'CRITICAL RISK ALERT';
  if (level === 'High') return 'HIGH RISK WARNING';
  if (level === 'Moderate') return 'MONITOR';
  return 'NORMAL STATUS';
}

function getInterpretation(level) {
  if (level === 'Critical') return 'The model indicates a critical level of landslide risk under the assessed conditions. Immediate review and local monitoring are recommended.';
  if (level === 'High') return 'The model indicates an elevated level of landslide risk under the assessed conditions. Increased monitoring is recommended.';
  if (level === 'Moderate') return 'The model indicates a moderate level of landslide risk under the assessed conditions. Continue monitoring for changing conditions.';
  return 'The model indicates a low level of landslide risk under the assessed conditions.';
}

function addWrappedText(pdf, text, x, y, width, lineHeight = 6) {
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y);
  return y + (lines.length * lineHeight);
}

function addSectionHeading(pdf, text, y) {
  pdf.setFillColor(20, 33, 51);
  pdf.rect(20, y - 5, 170, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(text, 24, y);
  pdf.setTextColor(35, 47, 62);
  return y + 12;
}

function createPdfDoc(options) {
  if (typeof jsPDF === 'function') return new jsPDF(options);
  if (jsPDF && typeof jsPDF.jsPDF === 'function') return new jsPDF.jsPDF(options);
  if (jsPDF && typeof jsPDF.default === 'function') return new jsPDF.default(options);
  throw new Error('jsPDF library constructor is unavailable');
}

export function generateRiskReport(location) {
  const pdf = createPdfDoc({ unit: 'mm', format: 'a4' });
  const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  const locName = location.locationName || location.name || 'NER Monitoring Station';
  const locState = location.state || 'North-East Region';
  const locDistrict = location.district || 'Regional Sector';
  const lat = Number(location.latitude ?? 26.2).toFixed(4);
  const lon = Number(location.longitude ?? 92.8).toFixed(4);
  const rf = Number(location.rainfall ?? 100);
  const sm = Number(location.soilMoisture ?? location.soil_moisture ?? 65);
  const slope = Number(location.slope ?? 20);
  const elev = Number(location.elevation ?? 1000);
  const ndviVal = Number(location.ndvi ?? 0.65).toFixed(2);
  const histCount = Number(location.historicalLandslides ?? location.historical_landslides ?? 0);
  const histStatus = location.historicalLandslideStatus || (histCount > 0 ? `${histCount} documented past events` : 'No recorded historical slips');

  const score = Math.round(Number(location.riskScore ?? location.risk_score ?? 50));
  const rawLvl = String(location.riskLevel || location.risk_level || (score > 75 ? 'Critical' : score > 50 ? 'High' : score > 25 ? 'Moderate' : 'Low'));
  const level = rawLvl.charAt(0).toUpperCase() + rawLvl.slice(1).toLowerCase();

  const colorHex = riskColors[level] || riskColors.Moderate || '#40916c';
  const colorMatches = colorHex ? colorHex.match(/[A-Fa-f0-9]{2}/g) : null;
  const color = colorMatches ? colorMatches.map((part) => parseInt(part, 16)) : [27, 67, 50];
  let y = 20;

  pdf.setFillColor(27, 67, 50);
  pdf.rect(0, 0, 210, 34, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('NorthEast Landslide Risk Monitoring System (NELRMS)', 20, 16);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(216, 243, 220);
  pdf.text('Geological Susceptibility & Environmental Risk Assessment', 20, 24);
  pdf.text(`Generated: ${generatedAt}`, 20, 30);

  y = 48;
  pdf.setTextColor(35, 47, 62);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(locName, 20, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`${locState} | District: ${locDistrict}`, 20, y + 7);
  pdf.text(`Coordinates: ${lat}° N, ${lon}° E`, 20, y + 13);

  pdf.setFillColor(...color);
  pdf.roundedRect(135, 42, 55, 29, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text(`${score}%`, 162.5, 55, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text(`${level.toUpperCase()} RISK`, 162.5, 64, { align: 'center' });

  y = 83;
  y = addSectionHeading(pdf, 'Environmental Parameters', y);
  const rows = [
    ['Rainfall', `${rf} mm`, getFactorStatus('rainfall', rf)],
    ['Soil moisture', `${sm}%`, getFactorStatus('soilMoisture', sm)],
    ['Slope', `${slope} deg`, getFactorStatus('slope', slope)],
    ['Elevation', `${elev} m`, getFactorStatus('elevation', elev)],
    ['NDVI', String(ndviVal), getFactorStatus('ndvi', Number(ndviVal))],
    ['Historical landslide', histStatus, getFactorStatus('historicalLandslide', histCount > 0 || isHistoricalRisk(histStatus))],
  ];
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(235, 239, 244);
  pdf.rect(20, y - 5, 170, 8, 'F');
  pdf.setTextColor(35, 47, 62);
  pdf.text('Parameter', 24, y);
  pdf.text('Value', 105, y);
  pdf.text('Status', 164, y);
  y += 8;
  pdf.setFont('helvetica', 'normal');
  rows.forEach(([label, value, status]) => {
    pdf.setDrawColor(225, 230, 235);
    pdf.line(20, y + 2, 190, y + 2);
    pdf.text(label, 24, y);
    pdf.text(pdf.splitTextToSize(String(value), 55), 105, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(status.toUpperCase(), 164, y);
    pdf.setFont('helvetica', 'normal');
    y += 8;
  });

  y += 8;
  y = addSectionHeading(pdf, 'Risk Status and Interpretation', y);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(`Early warning status: ${getWarning(location.riskLevel)}`, 20, y);
  y += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  y = addWrappedText(pdf, getInterpretation(location.riskLevel), 20, y, 170);

  y += 6;
  y = addSectionHeading(pdf, 'Contributing Environmental Factors', y);
  pdf.setFontSize(10);
  y = addWrappedText(pdf, 'The following values are contributing environmental factors displayed for context. They are not model feature-importance measurements.', 20, y, 170);

  y += 4;
  y = addSectionHeading(pdf, 'Conclusion', y);
  y = addWrappedText(pdf, `This report records an AI-based risk assessment for ${location.locationName} with a predicted score of ${score}% (${location.riskLevel}). Results should be considered alongside field observations and official guidance.`, 20, y, 170);

  y += 8;
  pdf.setFillColor(247, 244, 229);
  pdf.rect(20, y - 5, 170, 19, 'F');
  pdf.setTextColor(94, 78, 29);
  pdf.setFontSize(9);
  addWrappedText(pdf, 'Disclaimer: This is an AI-based risk assessment prototype and should not be treated as an official disaster warning.', 24, y + 2, 162, 5);

  const fileName = `NELRMS_Assessment_${location.id || 'station'}.pdf`;
  try {
    pdf.save(fileName);
  } catch (err) {
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 500);
  }
}
