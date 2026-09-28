export const riskColors = {
  Low: '#3daa6b',
  Moderate: '#e0bd23',
  High: '#e67d27',
  Critical: '#d63f45',
};

export function getRiskLevelFromScore(score) {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Critical';
}

export function getFactorStatus(parameter, value) {
  if (parameter === 'rainfall') return value > 140 ? 'High' : value > 75 ? 'Medium' : 'Low';
  if (parameter === 'soilMoisture') return value > 75 ? 'High' : value > 55 ? 'Medium' : 'Low';
  if (parameter === 'slope') return value > 25 ? 'High' : value > 15 ? 'Medium' : 'Low';
  if (parameter === 'elevation') return value > 1800 ? 'High' : value > 800 ? 'Medium' : 'Low';
  if (parameter === 'ndvi') return value < 0.58 ? 'High' : value < 0.7 ? 'Medium' : 'Low';
  if (parameter === 'historicalLandslide') return value ? 'High' : 'Low';
  return 'Low';
}

/**
 * Scientific Geotechnical Risk Calculation Formula.
 * Correlates real-time live meteorological telemetry with static terrain geomorphology.
 */
export function calculateGeomorphicRisk({
  rainfall = 0,
  slope = 20,
  soilMoisture = 60,
  historicalLandslides = 0,
  ndvi = 0.65,
  elevation = 1000,
}) {
  const rfNum = Math.max(0, Number(rainfall) || 0);
  const slopeNum = Math.max(0, Math.min(60, Number(slope) || 20));
  const smNum = Math.max(10, Math.min(100, Number(soilMoisture) || 60));
  const histNum = Number(historicalLandslides) > 0 ? 1 : 0;
  const ndviNum = Math.max(0.1, Math.min(1.0, Number(ndvi) || 0.65));

  // Dynamic soil moisture response to active rainfall:
  const adjustedSm = Math.min(99, Math.round(smNum * 0.7 + (rfNum / 160) * 30));

  // 1. Rainfall Driving Force (up to 35 pts)
  const rfScore = Math.min(1.0, rfNum / 180.0) * 35.0;

  // 2. Slope Gravity Component (up to 25 pts)
  const slopeScore = Math.min(1.0, slopeNum / 45.0) * 25.0;

  // 3. Pore-Water Pressure Component (up to 20 pts)
  const smScore = Math.min(1.0, adjustedSm / 100.0) * 20.0;

  // 4. Pre-existing Structural Weakness / History (12 pts)
  const histScore = histNum ? 12.0 : 2.0;

  // 5. Root Cohesion Deficit via NDVI (up to 8 pts)
  const vegScore = Math.max(0.0, (0.88 - ndviNum) / 0.88) * 8.0;

  const rawScore = Math.round(rfScore + slopeScore + smScore + histScore + vegScore);
  const riskScore = Math.max(5, Math.min(98, rawScore));
  const riskLevel = getRiskLevelFromScore(riskScore);

  return {
    riskScore,
    riskLevel,
    riskColor: riskColors[riskLevel] || '#ea580c',
    adjustedSoilMoisture: adjustedSm,
    breakdown: {
      rainfallComponent: Math.round(rfScore),
      slopeComponent: Math.round(slopeScore),
      moistureComponent: Math.round(smScore),
      historyComponent: Math.round(histScore),
      vegetationComponent: Math.round(vegScore),
    },
  };
}

/**
 * Curated monitoring stations across all 8 North Eastern Region (NER) States:
 * Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim.
 */
export const riskLocations = [
  // --- ASSAM ---
  {
    id: 'haflong',
    locationName: 'Haflong Hills',
    district: 'Dima Hasao',
    state: 'Assam',
    latitude: 25.1645,
    longitude: 93.0176,
    rainfall: 128,
    soilMoisture: 76,
    slope: 28,
    elevation: 966,
    ndvi: 0.62,
    historicalLandslides: 5,
    historicalLandslideStatus: 'Recorded major events in 2022 railway embankment',
    riskScore: 76,
    riskLevel: 'Critical',
    village: 'Bagetar & Lower Haflong',
  },
  {
    id: 'diphu',
    locationName: 'Diphu Corridor',
    district: 'Karbi Anglong',
    state: 'Assam',
    latitude: 25.843,
    longitude: 93.4315,
    rainfall: 72,
    soilMoisture: 56,
    slope: 16,
    elevation: 186,
    ndvi: 0.72,
    historicalLandslides: 1,
    historicalLandslideStatus: 'Minor slope washouts recorded',
    riskScore: 42,
    riskLevel: 'Moderate',
    village: 'Rongnihang',
  },
  {
    id: 'guwahati_hills',
    locationName: 'Kalapahar Slopes',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    latitude: 26.1365,
    longitude: 91.7342,
    rainfall: 115,
    soilMoisture: 72,
    slope: 24,
    elevation: 210,
    ndvi: 0.58,
    historicalLandslides: 4,
    historicalLandslideStatus: 'Multiple urban translational slips recorded',
    riskScore: 68,
    riskLevel: 'High',
    village: 'Boragaon Hillside',
  },

  // --- ARUNACHAL PRADESH ---
  {
    id: 'tawang',
    locationName: 'Tawang Valley Pass',
    district: 'Tawang',
    state: 'Arunachal Pradesh',
    latitude: 27.586,
    longitude: 91.8657,
    rainfall: 164,
    soilMoisture: 91,
    slope: 35,
    elevation: 2669,
    ndvi: 0.52,
    historicalLandslides: 8,
    historicalLandslideStatus: 'Active historical landslide and moraine zone',
    riskScore: 93,
    riskLevel: 'Critical',
    village: 'Lhou Village & Jang Pass',
  },
  {
    id: 'yingkiong',
    locationName: 'Yingkiong Ridge',
    district: 'Upper Siang',
    state: 'Arunachal Pradesh',
    latitude: 28.6106,
    longitude: 95.046,
    rainfall: 136,
    soilMoisture: 80,
    slope: 29,
    elevation: 341,
    ndvi: 0.67,
    historicalLandslides: 3,
    historicalLandslideStatus: 'Recorded monsoon flash debris flows',
    riskScore: 77,
    riskLevel: 'Critical',
    village: 'Simong Settlement',
  },
  {
    id: 'itanagar',
    locationName: 'Itanagar Hills',
    district: 'Papum Pare',
    state: 'Arunachal Pradesh',
    latitude: 27.0844,
    longitude: 93.6053,
    rainfall: 88,
    soilMoisture: 62,
    slope: 21,
    elevation: 320,
    ndvi: 0.70,
    historicalLandslides: 2,
    historicalLandslideStatus: 'Occasional cut-slope collapses',
    riskScore: 48,
    riskLevel: 'Moderate',
    village: 'Ganga Lake Catchment',
  },

  // --- MEGHALAYA ---
  {
    id: 'shillong',
    locationName: 'Shillong',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    latitude: 25.5788,
    longitude: 91.8933,
    rainfall: 15,
    soilMoisture: 82,
    slope: 28,
    elevation: 1486,
    ndvi: 0.52,
    temperature: 22,
    windSpeed: 12,
    weatherCondition: 'Light Rain',
    historicalLandslides: 3,
    historicalLandslideStatus: 'Historical hillside road cut slips documented',
    riskScore: 68,
    riskLevel: 'High',
    village: 'Laitumkhrah & Upper Shillong',
  },
  {
    id: 'sohra',
    locationName: 'Sohra Escarpment',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    latitude: 25.2702,
    longitude: 91.7328,
    rainfall: 192,
    soilMoisture: 88,
    slope: 32,
    elevation: 1313,
    ndvi: 0.56,
    historicalLandslides: 9,
    historicalLandslideStatus: 'Cherrapunji high-frequency orographic slip zone',
    riskScore: 91,
    riskLevel: 'Critical',
    village: 'Nongriat & Mawmluh',
  },
  {
    id: 'jowai',
    locationName: 'Jowai Ridge',
    district: 'West Jaintia Hills',
    state: 'Meghalaya',
    latitude: 25.452,
    longitude: 92.2087,
    rainfall: 94,
    soilMoisture: 64,
    slope: 20,
    elevation: 1390,
    ndvi: 0.73,
    historicalLandslides: 2,
    historicalLandslideStatus: 'Occasional minor slips along NH-6',
    riskScore: 53,
    riskLevel: 'High',
    village: 'Ialong Sector',
  },

  // --- MANIPUR ---
  {
    id: 'tupul',
    locationName: 'Tupul Railway Corridor',
    district: 'Noney',
    state: 'Manipur',
    latitude: 24.7186,
    longitude: 93.6331,
    rainfall: 175,
    soilMoisture: 89,
    slope: 34,
    elevation: 820,
    ndvi: 0.54,
    historicalLandslides: 6,
    historicalLandslideStatus: 'Catastrophic 2022 debris avalanche zone',
    riskScore: 94,
    riskLevel: 'Critical',
    village: 'Makhuam Village',
  },
  {
    id: 'senapati',
    locationName: 'Senapati Highway',
    district: 'Senapati',
    state: 'Manipur',
    latitude: 25.2671,
    longitude: 94.0222,
    rainfall: 124,
    soilMoisture: 77,
    slope: 27,
    elevation: 1061,
    ndvi: 0.65,
    historicalLandslides: 4,
    historicalLandslideStatus: 'Recorded events in the last 5 years',
    riskScore: 74,
    riskLevel: 'High',
    village: 'Karong Settlement',
  },
  {
    id: 'tamenglong',
    locationName: 'Tamenglong Hills',
    district: 'Tamenglong',
    state: 'Manipur',
    latitude: 24.982,
    longitude: 93.494,
    rainfall: 155,
    soilMoisture: 85,
    slope: 31,
    elevation: 1260,
    ndvi: 0.60,
    historicalLandslides: 5,
    historicalLandslideStatus: 'Active historical landslide corridor',
    riskScore: 88,
    riskLevel: 'Critical',
    village: 'Dailong Heritage Cluster',
  },

  // --- MIZORAM ---
  {
    id: 'aizawl',
    locationName: 'Aizawl Urban Slopes',
    district: 'Aizawl',
    state: 'Mizoram',
    latitude: 23.7271,
    longitude: 92.7176,
    rainfall: 118,
    soilMoisture: 74,
    slope: 26,
    elevation: 1132,
    ndvi: 0.61,
    historicalLandslides: 5,
    historicalLandslideStatus: 'Cyclone Remal Melthum-Hlimen fatal slide area',
    riskScore: 73,
    riskLevel: 'High',
    village: 'Melthum & Ramhlun',
  },
  {
    id: 'lunglei',
    locationName: 'Lunglei Ridge',
    district: 'Lunglei',
    state: 'Mizoram',
    latitude: 22.8671,
    longitude: 92.7654,
    rainfall: 78,
    soilMoisture: 58,
    slope: 18,
    elevation: 722,
    ndvi: 0.74,
    historicalLandslides: 1,
    historicalLandslideStatus: 'No major recent incidents recorded',
    riskScore: 41,
    riskLevel: 'Moderate',
    village: 'Rahsiveng Cluster',
  },

  // --- NAGALAND ---
  {
    id: 'kohima',
    locationName: 'Kohima Bypass',
    district: 'Kohima',
    state: 'Nagaland',
    latitude: 25.6751,
    longitude: 94.1086,
    rainfall: 125,
    soilMoisture: 75,
    slope: 28,
    elevation: 1444,
    ndvi: 0.63,
    historicalLandslides: 4,
    historicalLandslideStatus: 'Periodic monsoon slips along NH-29',
    riskScore: 75,
    riskLevel: 'High',
    village: 'Jotsoma Village',
  },
  {
    id: 'phek',
    locationName: 'Pfutsero Hill Pass',
    district: 'Phek',
    state: 'Nagaland',
    latitude: 25.684,
    longitude: 94.312,
    rainfall: 70,
    soilMoisture: 52,
    slope: 17,
    elevation: 1524,
    ndvi: 0.78,
    historicalLandslides: 1,
    historicalLandslideStatus: 'Past road subsidence reported during late monsoon',
    riskScore: 36,
    riskLevel: 'Moderate',
    village: 'Kikruma Sector',
  },
  {
    id: 'mokokchung',
    locationName: 'Mokokchung Slopes',
    district: 'Mokokchung',
    state: 'Nagaland',
    latitude: 26.324,
    longitude: 94.516,
    rainfall: 48,
    soilMoisture: 44,
    slope: 14,
    elevation: 1325,
    ndvi: 0.81,
    historicalLandslides: 0,
    historicalLandslideStatus: 'No recorded slope failures in inventory',
    riskScore: 24,
    riskLevel: 'Low',
    village: 'Ungma Village',
  },

  // --- TRIPURA ---
  {
    id: 'ambassa',
    locationName: 'Ambassa Slope',
    district: 'Dhalai',
    state: 'Tripura',
    latitude: 23.924,
    longitude: 91.855,
    rainfall: 60,
    soilMoisture: 50,
    slope: 13,
    elevation: 45,
    ndvi: 0.78,
    historicalLandslides: 0,
    historicalLandslideStatus: 'Minor rain washouts along road cuttings',
    riskScore: 30,
    riskLevel: 'Moderate',
    village: 'Kulal Cluster',
  },
  {
    id: 'dharmanagar',
    locationName: 'Dharmanagar Ridge',
    district: 'North Tripura',
    state: 'Tripura',
    latitude: 24.3667,
    longitude: 92.1694,
    rainfall: 38,
    soilMoisture: 36,
    slope: 9,
    elevation: 21,
    ndvi: 0.83,
    historicalLandslides: 0,
    historicalLandslideStatus: 'No historical events in inventory',
    riskScore: 16,
    riskLevel: 'Low',
    village: 'Rajbari Sector',
  },

  // --- SIKKIM ---
  {
    id: 'gangtok',
    locationName: 'Gangtok Ridge & NH-10',
    district: 'East Sikkim',
    state: 'Sikkim',
    latitude: 27.3389,
    longitude: 88.6065,
    rainfall: 172,
    soilMoisture: 87,
    slope: 33,
    elevation: 1650,
    ndvi: 0.58,
    historicalLandslides: 7,
    historicalLandslideStatus: 'High active vulnerability corridor along NH-10',
    riskScore: 89,
    riskLevel: 'Critical',
    village: 'Tadong & Deorali',
  },
  {
    id: 'mangan',
    locationName: 'Mangan-Chungthang Link',
    district: 'North Sikkim',
    state: 'Sikkim',
    latitude: 27.5096,
    longitude: 88.5309,
    rainfall: 168,
    soilMoisture: 89,
    slope: 37,
    elevation: 956,
    ndvi: 0.55,
    historicalLandslides: 8,
    historicalLandslideStatus: 'Teesta valley catastrophic road breach zone',
    riskScore: 95,
    riskLevel: 'Critical',
    village: 'Pegong & Naga Village',
  },
  {
    id: 'pakyong',
    locationName: 'Pakyong Hillside',
    district: 'Pakyong',
    state: 'Sikkim',
    latitude: 27.228,
    longitude: 88.589,
    rainfall: 104,
    soilMoisture: 68,
    slope: 24,
    elevation: 1422,
    ndvi: 0.68,
    historicalLandslides: 3,
    historicalLandslideStatus: 'Airport access cut-slopes monitored',
    riskScore: 67,
    riskLevel: 'High',
    village: 'Dikling Village',
  },
];
