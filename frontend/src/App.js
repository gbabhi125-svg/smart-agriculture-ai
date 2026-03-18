import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement, Filler,
  Title, Tooltip, Legend
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement, Filler,
  Title, Tooltip, Legend
);

const API = "http://127.0.0.1:5000";

// ── Crop Emojis ───────────────────────────────────────────────
const CROP_EMOJIS = {
  rice:"🌾", wheat:"🌾", maize:"🌽", tomato:"🍅", potato:"🥔",
  onion:"🧅", garlic:"🧄", banana:"🍌", mango:"🥭", grapes:"🍇",
  watermelon:"🍉", apple:"🍎", orange:"🍊", lemon:"🍋",
  strawberry:"🍓", coconut:"🥥", pineapple:"🍍", papaya:"🍈",
  avocado:"🥑", sugarcane:"🎋", cotton:"🌿", coffee:"☕",
  tea:"🍵", ginger:"🫚", turmeric:"🫚", chilli:"🌶",
  capsicum:"🫑", broccoli:"🥦", cabbage:"🥬", carrot:"🥕",
  cucumber:"🥒", pumpkin:"🎃", spinach:"🥬", peas:"🫛",
  beans:"🫘", soybean:"🫘", chickpea:"🫘", lentil:"🫘",
  groundnut:"🥜", mustard:"🌻", sunflower:"🌻", rose:"🌹",
  jasmine:"🌸", marigold:"🌼", default:"🌱"
};

// ── Crop gradient colors ──────────────────────────────────────
const CROP_GRADIENTS = {
  rice:       ["#2d8a52","#52b788"],
  wheat:      ["#b45309","#f59e0b"],
  maize:      ["#ca8a04","#fbbf24"],
  tomato:     ["#dc2626","#f87171"],
  potato:     ["#78350f","#d97706"],
  onion:      ["#7c3aed","#a78bfa"],
  banana:     ["#ca8a04","#fde047"],
  mango:      ["#ea580c","#fb923c"],
  grapes:     ["#7c3aed","#c084fc"],
  apple:      ["#dc2626","#f87171"],
  coconut:    ["#78350f","#a16207"],
  coffee:     ["#44403c","#78716c"],
  sugarcane:  ["#16a34a","#4ade80"],
  cotton:     ["#475569","#94a3b8"],
  default:    ["#1a5c34","#52b788"]
};

// ── Seasonal Calendar (multiple seasons) ─────────────────────
const CROP_SEASONS = {
  rice:       [
    { season:"Kharif",    sow:["Jun","Jul"],     harvest:["Oct","Nov"] },
    { season:"Rabi",      sow:["Nov","Dec"],     harvest:["Mar","Apr"] }
  ],
  wheat:      [{ season:"Rabi",      sow:["Oct","Nov"],     harvest:["Mar","Apr"] }],
  maize:      [
    { season:"Kharif",    sow:["Jun","Jul"],     harvest:["Sep","Oct"] },
    { season:"Rabi",      sow:["Nov","Dec"],     harvest:["Mar","Apr"] }
  ],
  sugarcane:  [
    { season:"Spring",    sow:["Feb","Mar"],     harvest:["Nov","Dec"] },
    { season:"Autumn",    sow:["Oct","Nov"],     harvest:["Jul","Aug"] }
  ],
  tomato:     [
    { season:"Kharif",    sow:["Jun","Jul"],     harvest:["Sep","Oct"] },
    { season:"Rabi",      sow:["Oct","Nov"],     harvest:["Jan","Feb"] },
    { season:"Summer",    sow:["Jan","Feb"],     harvest:["Apr","May"] }
  ],
  potato:     [
    { season:"Rabi",      sow:["Oct","Nov"],     harvest:["Jan","Feb"] },
    { season:"Spring",    sow:["Jan","Feb"],     harvest:["Apr","May"] }
  ],
  banana:     [
    { season:"Summer",    sow:["Feb","Mar"],     harvest:["Nov","Dec"] },
    { season:"Kharif",    sow:["Jun","Jul"],     harvest:["Mar","Apr"] },
    { season:"Year-round",sow:["Oct","Nov"],     harvest:["Jul","Aug"] }
  ],
  onion:      [
    { season:"Kharif",    sow:["May","Jun"],     harvest:["Oct","Nov"] },
    { season:"Rabi",      sow:["Oct","Nov"],     harvest:["Feb","Mar"] },
    { season:"Late Kharif",sow:["Aug","Sep"],    harvest:["Jan","Feb"] }
  ],
  cotton:     [{ season:"Kharif",    sow:["Apr","May"],     harvest:["Oct","Nov"] }],
  groundnut:  [
    { season:"Kharif",    sow:["Jun","Jul"],     harvest:["Oct","Nov"] },
    { season:"Rabi",      sow:["Nov","Dec"],     harvest:["Mar","Apr"] }
  ],
  soybean:    [{ season:"Kharif",    sow:["Jun","Jul"],     harvest:["Oct","Nov"] }],
  mango:      [
    { season:"Summer",    sow:["Jul","Aug"],     harvest:["Apr","Jun"] }
  ],
  turmeric:   [{ season:"Annual",    sow:["Apr","May"],     harvest:["Jan","Feb"] }],
  ginger:     [{ season:"Annual",    sow:["Apr","May"],     harvest:["Dec","Jan"] }],
  coffee:     [{ season:"Annual",    sow:["May","Jun"],     harvest:["Nov","Jan"] }],
  coconut:    [{ season:"Perennial", sow:["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"],
                 harvest:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] }],
  mustard:    [{ season:"Rabi",      sow:["Oct","Nov"],     harvest:["Feb","Mar"] }],
  chickpea:   [{ season:"Rabi",      sow:["Oct","Nov"],     harvest:["Feb","Mar"] }],
  lentil:     [{ season:"Rabi",      sow:["Oct","Nov"],     harvest:["Feb","Mar"] }],
  default:    [{ season:"Kharif",    sow:["Jun","Jul"],     harvest:["Oct","Nov"] }]
};

// ── Ideal NPK ─────────────────────────────────────────────────
const IDEAL_NPK = {
  rice:      {N:90, P:45, K:45, humidity:82, ph:6.5, rainfall:200},
  wheat:     {N:100,P:60, K:45, humidity:55, ph:7.0, rainfall:65},
  maize:     {N:90, P:60, K:60, humidity:65, ph:6.5, rainfall:100},
  tomato:    {N:100,P:80, K:100,humidity:65, ph:6.0, rainfall:70},
  potato:    {N:110,P:80, K:130,humidity:72, ph:5.8, rainfall:100},
  cotton:    {N:120,P:45, K:28, humidity:65, ph:7.0, rainfall:105},
  sugarcane: {N:120,P:60, K:110,humidity:75, ph:7.0, rainfall:190},
  banana:    {N:100,P:80, K:60, humidity:82, ph:6.3, rainfall:200},
  mango:     {N:20, P:20, K:35, humidity:55, ph:6.5, rainfall:100},
  chickpea:  {N:35, P:75, K:80, humidity:35, ph:7.0, rainfall:65},
  default:   {N:60, P:50, K:50, humidity:65, ph:6.5, rainfall:100}
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PARTICLES = ["🌱","🌿","🍃","🌾","🌻","🍀","🌳","🌲","🌵","🍂"];

function FloatingParticles({ darkMode }) {
  const particles = Array.from({length:20},(_,i)=>({
    id:i, emoji:PARTICLES[i%PARTICLES.length],
    x:Math.random()*100, duration:8+Math.random()*12,
    delay:Math.random()*8, size:16+Math.random()*20
  }));
  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",
      pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {particles.map(p=>(
        <motion.div key={p.id}
          style={{position:"absolute",left:`${p.x}%`,fontSize:p.size,
            opacity:darkMode?0.15:0.2}}
          initial={{y:"110vh",rotate:0}} animate={{y:"-10vh",rotate:360}}
          transition={{duration:p.duration,delay:p.delay,repeat:Infinity,ease:"linear"}}>
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}

function WaveHeader({ darkMode, title, subtitle }) {
  return (
    <div style={{position:"relative",
      background:darkMode
        ?"linear-gradient(135deg,#0d2818,#1a4a2e,#0d2818)"
        :"linear-gradient(135deg,#1a5c34,#2d8a52,#52b788)",
      borderRadius:24,padding:"40px 20px 60px",marginBottom:24,overflow:"hidden"}}>
      {[...Array(3)].map((_,i)=>(
        <motion.div key={i} style={{position:"absolute",borderRadius:"50%",
          background:"rgba(255,255,255,0.05)",width:200+i*100,height:200+i*100,
          top:-50-i*30,right:-50-i*30}}
          animate={{rotate:360}}
          transition={{duration:20+i*5,repeat:Infinity,ease:"linear"}}/>
      ))}
      <motion.div className="text-center"
        initial={{opacity:0,y:-30}} animate={{opacity:1,y:0}}
        transition={{duration:0.8}} style={{position:"relative",zIndex:1}}>
        <motion.h1 style={{color:"#fff",fontWeight:800,fontSize:38,
          textShadow:"0 2px 20px rgba(0,0,0,0.3)"}}
          animate={{scale:[1,1.02,1]}} transition={{duration:3,repeat:Infinity}}>
          🌾 {title}
        </motion.h1>
        <p style={{color:"rgba(255,255,255,0.85)",fontSize:16,marginBottom:0}}>{subtitle}</p>
        <small style={{color:"rgba(255,255,255,0.65)"}}>
          Random Forest · Gradient Boosting · Linear Regression · SHAP
        </small>
      </motion.div>
      <div style={{position:"absolute",bottom:-2,left:0,right:0}}>
        <svg viewBox="0 0 1200 60" style={{display:"block",width:"100%"}}>
          <motion.path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z"
            fill={darkMode?"#1a1a2e":"#f0f4f0"}
            animate={{d:[
              "M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z",
              "M0,20 C200,50 400,10 600,20 C800,50 1000,10 1200,20 L1200,60 L0,60 Z",
              "M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z"
            ]}}
            transition={{duration:4,repeat:Infinity,ease:"easeInOut"}}/>
        </svg>
      </div>
    </div>
  );
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(()=>{
    let start=0; const end=parseFloat(value);
    if(isNaN(end)) return;
    const step=end/(1000/16);
    const timer=setInterval(()=>{
      start+=step;
      if(start>=end){ setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.round(start*10)/10);
    },16);
    return ()=>clearInterval(timer);
  },[value]);
  return <span>{display}</span>;
}

const cardVariants = {
  hidden:{opacity:0,y:30,scale:0.95},
  visible:{opacity:1,y:0,scale:1,transition:{duration:0.5,ease:"easeOut"}}
};
const containerVariants = {hidden:{},visible:{transition:{staggerChildren:0.1}}};

const T = {
  en:{
    title:"Smart Agriculture AI",subtitle:"AI-Powered Farming Assistant",
    selectModules:"Select Analysis Modules",enterData:"Enter Farm Data",
    autoWeather:"🌤 Auto-fill Weather",fetching:"⏳ Fetching...",
    runAnalysis:"🔍 Run Analysis",analysing:"⏳ Analysing your farm data...",
    results:"Analysis Results",history:"📋 Prediction History",
    clearHistory:"Clear History",crop:"🌱 Recommended Crop",
    soil:"🟤 Soil Health Score",failure:"⚠️ Crop Failure Risk",
    harvest:"📅 Harvest Time",fertilizer:"🌿 Fertilizer Recommendation",
    shap:"🧠 Why did AI recommend this crop?",
    sure:"sure",days:"days remaining",confidence:"AI Confidence",
    modelConf:"Model Confidence",phAdvice:"pH Advice",
    selected:"✓ Selected",clickSelect:"Click to select",
    showing:"Showing last",predictions:"prediction(s)",
    basedOn:"Based on your soil nutrients and recommended crop",
    downloadPDF:"📄 Download PDF Report",
    darkMode:"🌙 Dark Mode",lightMode:"☀️ Light Mode",
    retrain:"🔄 Retrain Models",retraining:"⏳ Retraining...",
    retrainSuccess:"✅ Models retrained successfully!",
    retrainError:"❌ Retraining failed.",
    retrainInfo:"This will retrain all 3 AI models with latest data.",
    cropCard:"Crop Profile",marketPrice:"💰 Live Market Price",
    seasonal:"📅 Planting Calendar",sowingMonths:"Sowing",
    harvestMonths:"Harvest",season:"Season",
    radarTitle:"🕸 Your Soil vs Ideal Soil",
    yourSoil:"Your Soil",idealSoil:"Ideal Soil",
    radarAdvice:"Soil Adjustment Needed",
    livePrice:"Live from Agmarknet",estPrice:"Estimated MSP",
    labels:{N:"Nitrogen",P:"Phosphorus",K:"Potassium",
      temperature:"Temperature",humidity:"Humidity",ph:"pH",rainfall:"Rainfall"},
    modules:{crop:"Crop Recommendation",soil:"Soil Health",
      failure:"Failure Risk",harvest:"Harvest Predictor",fertilizer:"Fertilizer Advisor"},
    tableHeaders:["Time","N","P","K","Temp","Humidity","pH","Rainfall",
      "Crop","Confidence","Soil","Risk","Harvest"],
    dayWord:"days"
  },
  hi:{
    title:"स्मार्ट कृषि AI",subtitle:"AI संचालित कृषि सहायक",
    selectModules:"विश्लेषण मॉड्यूल चुनें",enterData:"खेत का डेटा दर्ज करें",
    autoWeather:"🌤 मौसम स्वतः भरें",fetching:"⏳ प्राप्त हो रहा है...",
    runAnalysis:"🔍 विश्लेषण चलाएं",analysing:"⏳ विश्लेषण हो रहा है...",
    results:"विश्लेषण परिणाम",history:"📋 भविष्यवाणी इतिहास",
    clearHistory:"इतिहास साफ करें",crop:"🌱 अनुशंसित फसल",
    soil:"🟤 मिट्टी स्वास्थ्य स्कोर",failure:"⚠️ फसल विफलता जोखिम",
    harvest:"📅 कटाई का समय",fertilizer:"🌿 उर्वरक सिफारिश",
    shap:"🧠 AI ने यह फसल क्यों सुझाई?",
    sure:"निश्चित",days:"दिन शेष",confidence:"AI विश्वास",
    modelConf:"मॉडल विश्वास",phAdvice:"pH सलाह",
    selected:"✓ चुना गया",clickSelect:"चुनने के लिए क्लिक करें",
    showing:"अंतिम दिखा रहा है",predictions:"भविष्यवाणी",
    basedOn:"आपकी मिट्टी के पोषक तत्वों के आधार पर",
    downloadPDF:"📄 PDF रिपोर्ट डाउनलोड करें",
    darkMode:"🌙 डार्क मोड",lightMode:"☀️ लाइट मोड",
    retrain:"🔄 मॉडल पुनः प्रशिक्षित करें",retraining:"⏳ पुनः प्रशिक्षण...",
    retrainSuccess:"✅ मॉडल सफलतापूर्वक पुनः प्रशिक्षित!",
    retrainError:"❌ पुनः प्रशिक्षण विफल।",
    retrainInfo:"सभी 3 AI मॉडल को नवीनतम डेटा से पुनः प्रशिक्षित करेगा।",
    cropCard:"फसल प्रोफाइल",marketPrice:"💰 लाइव बाजार मूल्य",
    seasonal:"📅 बुवाई कैलेंडर",sowingMonths:"बुवाई",
    harvestMonths:"कटाई",season:"मौसम",
    radarTitle:"🕸 आपकी मिट्टी बनाम आदर्श मिट्टी",
    yourSoil:"आपकी मिट्टी",idealSoil:"आदर्श मिट्टी",
    radarAdvice:"मिट्टी समायोजन आवश्यक",
    livePrice:"Agmarknet से लाइव",estPrice:"अनुमानित MSP",
    labels:{N:"नाइट्रोजन",P:"फास्फोरस",K:"पोटेशियम",
      temperature:"तापमान",humidity:"आर्द्रता",ph:"pH",rainfall:"वर्षा"},
    modules:{crop:"फसल सिफारिश",soil:"मिट्टी स्वास्थ्य",
      failure:"विफलता जोखिम",harvest:"कटाई भविष्यवक्ता",fertilizer:"उर्वरक सलाहकार"},
    tableHeaders:["समय","N","P","K","तापमान","आर्द्रता","pH","वर्षा",
      "फसल","विश्वास","मिट्टी","जोखिम","कटाई"],
    dayWord:"दिन"
  },
  ta:{
    title:"நுண்ணிய விவசாய AI",subtitle:"AI சக்தி கொண்ட விவசாய உதவியாளர்",
    selectModules:"பகுப்பாய்வு தொகுதிகளை தேர்ந்தெடுக்கவும்",
    enterData:"பண்ணை தகவல்களை உள்ளிடவும்",
    autoWeather:"🌤 வானிலை தானாக நிரப்பு",fetching:"⏳ பெறுகிறது...",
    runAnalysis:"🔍 பகுப்பாய்வு இயக்கு",analysing:"⏳ பகுப்பாய்கிறது...",
    results:"பகுப்பாய்வு முடிவுகள்",history:"📋 கணிப்பு வரலாறு",
    clearHistory:"வரலாற்றை அழி",crop:"🌱 பரிந்துரைக்கப்பட்ட பயிர்",
    soil:"🟤 மண் ஆரோக்கிய மதிப்பெண்",failure:"⚠️ பயிர் தோல்வி அபாயம்",
    harvest:"📅 அறுவடை நேரம்",fertilizer:"🌿 உர பரிந்துரை",
    shap:"🧠 AI ஏன் இந்த பயிரை பரிந்துரைத்தது?",
    sure:"உறுதி",days:"நாட்கள் மீதம்",confidence:"AI நம்பிக்கை",
    modelConf:"மாதிரி நம்பிக்கை",phAdvice:"pH ஆலோசனை",
    selected:"✓ தேர்ந்தெடுக்கப்பட்டது",clickSelect:"தேர்வு செய்ய கிளிக்",
    showing:"கடைசி காட்டுகிறது",predictions:"கணிப்பு(கள்)",
    basedOn:"உங்கள் மண் சத்துக்கள் அடிப்படையில்",
    downloadPDF:"📄 PDF அறிக்கை பதிவிறக்கு",
    darkMode:"🌙 டார்க் மோட்",lightMode:"☀️ லைட் மோட்",
    retrain:"🔄 மாதிரிகளை மீண்டும் பயிற்றி",retraining:"⏳ பயிற்சி...",
    retrainSuccess:"✅ வெற்றிகரமாக பயிற்றிக்கப்பட்டது!",
    retrainError:"❌ பயிற்சி தோல்வியடைந்தது.",
    retrainInfo:"அனைத்து 3 AI மாதிரிகளையும் மீண்டும் பயிற்றியது.",
    cropCard:"பயிர் விவரம்",marketPrice:"💰 நேரடி சந்தை விலை",
    seasonal:"📅 விதைப்பு நாட்காட்டி",sowingMonths:"விதைப்பு",
    harvestMonths:"அறுவடை",season:"பருவம்",
    radarTitle:"🕸 உங்கள் மண் vs சிறந்த மண்",
    yourSoil:"உங்கள் மண்",idealSoil:"சிறந்த மண்",
    radarAdvice:"மண் சரிசெய்தல் தேவை",
    livePrice:"Agmarknet நேரடி",estPrice:"மதிப்பிடப்பட்ட MSP",
    labels:{N:"நைட்ரஜன்",P:"பாஸ்பரஸ்",K:"பொட்டாசியம்",
      temperature:"வெப்பநிலை",humidity:"ஈரப்பதம்",ph:"pH",rainfall:"மழைவீழ்ச்சி"},
    modules:{crop:"பயிர் பரிந்துரை",soil:"மண் ஆரோக்கியம்",
      failure:"தோல்வி அபாயம்",harvest:"அறுவடை கணிப்பி",fertilizer:"உர ஆலோசகர்"},
    tableHeaders:["நேரம்","N","P","K","வெப்பம்","ஈரப்பதம்","pH","மழை",
      "பயிர்","நம்பிக்கை","மண்","அபாயம்","அறுவடை"],
    dayWord:"நாட்கள்"
  },
  te:{
    title:"స్మార్ట్ అగ్రికల్చర్ AI",subtitle:"AI ఆధారిత వ్యవసాయ సహాయకుడు",
    selectModules:"విశ్లేషణ మాడ్యూల్స్ ఎంచుకోండి",
    enterData:"వ్యవసాయ డేటా నమోదు చేయండి",
    autoWeather:"🌤 వాతావరణం నింపండి",fetching:"⏳ తెస్తోంది...",
    runAnalysis:"🔍 విశ్లేషణ చేయండి",analysing:"⏳ విశ్లేషిస్తోంది...",
    results:"విశ్లేషణ ఫలితాలు",history:"📋 అంచనా చరిత్ర",
    clearHistory:"చరిత్ర తొలగించు",crop:"🌱 సిఫార్సు పంట",
    soil:"🟤 నేల ఆరోగ్య స్కోరు",failure:"⚠️ పంట వైఫల్య ప్రమాదం",
    harvest:"📅 పంట కోత సమయం",fertilizer:"🌿 ఎరువుల సిఫార్సు",
    shap:"🧠 AI ఈ పంటను ఎందుకు సిఫార్సు చేసింది?",
    sure:"నిश్చితం",days:"రోజులు మిగిలాయి",confidence:"AI నమ్మకం",
    modelConf:"మోడల్ నమ్మకం",phAdvice:"pH సలహా",
    selected:"✓ ఎంచుకోబడింది",clickSelect:"ఎంచుకోవడానికి క్లిక్",
    showing:"చివరి చూపిస్తోంది",predictions:"అంచనా(లు)",
    basedOn:"మీ నేల పోషకాల ఆధారంగా",
    downloadPDF:"📄 PDF నివేదిక",
    darkMode:"🌙 డార్క్ మోడ్",lightMode:"☀️ లైట్ మోడ్",
    retrain:"🔄 మోడల్స్ రీట్రెయిన్",retraining:"⏳ రీట్రెయినింగ్...",
    retrainSuccess:"✅ మోడల్స్ విజయవంతంగా!",
    retrainError:"❌ రీట్రెయినింగ్ విఫలమైంది.",
    retrainInfo:"అన్ని 3 AI మోడల్స్‌ను రీట్రెయిన్ చేస్తుంది.",
    cropCard:"పంట వివరాలు",marketPrice:"💰 నేటి మార్కెట్ ధర",
    seasonal:"📅 విత్తన క్యాలెండర్",sowingMonths:"విత్తనం",
    harvestMonths:"కోత",season:"సీజన్",
    radarTitle:"🕸 మీ నేల vs ఆదర్శ నేల",
    yourSoil:"మీ నేల",idealSoil:"ఆదర్శ నేల",
    radarAdvice:"నేల సర్దుబాటు అవసరం",
    livePrice:"Agmarknet నేరుగా",estPrice:"అంచనా MSP",
    labels:{N:"నత్రజని",P:"భాస్వరం",K:"పొటాషియం",
      temperature:"ఉష్ణోగ్రత",humidity:"తేమ",ph:"pH",rainfall:"వర్షపాతం"},
    modules:{crop:"పంట సిఫార్సు",soil:"నేల ఆరోగ్యం",
      failure:"వైఫల్య ప్రమాదం",harvest:"పంట కోత అంచనా",fertilizer:"ఎరువుల సలహాదారు"},
    tableHeaders:["సమయం","N","P","K","ఉష్ణోగ్రత","తేమ","pH","వర్షం",
      "పంట","నమ్మకం","నేల","ప్రమాదం","పంటకోత"],
    dayWord:"రోజులు"
  },
  kn:{
    title:"ಸ್ಮಾರ್ಟ್ ಕೃಷಿ AI",subtitle:"AI ಚಾಲಿತ ಕೃಷಿ ಸಹಾಯಕ",
    selectModules:"ವಿಶ್ಲೇಷಣೆ ಮಾಡ್ಯೂಲ್‌ಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
    enterData:"ಜಮೀನಿನ ಡೇಟಾ ನಮೂದಿಸಿ",
    autoWeather:"🌤 ಹವಾಮಾನ ತುಂಬಿಸಿ",fetching:"⏳ ತರಲಾಗುತ್ತಿದೆ...",
    runAnalysis:"🔍 ವಿಶ್ಲೇಷಣೆ ಚಲಾಯಿಸಿ",analysing:"⏳ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    results:"ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶಗಳು",history:"📋 ಭವಿಷ್ಯವಾಣಿ ಇತಿಹಾಸ",
    clearHistory:"ಇತಿಹಾಸ ತೆರವುಗೊಳಿಸಿ",crop:"🌱 ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆ",
    soil:"🟤 ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸ್ಕೋರ್",failure:"⚠️ ಬೆಳೆ ವಿಫಲತೆ ಅಪಾಯ",
    harvest:"📅 ಕೊಯ್ಲು ಸಮಯ",fertilizer:"🌿 ಗೊಬ್ಬರ ಶಿಫಾರಸು",
    shap:"🧠 AI ಈ ಬೆಳೆಯನ್ನು ಏಕೆ ಶಿಫಾರಸು ಮಾಡಿತು?",
    sure:"ಖಚಿತ",days:"ದಿನಗಳು ಉಳಿದಿವೆ",confidence:"AI ವಿಶ್ವಾಸ",
    modelConf:"ಮಾದರಿ ವಿಶ್ವಾಸ",phAdvice:"pH ಸಲಹೆ",
    selected:"✓ ಆಯ್ಕೆಯಾಗಿದೆ",clickSelect:"ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್",
    showing:"ಕೊನೆಯದನ್ನು ತೋರಿಸುತ್ತಿದೆ",predictions:"ಭವಿಷ್ಯವಾಣಿ(ಗಳು)",
    basedOn:"ನಿಮ್ಮ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ",
    downloadPDF:"📄 PDF ವರದಿ",
    darkMode:"🌙 ಡಾರ್ಕ್ ಮೋಡ್",lightMode:"☀️ ಲೈಟ್ ಮೋಡ್",
    retrain:"🔄 ಮಾದರಿಗಳನ್ನು ಮರು ತರಬೇತಿ",retraining:"⏳ ಮರು ತರಬೇತಿ...",
    retrainSuccess:"✅ ಮಾದರಿಗಳು ಯಶಸ್ವಿಯಾಗಿ!",
    retrainError:"❌ ಮರು ತರಬೇತಿ ವಿಫಲವಾಗಿದೆ.",
    retrainInfo:"ಎಲ್ಲಾ 3 AI ಮಾದರಿಗಳನ್ನು ಮರು ತರಬೇತಿ ನೀಡುತ್ತದೆ.",
    cropCard:"ಬೆಳೆ ವಿವರ",marketPrice:"💰 ನೇರ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
    seasonal:"📅 ಬಿತ್ತನೆ ಕ್ಯಾಲೆಂಡರ್",sowingMonths:"ಬಿತ್ತನೆ",
    harvestMonths:"ಕೊಯ್ಲು",season:"ಋತು",
    radarTitle:"🕸 ನಿಮ್ಮ ಮಣ್ಣು vs ಆದರ್ಶ ಮಣ್ಣು",
    yourSoil:"ನಿಮ್ಮ ಮಣ್ಣು",idealSoil:"ಆದರ್ಶ ಮಣ್ಣು",
    radarAdvice:"ಮಣ್ಣು ಸರಿಪಡಿಸುವಿಕೆ ಅಗತ್ಯ",
    livePrice:"Agmarknet ನೇರ",estPrice:"ಅಂದಾಜು MSP",
    labels:{N:"ಸಾರಜನಕ",P:"ರಂಜಕ",K:"ಪೊಟ್ಯಾಶಿಯಂ",
      temperature:"ತಾಪಮಾನ",humidity:"ತೇವಾಂಶ",ph:"pH",rainfall:"ಮಳೆಪಾತ"},
    modules:{crop:"ಬೆಳೆ ಶಿಫಾರಸು",soil:"ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
      failure:"ವಿಫಲತೆ ಅಪಾಯ",harvest:"ಕೊಯ್ಲು ಭವಿಷ್ಯಕಾರ",fertilizer:"ಗೊಬ್ಬರ ಸಲಹೆಗಾರ"},
    tableHeaders:["ಸಮಯ","N","P","K","ತಾಪ","ತೇವ","pH","ಮಳೆ",
      "ಬೆಳೆ","ವಿಶ್ವಾಸ","ಮಣ್ಣು","ಅಪಾಯ","ಕೊಯ್ಲು"],
    dayWord:"ದಿನಗಳು"
  },
  ml:{
    title:"സ്മാർട്ട് അഗ്രികൾച്ചർ AI",subtitle:"AI അധിഷ്ഠിത കൃഷി സഹായി",
    selectModules:"വിശകലന മൊഡ്യൂളുകൾ തിരഞ്ഞെടുക്കുക",
    enterData:"ഫാം ഡേറ്റ നൽകുക",
    autoWeather:"🌤 കാലാവസ്ഥ പൂരിപ്പിക്കുക",fetching:"⏳ ലഭ്യമാക്കുന്നു...",
    runAnalysis:"🔍 വിശകലനം നടത്തുക",analysing:"⏳ വിശകലനം ചെയ്യുന്നു...",
    results:"വിശകലന ഫലങ്ങൾ",history:"📋 പ്രവചന ചരിത്രം",
    clearHistory:"ചരിത്രം മായ്ക്കുക",crop:"🌱 ശുപാർശ ചെയ്ത വിള",
    soil:"🟤 മണ്ണ് ആരോഗ്യ സ്കോർ",failure:"⚠️ വിള പരാജയ സാധ്യത",
    harvest:"📅 വിളവെടുപ്പ് സമയം",fertilizer:"🌿 വളം ശുപാർശ",
    shap:"🧠 AI ഈ വിള എന്തുകൊണ്ട് ശുപാർശ ചെയ്തു?",
    sure:"ഉറപ്പ്",days:"ദിവസങ്ങൾ ബാക്കി",confidence:"AI വിശ്വാസം",
    modelConf:"മോഡൽ വിശ്വാസം",phAdvice:"pH ഉപദേശം",
    selected:"✓ തിരഞ്ഞെടുത്തു",clickSelect:"തിരഞ്ഞെടുക്കാൻ ക്ലിക്ക്",
    showing:"അവസാനത്തേത് കാണിക്കുന്നു",predictions:"പ്രവചനം",
    basedOn:"മണ്ണ് പോഷകങ്ങൾ അടിസ്ഥാനമാക്കി",
    downloadPDF:"📄 PDF ഡൗൺലോഡ്",
    darkMode:"🌙 ഡാർക്ക് മോഡ്",lightMode:"☀️ ലൈറ്റ് മോഡ്",
    retrain:"🔄 മോഡലുകൾ പുനഃപരിശീലനം",retraining:"⏳ പുനഃപരിശീലനം...",
    retrainSuccess:"✅ മോഡലുകൾ വിജയകരമായി!",
    retrainError:"❌ പുനഃപരിശീലനം പരാജയപ്പെട്ടു.",
    retrainInfo:"എല്ലാ 3 AI മോഡലുകളും പുനഃപരിശീലനം നൽകും.",
    cropCard:"വിള വിവരം",marketPrice:"💰 തത്സമയ വിപണി വില",
    seasonal:"📅 വിതയ്ക്കൽ കലണ്ടർ",sowingMonths:"വിതയ്ക്കൽ",
    harvestMonths:"വിളവെടുപ്പ്",season:"സീസൺ",
    radarTitle:"🕸 നിങ്ങളുടെ മണ്ണ് vs ആദർശ മണ്ണ്",
    yourSoil:"നിങ്ങളുടെ മണ്ണ്",idealSoil:"ആദർശ മണ്ണ്",
    radarAdvice:"മണ്ണ് ക്രമീകരണം ആവശ്യം",
    livePrice:"Agmarknet തത്സമയം",estPrice:"കണക്കാക്കിയ MSP",
    labels:{N:"നൈട്രജൻ",P:"ഫോസ്ഫറസ്",K:"പൊട്ടാസ്യം",
      temperature:"താപനില",humidity:"ആർദ്രത",ph:"pH",rainfall:"മഴ"},
    modules:{crop:"വിള ശുപാർശ",soil:"മണ്ണ് ആരോഗ്യം",
      failure:"പരാജയ സാധ്യത",harvest:"വിളവെടുപ്പ് പ്രവചകൻ",fertilizer:"വളം ഉപദേഷ്ടാവ്"},
    tableHeaders:["സമയം","N","P","K","താപം","ആർദ്രത","pH","മഴ",
      "വിള","വിശ്വാസം","മണ്ണ്","സാധ്യത","വിളവെടുപ്പ്"],
    dayWord:"ദിവസം"
  }
};

function App() {
  const [lang,           setLang]           = useState("en");
  const [darkMode,       setDarkMode]       = useState(false);
  const [formData,       setFormData]       = useState({N:"",P:"",K:"",temperature:"",humidity:"",ph:"",rainfall:""});
  const [modules,        setModules]        = useState({crop:true,soil:true,failure:true,harvest:true,fertilizer:true});
  const [results,        setResults]        = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherInfo,    setWeatherInfo]    = useState("");
  const [history,        setHistory]        = useState([]);
  const [retrainStatus,  setRetrainStatus]  = useState("idle");
  const [retrainMsg,     setRetrainMsg]     = useState("");
  const [marketData,     setMarketData]     = useState(null);
  const [marketLoading,  setMarketLoading]  = useState(false);

  const t = T[lang];

  useEffect(()=>{
    document.body.style.backgroundColor = darkMode?"#1a1a2e":"#f0f4f0";
    document.body.style.color           = darkMode?"#e0e0e0":"#212529";
  },[darkMode]);

  const dm = {
    bg:        darkMode?"#1a1a2e":"#f0f4f0",
    card:      darkMode?"#16213e":"#ffffff",
    text:      darkMode?"#e0e0e0":"#212529",
    muted:     darkMode?"#a0a0b0":"#6c757d",
    border:    darkMode?"#2a2a4e":"#dee2e6",
    input:     darkMode?"#0f3460":"#ffffff",
    inputText: darkMode?"#e0e0e0":"#212529",
    tableHead: darkMode?"#0f3460":"#1a5c34",
    tableRow:  darkMode?"#1e2a4a":"#ffffff",
    tableAlt:  darkMode?"#162035":"#f0f7f2",
  };

  const handleChange = (e) => setFormData({...formData,[e.target.name]:e.target.value});
  const toggleModule = (key) => setModules({...modules,[key]:!modules[key]});

  const getWeather = ()=>{
    setWeatherLoading(true); setWeatherInfo("");
    if(!navigator.geolocation){ setWeatherInfo("Geolocation not supported."); setWeatherLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async(pos)=>{
        try{
          const r=await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`);
          const c=r.data.current;
          setFormData(p=>({...p,temperature:c.temperature_2m.toFixed(1),humidity:c.relative_humidity_2m.toFixed(1),rainfall:c.precipitation.toFixed(1)}));
          setWeatherInfo(`Weather fetched (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        }catch{ setWeatherInfo("Could not fetch weather."); }
        setWeatherLoading(false);
      },
      ()=>{ setWeatherInfo("Location denied."); setWeatherLoading(false); }
    );
  };

  const fetchMarketPrice = async(cropName)=>{
    setMarketLoading(true); setMarketData(null);
    try{
      const r = await axios.get(`${API}/market-price/${cropName}`);
      setMarketData(r.data);
    }catch{ setMarketData(null); }
    setMarketLoading(false);
  };

  const runAnalysis = async()=>{
    setError(""); setLoading(true); setMarketData(null);
    const out={crop:null,soil:null,failure:null,harvest:null,fertilizer:null};
    try{
      if(modules.crop)       { const r=await axios.post(`${API}/predict-crop`,formData);        out.crop=r.data; }
      if(modules.soil)       { const r=await axios.post(`${API}/predict-soil`,formData);        out.soil=r.data; }
      if(modules.failure)    { const r=await axios.post(`${API}/predict-failure`,formData);     out.failure=r.data; }
      if(modules.harvest)    { const r=await axios.post(`${API}/predict-harvest`,formData);     out.harvest=r.data; }
      if(modules.fertilizer) { const r=await axios.post(`${API}/predict-fertilizer`,formData); out.fertilizer=r.data; }
      setResults(out);
      if(out.crop?.recommended_crop) fetchMarketPrice(out.crop.recommended_crop);
      setHistory(prev=>[{
        time:new Date().toLocaleTimeString(),
        N:formData.N,P:formData.P,K:formData.K,
        temp:formData.temperature,humidity:formData.humidity,
        ph:formData.ph,rainfall:formData.rainfall,
        crop:out.crop?.recommended_crop||"-",
        confidence:out.crop?.confidence||"-",
        soil:out.soil?.status||"-",
        risk:out.failure?.failure_risk||"-",
        harvest:out.harvest?.harvest_days||"-"
      },...prev].slice(0,10));
    }catch{ setError("Cannot connect to Flask API. Make sure backend is running."); }
    setLoading(false);
  };

  const startRetrain = async()=>{
    setRetrainStatus("running"); setRetrainMsg("");
    try{
      await axios.post(`${API}/retrain`);
      const poll=setInterval(async()=>{
        try{
          const r=await axios.get(`${API}/retrain-status`);
          if(r.data.status==="success"){ setRetrainStatus("success"); setRetrainMsg(r.data.message); clearInterval(poll); }
          else if(r.data.status==="error"){ setRetrainStatus("error"); setRetrainMsg(r.data.message); clearInterval(poll); }
        }catch{ clearInterval(poll); }
      },3000);
    }catch{ setRetrainStatus("error"); setRetrainMsg("Could not connect to server."); }
  };

  const downloadPDF = ()=>{
    const doc=new jsPDF(); const date=new Date().toLocaleString();
    doc.setFillColor(45,106,79); doc.rect(0,0,210,28,"F");
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont("helvetica","bold");
    doc.text("Smart Agriculture AI",14,12);
    doc.setFontSize(10); doc.setFont("helvetica","normal");
    doc.text("AI-Powered Farming Assistant",14,20);
    doc.text(`Report: ${date}`,120,20);
    let y=36; doc.setTextColor(0,0,0);
    doc.setFontSize(13); doc.setFont("helvetica","bold"); doc.setTextColor(45,106,79);
    doc.text("Farm Input Data",14,y); y+=4;
    autoTable(doc,{startY:y,
      head:[["Parameter","Value","Parameter","Value"]],
      body:[["Nitrogen",formData.N||"-","Temperature",`${formData.temperature||"-"}°C`],
        ["Phosphorus",formData.P||"-","Humidity",`${formData.humidity||"-"}%`],
        ["Potassium",formData.K||"-","pH",formData.ph||"-"],
        ["Rainfall",`${formData.rainfall||"-"}mm`,"",""]],
      styles:{fontSize:10,cellPadding:3},
      headStyles:{fillColor:[45,106,79],textColor:255},
      alternateRowStyles:{fillColor:[240,244,240]},margin:{left:14,right:14}});
    y=doc.lastAutoTable.finalY+10;
    doc.setFontSize(13); doc.setFont("helvetica","bold"); doc.setTextColor(45,106,79);
    doc.text("AI Analysis Results",14,y); y+=4;
    const rr=[];
    if(results?.crop)    rr.push(["Crop",results.crop.recommended_crop.toUpperCase(),`${results.crop.confidence}%`]);
    if(results?.soil)    rr.push(["Soil",`${results.soil.soil_health_score}/100`,results.soil.status]);
    if(results?.failure) rr.push(["Risk",results.failure.failure_risk,`${results.failure.confidence}%`]);
    if(results?.harvest) rr.push(["Harvest",`${results.harvest.harvest_days} days`,results.harvest.season_type]);
    if(marketData)       rr.push(["Market Price",`₹${marketData.price}/quintal`,marketData.market]);
    autoTable(doc,{startY:y,head:[["Module","Result","Details"]],body:rr,
      styles:{fontSize:10,cellPadding:3},headStyles:{fillColor:[45,106,79],textColor:255},
      alternateRowStyles:{fillColor:[240,244,240]},margin:{left:14,right:14}});
    const pc=doc.internal.getNumberOfPages();
    for(let i=1;i<=pc;i++){
      doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150,150,150);
      doc.text("Smart Agriculture AI — Random Forest · Gradient Boosting · SHAP",14,290);
      doc.text(`Page ${i} of ${pc}`,185,290);
    }
    doc.save(`AgriReport_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // ── Radar Data + Advice ───────────────────────────────────
  const getCropRadarData = (cropName)=>{
    const ideal = IDEAL_NPK[cropName?.toLowerCase()] || IDEAL_NPK.default;
    const your  = {
      N:parseFloat(formData.N)||0,
      P:parseFloat(formData.P)||0,
      K:parseFloat(formData.K)||0,
      humidity:parseFloat(formData.humidity)||0,
      ph:(parseFloat(formData.ph)||0)*10,
      rainfall:(parseFloat(formData.rainfall)||0)/3
    };
    const idealNorm = {N:ideal.N,P:ideal.P,K:ideal.K,humidity:ideal.humidity,ph:ideal.ph*10,rainfall:ideal.rainfall/3};
    return {
      labels:["Nitrogen","Phosphorus","Potassium","Humidity","pH×10","Rainfall÷3"],
      your:your, ideal:idealNorm,
      chartData:{
        labels:["Nitrogen","Phosphorus","Potassium","Humidity","pH×10","Rainfall÷3"],
        datasets:[
          {label:t.yourSoil,
            data:[your.N,your.P,your.K,your.humidity,your.ph,your.rainfall],
            backgroundColor:"rgba(45,106,79,0.25)",borderColor:"rgba(45,106,79,0.9)",
            pointBackgroundColor:"rgba(45,106,79,1)",borderWidth:2},
          {label:t.idealSoil,
            data:[idealNorm.N,idealNorm.P,idealNorm.K,idealNorm.humidity,idealNorm.ph,idealNorm.rainfall],
            backgroundColor:"rgba(255,193,7,0.15)",borderColor:"rgba(255,193,7,0.9)",
            pointBackgroundColor:"rgba(255,193,7,1)",borderWidth:2,borderDash:[5,5]}
        ]
      }
    };
  };

  const getRadarAdvice = (cropName)=>{
    const ideal = IDEAL_NPK[cropName?.toLowerCase()] || IDEAL_NPK.default;
    const advice = [];
    const N=parseFloat(formData.N)||0;
    const P=parseFloat(formData.P)||0;
    const K=parseFloat(formData.K)||0;
    const ph=parseFloat(formData.ph)||0;
    const humidity=parseFloat(formData.humidity)||0;
    const rainfall=parseFloat(formData.rainfall)||0;

    if(N < ideal.N*0.8)       advice.push({param:"Nitrogen",  action:"increase", by:`+${Math.round(ideal.N-N)} mg/kg`,  color:"danger"});
    else if(N > ideal.N*1.2)  advice.push({param:"Nitrogen",  action:"reduce",   by:`-${Math.round(N-ideal.N)} mg/kg`,  color:"warning"});
    if(P < ideal.P*0.8)       advice.push({param:"Phosphorus",action:"increase", by:`+${Math.round(ideal.P-P)} mg/kg`,  color:"danger"});
    else if(P > ideal.P*1.2)  advice.push({param:"Phosphorus",action:"reduce",   by:`-${Math.round(P-ideal.P)} mg/kg`,  color:"warning"});
    if(K < ideal.K*0.8)       advice.push({param:"Potassium", action:"increase", by:`+${Math.round(ideal.K-K)} mg/kg`,  color:"danger"});
    else if(K > ideal.K*1.2)  advice.push({param:"Potassium", action:"reduce",   by:`-${Math.round(K-ideal.K)} mg/kg`,  color:"warning"});
    if(ph < ideal.ph-0.5)     advice.push({param:"pH",        action:"increase", by:`+${(ideal.ph-ph).toFixed(1)}`,     color:"danger"});
    else if(ph > ideal.ph+0.5)advice.push({param:"pH",        action:"reduce",   by:`-${(ph-ideal.ph).toFixed(1)}`,     color:"warning"});
    return advice;
  };

  const shapChartData = results?.crop?.shap_values ? {
    labels:Object.keys(results.crop.shap_values),
    datasets:[{
      label:"SHAP Impact",data:Object.values(results.crop.shap_values),
      backgroundColor:Object.values(results.crop.shap_values).map(v=>v>=0?"rgba(25,135,84,0.75)":"rgba(220,53,69,0.75)"),
      borderRadius:8
    }]
  } : null;

  const fieldKeys    = ["N","P","K","temperature","humidity","ph","rainfall"];
  const placeholders = {N:"0–140",P:"5–145",K:"5–205",temperature:"°C",humidity:"%",ph:"3.5–9.5",rainfall:"mm"};
  const moduleConfig = [
    {key:"crop",emoji:"🌱",color:"success"},
    {key:"soil",emoji:"🟤",color:"warning"},
    {key:"failure",emoji:"⚠️",color:"danger"},
    {key:"harvest",emoji:"📅",color:"info"},
    {key:"fertilizer",emoji:"🌿",color:"primary"}
  ];
  const moduleBg = {
    success:darkMode?"#1a3a2a":"#d1e7dd",warning:darkMode?"#3a2a00":"#fff3cd",
    danger:darkMode?"#3a1a1a":"#f8d7da",info:darkMode?"#0a2a3a":"#cff4fc",
    primary:darkMode?"#0a1a3a":"#cfe2ff"
  };
  const riskBadge={Low:"success",Medium:"warning",High:"danger"};
  const langButtons=[
    {code:"en",label:"🇬🇧 English"},{code:"hi",label:"🇮🇳 हिन्दी"},
    {code:"ta",label:"🇮🇳 தமிழ்"},{code:"te",label:"🇮🇳 తెలుగు"},
    {code:"kn",label:"🇮🇳 ಕನ್ನಡ"},{code:"ml",label:"🇮🇳 മലയാളം"}
  ];
  const cardStyle  = {backgroundColor:dm.card,color:dm.text,border:`1px solid ${dm.border}`,borderRadius:16};
  const inputStyle = {backgroundColor:dm.input,color:dm.inputText,border:`1px solid ${dm.border}`,borderRadius:10};

  const cropName   = results?.crop?.recommended_crop?.toLowerCase();
  const cropEmoji  = cropName ? (CROP_EMOJIS[cropName] || CROP_EMOJIS.default) : "🌱";
  const cropGrad   = cropName ? (CROP_GRADIENTS[cropName] || CROP_GRADIENTS.default) : CROP_GRADIENTS.default;
  const cropSeasons= cropName ? (CROP_SEASONS[cropName]  || CROP_SEASONS.default)    : null;
  const radarData  = cropName ? getCropRadarData(cropName) : null;
  const radarAdvice= cropName ? getRadarAdvice(cropName)   : [];

  return (
    <div style={{backgroundColor:dm.bg,minHeight:"100vh",paddingBottom:60,position:"relative"}}>
      <FloatingParticles darkMode={darkMode}/>
      <div className="container py-4" style={{position:"relative",zIndex:1}}>

        {/* Top Right Controls */}
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",top:0,right:0,display:"flex",gap:8,zIndex:100}}>
            <div className="dropdown">
              <button className="btn btn-sm btn-outline-success dropdown-toggle"
                type="button" data-bs-toggle="dropdown">
                🌐 {langButtons.find(l=>l.code===lang)?.label}
              </button>
              <ul className="dropdown-menu dropdown-menu-end"
                style={{backgroundColor:dm.card,border:`1px solid ${dm.border}`}}>
                {langButtons.map(({code,label})=>(
                  <li key={code}>
                    <button className="dropdown-item" onClick={()=>setLang(code)}
                      style={{backgroundColor:lang===code?(darkMode?"#1a3a2a":"#d1e7dd"):"transparent",
                        color:dm.text,fontWeight:lang===code?"bold":"normal"}}>
                      {label} {lang===code?"✓":""}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <motion.button className={`btn btn-sm ${darkMode?"btn-warning":"btn-dark"}`}
              onClick={()=>setDarkMode(!darkMode)}
              whileHover={{scale:1.1}} whileTap={{scale:0.9}}>
              {darkMode?"☀️":"🌙"}
            </motion.button>
          </div>
          <WaveHeader darkMode={darkMode} title={t.title} subtitle={t.subtitle}/>
        </div>

        {/* Retrain Card */}
        <motion.div className="card shadow-sm mb-4 p-4" style={cardStyle}
          initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-1" style={{color:dm.text}}>🔄 {t.retrain}</h5>
              <small style={{color:dm.muted}}>{t.retrainInfo}</small>
            </div>
            <motion.button
              className={`btn ${retrainStatus==="running"?"btn-secondary":retrainStatus==="success"?"btn-success":retrainStatus==="error"?"btn-danger":"btn-warning"}`}
              onClick={startRetrain} disabled={retrainStatus==="running"}
              whileHover={{scale:1.05}} whileTap={{scale:0.95}} style={{minWidth:180}}>
              {retrainStatus==="running"?t.retraining:retrainStatus==="success"?t.retrainSuccess:retrainStatus==="error"?t.retrainError:t.retrain}
            </motion.button>
          </div>
          {retrainStatus==="running"&&(
            <div className="mt-3">
              <div className="progress" style={{height:8,borderRadius:8}}>
                <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" style={{width:"100%"}}/>
              </div>
              <small style={{color:dm.muted}} className="mt-1 d-block">Training all 3 models... 1–2 minutes.</small>
            </div>
          )}
          {retrainMsg&&retrainStatus!=="running"&&(
            <div className={`alert alert-${retrainStatus==="success"?"success":"danger"} mt-3 mb-0 py-2`}>
              <small>{retrainMsg}</small>
            </div>
          )}
        </motion.div>

        {/* Module Selection */}
        <motion.div className="card shadow-sm mb-4 p-4" style={cardStyle}
          initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.1}}>
          <h5 className="mb-3 fw-bold" style={{color:dm.text}}>{t.selectModules}</h5>
          <div className="row g-2">
            {moduleConfig.map(({key,emoji,color},idx)=>(
              <div className="col-md col-6" key={key}>
                <motion.div onClick={()=>toggleModule(key)}
                  className={`card text-center p-3 border-2 border-${color} h-100`}
                  style={{cursor:"pointer",backgroundColor:modules[key]?moduleBg[color]:dm.card,color:dm.text,borderRadius:12}}
                  whileHover={{scale:1.05,boxShadow:"0 8px 25px rgba(0,0,0,0.15)"}}
                  whileTap={{scale:0.95}}
                  initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                  transition={{delay:idx*0.1}}>
                  <motion.div style={{fontSize:28,marginBottom:4}}
                    animate={modules[key]?{rotate:[0,10,-10,0]}:{}}
                    transition={{duration:0.5}}>
                    {emoji}
                  </motion.div>
                  <small className={`fw-bold text-${color}`}>{t.modules[key]}</small>
                  <div><small style={{color:dm.muted}}>{modules[key]?t.selected:t.clickSelect}</small></div>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div className="card shadow-sm mb-4 p-4" style={cardStyle}
          initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.2}}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0" style={{color:dm.text}}>{t.enterData}</h5>
            <motion.button className="btn btn-outline-info btn-sm"
              onClick={getWeather} disabled={weatherLoading}
              whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
              {weatherLoading?t.fetching:t.autoWeather}
            </motion.button>
          </div>
          {weatherInfo&&(
            <motion.div className="alert alert-info py-2 mb-3"
              initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}>
              <small>{weatherInfo}</small>
            </motion.div>
          )}
          <div className="row g-3">
            {fieldKeys.map((name,idx)=>(
              <motion.div className="col-md-4 col-6" key={name}
                initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                transition={{delay:idx*0.05}}>
                <label className="form-label small fw-bold" style={{color:dm.muted}}>
                  {t.labels[name]}
                </label>
                <input className="form-control" type="number" name={name}
                  placeholder={placeholders[name]} value={formData[name]}
                  onChange={handleChange} style={inputStyle}/>
              </motion.div>
            ))}
          </div>
          {error&&(
            <motion.div className="alert alert-danger mt-3 py-2 mb-0"
              initial={{opacity:0}} animate={{opacity:1}}>
              {error}
            </motion.div>
          )}
          <motion.button className="btn btn-lg w-100 mt-4 text-white"
            onClick={runAnalysis} disabled={loading}
            style={{background:"linear-gradient(135deg,#1a5c34,#2d8a52,#52b788)",
              border:"none",borderRadius:12,fontSize:18,fontWeight:700,
              boxShadow:"0 4px 20px rgba(45,106,79,0.4)"}}
            whileHover={{scale:1.02,boxShadow:"0 6px 25px rgba(45,106,79,0.5)"}}
            whileTap={{scale:0.98}}
            animate={loading?{opacity:[1,0.7,1]}:{}}
            transition={loading?{duration:0.8,repeat:Infinity}:{}}>
            {loading?(<span><span className="spinner-border spinner-border-sm me-2"/>{t.analysing}</span>):t.runAnalysis}
          </motion.button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {results&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{color:dm.text}}>{t.results}</h5>
                <motion.button className="btn btn-danger" onClick={downloadPDF}
                  whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
                  {t.downloadPDF}
                </motion.button>
              </div>

              <motion.div className="row g-3 mb-4"
                variants={containerVariants} initial="hidden" animate="visible">

                {/* Crop Card */}
                {results.crop&&(
                  <motion.div className="col-md-6" variants={cardVariants}>
                    <div className="card shadow p-4 h-100 border-success border-2"
                      style={{...cardStyle,background:darkMode?"linear-gradient(135deg,#16213e,#1a3a2a)":"linear-gradient(135deg,#f0fff4,#d1e7dd)"}}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className="text-success fw-bold mb-1">{t.crop}</p>
                          <h2 className="text-success text-capitalize fw-bold mb-0">
                            {results.crop.recommended_crop}
                          </h2>
                        </div>
                        <motion.span className="badge bg-success fs-6"
                          initial={{scale:0}} animate={{scale:1}}
                          transition={{type:"spring",bounce:0.5}}>
                          <AnimatedNumber value={results.crop.confidence}/>% {t.sure}
                        </motion.span>
                      </div>
                      <div className="mt-3">
                        <small style={{color:dm.muted}}>{t.confidence}</small>
                        <div className="progress mt-1" style={{height:12,borderRadius:8}}>
                          <motion.div className="progress-bar bg-success"
                            initial={{width:0}} animate={{width:`${results.crop.confidence}%`}}
                            transition={{duration:1.5,ease:"easeOut"}} style={{borderRadius:8}}/>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Soil */}
                {results.soil&&(
                  <motion.div className="col-md-6" variants={cardVariants}>
                    <div className="card shadow p-4 h-100 border-warning border-2"
                      style={{...cardStyle,background:darkMode?"linear-gradient(135deg,#16213e,#3a2a00)":"linear-gradient(135deg,#fffef0,#fff3cd)"}}>
                      <p className="text-warning fw-bold mb-1">{t.soil}</p>
                      <h2 className="fw-bold mb-2" style={{color:"#b45309"}}>
                        <AnimatedNumber value={results.soil.soil_health_score}/>
                        <small className="fs-6 ms-2 fw-normal" style={{color:dm.muted}}>/ 100</small>
                      </h2>
                      <div className="progress mb-2" style={{height:12,borderRadius:8}}>
                        <motion.div className={`progress-bar ${results.soil.status==="Healthy"?"bg-success":results.soil.status==="Moderate"?"bg-warning":"bg-danger"}`}
                          initial={{width:0}} animate={{width:`${results.soil.soil_health_score}%`}}
                          transition={{duration:1.5,ease:"easeOut"}} style={{borderRadius:8}}/>
                      </div>
                      <motion.span className={`badge fs-6 ${results.soil.status==="Healthy"?"bg-success":results.soil.status==="Moderate"?"bg-warning text-dark":"bg-danger"}`}
                        initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",bounce:0.5}}>
                        {results.soil.status}
                      </motion.span>
                    </div>
                  </motion.div>
                )}

                {/* Failure */}
                {results.failure&&(
                  <motion.div className="col-md-6" variants={cardVariants}>
                    <div className={`card shadow p-4 h-100 border-${results.failure.color} border-2`} style={cardStyle}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className={`text-${results.failure.color} fw-bold mb-1`}>{t.failure}</p>
                          <h2 className={`text-${results.failure.color} fw-bold mb-0`}>{results.failure.failure_risk}</h2>
                        </div>
                        <motion.span className={`badge bg-${results.failure.color} fs-6`}
                          initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",bounce:0.5}}>
                          <AnimatedNumber value={results.failure.confidence}/>% {t.sure}
                        </motion.span>
                      </div>
                      <div className="mt-3">
                        <small style={{color:dm.muted}}>{t.modelConf}</small>
                        <div className="progress mt-1" style={{height:12,borderRadius:8}}>
                          <motion.div className={`progress-bar bg-${results.failure.color}`}
                            initial={{width:0}} animate={{width:`${results.failure.confidence}%`}}
                            transition={{duration:1.5,ease:"easeOut"}} style={{borderRadius:8}}/>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Harvest */}
                {results.harvest&&(
                  <motion.div className="col-md-6" variants={cardVariants}>
                    <div className="card shadow p-4 h-100 border-info border-2"
                      style={{...cardStyle,background:darkMode?"linear-gradient(135deg,#16213e,#0a2a3a)":"linear-gradient(135deg,#f0fffe,#cff4fc)"}}>
                      <p className="text-info fw-bold mb-1">{t.harvest}</p>
                      <h2 className="text-info fw-bold mb-2">
                        <AnimatedNumber value={results.harvest.harvest_days}/>
                        <small className="fs-6 ms-2 fw-normal" style={{color:dm.muted}}>{t.days}</small>
                      </h2>
                      <motion.span className="badge bg-info fs-6 text-dark"
                        initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",bounce:0.5}}>
                        {results.harvest.season_type}
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* ── Crop Profile + Market Price + Seasonal Calendar ── */}
              {results.crop&&(
                <motion.div className="row g-3 mb-4"
                  initial={{opacity:0,y:30}} animate={{opacity:1,y:0}}
                  transition={{duration:0.6,delay:0.3}}>

                  {/* Crop Profile Card with emoji */}
                  <div className="col-md-4">
                    <div className="card shadow h-100 overflow-hidden" style={cardStyle}>
                      <div style={{
                        background:`linear-gradient(135deg,${cropGrad[0]},${cropGrad[1]})`,
                        padding:"30px 16px",textAlign:"center",position:"relative",overflow:"hidden"}}>
                        {[...Array(3)].map((_,i)=>(
                          <motion.div key={i} style={{position:"absolute",borderRadius:"50%",
                            background:"rgba(255,255,255,0.08)",
                            width:80+i*40,height:80+i*40,
                            top:-20-i*15,right:-20-i*15}}
                            animate={{rotate:360}}
                            transition={{duration:15+i*5,repeat:Infinity,ease:"linear"}}/>
                        ))}
                        <motion.div style={{fontSize:80,lineHeight:1,position:"relative",zIndex:1}}
                          animate={{y:[0,-8,0]}}
                          transition={{duration:2,repeat:Infinity,ease:"easeInOut"}}>
                          {cropEmoji}
                        </motion.div>
                        <h4 className="text-white fw-bold mt-2 text-capitalize" style={{position:"relative",zIndex:1}}>
                          {results.crop.recommended_crop}
                        </h4>
                      </div>
                      <div className="p-3 text-center">
                        <small style={{color:dm.muted}}>{t.cropCard}</small>
                        <div className="mt-2">
                          <span className="badge bg-success me-1">{results.crop.confidence}% {t.sure}</span>
                          {cropSeasons&&<span className="badge bg-primary">{cropSeasons[0]?.season}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Price Card */}
                  <div className="col-md-4">
                    <div className="card shadow h-100 overflow-hidden" style={cardStyle}>
                      <div style={{background:"linear-gradient(135deg,#b45309,#f59e0b)",padding:"10px 16px"}}>
                        <small className="text-white fw-bold">{t.marketPrice}</small>
                      </div>
                      <div className="p-4 text-center d-flex flex-column justify-content-center" style={{flex:1}}>
                        {marketLoading?(
                          <div>
                            <div className="spinner-border text-warning mb-2"/>
                            <div><small style={{color:dm.muted}}>Fetching live prices...</small></div>
                          </div>
                        ):marketData?(
                          <>
                            <motion.div initial={{scale:0}} animate={{scale:1}}
                              transition={{type:"spring",bounce:0.4}}>
                              <h1 className="fw-bold mb-0" style={{color:darkMode?"#f59e0b":"#b45309",fontSize:40}}>
                                ₹{marketData.price.toLocaleString()}
                              </h1>
                              <small style={{color:dm.muted}}>{marketData.unit}</small>
                            </motion.div>
                            <div className="mt-2">
                              <div style={{color:dm.muted,fontSize:12}}>{marketData.market}</div>
                              <div style={{color:dm.muted,fontSize:11}}>{marketData.state}</div>
                            </div>
                            <div className="mt-2">
                              <span className={`badge ${marketData.is_live?"bg-success":"bg-secondary"}`} style={{fontSize:10}}>
                                {marketData.is_live?"🟢 "+t.livePrice:"⚪ "+t.estPrice}
                              </span>
                            </div>
                            <div style={{color:dm.muted,fontSize:10}} className="mt-1">
                              Updated: {marketData.date}
                            </div>
                          </>
                        ):(
                          <small style={{color:dm.muted}}>Price data unavailable</small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seasonal Calendar */}
                  <div className="col-md-4">
                    <div className="card shadow h-100 overflow-hidden" style={cardStyle}>
                      <div style={{background:"linear-gradient(135deg,#0a4a7a,#1a8ad4)",padding:"10px 16px"}}>
                        <small className="text-white fw-bold">{t.seasonal}</small>
                      </div>
                      <div className="p-3" style={{overflowY:"auto",maxHeight:280}}>
                        {cropSeasons?.map((s,si)=>(
                          <div key={si} className="mb-3">
                            <span className="badge bg-primary mb-2">{s.season}</span>
                            <div className="mb-1">
                              <small className="fw-bold" style={{color:"#16a34a"}}>🌱 {t.sowingMonths}</small>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {MONTHS.map(m=>(
                                  <motion.span key={m}
                                    className={`badge ${s.sow.includes(m)?"bg-success":"bg-secondary"}`}
                                    style={{fontSize:10,opacity:s.sow.includes(m)?1:0.4}}
                                    animate={s.sow.includes(m)?{scale:[1,1.1,1]}:{}}
                                    transition={{duration:1.5,repeat:Infinity,delay:Math.random()*2}}>
                                    {m}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <small className="fw-bold" style={{color:"#b45309"}}>🌾 {t.harvestMonths}</small>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {MONTHS.map(m=>(
                                  <span key={m}
                                    className={`badge ${s.harvest.includes(m)?"bg-warning text-dark":"bg-secondary"}`}
                                    style={{fontSize:10,opacity:s.harvest.includes(m)?1:0.4}}>
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Fertilizer */}
              {results.fertilizer&&(
                <motion.div className="card shadow p-4 mb-4 border-primary border-2" style={cardStyle}
                  variants={cardVariants} initial="hidden" animate="visible">
                  <h5 className="fw-bold mb-1 text-primary">{t.fertilizer}</h5>
                  <p className="small mb-3" style={{color:dm.muted}}>
                    {t.basedOn}: <strong className="text-capitalize">{results.fertilizer.crop}</strong>
                  </p>
                  <div className="row g-3 mb-3">
                    {results.fertilizer.fertilizers.map((f,i)=>(
                      <motion.div className="col-md-4" key={i}
                        initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}
                        transition={{delay:i*0.1}}>
                        <div className={`card border-${f.color} border-2 p-3 text-center`} style={cardStyle}>
                          <p className={`fw-bold text-${f.color} mb-1`}>{f.nutrient}</p>
                          <span className={`badge bg-${f.color} mb-2`}>{f.status}</span>
                          <p className="small mb-0" style={{color:dm.muted}}>{f.advice}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className={`alert alert-${results.fertilizer.ph_color} py-2 mb-0`}>
                    <strong>{t.phAdvice}:</strong> {results.fertilizer.ph_advice}
                  </div>
                </motion.div>
              )}

              {/* NPK Radar Chart + Advice */}
              {results.crop&&radarData&&(
                <motion.div className="card shadow p-4 mb-4" style={cardStyle}
                  initial={{opacity:0,y:30}} animate={{opacity:1,y:0}}
                  transition={{duration:0.6,delay:0.4}}>
                  <h5 className="fw-bold mb-1" style={{color:dm.text}}>{t.radarTitle}</h5>
                  <p className="small mb-3" style={{color:dm.muted}}>
                    <span style={{color:"rgba(45,106,79,0.9)"}}>■</span> {t.yourSoil} &nbsp;
                    <span style={{color:"rgba(255,193,7,0.9)"}}>■</span> {t.idealSoil} for {results.crop.recommended_crop}
                  </p>
                  <div className="row align-items-center">
                    <div className="col-md-7">
                      <Radar data={radarData.chartData} options={{
                        responsive:true,
                        scales:{r:{
                          beginAtZero:true,
                          grid:{color:darkMode?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"},
                          ticks:{color:dm.muted,backdropColor:"transparent",font:{size:10}},
                          pointLabels:{color:dm.text,font:{size:11}}
                        }},
                        plugins:{
                          legend:{labels:{color:dm.text,font:{size:12}}},
                          title:{display:false}
                        }
                      }}/>
                    </div>
                    <div className="col-md-5">
                      <h6 className="fw-bold mb-2" style={{color:dm.text}}>
                        📋 {t.radarAdvice}
                      </h6>
                      {radarAdvice.length===0?(
                        <div className="alert alert-success py-2">
                          <small>✅ Your soil is well balanced for {results.crop.recommended_crop}!</small>
                        </div>
                      ):(
                        radarAdvice.map((a,i)=>(
                          <motion.div key={i}
                            className={`alert alert-${a.color} py-2 mb-2`}
                            initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}
                            transition={{delay:i*0.1}}>
                            <small>
                              <strong>{a.param}</strong> — {a.action} by{" "}
                              <strong>{a.by}</strong>
                              {a.action==="increase"
                                ? " to improve yield"
                                : " to avoid toxicity"}
                            </small>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SHAP Chart */}
              {shapChartData&&(
                <motion.div className="card shadow p-4 mb-4" style={cardStyle}
                  initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
                  <h5 className="fw-bold mb-1" style={{color:dm.text}}>{t.shap}</h5>
                  <p className="small mb-3" style={{color:dm.muted}}>
                    <span style={{color:"rgba(25,135,84,0.9)"}}>■</span> Green = pushed towards this crop &nbsp;
                    <span style={{color:"rgba(220,53,69,0.9)"}}>■</span> Red = pushed against it
                  </p>
                  <Bar data={shapChartData} options={{
                    indexAxis:"y",responsive:true,
                    plugins:{legend:{display:false}},
                    scales:{
                      x:{grid:{color:darkMode?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"},ticks:{color:dm.muted}},
                      y:{grid:{display:false},ticks:{color:dm.muted}}
                    }
                  }}/>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length>0&&(
          <motion.div className="card shadow p-4 mb-4" style={cardStyle}
            initial={{opacity:0}} animate={{opacity:1}}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{color:dm.text}}>{t.history}</h5>
              <motion.button className="btn btn-outline-danger btn-sm"
                onClick={()=>setHistory([])}
                whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
                {t.clearHistory}
              </motion.button>
            </div>
            <div className="table-responsive">
              <table className="table table-bordered table-sm align-middle mb-0" style={{color:dm.text}}>
                <thead>
                  <tr style={{backgroundColor:dm.tableHead,color:"#fff"}}>
                    {t.tableHeaders.map((h,i)=><th key={i}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h,i)=>(
                    <motion.tr key={i}
                      initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}
                      transition={{delay:i*0.05}}
                      style={{backgroundColor:i%2===0?dm.tableRow:dm.tableAlt}}>
                      <td><small>{h.time}</small></td>
                      <td>{h.N}</td><td>{h.P}</td><td>{h.K}</td>
                      <td>{h.temp}°</td><td>{h.humidity}%</td>
                      <td>{h.ph}</td><td>{h.rainfall}</td>
                      <td><span className="badge bg-success text-capitalize">{h.crop}</span></td>
                      <td>{h.confidence}%</td>
                      <td><span className={`badge ${h.soil==="Healthy"?"bg-success":h.soil==="Moderate"?"bg-warning text-dark":"bg-danger"}`}>{h.soil}</span></td>
                      <td><span className={`badge bg-${riskBadge[h.risk]||"secondary"}`}>{h.risk}</span></td>
                      <td>{h.harvest} {t.dayWord}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <small style={{color:dm.muted}} className="mt-2 d-block">
              {t.showing} {history.length} {t.predictions}
            </small>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;