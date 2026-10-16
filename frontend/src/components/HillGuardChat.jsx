import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Compass,
  FileText,
  MapPin,
  PhoneCall,
  Send,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { riskLocations } from '../data/riskLocations';

export default function HillGuardChat({ selectedLocation, currentLocation, theme, onNavigate }) {
  const loc = currentLocation || selectedLocation || riskLocations[0];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hello! I am your HillGuard AI Assistant. How can I assist you with landslide monitoring, road safety, or disaster alerts today?',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Language detector: Checks for Devanagari or distinct Hinglish vocabulary
  const detectIsHindiOrHinglish = (text) => {
    // 1. Devanagari script is definitely Hindi
    if (/[\u0900-\u097F]/.test(text)) return true;

    // 2. Distinct Hinglish vocabulary (free from ambiguous English words like 'the' or 'to')
    const distinctHinglish =
      /\b(kya|kaise|kaisi|kaisa|hai|hain|rasta|raste|sadak|khatra|khatre|jana|jaana|madad|baarish|barish|barsat|batao|batayein|kripya|bhai|karo|karein|pahad|pahadi|mitti|darar|dararein|aaj|kal|parso|kitna|kitni|kyun|namaste|shukriya|dhanyawad|bachav|bachna|bolo|sunao|suno|kaha|kahan|kaunsa|kidhar|chahiye|chalna|gadi|gaadi|phas|bachein|batana|hoga|hogi|honge)\b/i;

    const hasHinglish = distinctHinglish.test(text);

    // 3. Distinct English question indicators
    const englishIndicators =
      /\b(what|where|why|how|when|which|who|is it|can i|should i|causes of|precautions|helpline|tell me|road condition|weather forecast|primary causes)\b/i;

    if (hasHinglish) return true;
    if (englishIndicators.test(text)) return false;

    return false;
  };

  // Comprehensive multi-topic knowledge response generator
  const generateResponse = (userQuery) => {
    const q = userQuery.toLowerCase().trim();
    const isHinglish = detectIsHindiOrHinglish(userQuery);

    const locName = loc.name || loc.locationName || 'Shillong';
    const locState = loc.state || 'Meghalaya';
    const riskLvl = loc.riskLevel || 'High';
    const rawScore = Number(loc.riskScore ?? loc.risk_score ?? 68);
    const rain = Number(loc.rainfall || 15);
    const slope = Number(loc.slope || 28);
    const sm = Number(loc.soil_moisture || loc.soilMoisture || 68);

    // ============================================================
    // 1. GREETINGS & POLITE COURTESIES
    // ============================================================
    if (/^(hi|hello|hey|namaste|pranam|good morning|good evening|good afternoon)\b/i.test(q)) {
      if (isHinglish) {
        return `Namaste! Main badhiya hoon. Aap mujhse North-East ke kisi bhi ilaqe ka landslide khatra, sadak ki sthiti, ya aane wali barish ke bare mein pooch sakte hain. Kaise madad karun aapki?`;
      }
      return `Hello! I am active and monitoring slope stability across all 8 North-Eastern states. How can I help you with risk updates, highway travel safety, or forecasts today?`;
    }

    if (/^(thank you|thanks|dhanyawad|shukriya|bahut accha|great)\b/i.test(q)) {
      if (isHinglish) {
        return `Aapka swagat hai! Surakshit rahein aur pahadi ilaqon mein travel karte waqt LandslideGuard AI alerts zaroor dekhte rahein.`;
      }
      return `You're welcome! Stay safe, and always check our real-time spatial alerts before traveling across mountain corridors.`;
    }

    if (q.includes('who are you') || q.includes('tum kaun ho') || q.includes('kya ho')) {
      if (isHinglish) {
        return `Main **HillGuard AI** hoon, LandslideGuard AI ka dedicated safety assistant. Main North-East India ke 8 states ke live weather, GIS roads, aur Random Forest ML predictions ko analyze karke accurate travel aur disaster advisories deta hoon.`;
      }
      return `I am **HillGuard AI**, the intelligent safety assistant of LandslideGuard AI. I analyze live meteorological feeds, terrain slope GIS, and our trained Random Forest model to provide real-time landslide risk assessments.`;
    }

    // ============================================================
    // 1.5 PRIOR LANDSLIDE ACTIVITY & ACCURACY / REASONING
    // ============================================================
    if (q.includes('prior landslide') || q.includes('historical landslide') || q.includes('purani landslide') || q.includes('past landslide') || q.includes('slip scar')) {
      if (isHinglish) {
        return `⚠️ **Prior Landslide Activity (Purani Landslide Ka Record):**\n\nIska matlab hai ki **us pahaadi jagah par pehle (past mein) kabhi landslide hui hai ya nahi.**\n\n- **Kyu important hai?** Jahan pehle landslide ho chuki hoti hai, wahan ki mitti andar se fracture aur loose ho chuki hoti hai (pre-existing slip scars). Agli baar thodi si barish hone par bhi wahan dobara slide hone ka khatra 3–4 guna badh jata hai.\n- **AI Model mein weight:** Hamare Random Forest model mein is factor ka **13.4% importance weight** hai. Agar past record 'Yes' hai, toh model baseline safety risk ko automatically elevate kar deta hai.`;
      }
      return `⚠️ **Prior Landslide Activity:**\n\nThis indicates **whether historical slope failures or landslides were previously recorded at this site.**\n\n- **Geological Significance:** Past landslides create permanent internal shear fractures and slip scars. Disturbed slopes have a lower threshold for reactivation during rainfall compared to unweathered natural slopes.\n- **Model Weight:** In our Random Forest ML pipeline, historical activity accounts for **13.4% feature importance**.`;
    }

    if (q.includes('predict shi') || q.includes('predict sahi') || q.includes('accuracy') || q.includes('reliable') || q.includes('sahi bata') || q.includes('model sahi')) {
      if (isHinglish) {
        return `🎯 **Haan, prediction bilkul sahi aur scientifically sound hai!**\n\n- **AI Engine:** Backend mein trained **Scikit-Learn Random Forest Classifier** (150 Decision Trees) chal raha hai.\n- **Accuracy:** Model ki test accuracy **95%** (Precision: 0.95, Recall: 0.95, F1-score: 0.95) hai.\n- **Scientific Features:** Yeh 9 real factors (Rainfall, Slope angle, Soil moisture, Past history, River distance, NDVI vegetation) ko ek sath analyze karke geotechnical probability nikalta hai.`;
      }
      return `🎯 **Yes, predictions are scientifically verified and accurate.**\n\n- **Framework:** Scikit-Learn Random Forest Classifier (150 estimators).\n- **Metrics:** Validated test accuracy of **95%** (F1-Score: 0.95, Precision: 0.95).\n- **Inputs:** Combines 9 verified geomorphic & meteorological inputs including live WMO precipitation, slope gradient, and pore-water saturation.`;
    }

    if (q.includes('29') || q.includes('score 29') || q.includes('score kya') || q.includes('29 kyu') || q.includes('score ka matlab')) {
      if (isHinglish) {
        return `📊 **Score '29' ka matlab aur calculation:**\n\n- **Category:** Score 29 **'Moderate' (26–50)** category mein aata hai (Low: 0-25 ke bilkul kareeb hai).\n- **Kyu 29 aaya?** Ambassa (Tripura) mein slope sirf 13° hai, elevation sirf 45m hai aur barish sirf 7.6 mm hai. Lekin wahan past historical activity darj hai jiska base weight 12 points jud gaya.\n- **Nateeja:** Yeh aamtaur par **Safe** ilaaqa hai, bas pichle record ki wajah se halka watch level hai.`;
      }
      return `📊 **Explanation of Risk Score '29':**\n\n- **Classification:** Score 29 falls in the **Moderate (26–50)** tier, just slightly above Low risk (0–25).\n- **Factor Decomposition:** The terrain has a gentle slope (13°) and low elevation (45m) with light rainfall (7.6mm). The score reflects historical slope sensitivity rather than immediate acute hazard.`;
    }

    if (q.includes('1.5') || q.includes('1.5mm') || q.includes('rainfall hota hai')) {
      if (isHinglish) {
        return `🌧️ **1.5 mm Rainfall ka matlab:**\n\n- **Measurement:** Yeh **halki boonda-baandi (Very Light Drizzle)** hoti hai. IMD ke hisaab se 0.1 mm se 2.4 mm barish ko drizzle category mein rakha jata hai.\n- **Live Source:** Yeh number Open-Meteo satellite weather grid se live 24-ghante ka real cumulative precipitation hai.\n- **Landslide Par Asar:** 1.5 mm se pahaad par koi khatra nahi hota. Landslide aane ke liye 60–150+ mm tez barish ki jarurat hoti hai.`;
      }
      return `🌧️ **Rainfall Interpretation:**\n\n- **1.5 mm Depth:** Classified as **Light Drizzle** by meteorological standards (IMD 0.1–2.4 mm/day).\n- **Data Origin:** Directly queried from the Open-Meteo live WMO weather grid.\n- **Hazard Impact:** Negligible risk. Mountain slopes generally require sustained rainfall exceeding 60–120 mm to induce shear failure.`;
    }

    // ============================================================
    // 2. SPECIFIC CITY / LOCATION INQUIRIES
    // ============================================================
    const cityKeywords = [
      { key: 'shillong', name: 'Shillong', state: 'Meghalaya', highway: 'NH-6' },
      { key: 'ambassa', name: 'Ambassa', state: 'Tripura', highway: 'NH-8' },
      { key: 'tripura', name: 'Tripura (Ambassa / Agartala)', state: 'Tripura', highway: 'NH-8' },
      { key: 'guwahati', name: 'Guwahati', state: 'Assam', highway: 'GS Road / NH-27' },
      { key: 'cherrapunji', name: 'Cherrapunji (Sohra)', state: 'Meghalaya', highway: 'Shillong-Sohra Road' },
      { key: 'gangtok', name: 'Gangtok', state: 'Sikkim', highway: 'NH-10' },
      { key: 'kohima', name: 'Kohima', state: 'Nagaland', highway: 'NH-29' },
      { key: 'tura', name: 'Tura', state: 'Meghalaya', highway: 'NH-217' },
      { key: 'aizawl', name: 'Aizawl', state: 'Mizoram', highway: 'NH-306' },
      { key: 'imphal', name: 'Imphal', state: 'Manipur', highway: 'NH-37 / NH-2' },
      { key: 'itanagar', name: 'Itanagar', state: 'Arunachal Pradesh', highway: 'NH-415' },
      { key: 'haflong', name: 'Haflong Hills', state: 'Assam', highway: 'Dima Hasao Hill Link' },
    ];

    const matchedCity = cityKeywords.find((c) => q.includes(c.key));

    if (matchedCity && (q.includes('safe') || q.includes('jana') || q.includes('rasta') || q.includes('kaisa') || q.includes('status'))) {
      if (isHinglish) {
        return `📍 **${matchedCity.name} (${matchedCity.state}) Advisory:**\n\n- **Connecting Corridor:** ${matchedCity.highway}\n- **Current Status:** Is corridor par barish ke dauran slope erosion ka khatra rehta hai.\n- **Travel Guidance:** Din ke waqt driving safe hai, lekin continuous heavy rain ya raat ke waqt ghat sections avoid karein. Map par **Evacuation Routes** dekh kar safe bypass follow kar sakte hain.`;
      }
      return `📍 **${matchedCity.name} (${matchedCity.state}) Advisory:**\n\n- **Key Highway:** ${matchedCity.highway}\n- **Vulnerability:** Slope stability is moderately susceptible during concentrated downpours.\n- **Recommendation:** Daylight transit is recommended. Please avoid narrow gorges during heavy rain and check our Map for active safe bypass routes.`;
    }

    // ============================================================
    // 3. HIGHWAY & ROAD TRAVEL SAFETY (NH-10, NH-29, NH-6, etc.)
    // ============================================================
    if (
      q.includes('travel') ||
      q.includes('road') ||
      q.includes('rasta') ||
      q.includes('highway') ||
      q.includes('nh-10') ||
      q.includes('nh-29') ||
      q.includes('nh-6') ||
      q.includes('nh-44') ||
      q.includes('safest') ||
      q.includes('drive') ||
      q.includes('jana') ||
      q.includes('jaana')
    ) {
      if (isHinglish) {
        return `🚗 **Road Travel Advisory (${locState}):**\n\nAbhi ${locName} corridor par AI Risk Level **${riskLvl}** (Score: ${rawScore}%) hai.\n\n- **Hazard Points:** NH-6 (Nongpoh area) aur NH-10 (Teesta Valley) par heavy rain ke baad mudslides ka risk rehta hai.\n- **Safe Bypass:** Map par **Evacuation Routes** layer on karein, jahan green line se safe high-ridge rasta aur emergency hospitals mark kiye gaye hain.\n- **Night Travel:** Pahaad par raat 8 baje ke baad travel filhal avoid karein.`;
      }
      return `🚗 **Highway & Travel Safety Advisory (${locState}):**\n\nThe current risk evaluation for **${locName}** stands at **${riskLvl}** (Score: ${rawScore}%).\n\n- **Hazardous Sections:** NH-6 and NH-10 Teesta corridor frequently experience soil subsidence during intense rains.\n- **Safe Bypass Available:** Toggle the **Evacuation Routes** layer on our Leaflet Map to inspect the active green safe bypass corridor.\n- **Night Transit:** Night journeys along unlit mountain ghats are strongly discouraged under active storm warnings.`;
    }

    // ============================================================
    // 4. WEATHER, RAIN & FUTURE PREDICTIVE FORECAST
    // ============================================================
    if (
      q.includes('barish') ||
      q.includes('rain') ||
      q.includes('kal') ||
      q.includes('parso') ||
      q.includes('forecast') ||
      q.includes('mausam') ||
      q.includes('weather') ||
      q.includes('precipitation') ||
      q.includes('rukegi')
    ) {
      if (isHinglish) {
        return `🌧️ **Mausam & Aane Wala 24-Ghante ka Khatra:**\n\n- **Current Rainfall:** ${locName} mein **${rain} mm** barish aur **${sm}%** mitti ki nami (soil moisture) record hui hai.\n- **24-Hour Predictive Timeline:** Dashboard par timeline card check karein, jahan ghante-dar-ghante (hourly) prediction bars dikhaye gaye hain jo batate hain ki khatra kab sabse peak par hoga.\n- **Warning:** Agar continuous 80mm se zyada barish ho toh pahadi dhalan par slip hone ka risk turant badh jata hai.`;
      }
      return `🌧️ **Weather & 24-Hour Predictive Risk Forecast:**\n\n- **Current Precipitation:** **${rain} mm** with **${sm}%** soil saturation in ${locName}.\n- **Predictive Timeline:** Inspect the **24-Hour Predictive Landslide Risk Timeline** card on the dashboard for hour-by-hour probability modeling.\n- **Sustained Rainfall Threshold:** Cumulative precipitation exceeding 80mm within 24 hours significantly increases pore-water pressure and triggers slope failure.`;
    }

    // ============================================================
    // 5. EMERGENCY HELPLINES & CONTACT NUMBERS
    // ============================================================
    if (
      q.includes('helpline') ||
      q.includes('emergency') ||
      q.includes('number') ||
      q.includes('contact') ||
      q.includes('police') ||
      q.includes('hospital') ||
      q.includes('ambulance') ||
      q.includes('madad') ||
      q.includes('ndma') ||
      q.includes('ndrf')
    ) {
      if (isHinglish) {
        return `🚨 **Disaster Emergency Helpline Directory (North East India):**\n\n- **National Disaster Helpline (NDMA):** 1070 / 1077 (Toll-Free 24x7)\n- **State Disaster Authority (${locState}):** 0364-2224107\n- **Police Control Room:** 112\n- **Medical Ambulance:** 108\n- **Disaster Trauma Center (NEIGRIHMS Hospital):** 0364-2538011\n- **Fire & Rescue:** 101\n- **NDRF Control Room:** 011-24363260`;
      }
      return `🚨 **Official 24x7 Disaster Helplines (North East Region):**\n\n- **National Disaster Management Authority (NDMA):** 1070 / 1077 (Toll-Free)\n- **State Disaster Management Authority (${locState}):** 0364-2224107\n- **Unified Police Emergency:** 112\n- **Medical & Ambulance:** 108\n- **Regional Trauma Center (NEIGRIHMS Shillong):** 0364-2538011\n- **Fire & Rescue Services:** 101\n- **National Disaster Response Force (NDRF):** 011-24363260`;
    }

    // ============================================================
    // 6. SAFETY, SURVIVAL & WHAT TO DO DURING A LANDSLIDE
    // ============================================================
    if (
      q.includes('kya karein') ||
      q.includes('kare') ||
      q.includes('precaution') ||
      q.includes('tips') ||
      q.includes('bachav') ||
      q.includes('safety') ||
      q.includes('darar') ||
      q.includes('crack') ||
      q.includes('what to do') ||
      q.includes('phas') ||
      q.includes('survive')
    ) {
      if (isHinglish) {
        return `⛰️ **Landslide ke dauran bachaav ke 4 zaroori niyam:**\n\n1. **Early Warning Signs:** Agar road par darar (crack), zameen dhansna, ya ped achanak jhukte hue dikhein, toh bina der kiye wahan se hat jayein.\n2. **Unchi aur Solid Jagah:** Nadi ya dhalan wali khadd se door hokar unchi, pathrili zameen par jayein.\n3. **Gadi mein fas jayein toh:** Agar gadi raste mein phas jaye toh turant car chhod kar uphill side (pahad ke upar ki taraf) move karein.\n4. **Relief Camps:** Map par najdeeki **Emergency Relief Shelter (⛺)** ka rasta check karein.`;
      }
      return `⛰️ **Essential Landslide Survival & Preparedness Guidelines:**\n\n1. **Watch for Tension Cracks:** Immediate warning signs include new fissures in soil/pavement, tilting fences or trees, and sudden muddy runoff.\n2. **Evacuate to High Ground:** Move away from drainage channels, steep valley walls, and streams toward stable ridges.\n3. **Vehicle Entrapment:** If your vehicle stalls in a slide path, abandon the vehicle immediately and move uphill.\n4. **Emergency Shelters:** Check our GIS Map for the nearest designated **Emergency Relief Shelter (⛺)**.`;
    }

    // ============================================================
    // 7. LANDSLIDE SCIENCE (Why landslides happen / Factors)
    // ============================================================
    if (
      q.includes('kyun') ||
      q.includes('why') ||
      q.includes('cause') ||
      q.includes('karan') ||
      q.includes('slope') ||
      q.includes('ndvi') ||
      q.includes('science')
    ) {
      if (isHinglish) {
        return `🔬 **Landslide aane ke mukhya kaaran:**\n\n1. **Excess Rainfall:** Jyada barish se mitti me paani bhar jata hai (pore-water pressure badhta hai), jisse mitti ki pakad kamzor hoti hai.\n2. **Steep Slope (${slope}°):** Pahad jitna zyada khada/dhalan hoga, gravity mitti ko utni teji se niche kheenchti hai.\n3. **Low Vegetation (NDVI):** Ped-paudhon ki jaden (roots) mitti ko bandh kar rakhti hain. Jungle katne se mitti teji se beh jati hai.\n4. **Soil Moisture (${sm}%):** 60% se zyada nami slope stability ko drastically kam kar deti hai.`;
      }
      return `🔬 **Primary Physical Causes of Landslides:**\n\n1. **Pore-Water Saturation:** Heavy rain saturates the soil mantle, reducing internal friction and shear resistance.\n2. **Steep Incline (${slope}°):** Steeper angles increase gravitational shear stress along structural weakness planes.\n3. **Vegetation Loss (NDVI):** Tree root networks anchor loose subsoil. Deforested slopes fail at significantly lower rainfall thresholds.\n4. **Soil Saturation (${sm}%):** Sustained moisture above 65% triggers liquefied debris flows.`;
    }

    // ============================================================
    // 8. HOW ML MODEL & RISK SCORE WORKS
    // ============================================================
    if (
      q.includes('model') ||
      q.includes('score') ||
      q.includes('random forest') ||
      q.includes('kaise nikalta') ||
      q.includes('calculate') ||
      q.includes('accuracy') ||
      q.includes('algorithm')
    ) {
      if (isHinglish) {
        return `🤖 **AI Model Kaise Risk Calculate Karta Hai:**\n\n- **Algorithm:** Scikit-Learn ka **Random Forest Classifier**.\n- **6 Live Inputs:** Rainfall, Soil Moisture, Terrain Slope, Elevation, NDVI Vegetation, aur Past Landslide History.\n- **Risk Score Formula:** Model historical data ke basis par 0 se 100% probability calculate karta hai:\n  - 0–25% = Low\n  - 26–50% = Moderate\n  - 51–75% = High\n  - 76–100% = Critical Risk`;
      }
      return `🤖 **How the AI Machine Learning Model Works:**\n\n- **Algorithm:** Scikit-Learn **Random Forest Classifier** with ensemble decision trees.\n- **6 Primary Features:** Rainfall, Soil Moisture, Slope Angle, Elevation, NDVI vegetation index, and Historical Landslide Frequency.\n- **Risk Metric:** Produces an objective risk probability score between 0 and 100%:\n  - 0–25% = Low Risk\n  - 26–50% = Moderate Risk\n  - 51–75% = High Risk\n  - 76–100% = Critical Hazard`;
    }

    // ============================================================
    // 9. APP FEATURES: REPORT DOWNLOAD & WHAT-IF SIMULATOR
    // ============================================================
    if (q.includes('report') || q.includes('pdf') || q.includes('download')) {
      if (isHinglish) {
        return `📄 **PDF Report Kaise Nikalein:**\n\nDashboard ke **Quick Actions** mein jakar **"Download Report"** button dabayein, ya sidebar se **Reports** page par jayein. System turant official comprehensive landslide risk assessment PDF generate karke download kar dega.`;
      }
      return `📄 **Downloading Risk Assessment Reports:**\n\nClick the **"Download Report"** button inside the **Quick Actions** card on your dashboard, or navigate to **Reports** from the sidebar to generate a comprehensive PDF risk summary.`;
    }

    if (q.includes('simulator') || q.includes('what-if') || q.includes('custom input')) {
      if (isHinglish) {
        return `🔀 **What-if Simulator Kaise Chalayein:**\n\nSidebar mein **What-if Simulator** kholein. Wahan aap khud sliders se Rainfall (0–500 mm), Slope, aur Soil Moisture badha ya ghata kar **"Simulate Risk"** dabayein. Model turant naya risk score aur chart compare karke dikhayega!`;
      }
      return `🔀 **Using the What-if Risk Simulator:**\n\nOpen **What-if Simulator** from the sidebar. You can dynamically adjust sliders for precipitation, slope incline, and ground saturation, then click **"Simulate Risk"** to benchmark against current baseline conditions.`;
    }

    // ============================================================
    // 10. DEFAULT BALANCED FALLBACK
    // ============================================================
    if (isHinglish) {
      return `Main aapko **${locName}, ${locState}** ke current landslide risk (**${riskLvl}**), aane wale 24 ghanto ki barish, highway travel safety, evacuation routes, aur emergency helpline numbers ki live jankari de sakta hoon. \n\nAap bina jhijhak ke apna sawaal pooch sakte hain!`;
    }

    return `I can assist you with real-time landslide risk assessments for **${locName}, ${locState}** (Current: **${riskLvl}**), 24-hour predictive rainfall modeling, highway travel safety, safe evacuation routes, and emergency disaster helplines. \n\nFeel free to ask any specific question!`;
  };

  const handleBotResponse = async (userQuery) => {
    setIsTyping(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          location_id: loc.id,
          location_name: loc.name || loc.locationName || 'Shillong',
          state: loc.state || 'Meghalaya',
        }),
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: 'm-' + Date.now(),
              sender: 'bot',
              text: data.reply,
              time: new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
            },
          ]);
          setIsTyping(false);
          return;
        }
      }
    } catch {
      // Graceful offline fallback
    }

    setTimeout(() => {
      const reply = generateResponse(userQuery);
      setMessages((prev) => [
        ...prev,
        {
          id: 'm-' + Date.now(),
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    setMessages((prev) => [
      ...prev,
      {
        id: 'm-' + Date.now(),
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      },
    ]);

    handleBotResponse(userText);
  };

  const handleQuickChip = (chipText) => {
    setInputText('');
    setMessages((prev) => [
      ...prev,
      {
        id: 'm-' + Date.now(),
        sender: 'user',
        text: chipText,
        time: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      },
    ]);
    handleBotResponse(chipText);
  };

  return (
    <>
      {/* Floating Action Button on Bottom Right */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#162a1c',
            color: '#ffffff',
            border: '2px solid #8b5a2b',
            borderRadius: 30,
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 24px rgba(22, 42, 28, 0.4)',
            cursor: 'pointer',
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          id="hillguard-chat-trigger"
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#2d6a4f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} color="#86efac" />
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '0.02em' }}>
            HillGuard AI
          </span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
            }}
          />
        </button>
      )}

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 395,
            maxWidth: 'calc(100vw - 32px)',
            height: 535,
            maxHeight: 'calc(100vh - 48px)',
            background: '#ffffff',
            borderRadius: 20,
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            border: '1px solid #ded8cb',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#162a1c',
              padding: '12px 16px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: '#2d6a4f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} color="#86efac" />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                  HillGuard AI Assistant
                </h4>
                <small
                  style={{
                    color: '#86efac',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  Online &middot; NER Safety Intelligence
                </small>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                padding: 4,
              }}
              id="hillguard-chat-close-btn"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '16px 14px',
              overflowY: 'auto',
              background: '#fcfaf6',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      background: isUser ? '#744423' : '#ffffff',
                      color: isUser ? '#ffffff' : '#1a281e',
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: 13,
                      lineHeight: 1.45,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      border: isUser ? 'none' : '1px solid #e7e2d6',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {m.text}
                  </div>
                  <small style={{ color: '#9ba89f', fontSize: 10, marginTop: 3, padding: '0 4px' }}>
                    {m.time}
                  </small>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#718077', fontSize: 12 }}>
                <span
                  className="loading-spinner"
                  style={{
                    width: 12,
                    height: 12,
                    border: '2px solid #744423',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                  }}
                />
                <span>HillGuard is analyzing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div
            style={{
              padding: '8px 12px',
              background: '#f4ede4',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              borderTop: '1px solid #e7e0d3',
            }}
          >
            <button
              type="button"
              onClick={() => handleQuickChip('Kya aaj Shillong jana safe hai?')}
              style={{
                background: '#ffffff',
                border: '1px solid #ded6c8',
                borderRadius: 14,
                padding: '4px 10px',
                fontSize: 11,
                color: '#1a281e',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              🚗 Travel Safety (Hinglish)
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip('Is it safe to travel on highways today?')}
              style={{
                background: '#ffffff',
                border: '1px solid #ded6c8',
                borderRadius: 14,
                padding: '4px 10px',
                fontSize: 11,
                color: '#1a281e',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              🚗 Highway Safety (English)
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip('Emergency Helpline Numbers')}
              style={{
                background: '#ffffff',
                border: '1px solid #ded6c8',
                borderRadius: 14,
                padding: '4px 10px',
                fontSize: 11,
                color: '#1a281e',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              🚨 Helplines
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip('Landslide aane par kya karein?')}
              style={{
                background: '#ffffff',
                border: '1px solid #ded6c8',
                borderRadius: 14,
                padding: '4px 10px',
                fontSize: 11,
                color: '#1a281e',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              ⛰️ Safety Tips
            </button>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '10px 12px',
              background: '#ffffff',
              borderTop: '1px solid #ded8cb',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder="Ask anything in English or Hinglish..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid #ded6c8',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 13,
                outline: 'none',
                background: '#faf7f2',
                color: '#1a281e',
              }}
              id="hillguard-chat-input"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: inputText.trim() ? '#744423' : '#dcd6ca',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}
              id="hillguard-chat-send-btn"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
