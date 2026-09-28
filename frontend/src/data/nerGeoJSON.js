/**
 * GeoJSON polygon boundaries and major infrastructure corridors
 * for the 8 North Eastern Region (NER) states of India.
 */

export const nerStateBoundaries = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Assam', code: 'AS', color: '#e89e35' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [89.8, 26.0], [90.5, 26.5], [91.8, 26.7], [93.2, 27.0],
          [94.5, 27.5], [95.8, 27.8], [96.0, 27.3], [95.2, 26.8],
          [94.0, 26.2], [93.1, 25.0], [92.6, 24.5], [92.3, 24.8],
          [91.5, 25.8], [90.2, 25.9], [89.8, 26.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Arunachal Pradesh', code: 'AR', color: '#4b6b3e' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.6, 27.3], [92.0, 28.0], [93.5, 28.6], [95.0, 29.3],
          [96.5, 28.8], [97.3, 28.1], [96.8, 27.5], [95.5, 27.3],
          [94.0, 27.0], [92.5, 26.9], [91.6, 27.3]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Meghalaya', code: 'ML', color: '#cf5729' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [89.9, 25.1], [90.8, 25.9], [92.0, 25.8], [92.8, 25.5],
          [92.8, 25.0], [91.8, 25.1], [90.8, 25.1], [89.9, 25.1]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Manipur', code: 'MN', color: '#ea983a' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93.0, 24.0], [93.2, 25.6], [94.5, 25.6], [94.8, 24.8],
          [94.4, 23.8], [93.5, 23.9], [93.0, 24.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Mizoram', code: 'MZ', color: '#2f6133' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92.3, 24.3], [93.1, 24.2], [93.4, 23.0], [93.0, 21.9],
          [92.5, 22.0], [92.2, 23.2], [92.3, 24.3]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Nagaland', code: 'NL', color: '#2f5c35' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93.3, 25.5], [93.8, 26.3], [94.8, 27.0], [95.2, 26.8],
          [94.6, 25.7], [94.0, 25.3], [93.3, 25.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Sikkim', code: 'SK', color: '#4e6644' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [88.1, 27.2], [88.2, 28.0], [88.9, 28.0], [88.8, 27.1],
          [88.4, 27.1], [88.1, 27.2]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Tripura', code: 'TR', color: '#548443' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.1, 23.8], [91.8, 24.5], [92.3, 24.4], [92.2, 23.5],
          [91.8, 22.9], [91.3, 23.2], [91.1, 23.8]
        ]]
      }
    },
  ]
};

export const nerInfrastructureCorridors = [
  {
    id: 'nh10',
    name: 'NH-10 (Siliguri – Gangtok Highway Corridor)',
    type: 'Highway',
    criticality: 'High Landslide Hazard',
    path: [
      [26.72, 88.42],
      [26.91, 88.45],
      [27.08, 88.52],
      [27.24, 88.56],
      [27.33, 88.61]
    ]
  },
  {
    id: 'nh29',
    name: 'NH-29 (Dimapur – Kohima – Imphal Highway Corridor)',
    type: 'Highway',
    criticality: 'Frequent Subsidence Zone',
    path: [
      [25.90, 93.72],
      [25.77, 93.93],
      [25.67, 94.11],
      [25.27, 94.02],
      [24.81, 93.94]
    ]
  },
  {
    id: 'rail_lumding',
    name: 'Lumding – Badarpur Hill Section (Hill Railway)',
    type: 'Railway',
    criticality: 'High Vulnerability to Mudslides',
    path: [
      [25.75, 93.17],
      [25.32, 93.08],
      [25.17, 93.02],
      [24.96, 92.93],
      [24.89, 92.60]
    ]
  },
  {
    id: 'trans_arunachal',
    name: 'Trans-Arunachal Strategic Corridor',
    type: 'Highway',
    criticality: 'Active Debris Flow Slopes',
    path: [
      [27.15, 93.62],
      [27.58, 94.15],
      [28.10, 94.75],
      [28.61, 95.05],
      [28.32, 95.96]
    ]
  }
];

export const nerEvacuationRoutes = [
  {
    id: 'evac-meghalaya',
    name: 'Shillong Plateau Emergency Evacuation Route',
    state: 'Meghalaya',
    blockedSegment: {
      name: 'NH-6 Nongpoh Mudslide Danger Zone',
      status: 'BLOCKED / HIGH RISK',
      coords: [
        [25.90, 91.88],
        [25.82, 91.90],
        [25.72, 91.92]
      ]
    },
    safeBypassRoute: {
      name: 'Mawphlang – Mairang Safe High-Ridge Corridor',
      status: 'RECOMMENDED SAFE ROUTE',
      distance: '64 km',
      travelTime: '1 hr 45 min',
      coords: [
        [26.14, 91.75],
        [25.95, 91.60],
        [25.75, 91.65],
        [25.57, 91.89]
      ]
    },
    emergencyShelter: {
      name: 'Polo Grounds District Evacuation Relief Shelter',
      coords: [25.585, 91.895],
      capacity: '1,200 Persons',
      phone: '0364-2224107'
    },
    emergencyHospital: {
      name: 'NEIGRIHMS Multi-Speciality Disaster Hospital',
      coords: [25.590, 91.930],
      phone: '0364-2538011'
    }
  },
  {
    id: 'evac-sikkim',
    name: 'Gangtok – Teesta Valley Evacuation Corridor',
    state: 'Sikkim',
    blockedSegment: {
      name: 'NH-10 29th Mile Landslide Cut-off',
      status: 'BLOCKED / HIGH RISK',
      coords: [
        [26.95, 88.48],
        [27.05, 88.52],
        [27.18, 88.55]
      ]
    },
    safeBypassRoute: {
      name: 'Melli – Namchi – Singtam Alternative High Ridge',
      status: 'RECOMMENDED SAFE ROUTE',
      distance: '78 km',
      travelTime: '2 hr 20 min',
      coords: [
        [26.75, 88.42],
        [27.08, 88.45],
        [27.17, 88.36],
        [27.23, 88.49],
        [27.33, 88.61]
      ]
    },
    emergencyShelter: {
      name: 'Singtam Community Relief Camp & Shelter',
      coords: [27.235, 88.495],
      capacity: '850 Persons',
      phone: '03592-234201'
    },
    emergencyHospital: {
      name: 'STNM Multi-Speciality Hospital, Gangtok',
      coords: [27.320, 88.615],
      phone: '03592-202944'
    }
  }
];

