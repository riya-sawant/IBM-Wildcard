import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Camera, MapPin, Building2, Siren, BookOpen, Sun, Moon, Eye, Star, Upload, Loader2, Mic, MicOff, Copy, Check, AlertTriangle, Wallet } from "lucide-react";
import ManageCareCosts from "./ManageCareCosts";

// ---------- Theme tokens ----------
const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5001"
  : "";

const THEMES = {
  light: {
    bg: "#FFFFFF", panel: "#F1EFE8", ink: "#2C2C2A", sub: "#5F5E5A", mute: "#8A887F",
    border: "#D3D1C7", accent: "#534AB7", accentBg: "#EEEDFE",
    teal: "#0F6E56", tealBg: "#E1F5EE", amber: "#854F0B", amberBg: "#FAEEDA",
    pink: "#993556", pinkBg: "#FBEAF0", coral: "#993C1D", coralBg: "#FAECE7",
  },
  dark: {
    bg: "#1B1B19", panel: "#232320", ink: "#F1EFE8", sub: "#B4B2A9", mute: "#7C7A72",
    border: "#3A3934", accent: "#AFA9EC", accentBg: "#3C3489",
    teal: "#6FD3B4", tealBg: "#1E3B33", amber: "#E8B463", amberBg: "#3E2E13",
    pink: "#E9A9C0", pinkBg: "#3E1F2A", coral: "#E8A188", coralBg: "#3E2318",
  },
  colorblind: {
    bg: "#FFFFFF", panel: "#F1EFE8", ink: "#2C2C2A", sub: "#5F5E5A", mute: "#8A887F",
    border: "#D3D1C7", accent: "#185FA5", accentBg: "#E6F1FB",
    teal: "#185FA5", tealBg: "#E6F1FB", amber: "#854F0B", amberBg: "#FAEEDA",
    pink: "#185FA5", pinkBg: "#E6F1FB", coral: "#854F0B", coralBg: "#FAEEDA",
  },
};

const TABS = [
  { id: "home",        label: "Home",           icon: Send     },
  { id: "insurance",   label: "Insurance lens",  icon: MapPin   },
  { id: "noinsurance", label: "No insurance",    icon: Building2},
  { id: "urgent",      label: "Urgent",          icon: Siren    },
  { id: "costs",       label: "Manage costs",    icon: Wallet   },
  { id: "learn",       label: "Learn",           icon: BookOpen },
];

// ---------- Insurance lens data ----------
// ZIP prefix → state code lookup (first 3 digits covers all US ZIP ranges)
// Source: USPS ZIP code state assignments
const ZIP_PREFIX_TO_STATE = {
  "005":"NY","006":"PR","007":"PR","008":"VI","009":"PR",
  "010":"MA","011":"MA","012":"MA","013":"MA","014":"MA","015":"MA","016":"MA","017":"MA","018":"MA","019":"MA",
  "020":"MA","021":"MA","022":"MA","023":"MA","024":"MA","025":"MA","026":"MA","027":"MA",
  "028":"RI","029":"RI",
  "030":"NH","031":"NH","032":"NH","033":"NH","034":"NH","035":"NH","036":"NH","037":"NH","038":"NH",
  "039":"ME","040":"ME","041":"ME","042":"ME","043":"ME","044":"ME","045":"ME","046":"ME","047":"ME","048":"ME","049":"ME",
  "050":"VT","051":"VT","052":"VT","053":"VT","054":"VT","056":"VT","057":"VT","058":"VT","059":"VT",
  "060":"CT","061":"CT","062":"CT","063":"CT","064":"CT","065":"CT","066":"CT","067":"CT","068":"CT","069":"CT",
  "070":"NJ","071":"NJ","072":"NJ","073":"NJ","074":"NJ","075":"NJ","076":"NJ","077":"NJ","078":"NJ","079":"NJ",
  "080":"NJ","081":"NJ","082":"NJ","083":"NJ","084":"NJ","085":"NJ","086":"NJ","087":"NJ","088":"NJ","089":"NJ",
  "100":"NY","101":"NY","102":"NY","103":"NY","104":"NY","105":"NY","106":"NY","107":"NY","108":"NY","109":"NY",
  "110":"NY","111":"NY","112":"NY","113":"NY","114":"NY","115":"NY","116":"NY","117":"NY","118":"NY","119":"NY",
  "120":"NY","121":"NY","122":"NY","123":"NY","124":"NY","125":"NY","126":"NY","127":"NY","128":"NY","129":"NY",
  "130":"NY","131":"NY","132":"NY","133":"NY","134":"NY","135":"NY","136":"NY","137":"NY","138":"NY","139":"NY",
  "140":"NY","141":"NY","142":"NY","143":"NY","144":"NY","145":"NY","146":"NY","147":"NY","148":"NY","149":"NY",
  "150":"PA","151":"PA","152":"PA","153":"PA","154":"PA","155":"PA","156":"PA","157":"PA","158":"PA","159":"PA",
  "160":"PA","161":"PA","162":"PA","163":"PA","164":"PA","165":"PA","166":"PA","167":"PA","168":"PA","169":"PA",
  "170":"PA","171":"PA","172":"PA","173":"PA","174":"PA","175":"PA","176":"PA","177":"PA","178":"PA","179":"PA",
  "180":"PA","181":"PA","182":"PA","183":"PA","184":"PA","185":"PA","186":"PA","187":"PA","188":"PA","189":"PA",
  "190":"PA","191":"PA","192":"PA","193":"PA","194":"PA","195":"PA","196":"PA",
  "197":"DE","198":"DE","199":"DE",
  "200":"DC","201":"DC","202":"DC","203":"DC","204":"DC","205":"DC",
  "206":"MD","207":"MD","208":"MD","209":"MD","210":"MD","211":"MD","212":"MD","214":"MD","215":"MD","216":"MD","217":"MD","218":"MD","219":"MD",
  "220":"VA","221":"VA","222":"VA","223":"VA","224":"VA","225":"VA","226":"VA","227":"VA","228":"VA","229":"VA",
  "230":"VA","231":"VA","232":"VA","233":"VA","234":"VA","235":"VA","236":"VA","237":"VA","238":"VA","239":"VA",
  "240":"VA","241":"VA","242":"VA","243":"VA","244":"VA","245":"VA","246":"VA",
  "247":"WV","248":"WV","249":"WV","250":"WV","251":"WV","252":"WV","253":"WV","254":"WV","255":"WV","256":"WV","257":"WV","258":"WV","259":"WV",
  "260":"WV","261":"WV","262":"WV","263":"WV","264":"WV","265":"WV","266":"WV","267":"WV","268":"WV",
  "270":"NC","271":"NC","272":"NC","273":"NC","274":"NC","275":"NC","276":"NC","277":"NC","278":"NC","279":"NC",
  "280":"NC","281":"NC","282":"NC","283":"NC","284":"NC","285":"NC","286":"NC","287":"NC","288":"NC","289":"NC",
  "290":"SC","291":"SC","292":"SC","293":"SC","294":"SC","295":"SC","296":"SC","297":"SC","298":"SC","299":"SC",
  "300":"GA","301":"GA","302":"GA","303":"GA","304":"GA","305":"GA","306":"GA","307":"GA","308":"GA","309":"GA",
  "310":"GA","311":"GA","312":"GA","313":"GA","314":"GA","315":"GA","316":"GA","317":"GA","318":"GA","319":"GA",
  "320":"FL","321":"FL","322":"FL","323":"FL","324":"FL","325":"FL","326":"FL","327":"FL","328":"FL","329":"FL",
  "330":"FL","331":"FL","332":"FL","333":"FL","334":"FL","335":"FL","336":"FL","337":"FL","338":"FL","339":"FL",
  "341":"FL","342":"FL","344":"FL","346":"FL","347":"FL","349":"FL",
  "350":"AL","351":"AL","352":"AL","353":"AL","354":"AL","355":"AL","356":"AL","357":"AL","358":"AL","359":"AL",
  "360":"AL","361":"AL","362":"AL","363":"AL","364":"AL","365":"AL","366":"AL","367":"AL","368":"AL","369":"AL",
  "370":"TN","371":"TN","372":"TN","373":"TN","374":"TN","375":"TN","376":"TN","377":"TN","378":"TN","379":"TN",
  "380":"TN","381":"TN","382":"TN","383":"TN","384":"TN","385":"TN",
  "386":"MS","387":"MS","388":"MS","389":"MS","390":"MS","391":"MS","392":"MS","393":"MS","394":"MS","395":"MS","396":"MS","397":"MS",
  "398":"GA","399":"GA",
  "400":"KY","401":"KY","402":"KY","403":"KY","404":"KY","405":"KY","406":"KY","407":"KY","408":"KY","409":"KY",
  "410":"KY","411":"KY","412":"KY","413":"KY","414":"KY","415":"KY","416":"KY","417":"KY","418":"KY",
  "420":"KY","421":"KY","422":"KY","423":"KY","424":"KY","425":"KY","426":"KY","427":"KY",
  "430":"OH","431":"OH","432":"OH","433":"OH","434":"OH","435":"OH","436":"OH","437":"OH","438":"OH","439":"OH",
  "440":"OH","441":"OH","442":"OH","443":"OH","444":"OH","445":"OH","446":"OH","447":"OH","448":"OH","449":"OH",
  "450":"OH","451":"OH","452":"OH","453":"OH","454":"OH","455":"OH","456":"OH","457":"OH","458":"OH",
  "460":"IN","461":"IN","462":"IN","463":"IN","464":"IN","465":"IN","466":"IN","467":"IN","468":"IN","469":"IN",
  "470":"IN","471":"IN","472":"IN","473":"IN","474":"IN","475":"IN","476":"IN","477":"IN","478":"IN","479":"IN",
  "480":"MI","481":"MI","482":"MI","483":"MI","484":"MI","485":"MI","486":"MI","487":"MI","488":"MI","489":"MI",
  "490":"MI","491":"MI","492":"MI","493":"MI","494":"MI","495":"MI","496":"MI","497":"MI","498":"MI","499":"MI",
  "500":"IA","501":"IA","502":"IA","503":"IA","504":"IA","505":"IA","506":"IA","507":"IA","508":"IA","509":"IA",
  "510":"IA","511":"IA","512":"IA","513":"IA","514":"IA","515":"IA","516":"IA","520":"IA","521":"IA","522":"IA","523":"IA","524":"IA","525":"IA","526":"IA","527":"IA","528":"IA",
  "530":"WI","531":"WI","532":"WI","534":"WI","535":"WI","537":"WI","538":"WI","539":"WI",
  "540":"WI","541":"WI","542":"WI","543":"WI","544":"WI","545":"WI","546":"WI","547":"WI","548":"WI","549":"WI",
  "550":"MN","551":"MN","553":"MN","554":"MN","555":"MN","556":"MN","557":"MN","558":"MN","559":"MN",
  "560":"MN","561":"MN","562":"MN","563":"MN","564":"MN","565":"MN","566":"MN","567":"MN",
  "570":"SD","571":"SD","572":"SD","573":"SD","574":"SD","575":"SD","576":"SD","577":"SD",
  "580":"ND","581":"ND","582":"ND","583":"ND","584":"ND","585":"ND","586":"ND","587":"ND","588":"ND",
  "590":"MT","591":"MT","592":"MT","593":"MT","594":"MT","595":"MT","596":"MT","597":"MT","598":"MT","599":"MT",
  "600":"IL","601":"IL","602":"IL","603":"IL","604":"IL","605":"IL","606":"IL","607":"IL","608":"IL","609":"IL",
  "610":"IL","611":"IL","612":"IL","613":"IL","614":"IL","615":"IL","616":"IL","617":"IL","618":"IL","619":"IL",
  "620":"IL","622":"IL","623":"IL","624":"IL","625":"IL","626":"IL","627":"IL","628":"IL","629":"IL",
  "630":"MO","631":"MO","633":"MO","634":"MO","635":"MO","636":"MO","637":"MO","638":"MO","639":"MO",
  "640":"MO","641":"MO","644":"MO","645":"MO","646":"MO","647":"MO","648":"MO","649":"MO",
  "650":"MO","651":"MO","652":"MO","653":"MO","654":"MO","655":"MO","656":"MO","657":"MO","658":"MO",
  "660":"KS","661":"KS","662":"KS","664":"KS","665":"KS","666":"KS","667":"KS","668":"KS","669":"KS",
  "670":"KS","671":"KS","672":"KS","673":"KS","674":"KS","675":"KS","676":"KS","677":"KS","678":"KS","679":"KS",
  "680":"NE","681":"NE","683":"NE","684":"NE","685":"NE","686":"NE","687":"NE","688":"NE","689":"NE",
  "690":"NE","691":"NE","692":"NE","693":"NE",
  "700":"LA","701":"LA","703":"LA","704":"LA","705":"LA","706":"LA","707":"LA","708":"LA",
  "710":"LA","711":"LA","712":"LA","713":"LA","714":"LA",
  "716":"AR","717":"AR","718":"AR","719":"AR","720":"AR","721":"AR","722":"AR","723":"AR","724":"AR","725":"AR","726":"AR","727":"AR","728":"AR","729":"AR",
  "730":"OK","731":"OK","733":"OK","734":"OK","735":"OK","736":"OK","737":"OK","738":"OK","739":"OK",
  "740":"OK","741":"OK","743":"OK","744":"OK","745":"OK","746":"OK","747":"OK","748":"OK","749":"OK",
  "750":"TX","751":"TX","752":"TX","753":"TX","754":"TX","755":"TX","756":"TX","757":"TX","758":"TX","759":"TX",
  "760":"TX","761":"TX","762":"TX","763":"TX","764":"TX","765":"TX","766":"TX","767":"TX","768":"TX","769":"TX",
  "770":"TX","771":"TX","772":"TX","773":"TX","774":"TX","775":"TX","776":"TX","777":"TX","778":"TX","779":"TX",
  "780":"TX","781":"TX","782":"TX","783":"TX","784":"TX","785":"TX","786":"TX","787":"TX","788":"TX","789":"TX",
  "790":"TX","791":"TX","792":"TX","793":"TX","794":"TX","795":"TX","796":"TX","797":"TX","798":"TX","799":"TX",
  "800":"CO","801":"CO","802":"CO","803":"CO","804":"CO","805":"CO","806":"CO","807":"CO","808":"CO","809":"CO",
  "810":"CO","811":"CO","812":"CO","813":"CO","814":"CO","815":"CO","816":"CO",
  "820":"WY","821":"WY","822":"WY","823":"WY","824":"WY","825":"WY","826":"WY","827":"WY","828":"WY","829":"WY","830":"WY","831":"WY",
  "832":"ID","833":"ID","834":"ID","835":"ID","836":"ID","837":"ID","838":"ID",
  "840":"UT","841":"UT","842":"UT","843":"UT","844":"UT","845":"UT","846":"UT","847":"UT",
  "850":"AZ","851":"AZ","852":"AZ","853":"AZ","855":"AZ","856":"AZ","857":"AZ","859":"AZ","860":"AZ","863":"AZ","864":"AZ","865":"AZ",
  "870":"NM","871":"NM","872":"NM","873":"NM","874":"NM","875":"NM","876":"NM","877":"NM","878":"NM","879":"NM","880":"NM","881":"NM","882":"NM","883":"NM","884":"NM",
  "885":"TX",
  "889":"NV","890":"NV","891":"NV","893":"NV","894":"NV","895":"NV","896":"NV","897":"NV","898":"NV",
  "900":"CA","901":"CA","902":"CA","903":"CA","904":"CA","905":"CA","906":"CA","907":"CA","908":"CA","909":"CA",
  "910":"CA","911":"CA","912":"CA","913":"CA","914":"CA","915":"CA","916":"CA","917":"CA","918":"CA","919":"CA",
  "920":"CA","921":"CA","922":"CA","923":"CA","924":"CA","925":"CA","926":"CA","927":"CA","928":"CA",
  "930":"CA","931":"CA","932":"CA","933":"CA","934":"CA","935":"CA","936":"CA","937":"CA","938":"CA","939":"CA",
  "940":"CA","941":"CA","942":"CA","943":"CA","944":"CA","945":"CA","946":"CA","947":"CA","948":"CA","949":"CA",
  "950":"CA","951":"CA","952":"CA","953":"CA","954":"CA","955":"CA","956":"CA","957":"CA","958":"CA","959":"CA",
  "960":"CA","961":"CA",
  "967":"HI","968":"HI",
  "970":"OR","971":"OR","972":"OR","973":"OR","974":"OR","975":"OR","976":"OR","977":"OR","978":"OR","979":"OR",
  "980":"WA","981":"WA","982":"WA","983":"WA","984":"WA","985":"WA","986":"WA","988":"WA","989":"WA",
  "990":"WA","991":"WA","992":"WA","993":"WA","994":"WA",
  "995":"AK","996":"AK","997":"AK","998":"AK","999":"AK",
};

// Resolve a 5-digit ZIP to a 2-letter state code (or null if unknown)
function zipToState(zip) {
  if (!zip || zip.length < 3) return null;
  return ZIP_PREFIX_TO_STATE[zip.slice(0, 3)] || null;
}

const STATE_NAMES = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"Washington DC",FL:"Florida",
  GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
  KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",
  MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
  OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
  PR:"Puerto Rico",VI:"US Virgin Islands",
};

const IL_PROVIDERS = [
  // ══ BATCH 1A — NY, PA, MD, MA, CT, NJ ══

  // ── New York ──
  { name: "Dr. Amara Osei",              state: "NY", zip: "10001", specialty: "Family medicine",   distance: "0.8 mi",  rating: 4.8, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doctor 2023"],             asl: true,  phone: true,  languages: ["English","Twi"],                         insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Accessible","ASL","Phone"] },
  { name: "NYC Family Care Center",      state: "NY", zip: "10025", specialty: "Family medicine",   distance: "1.1 mi",  rating: 4.4, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Chinese"],           insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone","Spanish"] },
  { name: "Dr. Victor Huang",            state: "NY", zip: "10036", specialty: "Family medicine",   distance: "1.4 mi",  rating: 4.6, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],                   insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Riverside Health Clinic",     state: "NY", zip: "10002", specialty: "Internal medicine", distance: "1.2 mi",  rating: 4.5, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish","Yoruba"],            insurance: "low",    accessibility: ["elevator","transportation"],         tags: ["Accessible","Spanish"] },
  { name: "Dr. Preethi Raj",             state: "NY", zip: "10128", specialty: "Internal medicine", distance: "1.0 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Internist 2023"],          asl: false, phone: true,  languages: ["English","Hindi","Tamil"],               insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Accessible","Phone"] },
  { name: "Dr. James Fontaine",          state: "NY", zip: "10019", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.5, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Kezia Monroe",            state: "NY", zip: "11201", specialty: "Pediatrics",        distance: "1.5 mi",  rating: 4.7, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Brooklyn Child Health",       state: "NY", zip: "11205", specialty: "Pediatrics",        distance: "0.7 mi",  rating: 4.4, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Haitian Creole"],   insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Lawrence Kim",            state: "NY", zip: "10075", specialty: "Pediatrics",        distance: "1.2 mi",  rating: 4.8, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nina Castillo",           state: "NY", zip: "10027", specialty: "Dermatology",       distance: "1.6 mi",  rating: 4.5, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Daniel Shapiro",          state: "NY", zip: "10022", specialty: "Dermatology",       distance: "0.6 mi",  rating: 4.7, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: ["Top Derm 2022"],               asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Yuna Okafor",             state: "NY", zip: "10065", specialty: "Dermatology",       distance: "0.8 mi",  rating: 4.9, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: ["Excellence Award 2024"],       asl: false, phone: true,  languages: ["English","Igbo"],                       insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Harlem Mental Health Ctr",    state: "NY", zip: "10037", specialty: "Psychiatry",        distance: "0.5 mi",  rating: 4.4, years: 10, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Leila Mansouri",          state: "NY", zip: "10016", specialty: "Psychiatry",        distance: "1.1 mi",  rating: 4.6, years: 15, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Farsi"],                      insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Marcus Reid",             state: "NY", zip: "10021", specialty: "Psychiatry",        distance: "0.9 mi",  rating: 4.7, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: ["Mental Health Champion"],      asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Chioma Eze",              state: "NY", zip: "10031", specialty: "OB-GYN",            distance: "1.3 mi",  rating: 4.8, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: ["Women's Health Award"],        asl: false, phone: true,  languages: ["English","Igbo"],                       insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Sofia Ramirez",           state: "NY", zip: "10040", specialty: "OB-GYN",            distance: "1.0 mi",  rating: 4.6, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Claire Dunmore",          state: "NY", zip: "10023", specialty: "OB-GYN",            distance: "0.7 mi",  rating: 4.9, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Top OB 2023"],                 asl: false, phone: true,  languages: ["English","French"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Queens General Practice",     state: "NY", zip: "11354", specialty: "General practice",  distance: "0.8 mi",  rating: 4.3, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Chinese","Korean"],            insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Rasheed Owens",           state: "NY", zip: "10456", specialty: "General practice",  distance: "1.4 mi",  rating: 4.4, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Eleanor Price",           state: "NY", zip: "10028", specialty: "General practice",  distance: "0.5 mi",  rating: 4.7, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },

  // ── Pennsylvania ──
  { name: "Philly Community Care",       state: "PA", zip: "19103", specialty: "Family medicine",   distance: "0.6 mi",  rating: 4.4, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: ["HRSA Award 2023"],             asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone","Spanish"] },
  { name: "Dr. Teresa Nguyen",           state: "PA", zip: "19147", specialty: "Family medicine",   distance: "1.3 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],                 insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Accessible","Phone"] },
  { name: "Dr. Owen Bradley",            state: "PA", zip: "19103", specialty: "Family medicine",   distance: "0.9 mi",  rating: 4.5, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Robert Chen",             state: "PA", zip: "19101", specialty: "Internal medicine", distance: "1.8 mi",  rating: 4.6, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin","Cantonese"],        insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Accessible","Phone"] },
  { name: "PA Free Health Clinic",       state: "PA", zip: "19133", specialty: "Internal medicine", distance: "0.7 mi",  rating: 4.2, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Alicia Grayson",          state: "PA", zip: "19103", specialty: "Internal medicine", distance: "1.2 mi",  rating: 4.8, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Internist 2024"],          asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Marcus Hill",             state: "PA", zip: "19146", specialty: "Pediatrics",        distance: "1.5 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Philly Kids Health",          state: "PA", zip: "19104", specialty: "Pediatrics",        distance: "0.8 mi",  rating: 4.4, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Mandarin"],          insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Hannah Levy",             state: "PA", zip: "19118", specialty: "Pediatrics",        distance: "2.0 mi",  rating: 4.7, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Kwame Asante",            state: "PA", zip: "19143", specialty: "Dermatology",       distance: "2.1 mi",  rating: 4.4, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi"],                         insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Susan Park",              state: "PA", zip: "19103", specialty: "Dermatology",       distance: "0.9 mi",  rating: 4.6, years: 15, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. William Foster",          state: "PA", zip: "19103", specialty: "Dermatology",       distance: "1.1 mi",  rating: 4.8, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: ["Top Derm 2023"],               asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Philly Minds Clinic",         state: "PA", zip: "19107", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.5, years: 9,  gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nadia Petrov",            state: "PA", zip: "19103", specialty: "Psychiatry",        distance: "1.3 mi",  rating: 4.6, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Russian"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Charles Whitman",         state: "PA", zip: "19103", specialty: "Psychiatry",        distance: "0.8 mi",  rating: 4.7, years: 21, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Aisha Reid",              state: "PA", zip: "19139", specialty: "OB-GYN",            distance: "1.9 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Carmen Vega",             state: "PA", zip: "19147", specialty: "OB-GYN",            distance: "1.4 mi",  rating: 4.6, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lynn McAllister",         state: "PA", zip: "19103", specialty: "OB-GYN",            distance: "0.7 mi",  rating: 4.9, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "West Philly Health Hub",      state: "PA", zip: "19104", specialty: "General practice",  distance: "0.5 mi",  rating: 4.2, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Derek Simmons",           state: "PA", zip: "19103", specialty: "General practice",  distance: "1.0 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Wolff",          state: "PA", zip: "19118", specialty: "General practice",  distance: "1.8 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","German"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Maryland ──
  { name: "Baltimore Community Care",    state: "MD", zip: "21201", specialty: "Family medicine",   distance: "0.7 mi",  rating: 4.4, years: 16, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Amharic"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Keisha Thompson",         state: "MD", zip: "21218", specialty: "Family medicine",   distance: "1.3 mi",  rating: 4.6, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Brian Whitmore",          state: "MD", zip: "20814", specialty: "Family medicine",   distance: "1.5 mi",  rating: 4.7, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Baltimore Health Hub",        state: "MD", zip: "21201", specialty: "Internal medicine", distance: "1.0 mi",  rating: 4.5, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Priya Sharma",            state: "MD", zip: "20850", specialty: "Internal medicine", distance: "1.2 mi",  rating: 4.7, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hindi"],                      insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. James Calloway",          state: "MD", zip: "20814", specialty: "Internal medicine", distance: "1.7 mi",  rating: 4.5, years: 22, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Imani Brooks",            state: "MD", zip: "21215", specialty: "Pediatrics",        distance: "1.4 mi",  rating: 4.6, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Charm City Kids Clinic",      state: "MD", zip: "21202", specialty: "Pediatrics",        distance: "0.8 mi",  rating: 4.4, years: 12, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Amharic"],           insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Daniel Chou",             state: "MD", zip: "20850", specialty: "Pediatrics",        distance: "2.0 mi",  rating: 4.8, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Mandarin"],                   insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Fatou Diallo",            state: "MD", zip: "20740", specialty: "Dermatology",       distance: "1.9 mi",  rating: 4.5, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French","Wolof"],              insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Kevin Ross",              state: "MD", zip: "21201", specialty: "Dermatology",       distance: "1.1 mi",  rating: 4.6, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Bloom",            state: "MD", zip: "20814", specialty: "Dermatology",       distance: "0.9 mi",  rating: 4.8, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2023"],               asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Baltimore Minds Clinic",      state: "MD", zip: "21201", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.5, years: 10, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Yemi Adeyemi",            state: "MD", zip: "20601", specialty: "Psychiatry",        distance: "2.0 mi",  rating: 4.6, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yoruba"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Thomas Grant",            state: "MD", zip: "20814", specialty: "Psychiatry",        distance: "1.4 mi",  rating: 4.7, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Amara Diop",              state: "MD", zip: "20740", specialty: "OB-GYN",            distance: "1.8 mi",  rating: 4.7, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                     insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Latoya Simms",            state: "MD", zip: "21201", specialty: "OB-GYN",            distance: "1.0 mi",  rating: 4.6, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rebecca Klein",           state: "MD", zip: "20814", specialty: "OB-GYN",            distance: "1.3 mi",  rating: 4.9, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Excellence in Women's Health"], asl: false, phone: true,  languages: ["English"],                             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "East Baltimore Health",       state: "MD", zip: "21205", specialty: "General practice",  distance: "0.9 mi",  rating: 4.2, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Noel Patterson",          state: "MD", zip: "21201", specialty: "General practice",  distance: "1.5 mi",  rating: 4.4, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Grace Hwang",             state: "MD", zip: "20850", specialty: "General practice",  distance: "1.1 mi",  rating: 4.7, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Massachusetts ──
  { name: "Boston Community Clinic",     state: "MA", zip: "02110", specialty: "Family medicine",   distance: "0.4 mi",  rating: 4.3, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: ["HRSA Gold Award"],             asl: true,  phone: true,  languages: ["English","Spanish","Haitian Creole"],   insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone","Spanish"] },
  { name: "Dr. Sarah Whitfield",         state: "MA", zip: "02101", specialty: "Family medicine",   distance: "1.0 mi",  rating: 4.7, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],                 insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Accessible","Phone"] },
  { name: "Dr. Nathan Hughes",           state: "MA", zip: "02115", specialty: "Family medicine",   distance: "0.8 mi",  rating: 4.6, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Roxbury Health Center",       state: "MA", zip: "02119", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.3, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Cape Verdean Creole"], insurance: "low", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Yuki Tanaka",             state: "MA", zip: "02115", specialty: "Internal medicine", distance: "1.1 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],                   insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Andrew Collins",          state: "MA", zip: "02116", specialty: "Internal medicine", distance: "0.7 mi",  rating: 4.8, years: 21, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lucia Ferreira",          state: "MA", zip: "02119", specialty: "Pediatrics",        distance: "1.5 mi",  rating: 4.6, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],                 insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "MA Child Wellness Clinic",    state: "MA", zip: "02111", specialty: "Pediatrics",        distance: "0.6 mi",  rating: 4.4, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],            insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thomas Barry",            state: "MA", zip: "02116", specialty: "Pediatrics",        distance: "0.9 mi",  rating: 4.8, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Aminata Diallo",          state: "MA", zip: "02120", specialty: "Dermatology",       distance: "1.7 mi",  rating: 4.5, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Peter Sato",              state: "MA", zip: "02115", specialty: "Dermatology",       distance: "1.2 mi",  rating: 4.6, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Carolyn Pierce",          state: "MA", zip: "02116", specialty: "Dermatology",       distance: "0.8 mi",  rating: 4.8, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2024"],               asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "South End Mental Health",     state: "MA", zip: "02118", specialty: "Psychiatry",        distance: "0.5 mi",  rating: 4.4, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Mei Chen",                state: "MA", zip: "02115", specialty: "Psychiatry",        distance: "1.0 mi",  rating: 4.7, years: 15, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Robert Adler",            state: "MA", zip: "02116", specialty: "Psychiatry",        distance: "0.7 mi",  rating: 4.8, years: 22, gender: "Male",   nonprofit: false, verified: true,  awards: ["Mental Health Champion"],      asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Marcia Barbosa",          state: "MA", zip: "02119", specialty: "OB-GYN",            distance: "1.6 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],                 insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Simone Laurent",          state: "MA", zip: "02115", specialty: "OB-GYN",            distance: "1.1 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Walsh",          state: "MA", zip: "02116", specialty: "OB-GYN",            distance: "0.6 mi",  rating: 4.9, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2022"],                asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dorchester Health Center",    state: "MA", zip: "02122", specialty: "General practice",  distance: "1.3 mi",  rating: 4.3, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Leon Fraser",             state: "MA", zip: "02115", specialty: "General practice",  distance: "0.9 mi",  rating: 4.5, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Vivian Obi",              state: "MA", zip: "02116", specialty: "General practice",  distance: "0.7 mi",  rating: 4.7, years: 15, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],                       insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Connecticut ──
  { name: "Hartford Health Center",      state: "CT", zip: "06103", specialty: "Family medicine",   distance: "0.8 mi",  rating: 4.3, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ingrid Vasquez",          state: "CT", zip: "06105", specialty: "Family medicine",   distance: "1.2 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Paul Hewitt",             state: "CT", zip: "06511", specialty: "Family medicine",   distance: "1.5 mi",  rating: 4.5, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Bridgeport Free Clinic",      state: "CT", zip: "06604", specialty: "Internal medicine", distance: "0.6 mi",  rating: 4.2, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Linh Nguyen",             state: "CT", zip: "06101", specialty: "Internal medicine", distance: "1.4 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Vietnamese"],                 insurance: "medium", accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Scott Ramsey",            state: "CT", zip: "06511", specialty: "Internal medicine", distance: "1.0 mi",  rating: 4.6, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rosa Iglesias",           state: "CT", zip: "06604", specialty: "Pediatrics",        distance: "1.3 mi",  rating: 4.5, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "CT Kids Care Center",         state: "CT", zip: "06103", specialty: "Pediatrics",        distance: "0.7 mi",  rating: 4.4, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Polish"],            insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Michael Chong",           state: "CT", zip: "06511", specialty: "Pediatrics",        distance: "1.8 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Cantonese"],                  insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Bola Akintola",           state: "CT", zip: "06604", specialty: "Dermatology",       distance: "2.0 mi",  rating: 4.4, years: 9,  gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yoruba"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Helen Moore",             state: "CT", zip: "06103", specialty: "Dermatology",       distance: "1.1 mi",  rating: 4.6, years: 15, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Jonathan Wade",           state: "CT", zip: "06511", specialty: "Dermatology",       distance: "0.9 mi",  rating: 4.8, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: ["Top Derm 2023"],               asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "New Haven Wellness Ctr",      state: "CT", zip: "06510", specialty: "Psychiatry",        distance: "0.5 mi",  rating: 4.4, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ayasha Begay",            state: "CT", zip: "06103", specialty: "Psychiatry",        distance: "1.5 mi",  rating: 4.6, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Peter Marcus",            state: "CT", zip: "06511", specialty: "Psychiatry",        distance: "1.0 mi",  rating: 4.7, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Carmen Delacruz",         state: "CT", zip: "06604", specialty: "OB-GYN",            distance: "1.7 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Fiona OBrien",            state: "CT", zip: "06103", specialty: "OB-GYN",            distance: "1.2 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Alison Parks",            state: "CT", zip: "06511", specialty: "OB-GYN",            distance: "0.8 mi",  rating: 4.9, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2024"],                asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hartford Community Clinic",   state: "CT", zip: "06106", specialty: "General practice",  distance: "0.6 mi",  rating: 4.2, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Mark Ellis",              state: "CT", zip: "06103", specialty: "General practice",  distance: "1.3 mi",  rating: 4.5, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Angela Kwan",             state: "CT", zip: "06511", specialty: "General practice",  distance: "1.0 mi",  rating: 4.7, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Cantonese"],                  insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── New Jersey ──
  { name: "Newark Community Health",     state: "NJ", zip: "07102", specialty: "Family medicine",   distance: "0.5 mi",  rating: 4.2, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone","Spanish"] },
  { name: "Dr. Amina Hassan",            state: "NJ", zip: "07030", specialty: "Family medicine",   distance: "1.0 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Arabic","Somali"],             insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Marcus Webb",             state: "NJ", zip: "07101", specialty: "Family medicine",   distance: "1.1 mi",  rating: 4.5, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Trenton Free Clinic",         state: "NJ", zip: "08608", specialty: "Internal medicine", distance: "0.7 mi",  rating: 4.2, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jennifer Ho",             state: "NJ", zip: "07030", specialty: "Internal medicine", distance: "1.3 mi",  rating: 4.7, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Gregory Bell",            state: "NJ", zip: "07101", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.6, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Luz Morales",             state: "NJ", zip: "07105", specialty: "Pediatrics",        distance: "1.4 mi",  rating: 4.5, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "NJ Child Health Center",      state: "NJ", zip: "07102", specialty: "Pediatrics",        distance: "0.6 mi",  rating: 4.4, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Gujarati"],          insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Patrick Doyle",           state: "NJ", zip: "07030", specialty: "Pediatrics",        distance: "1.8 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Oluwaseun Adebayo",       state: "NJ", zip: "07105", specialty: "Dermatology",       distance: "2.1 mi",  rating: 4.4, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yoruba"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Alan Kim",                state: "NJ", zip: "07030", specialty: "Dermatology",       distance: "1.2 mi",  rating: 4.6, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Martha Levine",           state: "NJ", zip: "07101", specialty: "Dermatology",       distance: "0.8 mi",  rating: 4.8, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2022"],               asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Jersey City Mental Health",   state: "NJ", zip: "07302", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.5, years: 10, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nadia Singh",             state: "NJ", zip: "07030", specialty: "Psychiatry",        distance: "1.4 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hindi"],                      insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. David Crane",             state: "NJ", zip: "07101", specialty: "Psychiatry",        distance: "1.0 mi",  rating: 4.7, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Beatriz Santos",          state: "NJ", zip: "07105", specialty: "OB-GYN",            distance: "1.9 mi",  rating: 4.7, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],                 insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Priya Patel",             state: "NJ", zip: "07030", specialty: "OB-GYN",            distance: "1.1 mi",  rating: 4.6, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Gujarati","Hindi"],            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Susan McCarthy",          state: "NJ", zip: "07101", specialty: "OB-GYN",            distance: "0.8 mi",  rating: 4.9, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "North Ward Health Hub",       state: "NJ", zip: "07103", specialty: "General practice",  distance: "0.7 mi",  rating: 4.2, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Vincent Chow",            state: "NJ", zip: "07030", specialty: "General practice",  distance: "1.5 mi",  rating: 4.4, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Cantonese"],                  insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Christine Booth",         state: "NJ", zip: "07101", specialty: "General practice",  distance: "1.0 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ══ BATCH 1B — NH, VT, RI, ME, DC, DE ══

  // ── New Hampshire ──
  { name: "NH Community Health Ctr",     state: "NH", zip: "03101", specialty: "Family medicine",   distance: "1.2 mi",  rating: 4.3, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],            insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Emily Frost",             state: "NH", zip: "03101", specialty: "Family medicine",   distance: "2.0 mi",  rating: 4.6, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Alan Prescott",           state: "NH", zip: "03301", specialty: "Family medicine",   distance: "2.5 mi",  rating: 4.5, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Concord Free Clinic",         state: "NH", zip: "03301", specialty: "Internal medicine", distance: "1.8 mi",  rating: 4.2, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],            insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Mei-Ling Tran",           state: "NH", zip: "03820", specialty: "Internal medicine", distance: "1.4 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],         insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Gregory Walsh",           state: "NH", zip: "03301", specialty: "Internal medicine", distance: "1.1 mi",  rating: 4.7, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Fatima Osei",             state: "NH", zip: "03820", specialty: "Pediatrics",        distance: "1.9 mi",  rating: 4.5, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi"],               insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "NH Childrens Health Hub",     state: "NH", zip: "03101", specialty: "Pediatrics",        distance: "0.9 mi",  rating: 4.4, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],            insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Brian Sinclair",          state: "NH", zip: "03301", specialty: "Pediatrics",        distance: "2.2 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nora Bouchard",           state: "NH", zip: "03820", specialty: "Dermatology",       distance: "2.8 mi",  rating: 4.4, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],            insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. James Colby",             state: "NH", zip: "03101", specialty: "Dermatology",       distance: "1.6 mi",  rating: 4.6, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Hewitt",           state: "NH", zip: "03301", specialty: "Dermatology",       distance: "1.3 mi",  rating: 4.8, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2024"],               asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Granite State Mental Health", state: "NH", zip: "03101", specialty: "Psychiatry",        distance: "0.7 mi",  rating: 4.4, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],            insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Alicia Drummond",         state: "NH", zip: "03820", specialty: "Psychiatry",        distance: "2.0 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Paul Hennessy",           state: "NH", zip: "03301", specialty: "Psychiatry",        distance: "1.5 mi",  rating: 4.7, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Camille Bertrand",        state: "NH", zip: "03820", specialty: "OB-GYN",            distance: "2.4 mi",  rating: 4.6, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],            insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Linda Marsh",             state: "NH", zip: "03101", specialty: "OB-GYN",            distance: "1.7 mi",  rating: 4.7, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Vivienne Cole",           state: "NH", zip: "03301", specialty: "OB-GYN",            distance: "1.2 mi",  rating: 4.9, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Manchester Health Hub",       state: "NH", zip: "03101", specialty: "General practice",  distance: "0.8 mi",  rating: 4.2, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"], insurance: "low",  accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thomas Carey",            state: "NH", zip: "03820", specialty: "General practice",  distance: "1.9 mi",  rating: 4.4, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rachel Stone",            state: "NH", zip: "03301", specialty: "General practice",  distance: "1.4 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Vermont ──
  { name: "Burlington Community Care",   state: "VT", zip: "05401", specialty: "Family medicine",   distance: "1.0 mi",  rating: 4.3, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","French","Somali"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Claire Fontaine",         state: "VT", zip: "05401", specialty: "Family medicine",   distance: "1.5 mi",  rating: 4.6, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],            insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Thomas Briggs",           state: "VT", zip: "05602", specialty: "Family medicine",   distance: "3.0 mi",  rating: 4.4, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["ramp"],                             tags: ["Rural","Phone"] },
  { name: "Green Mountain Health Ctr",   state: "VT", zip: "05401", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.2, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],            insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Yuki Moreau",             state: "VT", zip: "05401", specialty: "Internal medicine", distance: "1.3 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],          insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Andrew Harper",           state: "VT", zip: "05602", specialty: "Internal medicine", distance: "2.8 mi",  rating: 4.5, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Amara Diallo",            state: "VT", zip: "05401", specialty: "Pediatrics",        distance: "1.7 mi",  rating: 4.5, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],            insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "VT Children Wellness Ctr",    state: "VT", zip: "05401", specialty: "Pediatrics",        distance: "0.8 mi",  rating: 4.4, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali"],             insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Peter Langley",           state: "VT", zip: "05602", specialty: "Pediatrics",        distance: "3.2 mi",  rating: 4.7, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Rural","Phone"] },
  { name: "Dr. Isabelle Morin",          state: "VT", zip: "05401", specialty: "Dermatology",       distance: "2.1 mi",  rating: 4.4, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],            insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Calvin Reed",             state: "VT", zip: "05602", specialty: "Dermatology",       distance: "3.5 mi",  rating: 4.5, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Rural","Phone"] },
  { name: "Dr. Sarah Whitmore",          state: "VT", zip: "05401", specialty: "Dermatology",       distance: "1.4 mi",  rating: 4.8, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2022"],               asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "VT Mind & Wellness Center",   state: "VT", zip: "05401", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.4, years: 10, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","French"],             insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Genevieve Tremblay",      state: "VT", zip: "05602", specialty: "Psychiatry",        distance: "2.9 mi",  rating: 4.6, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Rural","Phone"] },
  { name: "Dr. Martin Rhodes",           state: "VT", zip: "05401", specialty: "Psychiatry",        distance: "1.8 mi",  rating: 4.7, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nia Okonkwo",             state: "VT", zip: "05401", specialty: "OB-GYN",            distance: "1.9 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],              insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Helen Lafrance",          state: "VT", zip: "05401", specialty: "OB-GYN",            distance: "1.2 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Christine Burke",         state: "VT", zip: "05602", specialty: "OB-GYN",            distance: "3.0 mi",  rating: 4.8, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2024"],                asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Rural","Phone"] },
  { name: "Champlain Valley Health",     state: "VT", zip: "05401", specialty: "General practice",  distance: "0.7 mi",  rating: 4.2, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","French","Somali"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Oliver Grant",            state: "VT", zip: "05602", specialty: "General practice",  distance: "4.0 mi",  rating: 4.4, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["ramp"],                             tags: ["Rural","Phone"] },
  { name: "Dr. Denise Lavoie",           state: "VT", zip: "05401", specialty: "General practice",  distance: "1.5 mi",  rating: 4.6, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Rhode Island ──
  { name: "Providence Community Care",   state: "RI", zip: "02903", specialty: "Family medicine",   distance: "0.6 mi",  rating: 4.3, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"], insurance: "low",   accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Sandra Lopes",            state: "RI", zip: "02901", specialty: "Family medicine",   distance: "1.5 mi",  rating: 4.6, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Michael Costa",           state: "RI", zip: "02860", specialty: "Family medicine",   distance: "1.2 mi",  rating: 4.5, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "RI Community Health Center",  state: "RI", zip: "02905", specialty: "Internal medicine", distance: "0.8 mi",  rating: 4.2, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"], insurance: "low",   accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Olga Ferreira",           state: "RI", zip: "02901", specialty: "Internal medicine", distance: "1.3 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Jason Carroll",           state: "RI", zip: "02860", specialty: "Internal medicine", distance: "1.0 mi",  rating: 4.6, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Kezia Barbosa",           state: "RI", zip: "02905", specialty: "Pediatrics",        distance: "1.4 mi",  rating: 4.5, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "RI Kids Wellness Clinic",     state: "RI", zip: "02903", specialty: "Pediatrics",        distance: "0.7 mi",  rating: 4.4, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"], insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Daniel Souza",            state: "RI", zip: "02860", specialty: "Pediatrics",        distance: "1.8 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Amina Ndiaye",            state: "RI", zip: "02905", specialty: "Dermatology",       distance: "2.0 mi",  rating: 4.4, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French","Wolof"],    insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Anthony Reis",            state: "RI", zip: "02901", specialty: "Dermatology",       distance: "1.1 mi",  rating: 4.6, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Carol Whitfield",         state: "RI", zip: "02860", specialty: "Dermatology",       distance: "0.9 mi",  rating: 4.8, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2023"],               asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Providence Minds Clinic",     state: "RI", zip: "02903", specialty: "Psychiatry",        distance: "0.5 mi",  rating: 4.4, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"], insurance: "low",   accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Luisa Monteiro",          state: "RI", zip: "02901", specialty: "Psychiatry",        distance: "1.6 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Robert Quinn",            state: "RI", zip: "02860", specialty: "Psychiatry",        distance: "1.3 mi",  rating: 4.7, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Livia Pereira",           state: "RI", zip: "02905", specialty: "OB-GYN",            distance: "1.9 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Natalie Bento",           state: "RI", zip: "02901", specialty: "OB-GYN",            distance: "1.2 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Anne-Marie Gagnon",       state: "RI", zip: "02860", specialty: "OB-GYN",            distance: "0.8 mi",  rating: 4.9, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","French"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "South Providence Health Hub", state: "RI", zip: "02905", specialty: "General practice",  distance: "0.7 mi",  rating: 4.2, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Portuguese"], insurance: "low",   accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marco Silva",             state: "RI", zip: "02901", specialty: "General practice",  distance: "1.4 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Dawn Fletcher",           state: "RI", zip: "02860", specialty: "General practice",  distance: "1.1 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Maine ──
  { name: "Portland Health Center",      state: "ME", zip: "04101", specialty: "Family medicine",   distance: "0.9 mi",  rating: 4.3, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali"],             insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Maria Rodrigues",         state: "ME", zip: "04101", specialty: "Family medicine",   distance: "1.5 mi",  rating: 4.5, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Portuguese"],        insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Paul Donovan",            state: "ME", zip: "04401", specialty: "Family medicine",   distance: "4.0 mi",  rating: 4.3, years: 22, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["ramp"],                             tags: ["Rural","Phone"] },
  { name: "Maine Community Clinic",      state: "ME", zip: "04101", specialty: "Internal medicine", distance: "1.2 mi",  rating: 4.2, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","French"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Lisa Chen",               state: "ME", zip: "04101", specialty: "Internal medicine", distance: "1.0 mi",  rating: 4.6, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],          insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Owen Murphy",             state: "ME", zip: "04401", specialty: "Internal medicine", distance: "3.5 mi",  rating: 4.5, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Rural","Phone"] },
  { name: "Dr. Hodan Abdi",              state: "ME", zip: "04101", specialty: "Pediatrics",        distance: "1.8 mi",  rating: 4.6, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],            insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "ME Kids Health Hub",          state: "ME", zip: "04101", specialty: "Pediatrics",        distance: "0.7 mi",  rating: 4.4, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","French"],    insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Caleb Morrison",          state: "ME", zip: "04401", specialty: "Pediatrics",        distance: "4.5 mi",  rating: 4.5, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Rural","Phone"] },
  { name: "Dr. Ayana Blackwell",         state: "ME", zip: "04101", specialty: "Dermatology",       distance: "2.2 mi",  rating: 4.4, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Sean Gallagher",          state: "ME", zip: "04401", specialty: "Dermatology",       distance: "5.0 mi",  rating: 4.5, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Rural","Phone"] },
  { name: "Dr. Claire Beaumont",         state: "ME", zip: "04101", specialty: "Dermatology",       distance: "1.4 mi",  rating: 4.7, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2022"],               asl: false, phone: true,  languages: ["English","French"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Portland Mental Health Ctr",  state: "ME", zip: "04101", specialty: "Psychiatry",        distance: "0.8 mi",  rating: 4.4, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali"],             insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Yolanda Pierce",          state: "ME", zip: "04101", specialty: "Psychiatry",        distance: "1.6 mi",  rating: 4.6, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Frank Sullivan",          state: "ME", zip: "04401", specialty: "Psychiatry",        distance: "3.8 mi",  rating: 4.5, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Rural","Phone"] },
  { name: "Dr. Salma Hassan",            state: "ME", zip: "04101", specialty: "OB-GYN",            distance: "2.0 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],            insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Andrea McGowan",          state: "ME", zip: "04101", specialty: "OB-GYN",            distance: "1.3 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Susan Pelletier",         state: "ME", zip: "04401", specialty: "OB-GYN",            distance: "4.2 mi",  rating: 4.8, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2022"],                asl: false, phone: true,  languages: ["English","French"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Rural","Phone"] },
  { name: "Bayside Health Hub",          state: "ME", zip: "04101", specialty: "General practice",  distance: "0.6 mi",  rating: 4.2, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali"],             insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Liam OBrien",             state: "ME", zip: "04401", specialty: "General practice",  distance: "5.5 mi",  rating: 4.3, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["ramp"],                             tags: ["Rural","Phone"] },
  { name: "Dr. Isabelle Cote",           state: "ME", zip: "04101", specialty: "General practice",  distance: "1.1 mi",  rating: 4.6, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Washington DC ──
  { name: "Capital Health Clinic",       state: "DC", zip: "20001", specialty: "Family medicine",   distance: "0.6 mi",  rating: 4.6, years: 12, gender: "Mixed",  nonprofit: true,  verified: true,  awards: ["HRSA Award 2024"],             asl: true,  phone: true,  languages: ["English","Spanish","Amharic"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone","Spanish"] },
  { name: "Dr. Nadia Osei",              state: "DC", zip: "20009", specialty: "Family medicine",   distance: "1.0 mi",  rating: 4.7, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi","French"],      insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Marcus Boyd",             state: "DC", zip: "20005", specialty: "Family medicine",   distance: "0.8 mi",  rating: 4.6, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "DC Free Clinic",              state: "DC", zip: "20001", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.3, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Amharic"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Priya Menon",             state: "DC", zip: "20009", specialty: "Internal medicine", distance: "1.3 mi",  rating: 4.7, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hindi","Malayalam"],  insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Tyler Washington",        state: "DC", zip: "20005", specialty: "Internal medicine", distance: "0.7 mi",  rating: 4.8, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Zainab Saleh",            state: "DC", zip: "20011", specialty: "Pediatrics",        distance: "1.5 mi",  rating: 4.6, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Arabic"],            insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "DC Child Wellness Center",    state: "DC", zip: "20001", specialty: "Pediatrics",        distance: "0.5 mi",  rating: 4.4, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Amharic"],  insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jonathan Lee",            state: "DC", zip: "20009", specialty: "Pediatrics",        distance: "1.2 mi",  rating: 4.8, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Korean"],            insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Adaeze Obi",              state: "DC", zip: "20011", specialty: "Dermatology",       distance: "1.9 mi",  rating: 4.5, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],              insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Rafael Moreno",           state: "DC", zip: "20009", specialty: "Dermatology",       distance: "1.0 mi",  rating: 4.6, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lauren Holt",             state: "DC", zip: "20005", specialty: "Dermatology",       distance: "0.7 mi",  rating: 4.9, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2024"],               asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "DC Minds Wellness Clinic",    state: "DC", zip: "20001", specialty: "Psychiatry",        distance: "0.4 mi",  rating: 4.5, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Amharic"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Fatima Diallo",           state: "DC", zip: "20009", specialty: "Psychiatry",        distance: "1.4 mi",  rating: 4.7, years: 15, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French","Wolof"],    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Brian Cox",               state: "DC", zip: "20005", specialty: "Psychiatry",        distance: "0.9 mi",  rating: 4.8, years: 21, gender: "Male",   nonprofit: false, verified: true,  awards: ["Mental Health Champion"],      asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Amina Jallow",            state: "DC", zip: "20011", specialty: "OB-GYN",            distance: "1.8 mi",  rating: 4.8, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandinka","French"],  insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Christine Park",          state: "DC", zip: "20009", specialty: "OB-GYN",            distance: "1.1 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Valerie Dupont",          state: "DC", zip: "20005", specialty: "OB-GYN",            distance: "0.6 mi",  rating: 4.9, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Excellence in Women's Health"], asl: false, phone: true, languages: ["English","French"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "SE DC Community Hub",         state: "DC", zip: "20020", specialty: "General practice",  distance: "1.2 mi",  rating: 4.2, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Samuel Price",            state: "DC", zip: "20009", specialty: "General practice",  distance: "0.8 mi",  rating: 4.5, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Alexis Rowe",             state: "DC", zip: "20005", specialty: "General practice",  distance: "0.6 mi",  rating: 4.7, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Delaware ──
  { name: "Wilmington Community Care",   state: "DE", zip: "19801", specialty: "Family medicine",   distance: "0.8 mi",  rating: 4.3, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kezia Okafor",            state: "DE", zip: "19801", specialty: "Family medicine",   distance: "1.3 mi",  rating: 4.6, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],              insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. James Calloway",          state: "DE", zip: "19802", specialty: "Family medicine",   distance: "1.0 mi",  rating: 4.5, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "DE Free Health Center",       state: "DE", zip: "19801", specialty: "Internal medicine", distance: "0.6 mi",  rating: 4.2, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Creole"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Alison Patel",            state: "DE", zip: "19801", specialty: "Internal medicine", distance: "1.4 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Gujarati"],          insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Richard Hayes",           state: "DE", zip: "19802", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.6, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Monique Williams",        state: "DE", zip: "19801", specialty: "Pediatrics",        distance: "1.5 mi",  rating: 4.5, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "DE Kids Health Center",       state: "DE", zip: "19801", specialty: "Pediatrics",        distance: "0.7 mi",  rating: 4.4, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Patrick Nolan",           state: "DE", zip: "19802", specialty: "Pediatrics",        distance: "1.8 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Tanisha Grant",           state: "DE", zip: "19801", specialty: "Dermatology",       distance: "2.0 mi",  rating: 4.4, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Victor Chung",            state: "DE", zip: "19801", specialty: "Dermatology",       distance: "1.1 mi",  rating: 4.6, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Cantonese"],         insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Linda Sawyer",            state: "DE", zip: "19802", specialty: "Dermatology",       distance: "0.9 mi",  rating: 4.8, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2023"],               asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wilmington Minds Clinic",     state: "DE", zip: "19801", specialty: "Psychiatry",        distance: "0.5 mi",  rating: 4.4, years: 10, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Rashida Odom",            state: "DE", zip: "19801", specialty: "Psychiatry",        distance: "1.6 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Stephen Ward",            state: "DE", zip: "19802", specialty: "Psychiatry",        distance: "1.2 mi",  rating: 4.7, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Chinyere Agu",            state: "DE", zip: "19801", specialty: "OB-GYN",            distance: "1.9 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],              insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Patricia Coleman",        state: "DE", zip: "19801", specialty: "OB-GYN",            distance: "1.2 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karen Flynn",             state: "DE", zip: "19802", specialty: "OB-GYN",            distance: "0.8 mi",  rating: 4.9, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2024"],                asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "East Side Health Hub",        state: "DE", zip: "19801", specialty: "General practice",  distance: "0.7 mi",  rating: 4.2, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Creole"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Carlos Rivera",           state: "DE", zip: "19801", specialty: "General practice",  distance: "1.5 mi",  rating: 4.4, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Beverly King",            state: "DE", zip: "19802", specialty: "General practice",  distance: "1.1 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ══ BATCH 2A — FL, GA, NC ══

  // ── Florida ──
  { name: "Sunshine Community Clinic",   state: "FL", zip: "33101", specialty: "Family medicine",   distance: "1.0 mi",  rating: 4.4, years: 12, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Creole"],   insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone","Spanish"] },
  { name: "Dr. Lucia Fernandez",         state: "FL", zip: "33125", specialty: "Family medicine",   distance: "1.3 mi",  rating: 4.6, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],            insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Robert Marsh",            state: "FL", zip: "33602", specialty: "Family medicine",   distance: "1.0 mi",  rating: 4.5, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Miami Free Health Center",    state: "FL", zip: "33136", specialty: "Internal medicine", distance: "0.8 mi",  rating: 4.3, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Creole"],   insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Maria Gonzalez",          state: "FL", zip: "33125", specialty: "Internal medicine", distance: "1.5 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. David Bloom",             state: "FL", zip: "33602", specialty: "Internal medicine", distance: "1.1 mi",  rating: 4.6, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Yolanda Price",           state: "FL", zip: "33136", specialty: "Pediatrics",        distance: "1.4 mi",  rating: 4.5, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],            insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "FL Kids Health Hub",          state: "FL", zip: "33101", specialty: "Pediatrics",        distance: "0.7 mi",  rating: 4.4, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: ["Top Pediatrician 2024"],        asl: true,  phone: true,  languages: ["English","Spanish","Creole"],   insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jason Nguyen",            state: "FL", zip: "33602", specialty: "Pediatrics",        distance: "1.8 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Vietnamese"],         insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Imani Clarke",            state: "FL", zip: "32801", specialty: "Dermatology",       distance: "2.0 mi",  rating: 4.4, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Carlos Ruiz",             state: "FL", zip: "33125", specialty: "Dermatology",       distance: "1.2 mi",  rating: 4.6, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Kim",              state: "FL", zip: "33602", specialty: "Dermatology",       distance: "0.9 mi",  rating: 4.8, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2023"],               asl: false, phone: true,  languages: ["English","Korean"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "FL Behavioral Health Ctr",    state: "FL", zip: "33136", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.4, years: 10, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Creole"],   insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Renee Morales",           state: "FL", zip: "33125", specialty: "Psychiatry",        distance: "1.5 mi",  rating: 4.6, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Aaron Bradley",           state: "FL", zip: "33602", specialty: "Psychiatry",        distance: "1.0 mi",  rating: 4.7, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: ["Mental Health Champion"],      asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Keisha Rolle",            state: "FL", zip: "33136", specialty: "OB-GYN",            distance: "1.9 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Creole"],             insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Ana Vargas",              state: "FL", zip: "33125", specialty: "OB-GYN",            distance: "1.1 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lisa Hoffman",            state: "FL", zip: "33602", specialty: "OB-GYN",            distance: "0.8 mi",  rating: 4.9, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2022"],                asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Little Havana Health Hub",    state: "FL", zip: "33135", specialty: "General practice",  distance: "0.5 mi",  rating: 4.2, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Creole"],   insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Miguel Santos",           state: "FL", zip: "33125", specialty: "General practice",  distance: "1.4 mi",  rating: 4.4, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Christine Hall",          state: "FL", zip: "33602", specialty: "General practice",  distance: "1.1 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Georgia ──
  { name: "Atlanta Community Care",      state: "GA", zip: "30303", specialty: "Family medicine",   distance: "0.7 mi",  rating: 4.4, years: 16, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Amharic"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Aisha Williams",          state: "GA", zip: "30301", specialty: "Family medicine",   distance: "1.4 mi",  rating: 4.6, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Marcus Grant",            state: "GA", zip: "30308", specialty: "Family medicine",   distance: "1.1 mi",  rating: 4.5, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Atlanta Health Center",       state: "GA", zip: "30303", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.3, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: ["Community Award 2023"],        asl: true,  phone: true,  languages: ["English","Spanish","Mandarin"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Priya Nair",              state: "GA", zip: "30309", specialty: "Internal medicine", distance: "1.2 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hindi"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Robert Osei",             state: "GA", zip: "30308", specialty: "Internal medicine", distance: "1.0 mi",  rating: 4.6, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Tamika Jordan",           state: "GA", zip: "30310", specialty: "Pediatrics",        distance: "1.6 mi",  rating: 4.5, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "GA Kids Wellness Center",     state: "GA", zip: "30303", specialty: "Pediatrics",        distance: "0.8 mi",  rating: 4.4, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Amharic"],  insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kevin Park",              state: "GA", zip: "30308", specialty: "Pediatrics",        distance: "1.9 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Korean"],             insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Zora Mitchell",           state: "GA", zip: "30310", specialty: "Dermatology",       distance: "2.1 mi",  rating: 4.4, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. James Okonkwo",           state: "GA", zip: "30309", specialty: "Dermatology",       distance: "1.3 mi",  rating: 4.6, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yoruba"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Helen Wu",                state: "GA", zip: "30308", specialty: "Dermatology",       distance: "0.9 mi",  rating: 4.8, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2024"],               asl: false, phone: true,  languages: ["English","Mandarin"],           insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "GA Minds Wellness Clinic",    state: "GA", zip: "30303", specialty: "Psychiatry",        distance: "0.5 mi",  rating: 4.4, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nadia Osei",              state: "GA", zip: "30309", specialty: "Psychiatry",        distance: "1.4 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Tyler Brooks",            state: "GA", zip: "30308", specialty: "Psychiatry",        distance: "1.0 mi",  rating: 4.7, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ebony Carter",            state: "GA", zip: "30310", specialty: "OB-GYN",            distance: "1.8 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Nkechi Eze",              state: "GA", zip: "30309", specialty: "OB-GYN",            distance: "1.1 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Rhodes",           state: "GA", zip: "30308", specialty: "OB-GYN",            distance: "0.7 mi",  rating: 4.9, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Excellence in Women's Health"], asl: false, phone: true, languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Vine City Health Hub",        state: "GA", zip: "30314", specialty: "General practice",  distance: "0.9 mi",  rating: 4.2, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Darnell Jackson",         state: "GA", zip: "30309", specialty: "General practice",  distance: "1.5 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Grace Hwang",             state: "GA", zip: "30308", specialty: "General practice",  distance: "1.0 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── North Carolina ──
  { name: "Raleigh Community Care",      state: "NC", zip: "27601", specialty: "Family medicine",   distance: "0.9 mi",  rating: 4.3, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Keisha Monroe",           state: "NC", zip: "27601", specialty: "Family medicine",   distance: "1.4 mi",  rating: 4.6, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Darnell Jackson",         state: "NC", zip: "27608", specialty: "Family medicine",   distance: "1.6 mi",  rating: 4.5, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "NC Free Health Center",       state: "NC", zip: "27601", specialty: "Internal medicine", distance: "0.7 mi",  rating: 4.2, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Li Wei",                  state: "NC", zip: "27701", specialty: "Internal medicine", distance: "1.3 mi",  rating: 4.7, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],          insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Samuel Owens",            state: "NC", zip: "27608", specialty: "Internal medicine", distance: "1.0 mi",  rating: 4.6, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Tamara Reid",             state: "NC", zip: "28201", specialty: "Pediatrics",        distance: "1.5 mi",  rating: 4.5, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Triangle Kids Clinic",        state: "NC", zip: "27601", specialty: "Pediatrics",        distance: "0.8 mi",  rating: 4.4, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"], insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Chris Patel",             state: "NC", zip: "27701", specialty: "Pediatrics",        distance: "1.8 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Gujarati"],          insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Yolanda Pierce",          state: "NC", zip: "28201", specialty: "Dermatology",       distance: "2.0 mi",  rating: 4.4, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. James Okafor",            state: "NC", zip: "27601", specialty: "Dermatology",       distance: "1.2 mi",  rating: 4.6, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Susan Fong",              state: "NC", zip: "27701", specialty: "Dermatology",       distance: "0.9 mi",  rating: 4.8, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2022"],               asl: false, phone: true,  languages: ["English","Cantonese"],         insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "NC Mental Health Center",     state: "NC", zip: "27601", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.4, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Alicia Grant",            state: "NC", zip: "27701", specialty: "Psychiatry",        distance: "1.5 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patrick Wells",           state: "NC", zip: "27608", specialty: "Psychiatry",        distance: "1.1 mi",  rating: 4.7, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Renee Townsend",          state: "NC", zip: "28201", specialty: "OB-GYN",            distance: "1.9 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Isabel Flores",           state: "NC", zip: "27601", specialty: "OB-GYN",            distance: "1.2 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Margaret Yoon",           state: "NC", zip: "27701", specialty: "OB-GYN",            distance: "0.8 mi",  rating: 4.9, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Korean"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "SE Raleigh Health Hub",       state: "NC", zip: "27610", specialty: "General practice",  distance: "1.1 mi",  rating: 4.2, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thomas Wright",           state: "NC", zip: "27701", specialty: "General practice",  distance: "1.5 mi",  rating: 4.4, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Angela Kim",              state: "NC", zip: "27608", specialty: "General practice",  distance: "1.0 mi",  rating: 4.6, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ══ BATCH 2B — SC, AL, MS ══

  // ── South Carolina ──
  { name: "Columbia Community Care",     state: "SC", zip: "29201", specialty: "Family medicine",   distance: "0.8 mi",  rating: 4.3, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Tanya Rivers",            state: "SC", zip: "29201", specialty: "Family medicine",   distance: "1.5 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. James Calhoun",           state: "SC", zip: "29403", specialty: "Family medicine",   distance: "1.2 mi",  rating: 4.5, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "SC Free Health Center",       state: "SC", zip: "29201", specialty: "Internal medicine", distance: "0.7 mi",  rating: 4.2, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Priya Nair",              state: "SC", zip: "29403", specialty: "Internal medicine", distance: "1.4 mi",  rating: 4.7, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hindi"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. William Ford",            state: "SC", zip: "29201", specialty: "Internal medicine", distance: "1.1 mi",  rating: 4.6, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Lakeisha Brown",          state: "SC", zip: "29204", specialty: "Pediatrics",        distance: "1.6 mi",  rating: 4.5, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "SC Kids Wellness Clinic",     state: "SC", zip: "29201", specialty: "Pediatrics",        distance: "0.9 mi",  rating: 4.4, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Michael Chen",            state: "SC", zip: "29403", specialty: "Pediatrics",        distance: "1.8 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Mandarin"],          insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Amara Scott",             state: "SC", zip: "29204", specialty: "Dermatology",       distance: "2.1 mi",  rating: 4.4, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Robert King",             state: "SC", zip: "29201", specialty: "Dermatology",       distance: "1.3 mi",  rating: 4.6, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Claire Beaumont",         state: "SC", zip: "29403", specialty: "Dermatology",       distance: "0.9 mi",  rating: 4.8, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2023"],               asl: false, phone: true,  languages: ["English","French"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "SC Mental Health Hub",        state: "SC", zip: "29201", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.4, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Fatima Hassan",           state: "SC", zip: "29403", specialty: "Psychiatry",        distance: "1.5 mi",  rating: 4.6, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Arabic"],            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Thomas Grant",            state: "SC", zip: "29201", specialty: "Psychiatry",        distance: "1.1 mi",  rating: 4.7, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Monique Davis",           state: "SC", zip: "29204", specialty: "OB-GYN",            distance: "1.9 mi",  rating: 4.7, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Lucia Reyes",             state: "SC", zip: "29201", specialty: "OB-GYN",            distance: "1.2 mi",  rating: 4.6, years: 12, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karen Walsh",             state: "SC", zip: "29403", specialty: "OB-GYN",            distance: "0.8 mi",  rating: 4.9, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2022"],                asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Five Points Health Hub",      state: "SC", zip: "29205", specialty: "General practice",  distance: "0.7 mi",  rating: 4.2, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Leon Harris",             state: "SC", zip: "29201", specialty: "General practice",  distance: "1.5 mi",  rating: 4.4, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Vivian Park",             state: "SC", zip: "29403", specialty: "General practice",  distance: "1.1 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Alabama ──
  { name: "Birmingham Free Clinic",      state: "AL", zip: "35203", specialty: "Family medicine",   distance: "0.8 mi",  rating: 4.3, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Crystal Haynes",          state: "AL", zip: "35201", specialty: "Family medicine",   distance: "1.4 mi",  rating: 4.5, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Marcus Stone",            state: "AL", zip: "35209", specialty: "Family medicine",   distance: "1.2 mi",  rating: 4.5, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "AL Community Health Center",  state: "AL", zip: "35203", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.2, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ingrid Vasquez",          state: "AL", zip: "35201", specialty: "Internal medicine", distance: "1.3 mi",  rating: 4.6, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Carl Simmons",            state: "AL", zip: "35209", specialty: "Internal medicine", distance: "1.0 mi",  rating: 4.7, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Ebony Thomas",            state: "AL", zip: "35211", specialty: "Pediatrics",        distance: "1.7 mi",  rating: 4.5, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "AL Kids Health Hub",          state: "AL", zip: "35203", specialty: "Pediatrics",        distance: "0.8 mi",  rating: 4.4, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Patrick Nguyen",          state: "AL", zip: "35201", specialty: "Pediatrics",        distance: "1.9 mi",  rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English","Vietnamese"],        insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Zora Collins",            state: "AL", zip: "35211", specialty: "Dermatology",       distance: "2.2 mi",  rating: 4.3, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. James Whitfield",         state: "AL", zip: "35201", specialty: "Dermatology",       distance: "1.4 mi",  rating: 4.5, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Helen Park",              state: "AL", zip: "35209", specialty: "Dermatology",       distance: "1.0 mi",  rating: 4.8, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2022"],               asl: false, phone: true,  languages: ["English","Korean"],            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "AL Behavioral Health Ctr",    state: "AL", zip: "35203", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.3, years: 10, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Sandra Odom",             state: "AL", zip: "35201", specialty: "Psychiatry",        distance: "1.6 mi",  rating: 4.5, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Brian Taylor",            state: "AL", zip: "35209", specialty: "Psychiatry",        distance: "1.2 mi",  rating: 4.6, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Kezia Robinson",          state: "AL", zip: "35211", specialty: "OB-GYN",            distance: "1.9 mi",  rating: 4.6, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Carmen Diaz",             state: "AL", zip: "35201", specialty: "OB-GYN",            distance: "1.2 mi",  rating: 4.5, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Woods",          state: "AL", zip: "35209", specialty: "OB-GYN",            distance: "0.9 mi",  rating: 4.8, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2024"],                asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "West End Health Hub",         state: "AL", zip: "35208", specialty: "General practice",  distance: "0.8 mi",  rating: 4.1, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Anthony Brooks",          state: "AL", zip: "35201", specialty: "General practice",  distance: "1.5 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nicole Foster",           state: "AL", zip: "35209", specialty: "General practice",  distance: "1.1 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },

  // ── Mississippi ──
  { name: "Jackson Community Care",      state: "MS", zip: "39201", specialty: "Family medicine",   distance: "0.9 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Crystal Haynes",          state: "MS", zip: "39201", specialty: "Family medicine",   distance: "2.3 mi",  rating: 4.4, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Marcus Webb",             state: "MS", zip: "39202", specialty: "Family medicine",   distance: "1.5 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "MS Free Health Center",       state: "MS", zip: "39201", specialty: "Internal medicine", distance: "1.0 mi",  rating: 4.1, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Yolanda Pierce",          state: "MS", zip: "39202", specialty: "Internal medicine", distance: "1.6 mi",  rating: 4.5, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. James Perkins",           state: "MS", zip: "39201", specialty: "Internal medicine", distance: "1.2 mi",  rating: 4.5, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Tamika Johnson",          state: "MS", zip: "39206", specialty: "Pediatrics",        distance: "1.8 mi",  rating: 4.4, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "MS Kids Health Hub",          state: "MS", zip: "39201", specialty: "Pediatrics",        distance: "0.8 mi",  rating: 4.3, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kevin Ross",              state: "MS", zip: "39202", specialty: "Pediatrics",        distance: "2.0 mi",  rating: 4.6, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: ["Patient Choice Award"],        asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Aisha Williams",          state: "MS", zip: "39206", specialty: "Dermatology",       distance: "2.4 mi",  rating: 4.3, years: 8,  gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["ramp"],                             tags: ["Phone"] },
  { name: "Dr. Raymond Ford",            state: "MS", zip: "39201", specialty: "Dermatology",       distance: "1.5 mi",  rating: 4.5, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Lee",              state: "MS", zip: "39202", specialty: "Dermatology",       distance: "1.1 mi",  rating: 4.7, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Derm 2023"],               asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "MS Behavioral Health Ctr",    state: "MS", zip: "39201", specialty: "Psychiatry",        distance: "0.7 mi",  rating: 4.2, years: 11, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Denise Carter",           state: "MS", zip: "39202", specialty: "Psychiatry",        distance: "1.7 mi",  rating: 4.5, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Aaron Miles",             state: "MS", zip: "39201", specialty: "Psychiatry",        distance: "1.3 mi",  rating: 4.6, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ebony Clark",             state: "MS", zip: "39206", specialty: "OB-GYN",            distance: "2.1 mi",  rating: 4.6, years: 10, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "low",    accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dr. Rosa Mendez",             state: "MS", zip: "39201", specialty: "OB-GYN",            distance: "1.4 mi",  rating: 4.5, years: 11, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Linda Whitmore",          state: "MS", zip: "39202", specialty: "OB-GYN",            distance: "1.0 mi",  rating: 4.8, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Capitol Street Health Hub",   state: "MS", zip: "39201", specialty: "General practice",  distance: "0.6 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],           insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Samuel Price",            state: "MS", zip: "39202", specialty: "General practice",  distance: "1.8 mi",  rating: 4.3, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Beverly Grant",           state: "MS", zip: "39201", specialty: "General practice",  distance: "1.3 mi",  rating: 4.5, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Tennessee (TN) ──
  { name: "Nashville Community Health Collective", state: "TN", zip: "37201", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Arabic"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marcus Webb",                       state: "TN", zip: "37203", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Holloway",                   state: "TN", zip: "37205", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2022"],                asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Shelby County Free Clinic",             state: "TN", zip: "38103", specialty: "Internal medicine",  distance: "0.7 mi",  rating: 4.1, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Charles Nguyen",                    state: "TN", zip: "38104", specialty: "Internal medicine",  distance: "1.5 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Simmons",                  state: "TN", zip: "38105", specialty: "Internal medicine",  distance: "1.2 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "East Nashville Pediatric Access Clinic",state: "TN", zip: "37206", specialty: "Pediatrics",         distance: "0.8 mi",  rating: 4.3, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kevin Park",                        state: "TN", zip: "37207", specialty: "Pediatrics",         distance: "1.6 mi",  rating: 4.5, years: 9,  gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Laura Jennings",                    state: "TN", zip: "37208", specialty: "Pediatrics",         distance: "1.3 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Tennessee Dermatology Access Center",   state: "TN", zip: "37201", specialty: "Dermatology",        distance: "0.9 mi",  rating: 4.0, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. James Foster",                      state: "TN", zip: "37203", specialty: "Dermatology",        distance: "1.7 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Alice Monroe",                      state: "TN", zip: "37205", specialty: "Dermatology",        distance: "1.4 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Memphis Mental Health Access Network",  state: "TN", zip: "38103", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Arabic"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Eric Thomas",                       state: "TN", zip: "38104", specialty: "Psychiatry",         distance: "1.8 mi",  rating: 4.4, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Vanessa Cole",                      state: "TN", zip: "38105", specialty: "Psychiatry",         distance: "1.5 mi",  rating: 4.7, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Knoxville Women's Health Collective",   state: "TN", zip: "37901", specialty: "OB-GYN",             distance: "0.7 mi",  rating: 4.3, years: 16, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Samuel Davis",                      state: "TN", zip: "37902", specialty: "OB-GYN",             distance: "1.9 mi",  rating: 4.2, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Grace Park",                        state: "TN", zip: "37903", specialty: "OB-GYN",             distance: "1.6 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Top OB 2023"],                 asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Tennessee Valley Community Care",       state: "TN", zip: "37201", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 29, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Robert Fleming",                    state: "TN", zip: "37203", specialty: "General practice",   distance: "1.7 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Diana Chow",                        state: "TN", zip: "37205", specialty: "General practice",   distance: "1.4 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],                 insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Louisiana (LA) ──
  { name: "New Orleans Community Health Hub",      state: "LA", zip: "70112", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.2, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","French","Haitian Creole"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Antoine Broussard",                 state: "LA", zip: "70113", specialty: "Family medicine",    distance: "1.5 mi",  rating: 4.4, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Celeste Thibodaux",                 state: "LA", zip: "70115", specialty: "Family medicine",    distance: "1.2 mi",  rating: 4.7, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English","French"],                   insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Baton Rouge Free Medical Clinic",       state: "LA", zip: "70801", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","French"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marcus Landry",                     state: "LA", zip: "70802", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Yvette Fontenot",                   state: "LA", zip: "70803", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                   insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Greater New Orleans Pediatric Access",  state: "LA", zip: "70112", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Haitian Creole"], insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Pierre Gauthier",                   state: "LA", zip: "70114", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 8,  gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Monique Hebert",                    state: "LA", zip: "70116", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Louisiana Dermatology Access Center",   state: "LA", zip: "70801", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","French"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jean-Pierre Mouton",                state: "LA", zip: "70802", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sophie Arceneaux",                  state: "LA", zip: "70803", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Crescent City Mental Health Collective",state: "LA", zip: "70112", specialty: "Psychiatry",         distance: "0.5 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","French","Haitian Creole"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. René Trosclair",                    state: "LA", zip: "70113", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Isabelle Bergeron",                 state: "LA", zip: "70115", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Bayou Women's Health Clinic",           state: "LA", zip: "70112", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.3, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","French","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Henri Olivier",                     state: "LA", zip: "70113", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nadine Broussard",                  state: "LA", zip: "70115", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","French"],                   insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Acadiana Community Care Network",       state: "LA", zip: "70501", specialty: "General practice",   distance: "0.6 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","French","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Clifton Guidry",                    state: "LA", zip: "70503", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Elaine Fontenot",                   state: "LA", zip: "70505", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","French"],                   insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Virginia (VA) ──
  { name: "Arlington Community Health Collective", state: "VA", zip: "22201", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.3, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Korean","Amharic"], insurance: "low",  accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. James Okafor",                      state: "VA", zip: "22202", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],                      insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Catherine Whitfield",               state: "VA", zip: "22204", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2022"],                asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Northern Virginia Free Clinic",         state: "VA", zip: "22203", specialty: "Internal medicine",  distance: "0.7 mi",  rating: 4.2, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese","Amharic"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Philip Nguyen",                     state: "VA", zip: "22206", specialty: "Internal medicine",  distance: "1.5 mi",  rating: 4.4, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Amelia Foster",                     state: "VA", zip: "22209", specialty: "Internal medicine",  distance: "1.2 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Richmond Pediatric Access Clinic",      state: "VA", zip: "23220", specialty: "Pediatrics",         distance: "0.8 mi",  rating: 4.3, years: 13, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Amharic","Tigrinya"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Michael Kim",                       state: "VA", zip: "23221", specialty: "Pediatrics",         distance: "1.6 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rachel Thompson",                   state: "VA", zip: "23222", specialty: "Pediatrics",         distance: "1.3 mi",  rating: 4.8, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Virginia Dermatology Access Center",    state: "VA", zip: "22201", specialty: "Dermatology",        distance: "0.9 mi",  rating: 4.1, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Korean"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. David Park",                        state: "VA", zip: "22202", specialty: "Dermatology",        distance: "1.7 mi",  rating: 4.4, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Linda Chen",                        state: "VA", zip: "22204", specialty: "Dermatology",        distance: "1.4 mi",  rating: 4.6, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],                 insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Virginia Mental Health Access Network", state: "VA", zip: "22203", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Amharic"],         insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Richard Okonkwo",                   state: "VA", zip: "22206", specialty: "Psychiatry",         distance: "1.8 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yoruba"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Priya Sharma",                      state: "VA", zip: "22209", specialty: "Psychiatry",         distance: "1.5 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hindi"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hampton Roads Women's Health Clinic",   state: "VA", zip: "23510", specialty: "OB-GYN",             distance: "0.7 mi",  rating: 4.3, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Samuel Wright",                     state: "VA", zip: "23511", specialty: "OB-GYN",             distance: "1.9 mi",  rating: 4.2, years: 9,  gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Angela Morrison",                   state: "VA", zip: "23513", specialty: "OB-GYN",             distance: "1.6 mi",  rating: 4.9, years: 26, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                            insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Shenandoah Valley Community Care",      state: "VA", zip: "22801", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],                  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nathan Bradley",                    state: "VA", zip: "22802", specialty: "General practice",   distance: "1.7 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                            insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Vivian Xu",                         state: "VA", zip: "22803", specialty: "General practice",   distance: "1.4 mi",  rating: 4.5, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],                 insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── West Virginia (WV) ──
  { name: "Charleston Community Health Collective",state: "WV", zip: "25301", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.1, years: 21, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thomas Harmon",                     state: "WV", zip: "25302", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Caldwell",                 state: "WV", zip: "25303", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.6, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2022"],                asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Appalachian Free Clinic",               state: "WV", zip: "25701", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.2, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Larry Stone",                       state: "WV", zip: "25702", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Bishop",                     state: "WV", zip: "25703", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.5, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Mountain State Pediatric Access",       state: "WV", zip: "25301", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.2, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Keith Ramsey",                      state: "WV", zip: "25303", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.4, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Helen Watts",                       state: "WV", zip: "25304", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "WV Dermatology Access Center",          state: "WV", zip: "25301", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jack Morrison",                     state: "WV", zip: "25302", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nancy Fields",                      state: "WV", zip: "25303", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Kanawha Valley Mental Health Clinic",   state: "WV", zip: "25301", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.1, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Brian Tucker",                      state: "WV", zip: "25302", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Amy Crawford",                      state: "WV", zip: "25303", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.6, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "WV Women's Health Access Clinic",       state: "WV", zip: "25301", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Gary Spencer",                      state: "WV", zip: "25302", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Diane Harrison",                    state: "WV", zip: "25303", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.7, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Mountaineer Community Care Network",    state: "WV", zip: "25301", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 30, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English"],                    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ronald Griffith",                   state: "WV", zip: "25302", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Carol Adkins",                      state: "WV", zip: "25303", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Arkansas (AR) ──
  { name: "Little Rock Community Health Hub",      state: "AR", zip: "72201", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.2, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marcus Williams",                   state: "AR", zip: "72202", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Joy Simmons",                       state: "AR", zip: "72205", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.6, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Central Arkansas Free Medical Clinic",  state: "AR", zip: "72201", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Robert Hunter",                     state: "AR", zip: "72202", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Pamela Scott",                      state: "AR", zip: "72205", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Arkansas Pediatric Access Center",      state: "AR", zip: "72201", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Marshallese"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Edwin Johnson",                     state: "AR", zip: "72204", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 9,  gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karen Mitchell",                    state: "AR", zip: "72206", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Arkansas Dermatology Access Center",    state: "AR", zip: "72201", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Calvin Reed",                       state: "AR", zip: "72202", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Beverly Ross",                      state: "AR", zip: "72205", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "AR Mental Health Access Collective",    state: "AR", zip: "72201", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Dennis Bailey",                     state: "AR", zip: "72203", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lisa Coleman",                      state: "AR", zip: "72205", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 15, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Arkansas Women's Health Clinic",        state: "AR", zip: "72201", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Curtis Powell",                     state: "AR", zip: "72202", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Brenda Howard",                     state: "AR", zip: "72205", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Natural State Community Care",          state: "AR", zip: "72201", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Harold Warren",                     state: "AR", zip: "72202", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sylvia Turner",                     state: "AR", zip: "72205", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Kentucky (KY) ──
  { name: "Lexington Community Health Collective", state: "KY", zip: "40502", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Timothy Holt",                      state: "KY", zip: "40503", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Caroline Burke",                    state: "KY", zip: "40505", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Louisville Free Clinic",                state: "KY", zip: "40202", specialty: "Internal medicine",  distance: "0.7 mi",  rating: 4.1, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"], insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Andrew McCoy",                      state: "KY", zip: "40203", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ruth Chambers",                     state: "KY", zip: "40204", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Bluegrass Pediatric Access Clinic",     state: "KY", zip: "40502", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"], insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Philip Lawson",                     state: "KY", zip: "40503", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Tina Fox",                          state: "KY", zip: "40504", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Kentucky Dermatology Access Center",    state: "KY", zip: "40502", specialty: "Dermatology",        distance: "0.8 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Gary Ross",                         state: "KY", zip: "40503", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Donna Perkins",                     state: "KY", zip: "40505", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Kentucky Mental Health Access Network", state: "KY", zip: "40502", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ernest Long",                       state: "KY", zip: "40503", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sharon Owens",                      state: "KY", zip: "40504", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Bluegrass Women's Health Clinic",       state: "KY", zip: "40502", specialty: "OB-GYN",             distance: "0.7 mi",  rating: 4.3, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],          insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Victor Marsh",                      state: "KY", zip: "40503", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Janet Wade",                        state: "KY", zip: "40505", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Derby City Community Care",             state: "KY", zip: "40202", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"], insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Floyd Burns",                       state: "KY", zip: "40203", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Grace Neal",                        state: "KY", zip: "40204", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                    insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Illinois (IL) ──
  { name: "Chicago Community Health Collective",   state: "IL", zip: "60601", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.3, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Polish","Mandarin"], insurance: "low",  accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Alejandro Reyes",                   state: "IL", zip: "60602", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Margaret O'Brien",                  state: "IL", zip: "60605", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2022"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Erie Family Health Centers",            state: "IL", zip: "60622", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.2, years: 30, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Polish"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Wei Zhang",                         state: "IL", zip: "60603", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Linda Kowalski",                    state: "IL", zip: "60606", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Polish"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Lawndale Christian Health Center",      state: "IL", zip: "60623", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.4, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Samuel Adeyemi",                    state: "IL", zip: "60637", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yoruba"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karen Novak",                       state: "IL", zip: "60640", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Illinois Dermatology Access Center",    state: "IL", zip: "60601", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Mandarin"],   insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. David Kowalczyk",                   state: "IL", zip: "60602", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Anne Sullivan",                     state: "IL", zip: "60605", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Thresholds Mental Health Clinic",       state: "IL", zip: "60614", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.3, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Polish"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Carlos Mendoza",                    state: "IL", zip: "60603", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.4, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Claire Johansson",                  state: "IL", zip: "60606", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Chicago Women's Health Center",         state: "IL", zip: "60601", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.4, years: 16, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. James Park",                        state: "IL", zip: "60602", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Natalia Wisniewska",                state: "IL", zip: "60605", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.9, years: 27, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Polish"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Near North Health Service Corp",        state: "IL", zip: "60610", specialty: "General practice",   distance: "0.5 mi",  rating: 4.2, years: 32, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Mandarin"],   insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marcus Thompson",                   state: "IL", zip: "60637", specialty: "General practice",   distance: "1.8 mi",  rating: 4.4, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Elena Petrov",                      state: "IL", zip: "60640", specialty: "General practice",   distance: "1.5 mi",  rating: 4.6, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Russian"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Michigan (MI) ──
  { name: "Detroit Community Health Connection",   state: "MI", zip: "48201", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.2, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Arabic"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Khalil Hassan",                     state: "MI", zip: "48202", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Arabic"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Kowalski",                 state: "MI", zip: "48205", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2022"],                asl: false, phone: true,  languages: ["English","Polish"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Southwest Detroit Community Clinic",    state: "MI", zip: "48217", specialty: "Internal medicine",  distance: "0.9 mi",  rating: 4.1, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Arabic"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Omar Nasser",                       state: "MI", zip: "48203", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.4, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Arabic"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Susan Fitzgerald",                  state: "MI", zip: "48206", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Grand Rapids Pediatric Access Center",  state: "MI", zip: "49501", specialty: "Pediatrics",         distance: "0.8 mi",  rating: 4.3, years: 13, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Arabic"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ahmed Al-Mansouri",                 state: "MI", zip: "48209", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Arabic"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rebecca Nowak",                     state: "MI", zip: "48211", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Michigan Dermatology Access Center",    state: "MI", zip: "48201", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Arabic"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. David Qureshi",                     state: "MI", zip: "48202", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Jennifer Chu",                      state: "MI", zip: "48205", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Detroit Wayne Mental Health Authority", state: "MI", zip: "48226", specialty: "Psychiatry",         distance: "0.5 mi",  rating: 4.2, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Arabic"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Yusuf Ibrahim",                     state: "MI", zip: "48203", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Arabic"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Cynthia Grabowski",                 state: "MI", zip: "48206", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hamtramck Women's Health Clinic",       state: "MI", zip: "48212", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.3, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Arabic","Bengali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Tariq Al-Farsi",                    state: "MI", zip: "48213", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 9,  gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Arabic"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lena Schultz",                      state: "MI", zip: "48215", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","German"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Detroit Mercy Community Care",          state: "MI", zip: "48201", specialty: "General practice",   distance: "0.6 mi",  rating: 4.1, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Arabic"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marcus Johnson",                    state: "MI", zip: "48202", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Priya Patel",                       state: "MI", zip: "48205", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Gujarati"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Ohio (OH) ──
  { name: "Cleveland Community Health Collective", state: "OH", zip: "44101", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.3, years: 21, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali","Arabic"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Elias Osei",                        state: "OH", zip: "44102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sarah Kowalski",                    state: "OH", zip: "44105", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Columbus Free Community Clinic",        state: "OH", zip: "43201", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.2, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Mohammed Al-Amin",                  state: "OH", zip: "43202", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.4, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Arabic"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Deborah Richardson",                state: "OH", zip: "43205", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nationwide Children's Satellite Clinic",state: "OH", zip: "43205", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.5, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kofi Mensah",                       state: "OH", zip: "43206", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lisa Steinberg",                    state: "OH", zip: "43207", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Ohio Dermatology Access Center",        state: "OH", zip: "44101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Anthony Brown",                     state: "OH", zip: "44102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Michelle Park",                     state: "OH", zip: "44105", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "North Star Behavioral Health Network",  state: "OH", zip: "43201", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Isaac Boateng",                     state: "OH", zip: "43202", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Angela Fischer",                    state: "OH", zip: "43205", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Ohio Women's Health Access Clinic",     state: "OH", zip: "44101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.3, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Samuel Okafor",                     state: "OH", zip: "44102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],                  insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rachel Goldstein",                  state: "OH", zip: "44105", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Community Care Alliance Ohio",          state: "OH", zip: "43201", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 29, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Emmanuel Adjei",                    state: "OH", zip: "43202", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi"],                   insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Mei Lin",                           state: "OH", zip: "43205", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Indiana (IN) ──
  { name: "Indianapolis Community Health Collective",state: "IN", zip: "46201", specialty: "Family medicine",  distance: "0.5 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Burmese"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Carlos Rivera",                       state: "IN", zip: "46202", specialty: "Family medicine",  distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lisa Blackwell",                      state: "IN", zip: "46204", specialty: "Family medicine",  distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wishard Community Free Clinic",           state: "IN", zip: "46202", specialty: "Internal medicine",distance: "0.8 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Burmese"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thomas Nguyen",                       state: "IN", zip: "46203", specialty: "Internal medicine",distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Pamela Okonkwo",                      state: "IN", zip: "46205", specialty: "Internal medicine",distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Igbo"],                  insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Indy Eastside Pediatric Access Clinic",   state: "IN", zip: "46201", specialty: "Pediatrics",       distance: "0.9 mi",  rating: 4.3, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Burmese"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Richard Pham",                        state: "IN", zip: "46206", specialty: "Pediatrics",       distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Angela Moore",                        state: "IN", zip: "46208", specialty: "Pediatrics",       distance: "1.4 mi",  rating: 4.8, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Indiana Dermatology Access Center",       state: "IN", zip: "46201", specialty: "Dermatology",      distance: "0.7 mi",  rating: 4.0, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kevin Hart",                          state: "IN", zip: "46202", specialty: "Dermatology",      distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Lin",                          state: "IN", zip: "46204", specialty: "Dermatology",      distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Midtown Mental Health Indiana",           state: "IN", zip: "46202", specialty: "Psychiatry",       distance: "0.6 mi",  rating: 4.2, years: 21, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Burmese"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Derek Williams",                      state: "IN", zip: "46203", specialty: "Psychiatry",       distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Miriam Osei",                         state: "IN", zip: "46205", specialty: "Psychiatry",       distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Twi"],                   insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Indiana Women's Health Access Clinic",    state: "IN", zip: "46201", specialty: "OB-GYN",           distance: "0.8 mi",  rating: 4.3, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Albert Schneider",                    state: "IN", zip: "46202", specialty: "OB-GYN",           distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Vivian Charles",                      state: "IN", zip: "46204", specialty: "OB-GYN",           distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Circle City Community Care",              state: "IN", zip: "46201", specialty: "General practice", distance: "0.5 mi",  rating: 4.1, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Burmese"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jason Lee",                           state: "IN", zip: "46202", specialty: "General practice", distance: "1.8 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Beth Cunningham",                     state: "IN", zip: "46204", specialty: "General practice", distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Wisconsin (WI) ──
  { name: "Milwaukee Community Health Collective",  state: "WI", zip: "53201", specialty: "Family medicine",   distance: "0.6 mi",  rating: 4.3, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Hmong"],       insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Hector Fuentes",                     state: "WI", zip: "53202", specialty: "Family medicine",   distance: "1.4 mi",  rating: 4.5, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karen Mueller",                      state: "WI", zip: "53205", specialty: "Family medicine",   distance: "1.1 mi",  rating: 4.7, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2022"],                asl: false, phone: true,  languages: ["English","German"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Sixteenth Street Community Health",      state: "WI", zip: "53204", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.3, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Hmong"],       insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Pao Vang",                           state: "WI", zip: "53203", specialty: "Internal medicine", distance: "1.6 mi",  rating: 4.4, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hmong"],                insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Helena Nowak",                       state: "WI", zip: "53206", specialty: "Internal medicine", distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Polish"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Madison Pediatric Access Clinic",        state: "WI", zip: "53701", specialty: "Pediatrics",        distance: "0.8 mi",  rating: 4.3, years: 13, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Hmong"],       insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Chia Lee",                           state: "WI", zip: "53703", specialty: "Pediatrics",        distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hmong"],                insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Julie Andersen",                     state: "WI", zip: "53705", specialty: "Pediatrics",        distance: "1.4 mi",  rating: 4.8, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wisconsin Dermatology Access Center",    state: "WI", zip: "53201", specialty: "Dermatology",       distance: "0.7 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Hmong"],       insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Brendan Walsh",                      state: "WI", zip: "53202", specialty: "Dermatology",       distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Anna Eriksson",                      state: "WI", zip: "53205", specialty: "Dermatology",       distance: "1.5 mi",  rating: 4.6, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wisconsin Community Mental Health Ctr",  state: "WI", zip: "53201", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.2, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Hmong"],       insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Mai Xiong",                          state: "WI", zip: "53203", specialty: "Psychiatry",        distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hmong"],                insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ingrid Larsson",                     state: "WI", zip: "53206", specialty: "Psychiatry",        distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Milwaukee Women's Health Access Clinic", state: "WI", zip: "53201", specialty: "OB-GYN",            distance: "0.8 mi",  rating: 4.3, years: 16, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Erik Hansson",                       state: "WI", zip: "53202", specialty: "OB-GYN",            distance: "2.0 mi",  rating: 4.2, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Maria Santos",                       state: "WI", zip: "53205", specialty: "OB-GYN",            distance: "1.7 mi",  rating: 4.8, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Badger State Community Care Network",    state: "WI", zip: "53201", specialty: "General practice",  distance: "0.5 mi",  rating: 4.1, years: 29, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Hmong"],       insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Lars Bergstrom",                     state: "WI", zip: "53202", specialty: "General practice",  distance: "1.8 mi",  rating: 4.3, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rosa Gutierrez",                     state: "WI", zip: "53205", specialty: "General practice",  distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Minnesota (MN) ──
  { name: "Minneapolis Community Health Collective",state: "MN", zip: "55401", specialty: "Family medicine",   distance: "0.5 mi",  rating: 4.4, years: 21, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali","Hmong"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Abdirahman Ahmed",                   state: "MN", zip: "55404", specialty: "Family medicine",   distance: "1.4 mi",  rating: 4.6, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Astrid Olson",                       state: "MN", zip: "55408", specialty: "Family medicine",   distance: "1.1 mi",  rating: 4.8, years: 26, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Open Door Health Center MN",             state: "MN", zip: "55411", specialty: "Internal medicine", distance: "0.9 mi",  rating: 4.2, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","Spanish","Hmong"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Mohamud Warsame",                    state: "MN", zip: "55412", specialty: "Internal medicine", distance: "1.6 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karin Lindberg",                     state: "MN", zip: "55405", specialty: "Internal medicine", distance: "1.3 mi",  rating: 4.6, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "St. Paul Eastside Pediatric Access",     state: "MN", zip: "55106", specialty: "Pediatrics",        distance: "0.8 mi",  rating: 4.4, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","Hmong","Spanish"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Koua Yang",                          state: "MN", zip: "55107", specialty: "Pediatrics",        distance: "1.7 mi",  rating: 4.5, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hmong"],                insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ingrid Holm",                        state: "MN", zip: "55108", specialty: "Pediatrics",        distance: "1.4 mi",  rating: 4.8, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Minnesota Dermatology Access Center",    state: "MN", zip: "55401", specialty: "Dermatology",       distance: "0.7 mi",  rating: 4.1, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","Spanish"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Fadumo Ibrahim",                     state: "MN", zip: "55404", specialty: "Dermatology",       distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Hanna Eriksson",                     state: "MN", zip: "55408", specialty: "Dermatology",       distance: "1.5 mi",  rating: 4.6, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hennepin Mental Health Access Network",  state: "MN", zip: "55401", specialty: "Psychiatry",        distance: "0.6 mi",  rating: 4.3, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","Hmong"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Abdullahi Nur",                      state: "MN", zip: "55411", specialty: "Psychiatry",        distance: "1.9 mi",  rating: 4.4, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sara Johansson",                     state: "MN", zip: "55405", specialty: "Psychiatry",        distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Twin Cities Women's Health Access",      state: "MN", zip: "55401", specialty: "OB-GYN",            distance: "0.8 mi",  rating: 4.4, years: 16, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","Spanish"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Yusuf Shire",                        state: "MN", zip: "55412", specialty: "OB-GYN",            distance: "2.0 mi",  rating: 4.3, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Maja Svensson",                      state: "MN", zip: "55408", specialty: "OB-GYN",            distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Northside Community Care MN",            state: "MN", zip: "55411", specialty: "General practice",  distance: "0.5 mi",  rating: 4.2, years: 30, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","Hmong","Spanish"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Liban Hassan",                       state: "MN", zip: "55412", specialty: "General practice",  distance: "1.8 mi",  rating: 4.4, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Tove Lindstrom",                     state: "MN", zip: "55405", specialty: "General practice",  distance: "1.5 mi",  rating: 4.6, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Iowa (IA) ──
  { name: "Des Moines Community Health Collective",state: "IA", zip: "50301", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Bosnian"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Pablo Herrera",                     state: "IA", zip: "50302", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Carol Hansen",                      state: "IA", zip: "50304", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Iowa Free Medical Clinic",              state: "IA", zip: "50301", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Bosnian"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ivan Novak",                        state: "IA", zip: "50303", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Bosnian"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ellen Christensen",                 state: "IA", zip: "50305", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Iowa Pediatric Access Center",          state: "IA", zip: "50301", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Bosnian"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marcus Rosenberg",                  state: "IA", zip: "50306", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 9,  gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Laura Sorensen",                    state: "IA", zip: "50309", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Iowa Dermatology Access Center",        state: "IA", zip: "50301", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Stephen Olsen",                     state: "IA", zip: "50302", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nancy Berg",                        state: "IA", zip: "50304", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Iowa Mental Health Access Network",     state: "IA", zip: "50301", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Daniel Petersen",                   state: "IA", zip: "50303", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Megan Nelsen",                      state: "IA", zip: "50305", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Iowa Women's Health Access Clinic",     state: "IA", zip: "50301", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Lars Andersen",                     state: "IA", zip: "50302", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Britta Madsen",                     state: "IA", zip: "50304", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hawkeye Community Care Network",        state: "IA", zip: "50301", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Bosnian"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Gerald Olson",                      state: "IA", zip: "50302", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Diane Sorensen",                    state: "IA", zip: "50304", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Missouri (MO) ──
  { name: "St. Louis Community Health Collective", state: "MO", zip: "63101", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.2, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Bosnian"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Antonio Garcia",                    state: "MO", zip: "63102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Renee Stevenson",                   state: "MO", zip: "63105", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "KC Care Health Center",                 state: "MO", zip: "64108", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.3, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Darius Kimani",                     state: "MO", zip: "64109", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Swahili"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Helen Barnes",                      state: "MO", zip: "64110", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Missouri Pediatric Access Center",      state: "MO", zip: "63101", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Bosnian"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Emir Hadzic",                       state: "MO", zip: "63103", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Bosnian"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sharon Coleman",                    state: "MO", zip: "63106", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Missouri Dermatology Access Center",    state: "MO", zip: "63101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Mark Jefferson",                    state: "MO", zip: "63102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Angela King",                       state: "MO", zip: "63105", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Gateway Mental Health Services",        state: "MO", zip: "63101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 21, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Bosnian"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. James Radovic",                     state: "MO", zip: "63103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Vanessa Pierce",                    state: "MO", zip: "63106", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Missouri Women's Health Access Clinic", state: "MO", zip: "63101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Patrick Sweeney",                   state: "MO", zip: "63102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Denise Robinson",                   state: "MO", zip: "63105", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Show-Me Community Care Network",        state: "MO", zip: "63101", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Bosnian"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Frank Willis",                      state: "MO", zip: "63102", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Janet Owens",                       state: "MO", zip: "63105", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Kansas (KS) ──
  { name: "Wichita Community Health Collective",   state: "KS", zip: "67201", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Roberto Diaz",                      state: "KS", zip: "67202", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Hartman",                  state: "KS", zip: "67205", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Kansas Free Community Clinic",          state: "KS", zip: "67201", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Miguel Soto",                       state: "KS", zip: "67203", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Elizabeth Brewer",                  state: "KS", zip: "67206", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Kansas Pediatric Access Center",        state: "KS", zip: "67201", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Joel Martinez",                     state: "KS", zip: "67204", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Amy Goldman",                       state: "KS", zip: "67207", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Kansas Dermatology Access Center",      state: "KS", zip: "67201", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Javier Reyes",                      state: "KS", zip: "67202", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lisa Farrow",                       state: "KS", zip: "67205", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Kansas Mental Health Access Network",   state: "KS", zip: "67201", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ernesto Cruz",                      state: "KS", zip: "67203", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sarah Manning",                     state: "KS", zip: "67206", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Sunflower Women's Health Access Clinic",state: "KS", zip: "67201", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Oscar Morales",                     state: "KS", zip: "67202", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Wendy Abbott",                      state: "KS", zip: "67205", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wheat State Community Care",            state: "KS", zip: "67201", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Raymond Torres",                    state: "KS", zip: "67202", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rebecca Holt",                      state: "KS", zip: "67205", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Nebraska (NE) ──
  { name: "Omaha Community Health Collective",     state: "NE", zip: "68101", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Luis Aguilar",                      state: "NE", zip: "68102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karen Fischer",                     state: "NE", zip: "68104", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nebraska Free Clinic",                  state: "NE", zip: "68101", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Mohamed Ali",                       state: "NE", zip: "68103", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Jensen",                   state: "NE", zip: "68105", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nebraska Pediatric Access Center",      state: "NE", zip: "68101", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Hassan Omar",                       state: "NE", zip: "68106", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Susan Haas",                        state: "NE", zip: "68108", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nebraska Dermatology Access Center",    state: "NE", zip: "68101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Carl Nystrom",                      state: "NE", zip: "68102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Elaine Johanson",                   state: "NE", zip: "68104", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nebraska Mental Health Access Network", state: "NE", zip: "68101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Abdi Hussein",                      state: "NE", zip: "68103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Donna Larsen",                      state: "NE", zip: "68105", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nebraska Women's Health Access Clinic", state: "NE", zip: "68101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Erik Bjornsen",                     state: "NE", zip: "68102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Anita Sorensen",                    state: "NE", zip: "68104", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Cornhusker Community Care",             state: "NE", zip: "68101", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Adan Jama",                         state: "NE", zip: "68102", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Martha Nelson",                     state: "NE", zip: "68104", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── South Dakota (SD) ──
  { name: "Sioux Falls Community Health Collective",state: "SD", zip: "57101", specialty: "Family medicine",   distance: "0.6 mi",  rating: 4.2, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Lakota"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Brandon Swifthawk",                 state: "SD", zip: "57103", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Lakota"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Carol Gustafson",                   state: "SD", zip: "57105", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.6, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "SD Free Community Clinic",              state: "SD", zip: "57101", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Lakota","Spanish"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. James Eagleheart",                  state: "SD", zip: "57103", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Lakota"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Linda Magnuson",                    state: "SD", zip: "57106", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "South Dakota Pediatric Access Center",  state: "SD", zip: "57101", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Lakota","Spanish"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thomas Whirlwind",                  state: "SD", zip: "57104", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Lakota"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nicole Andersen",                   state: "SD", zip: "57108", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "SD Dermatology Access Center",          state: "SD", zip: "57101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Lakota"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kenneth Brave Bull",                state: "SD", zip: "57103", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Mary Carlson",                      state: "SD", zip: "57105", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Great Plains Mental Health Network",    state: "SD", zip: "57101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Lakota","Spanish"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Albert Whitehorse",                 state: "SD", zip: "57103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Lakota"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Heidi Sorensen",                    state: "SD", zip: "57106", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "SD Women's Health Access Clinic",       state: "SD", zip: "57101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Lakota"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nathan Ironwing",                   state: "SD", zip: "57104", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Signe Larson",                      state: "SD", zip: "57108", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Mount Rushmore Community Care",         state: "SD", zip: "57701", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Lakota"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Russell Twobears",                  state: "SD", zip: "57702", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ingrid Hanson",                     state: "SD", zip: "57703", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── North Dakota (ND) ──
  { name: "Fargo Community Health Collective",     state: "ND", zip: "58101", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.2, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Abdi Warsame",                      state: "ND", zip: "58102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Astrid Hanson",                     state: "ND", zip: "58104", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "ND Free Community Clinic",              state: "ND", zip: "58201", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","Spanish"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Omar Farah",                        state: "ND", zip: "58202", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Kari Olson",                        state: "ND", zip: "58203", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.5, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "North Dakota Pediatric Access Center",  state: "ND", zip: "58101", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","Spanish"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ahmed Elmi",                        state: "ND", zip: "58103", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 9,  gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sigrid Magnuson",                   state: "ND", zip: "58105", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "ND Dermatology Access Center",          state: "ND", zip: "58101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Lars Thoreson",                     state: "ND", zip: "58102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Margaret Pedersen",                 state: "ND", zip: "58104", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Prairie Mental Health Access Network",  state: "ND", zip: "58101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Abdifatah Hussein",                 state: "ND", zip: "58103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ragna Fjeldbo",                     state: "ND", zip: "58105", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "ND Women's Health Access Clinic",       state: "ND", zip: "58101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nils Bergstrom",                    state: "ND", zip: "58102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Helga Christiansen",                state: "ND", zip: "58104", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Peace Garden Community Care",           state: "ND", zip: "58501", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ibrahim Osman",                     state: "ND", zip: "58502", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Solveig Bjornstad",                 state: "ND", zip: "58503", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Texas (TX) ──
  { name: "Houston Community Health Collective",   state: "TX", zip: "77002", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.3, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese","Chinese"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Carlos Vega",                       state: "TX", zip: "77003", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Megan Okafor",                      state: "TX", zip: "77005", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2022"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Peoples Community Clinic Austin",       state: "TX", zip: "78701", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.2, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Roberto Castillo",                  state: "TX", zip: "78702", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.4, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Priya Patel",                       state: "TX", zip: "77006", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hindi"],                insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Dallas Pediatric Access Center",        state: "TX", zip: "75201", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.4, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nguyen Van Tran",                   state: "TX", zip: "77007", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Morales",                    state: "TX", zip: "77008", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Texas Dermatology Access Center",       state: "TX", zip: "77002", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Eduardo Reyes",                     state: "TX", zip: "77003", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Amy Chen",                          state: "TX", zip: "77005", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "San Antonio Mental Health Access Net",  state: "TX", zip: "78201", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jorge Hernandez",                   state: "TX", zip: "78202", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Natasha Williams",                  state: "TX", zip: "77006", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Texas Women's Health Access Clinic",    state: "TX", zip: "77002", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.3, years: 16, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Felipe Gutierrez",                  state: "TX", zip: "77003", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.3, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Diana Torres",                      state: "TX", zip: "77005", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.9, years: 27, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Lone Star Community Care Network",      state: "TX", zip: "77002", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 30, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Samuel Adeyemi",                    state: "TX", zip: "77007", specialty: "General practice",   distance: "1.8 mi",  rating: 4.4, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yoruba"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lin Wei",                           state: "TX", zip: "77008", specialty: "General practice",   distance: "1.5 mi",  rating: 4.6, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Oklahoma (OK) ──
  { name: "OKC Community Health Collective",       state: "OK", zip: "73101", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.2, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Cherokee"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. James Redcloud",                    state: "OK", zip: "73102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Cherokee"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Susan Morningstar",                 state: "OK", zip: "73105", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Tulsa County Free Medical Clinic",      state: "OK", zip: "74101", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Cherokee"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Billy Runningwater",                state: "OK", zip: "74102", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Cherokee"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karen Bigcrow",                     state: "OK", zip: "74103", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Oklahoma Pediatric Access Center",      state: "OK", zip: "73101", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Cherokee"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thomas Yellowhorse",                state: "OK", zip: "73103", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Cherokee"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Deer",                     state: "OK", zip: "73106", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Oklahoma Dermatology Access Center",    state: "OK", zip: "73101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Frank Eaglefeather",                state: "OK", zip: "73102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Donna Walkingstick",                state: "OK", zip: "73105", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Oklahoma Mental Health Access Network", state: "OK", zip: "73101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Cherokee"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nathan Ironcloud",                  state: "OK", zip: "73103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lucy Swiftbird",                    state: "OK", zip: "73106", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Oklahoma Women's Health Access Clinic", state: "OK", zip: "73101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Russell Stonecipher",               state: "OK", zip: "73102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Martha Cornsilk",                   state: "OK", zip: "73105", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Sooner State Community Care",           state: "OK", zip: "73101", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Cherokee"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Charles Littlejohn",                state: "OK", zip: "73102", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Vera Nighthorse",                   state: "OK", zip: "73105", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Colorado (CO) ──
  { name: "Denver Community Health Collective",    state: "CO", zip: "80201", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.3, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marco Rodriguez",                  state: "CO", zip: "80202", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sarah Weatherspoon",               state: "CO", zip: "80205", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Clinica Tepeyac Denver",               state: "CO", zip: "80216", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.3, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Alejandro Vargas",                 state: "CO", zip: "80203", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Heather Okonkwo",                  state: "CO", zip: "80206", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Denver Pediatric Access Center",       state: "CO", zip: "80201", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.4, years: 13, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Felipe Montoya",                   state: "CO", zip: "80207", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Jessica Trujillo",                 state: "CO", zip: "80209", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Colorado Dermatology Access Center",   state: "CO", zip: "80201", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Javier Morales",                   state: "CO", zip: "80202", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Claire Yamamoto",                  state: "CO", zip: "80205", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Colorado Mental Health Access Network",state: "CO", zip: "80201", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Diego Ruiz",                       state: "CO", zip: "80203", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Allison Bergman",                  state: "CO", zip: "80206", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Colorado Women's Health Access Clinic",state: "CO", zip: "80201", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.3, years: 16, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Hector Flores",                    state: "CO", zip: "80202", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.3, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nicole Espinoza",                  state: "CO", zip: "80205", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Mile High Community Care Network",     state: "CO", zip: "80201", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Carlos Sandoval",                  state: "CO", zip: "80207", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lin Park",                         state: "CO", zip: "80209", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Arizona (AZ) ──
  { name: "Phoenix Community Health Collective",  state: "AZ", zip: "85001", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.3, years: 21, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jose Delgado",                     state: "AZ", zip: "85002", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Elena Whitehorse",                 state: "AZ", zip: "85005", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2022"],                asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Tucson Community Free Clinic",         state: "AZ", zip: "85701", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Raymond Runningwater",             state: "AZ", zip: "85702", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lisa Moreno",                      state: "AZ", zip: "85703", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Arizona Pediatric Access Center",      state: "AZ", zip: "85001", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Samuel Nez",                       state: "AZ", zip: "85003", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Angela Gutierrez",                 state: "AZ", zip: "85006", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Arizona Dermatology Access Center",    state: "AZ", zip: "85001", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Frank Ironhorse",                  state: "AZ", zip: "85002", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Tso",                     state: "AZ", zip: "85005", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Arizona Mental Health Access Network", state: "AZ", zip: "85001", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thomas Yazzie",                    state: "AZ", zip: "85003", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rosa Valdez",                      state: "AZ", zip: "85006", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "AZ Women's Health Access Clinic",      state: "AZ", zip: "85001", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nathan Begay",                     state: "AZ", zip: "85002", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Isabella Reyes",                   state: "AZ", zip: "85005", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Saguaro Community Care Network",       state: "AZ", zip: "85001", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Roy Tsinajinnie",                  state: "AZ", zip: "85003", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Veronica Sanchez",                 state: "AZ", zip: "85006", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── New Mexico (NM) ──
  { name: "Albuquerque Community Health Collective",state: "NM", zip: "87101", specialty: "Family medicine",  distance: "0.6 mi",  rating: 4.2, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Miguel Trujillo",                  state: "NM", zip: "87102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Linda Benally",                    state: "NM", zip: "87104", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "NM Free Community Health Clinic",      state: "NM", zip: "87101", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Joe Runningwater",                 state: "NM", zip: "87103", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Maria Espinoza",                   state: "NM", zip: "87105", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "New Mexico Pediatric Access Center",   state: "NM", zip: "87101", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Andrew Tsosie",                    state: "NM", zip: "87106", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Carmen Lopez",                     state: "NM", zip: "87108", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "NM Dermatology Access Center",         state: "NM", zip: "87101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Robert Yazzie",                    state: "NM", zip: "87102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sofia Gallegos",                   state: "NM", zip: "87104", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "NM Mental Health Access Network",      state: "NM", zip: "87101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Fred Chee",                        state: "NM", zip: "87103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Dolores Romero",                   state: "NM", zip: "87105", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "NM Women's Health Access Clinic",      state: "NM", zip: "87101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Aaron Nez",                        state: "NM", zip: "87102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Elena Cisneros",                   state: "NM", zip: "87104", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Land of Enchantment Community Care",   state: "NM", zip: "87101", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Navajo"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Roy Silversmith",                  state: "NM", zip: "87103", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Navajo"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Pilar Vigil",                      state: "NM", zip: "87105", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Utah (UT) ──
  { name: "Salt Lake Community Health Collective", state: "UT", zip: "84101", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.3, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tongan"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Pedro Flores",                     state: "UT", zip: "84102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Mary Christensen",                 state: "UT", zip: "84105", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Utah Community Free Clinic",           state: "UT", zip: "84101", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tongan"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Sione Fifita",                     state: "UT", zip: "84103", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Tongan"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lisa Anderson",                    state: "UT", zip: "84106", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Utah Pediatric Access Center",         state: "UT", zip: "84101", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tongan"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Taufa Taufa",                      state: "UT", zip: "84104", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Tongan"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karen Jensen",                     state: "UT", zip: "84107", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Utah Dermatology Access Center",       state: "UT", zip: "84101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marcus Olsen",                     state: "UT", zip: "84102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Emily Nielsen",                    state: "UT", zip: "84105", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Utah Mental Health Access Network",    state: "UT", zip: "84101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tongan"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Peni Taufa",                       state: "UT", zip: "84103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Tongan"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rachel Petersen",                  state: "UT", zip: "84106", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Utah Women's Health Access Clinic",    state: "UT", zip: "84101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Samuel Christoffersen",            state: "UT", zip: "84102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Linda Sorensen",                   state: "UT", zip: "84105", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Beehive Community Care Network",       state: "UT", zip: "84101", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tongan"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Fili Taufa",                       state: "UT", zip: "84103", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Tongan"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Heidi Larsen",                     state: "UT", zip: "84106", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Nevada (NV) ──
  { name: "Las Vegas Community Health Collective",state: "NV", zip: "89101", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.2, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tagalog"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Eduardo Ramos",                    state: "NV", zip: "89102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Grace Santos",                     state: "NV", zip: "89105", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English","Tagalog"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nevada Community Free Clinic",         state: "NV", zip: "89101", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tagalog"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Romeo Cruz",                       state: "NV", zip: "89103", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Tagalog"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Angela Torres",                    state: "NV", zip: "89106", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nevada Pediatric Access Center",       state: "NV", zip: "89101", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tagalog"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ernesto Mendez",                   state: "NV", zip: "89104", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Maria Reyes",                      state: "NV", zip: "89107", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English","Tagalog"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nevada Dermatology Access Center",     state: "NV", zip: "89101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Felix Navarro",                    state: "NV", zip: "89102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lisa Kim",                         state: "NV", zip: "89105", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nevada Mental Health Access Network",  state: "NV", zip: "89101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tagalog"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jose Villanueva",                  state: "NV", zip: "89103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Tagalog"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Lopez",                     state: "NV", zip: "89106", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Nevada Women's Health Access Clinic",  state: "NV", zip: "89101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Carlos Villafuerte",               state: "NV", zip: "89102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ana Bautista",                     state: "NV", zip: "89105", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Tagalog"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Silver State Community Care",          state: "NV", zip: "89101", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Tagalog"],     insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Bernard Santos",                   state: "NV", zip: "89103", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Tagalog"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Rosa Ochoa",                       state: "NV", zip: "89106", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Idaho (ID) ──
  { name: "Boise Community Health Collective",    state: "ID", zip: "83701", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Marco Gutierrez",                  state: "ID", zip: "83702", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Kathy Anderson",                   state: "ID", zip: "83704", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Idaho Free Community Clinic",          state: "ID", zip: "83701", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ruben Vasquez",                    state: "ID", zip: "83703", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Diana Nelson",                     state: "ID", zip: "83705", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Idaho Pediatric Access Center",        state: "ID", zip: "83701", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Luis Herrera",                     state: "ID", zip: "83706", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nicole Olsen",                     state: "ID", zip: "83708", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Idaho Dermatology Access Center",      state: "ID", zip: "83701", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Felipe Ortega",                    state: "ID", zip: "83702", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Kristin Larsen",                   state: "ID", zip: "83704", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Idaho Mental Health Access Network",   state: "ID", zip: "83701", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Antonio Romero",                   state: "ID", zip: "83703", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Janet Thompson",                   state: "ID", zip: "83705", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Idaho Women's Health Access Clinic",   state: "ID", zip: "83701", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. David Sorensen",                   state: "ID", zip: "83702", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Maria Jimenez",                    state: "ID", zip: "83704", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Gem State Community Care",             state: "ID", zip: "83701", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jose Reyes",                       state: "ID", zip: "83703", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Patricia Hansen",                  state: "ID", zip: "83705", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Montana (MT) ──
  { name: "Billings Community Health Collective", state: "MT", zip: "59101", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.2, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Crow"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thomas Bighorn",                   state: "MT", zip: "59102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Crow"],                 insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ingrid Olson",                     state: "MT", zip: "59103", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Montana Community Free Clinic",        state: "MT", zip: "59601", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Crow","Spanish"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. James Two Moons",                  state: "MT", zip: "59602", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Crow"],                 insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Karen Swenson",                    state: "MT", zip: "59603", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Montana Pediatric Access Center",      state: "MT", zip: "59101", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Crow","Spanish"],        insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. William Whiteman",                 state: "MT", zip: "59103", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Crow"],                 insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sandra Magnuson",                  state: "MT", zip: "59105", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Montana Dermatology Access Center",    state: "MT", zip: "59101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Crow"],                 insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Robert Cummins",                   state: "MT", zip: "59102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Astrid Pedersen",                  state: "MT", zip: "59103", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Montana Mental Health Access Network", state: "MT", zip: "59101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Crow"],                 insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Dennis Pretty Eagle",              state: "MT", zip: "59103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Crow"],                 insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ruth Thorvaldsen",                 state: "MT", zip: "59106", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Montana Women's Health Access Clinic", state: "MT", zip: "59101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Crow"],                 insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Henry Bearchild",                  state: "MT", zip: "59102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Helene Gronberg",                  state: "MT", zip: "59103", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Treasure State Community Care",        state: "MT", zip: "59101", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Crow"],                 insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kevin Stops",                      state: "MT", zip: "59102", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sigrid Hansen",                    state: "MT", zip: "59103", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Wyoming (WY) ──
  { name: "Cheyenne Community Health Collective", state: "WY", zip: "82001", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.1, years: 16, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Ricardo Morales",                  state: "WY", zip: "82002", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Linda Erikson",                    state: "WY", zip: "82003", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.6, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wyoming Community Free Clinic",        state: "WY", zip: "82001", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Jorge Soto",                       state: "WY", zip: "82003", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Carol Olsen",                      state: "WY", zip: "82005", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.5, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wyoming Pediatric Access Center",      state: "WY", zip: "82001", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.2, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Manuel Vargas",                    state: "WY", zip: "82004", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.4, years: 9,  gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nancy Sullivan",                   state: "WY", zip: "82007", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wyoming Dermatology Access Center",    state: "WY", zip: "82001", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Carl Benson",                      state: "WY", zip: "82002", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ruth Larsen",                      state: "WY", zip: "82003", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.5, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wyoming Mental Health Access Network", state: "WY", zip: "82001", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 17, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. David Rios",                       state: "WY", zip: "82003", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Monica Carlson",                   state: "WY", zip: "82005", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Wyoming Women's Health Access Clinic", state: "WY", zip: "82001", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Aaron Reyes",                      state: "WY", zip: "82002", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Christine Johnson",                state: "WY", zip: "82003", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.7, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Equality State Community Care",        state: "WY", zip: "82001", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Raul Diaz",                        state: "WY", zip: "82002", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Margaret Swanson",                 state: "WY", zip: "82003", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── California (CA) ──
  { name: "LA Community Health Collective",        state: "CA", zip: "90001", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.4, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Mandarin","Tagalog","Korean"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Javier Ramirez",                    state: "CA", zip: "90002", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.6, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Jennifer Nakamura",                 state: "CA", zip: "90005", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.8, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Tenderloin Health SF",                  state: "CA", zip: "94102", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.3, years: 30, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Cantonese","Vietnamese"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Wei Liu",                           state: "CA", zip: "94103", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.5, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin","Cantonese"], insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sofia Espinoza",                    state: "CA", zip: "90007", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Oakland Pediatric Access Center",       state: "CA", zip: "94601", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.4, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Cantonese","Vietnamese"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kevin Tran",                        state: "CA", zip: "90003", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Yuki Tanaka",                       state: "CA", zip: "90006", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.9, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English","Japanese","Korean"],     insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "California Dermatology Access Center",  state: "CA", zip: "90001", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.2, years: 16, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Mandarin"],   insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Rafael Guerrero",                   state: "CA", zip: "90002", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.5, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Min-Ji Park",                       state: "CA", zip: "90005", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.7, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Didi Hirsch Mental Health Access",      state: "CA", zip: "90019", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.3, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Mandarin"],   insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Andres Herrera",                    state: "CA", zip: "90003", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sakura Yamamoto",                   state: "CA", zip: "94102", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.8, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "California Women's Health Access",      state: "CA", zip: "90001", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.4, years: 17, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Enrique Morales",                   state: "CA", zip: "90002", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ling Chen",                         state: "CA", zip: "94601", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.9, years: 28, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Mandarin","Cantonese"], insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Northeast Community Clinic CA",         state: "CA", zip: "90032", specialty: "General practice",   distance: "0.5 mi",  rating: 4.2, years: 32, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Mandarin","Tagalog"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Hyun-Soo Kim",                      state: "CA", zip: "90010", specialty: "General practice",   distance: "1.8 mi",  rating: 4.5, years: 20, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Gloria Munoz",                      state: "CA", zip: "90006", specialty: "General practice",   distance: "1.5 mi",  rating: 4.7, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Washington (WA) ──
  { name: "Seattle Community Health Collective",   state: "WA", zip: "98101", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.4, years: 21, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali","Vietnamese","Amharic"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nguyen Duc Pham",                   state: "WA", zip: "98102", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Emily Johansson",                   state: "WA", zip: "98105", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Country Doctor Community Clinic",       state: "WA", zip: "98122", specialty: "Internal medicine",  distance: "0.9 mi",  rating: 4.3, years: 28, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali","Vietnamese"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Abdi Mohamed",                      state: "WA", zip: "98103", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Maya Chen",                         state: "WA", zip: "98106", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Neighborcare Health Pediatric Access",  state: "WA", zip: "98101", specialty: "Pediatrics",         distance: "0.8 mi",  rating: 4.4, years: 14, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali","Vietnamese"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Hamid Ahmed",                       state: "WA", zip: "98107", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Soo-Jin Lee",                       state: "WA", zip: "98109", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English","Korean"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "WA Dermatology Access Center",          state: "WA", zip: "98101", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.2, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Bui Thanh Nguyen",                  state: "WA", zip: "98102", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Hannah Park",                       state: "WA", zip: "98105", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Korean"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "WA Mental Health Access Network",       state: "WA", zip: "98101", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.3, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Somali","Spanish","Amharic"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Dawit Tesfaye",                     state: "WA", zip: "98103", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.4, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Amharic"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Megan Osei",                        state: "WA", zip: "98106", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "WA Women's Health Access Clinic",       state: "WA", zip: "98101", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.3, years: 16, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Solomon Tadesse",                   state: "WA", zip: "98102", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Amharic"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Akemi Suzuki",                      state: "WA", zip: "98105", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.9, years: 27, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Puget Sound Community Care",            state: "WA", zip: "98101", specialty: "General practice",   distance: "0.5 mi",  rating: 4.2, years: 29, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali","Vietnamese"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Mustafa Hassan",                    state: "WA", zip: "98107", specialty: "General practice",   distance: "1.8 mi",  rating: 4.4, years: 19, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Li-Hua Chang",                      state: "WA", zip: "98109", specialty: "General practice",   distance: "1.5 mi",  rating: 4.6, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Mandarin","Cantonese"], insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Oregon (OR) ──
  { name: "Portland Community Health Collective",  state: "OR", zip: "97201", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.4, years: 21, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese","Somali"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Duc Nguyen",                        state: "OR", zip: "97202", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Astrid Lindgren",                   state: "OR", zip: "97205", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Outside In Health Services",            state: "OR", zip: "97204", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.2, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Abdi Mohamud",                      state: "OR", zip: "97203", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.4, years: 16, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Clara Yamamoto",                    state: "OR", zip: "97206", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 21, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Oregon Pediatric Access Center",        state: "OR", zip: "97201", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.4, years: 13, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Thanh Vo",                          state: "OR", zip: "97207", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Erin Olsen",                        state: "OR", zip: "97209", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.8, years: 18, gender: "Female", nonprofit: false, verified: true,  awards: ["Best Pediatrician 2023"],      asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Oregon Dermatology Access Center",      state: "OR", zip: "97201", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 15, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Minh Le",                           state: "OR", zip: "97202", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Sarah Andersen",                    state: "OR", zip: "97205", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Oregon Mental Health Access Network",   state: "OR", zip: "97201", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.3, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Somali"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Hassan Farah",                      state: "OR", zip: "97203", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.4, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Ingrid Svensson",                   state: "OR", zip: "97206", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "OR Women's Health Access Clinic",       state: "OR", zip: "97201", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.3, years: 16, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Omar Jama",                         state: "OR", zip: "97202", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Somali"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Keiko Fujimoto",                    state: "OR", zip: "97205", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Beaver State Community Care",           state: "OR", zip: "97201", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Vietnamese"],  insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Binh Nguyen",                       state: "OR", zip: "97203", specialty: "General practice",   distance: "1.8 mi",  rating: 4.4, years: 18, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Vietnamese"],           insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nina Christophersen",               state: "OR", zip: "97206", specialty: "General practice",   distance: "1.5 mi",  rating: 4.6, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Hawaii (HI) ──
  { name: "Honolulu Community Health Collective",  state: "HI", zip: "96801", specialty: "Family medicine",    distance: "0.5 mi",  rating: 4.4, years: 20, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Tagalog","Ilokano","Japanese","Samoan"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kenji Tanaka",                      state: "HI", zip: "96802", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.5, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Leilani Kahananui",                 state: "HI", zip: "96805", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.8, years: 25, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English","Hawaiian"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hawaii Free Community Clinic",          state: "HI", zip: "96801", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.2, years: 24, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Tagalog","Samoan","Ilokano"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Eduardo Santos",                    state: "HI", zip: "96803", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.4, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Tagalog"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Yuki Shimizu",                      state: "HI", zip: "96806", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.6, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hawaii Pediatric Access Center",        state: "HI", zip: "96801", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.4, years: 12, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Tagalog","Samoan"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Rico Dela Cruz",                    state: "HI", zip: "96804", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Tagalog"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Malia Fonoti",                      state: "HI", zip: "96807", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Samoan"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hawaii Dermatology Access Center",      state: "HI", zip: "96801", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.1, years: 14, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Tagalog","Japanese"],    insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Hiroshi Mori",                      state: "HI", zip: "96802", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.4, years: 13, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Kiana Akana",                       state: "HI", zip: "96805", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.6, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hawaiian"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hawaii Mental Health Access Network",   state: "HI", zip: "96801", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.3, years: 19, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Tagalog","Samoan"],      insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Aliʻi Makoa",                       state: "HI", zip: "96803", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.4, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hawaiian"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Siosaia Taufa",                     state: "HI", zip: "96806", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Samoan"],               insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Hawaii Women's Health Access Clinic",   state: "HI", zip: "96801", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.3, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Tagalog"],              insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Kai Makoa",                         state: "HI", zip: "96802", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.3, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hawaiian"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Nani Akana",                        state: "HI", zip: "96805", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 24, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English","Hawaiian"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Aloha State Community Care",            state: "HI", zip: "96801", specialty: "General practice",   distance: "0.5 mi",  rating: 4.2, years: 27, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Tagalog","Ilokano","Samoan"], insurance: "low", accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Akira Watanabe",                    state: "HI", zip: "96803", specialty: "General practice",   distance: "1.8 mi",  rating: 4.4, years: 17, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Haunani Kahananui",                 state: "HI", zip: "96806", specialty: "General practice",   distance: "1.5 mi",  rating: 4.6, years: 22, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Hawaiian"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  // ── Alaska (AK) ──
  { name: "Anchorage Community Health Collective", state: "AK", zip: "99501", specialty: "Family medicine",    distance: "0.6 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Spanish","Yupik"],       insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. James Aguilar",                     state: "AK", zip: "99502", specialty: "Family medicine",    distance: "1.4 mi",  rating: 4.4, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Spanish"],              insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Mary Tallman",                      state: "AK", zip: "99503", specialty: "Family medicine",    distance: "1.1 mi",  rating: 4.7, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doc 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Alaska Community Free Clinic",          state: "AK", zip: "99501", specialty: "Internal medicine",  distance: "0.8 mi",  rating: 4.1, years: 23, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Yupik","Spanish"],       insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. John Walrus",                       state: "AK", zip: "99503", specialty: "Internal medicine",  distance: "1.6 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yupik"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Helen Frost",                       state: "AK", zip: "99504", specialty: "Internal medicine",  distance: "1.3 mi",  rating: 4.5, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Alaska Pediatric Access Center",        state: "AK", zip: "99501", specialty: "Pediatrics",         distance: "0.9 mi",  rating: 4.3, years: 11, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Yupik","Spanish"],       insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Tommy Iqaluk",                      state: "AK", zip: "99505", specialty: "Pediatrics",         distance: "1.7 mi",  rating: 4.5, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yupik"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Susan Nakamura",                    state: "AK", zip: "99507", specialty: "Pediatrics",         distance: "1.4 mi",  rating: 4.7, years: 17, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Japanese"],             insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Alaska Dermatology Access Center",      state: "AK", zip: "99501", specialty: "Dermatology",        distance: "0.7 mi",  rating: 4.0, years: 13, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Yupik"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Carl Atkan",                        state: "AK", zip: "99502", specialty: "Dermatology",        distance: "1.8 mi",  rating: 4.3, years: 14, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Lisa Johanssen",                    state: "AK", zip: "99503", specialty: "Dermatology",        distance: "1.5 mi",  rating: 4.5, years: 19, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Alaska Mental Health Access Network",   state: "AK", zip: "99501", specialty: "Psychiatry",         distance: "0.6 mi",  rating: 4.2, years: 18, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Yupik"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Paul Seetot",                       state: "AK", zip: "99503", specialty: "Psychiatry",         distance: "1.9 mi",  rating: 4.3, years: 12, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yupik"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Anna Bergman",                      state: "AK", zip: "99504", specialty: "Psychiatry",         distance: "1.6 mi",  rating: 4.7, years: 16, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Alaska Women's Health Access Clinic",   state: "AK", zip: "99501", specialty: "OB-GYN",             distance: "0.8 mi",  rating: 4.2, years: 15, gender: "Female", nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Yupik"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Nathan Tikiun",                     state: "AK", zip: "99502", specialty: "OB-GYN",             distance: "2.0 mi",  rating: 4.2, years: 10, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Claire Sorensen",                   state: "AK", zip: "99503", specialty: "OB-GYN",             distance: "1.7 mi",  rating: 4.8, years: 23, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2023"],                asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
  { name: "Last Frontier Community Care",          state: "AK", zip: "99501", specialty: "General practice",   distance: "0.5 mi",  rating: 4.1, years: 26, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [],                              asl: true,  phone: true,  languages: ["English","Yupik"],               insurance: "low",    accessibility: ["elevator","ramp","transportation"],  tags: ["Accessible","ASL","Phone"] },
  { name: "Dr. Elias Kimiksana",                   state: "AK", zip: "99502", specialty: "General practice",   distance: "1.8 mi",  rating: 4.3, years: 15, gender: "Male",   nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English","Yupik"],               insurance: "medium", accessibility: ["elevator"],                         tags: ["Phone"] },
  { name: "Dr. Kari Lindstrom",                    state: "AK", zip: "99503", specialty: "General practice",   distance: "1.5 mi",  rating: 4.5, years: 20, gender: "Female", nonprofit: false, verified: true,  awards: [],                              asl: false, phone: true,  languages: ["English"],                        insurance: "high",   accessibility: ["elevator","ramp"],                  tags: ["Phone"] },
];

const IL_SPECIALTIES = ["All", "Family medicine", "Internal medicine", "Pediatrics", "Dermatology", "Psychiatry", "OB-GYN", "General practice"];

const IL_RESOURCES = [
  // ── Major National Insurance Provider Directories ──
  { cat: "Community Clinic", title: "BCBS Find Care Tool",                   body: "Search for nationwide in-network doctors, specialists, and hospitals using the Blue Cross Blue Shield Find Care Tool.", link: "https://www.bcbs.com/find-care", icon: "◆" },
  { cat: "Community Clinic", title: "UnitedHealthcare Provider Directory",   body: "Access a nationwide network of over 1.7 million care professionals. For Medicaid or Dual-Eligible plans, use the UHC Community Plan Locator.", link: "https://www.uhc.com/find-a-doctor", icon: "◆" },
  { cat: "Community Clinic", title: "Aetna DocFind Tool",                    body: "Find local specialists and family doctors by entering your location on the Aetna DocFind Tool.", link: "https://www.aetna.com/dsepublic/#/contentPage?page=providerSearchLanding&site_id=dse", icon: "◆" },
  { cat: "Community Clinic", title: "Cigna Health Care Professional Directory", body: "Filter by provider name, facility type, or specialty using the Cigna Health Care Professional Directory.", link: "https://hcpdirectory.cigna.com/web/public/consumer/directory/search", icon: "◆" },
  { cat: "Community Clinic", title: "Health Net ProviderSearch Engine",      body: "Locate regional PPO and HMO network doctors directly via the Health Net ProviderSearch portal. Search by provider name, specialty, or facility type within your plan network.", link: "https://www.healthnet.com/portal/providerSearch.action", icon: "◆" },
  // ── Government & Public Insurance Directories ──
  { cat: "Government",       title: "Medicare Care Compare — Physicians",     body: "Official CMS tool for Medicare patients. Search by name, location, or specialty — filter by distance, hospital affiliation, and Medicare assignment status (whether the doctor accepts Medicare-approved payment amounts).", link: "https://www.medicare.gov/care-compare/?providerType=Physician", icon: "▲" },
  { cat: "Government",       title: "Medicare Care Compare — Hospitals",      body: "Compare hospitals, nursing homes, home health agencies, hospice care, and inpatient rehab facilities on quality measures and patient satisfaction scores.", link: "https://www.medicare.gov/care-compare/", icon: "▲" },
  { cat: "Government",       title: "HealthCare.gov Local Help Directory",   body: "If you bought your plan through the ACA exchange, find a local agent or navigator to guide your search via the HealthCare.gov Local Help Directory.", link: "https://localhelp.healthcare.gov/", icon: "▲" },
  { cat: "Government",       title: "HRSA Find a Health Center",             body: "Federally funded, community-based health centers that accept most insurances and offer sliding scales for the underinsured.", link: "https://findahealthcenter.hrsa.gov/", icon: "▲" },
  { cat: "Government",       title: "HealthCare.gov — Find a Plan",          body: "Compare ACA Marketplace plans by ZIP, income and coverage need. Subsidies available at all income levels.", link: "https://www.healthcare.gov/using-marketplace-coverage/getting-medical-care/", icon: "▲" },
  { cat: "Government",       title: "UHC Health Plans by State",             body: "United Healthcare plan finder by state — see what plans are available where you live.", link: "https://www.uhcprovider.com/en/health-plans-by-state.html", icon: "▲" },
  { cat: "Community Clinic", title: "AMA Doctor Finder",                     body: "American Medical Association database of licensed US physicians — filter by specialty, location and name.", link: "https://find-doctor.ama-assn.org/", icon: "◆" },
  { cat: "Nonprofit",        title: "Covered Traveler — Medical Providers",  body: "Directory of vetted medical providers with transparent pricing across the US.", link: "https://www.coveredtraveler.com/medical-providers", icon: "●" },
  { cat: "Government",       title: "NIMHD Health Data Portal — Insurance",  body: "NIH data on insurance coverage gaps by race, age and sex — understand disparities in your community.", link: "https://hdpulse.nimhd.nih.gov/data-portal/healthcare/table?age=174&age_options=age_6&demo=00030&demo_options=insurance_12&healthcaretopic=040&healthcaretopic_options=healthcare_3&race=00&race_options=race_1_all&sex=0&sex_options=sex_3&statefips=00&statefips_options=area_states", icon: "▲" },
  { cat: "Government",       title: "Census Bureau — Health Insurance Report", body: "Official 2024 US Census data on insurance coverage by demographics and state.", link: "https://www.census.gov/library/publications/2025/demo/p60-288.html", icon: "▲" },
  { cat: "Government",       title: "CDC — Health Insurance FastStats",       body: "CDC quick-reference statistics on insurance coverage, uninsured rates and access to care.", link: "https://www.cdc.gov/nchs/fastats/health-insurance.htm", icon: "▲" },
  { cat: "Nonprofit",        title: "KFF — Insurance Coverage by Gender",    body: "Kaiser Family Foundation data on insurance coverage disparities across genders and states.", link: "https://www.kff.org/state-category/health-coverage-uninsured/health-insurance-status-by-gender/", icon: "●" },
  { cat: "Nonprofit",        title: "US Health Group — Get a Quote",          body: "Compare private health insurance plans and get personalised quotes by coverage level.", link: "https://www.ushealthgroup.com/get-a-quote", icon: "●" },
  { cat: "Nonprofit",        title: "First Family Insurance",                 body: "Independent broker helping families find affordable insurance plans across the US market.", link: "https://www.firstfamilyinsurance.com/", icon: "●" },
  { cat: "Nonprofit",        title: "How to Find In-Network Providers (Guide)", body: "Step-by-step guide: (1) Contact your provider directly and ask if they're in your plan's network. (2) Use your insurer's online 'Find a Doctor' tool — found on your insurance ID card. (3) Call your insurer's customer service to verify in-network status before your visit. By Triage Cancer & Pfizer.", link: "https://www.myhealthcarefinances.com/health-insurance/finding-in-network-health-care-providers", icon: "●" },
];

// ---------- Learn tab data ----------
const LEARN_CATS = ["All", "First Aid", "Prevention", "Nutrition", "Mental Health", "Know When to Go"];

const LEARN_GUIDES = [
  // ── First Aid ──
  {
    cat: "First Aid", icon: "🩹", title: "Cuts & minor wounds",
    summary: "Clean, cover, monitor — most small cuts heal at home.",
    steps: [
      "Rinse the wound under cool running water for 1–2 minutes to flush debris.",
      "Apply gentle pressure with a clean cloth for 5–10 min to stop bleeding.",
      "Pat dry and apply a thin layer of antibiotic ointment (e.g. Neosporin).",
      "Cover with a sterile adhesive bandage; change daily or when wet.",
      "Watch for redness spreading beyond the wound edge, warmth, pus, or fever — those need a provider.",
    ],
    tip: "See a provider if the cut is deeper than ¼ inch, gaping, or from a rusty or dirty object.",
  },
  {
    cat: "First Aid", icon: "🔥", title: "Minor burns (1st degree)",
    summary: "Cool, protect, and soothe — never use ice or butter.",
    steps: [
      "Run cool (not cold) water over the burn for at least 10–20 minutes.",
      "Do NOT apply ice, butter, toothpaste, or any oil — these trap heat.",
      "Take ibuprofen or acetaminophen for pain if needed.",
      "Cover loosely with a non-stick sterile bandage or clean cling wrap.",
      "Keep clean and dry; apply aloe vera gel to soothe once cooled.",
    ],
    tip: "Go to emergency care for burns larger than 3 inches, burns on the face/hands/genitals, or any 3rd-degree burn (white or charred skin).",
  },
  {
    cat: "First Aid", icon: "🦷", title: "Knocked-out tooth",
    summary: "Act within 30 minutes — you can often save the tooth.",
    steps: [
      "Pick up the tooth by the crown (white part), not the root.",
      "Rinse gently with milk or saline — do NOT scrub or use tap water.",
      "Try to reinsert it into the socket; bite gently on a damp cloth to hold it.",
      "If you can't reinsert, keep it moist: submerge in milk or hold between cheek and gum.",
      "Get to a dentist or ER within 30 minutes for the best chance of saving it.",
    ],
    tip: "Time is critical — the sooner a dentist sees it, the higher the survival chance.",
  },
  {
    cat: "First Aid", icon: "🤧", title: "Nosebleed at home",
    summary: "Lean forward, pinch, wait — do NOT tilt back.",
    steps: [
      "Sit upright and lean slightly forward (leaning back causes blood to flow to throat).",
      "Pinch the soft part of your nose shut firmly with your thumb and index finger.",
      "Breathe through your mouth and hold for a full 10–15 minutes without peeking.",
      "Apply a cold pack to the bridge of the nose while pinching.",
      "Once stopped, avoid blowing your nose, bending over, or heavy activity for a few hours.",
    ],
    tip: "Seek care if it doesn't stop after 30 minutes, follows a head injury, or recurs frequently.",
  },
  {
    cat: "First Aid", icon: "🦟", title: "Insect sting reaction",
    summary: "Remove the stinger fast, watch for allergic signs.",
    steps: [
      "Scrape the stinger out sideways with a credit card edge — don't use tweezers (squeezes venom).",
      "Wash the area with soap and water.",
      "Apply ice wrapped in a cloth for 10 minutes on, 10 off, to reduce swelling.",
      "Take an oral antihistamine (e.g. Benadryl) for itching and swelling.",
      "Elevate the affected limb if possible.",
    ],
    tip: "Call 911 immediately if the person develops throat swelling, difficulty breathing, dizziness, or hives spreading — this is anaphylaxis.",
  },
  {
    cat: "First Aid", icon: "🥵", title: "Heat exhaustion",
    summary: "Move to shade, hydrate, cool the skin urgently.",
    steps: [
      "Move the person to a cool, shaded, or air-conditioned place immediately.",
      "Loosen or remove tight, heavy clothing.",
      "Apply cool, wet cloths to skin — especially neck, armpits, and groin.",
      "Give cool water or a sports drink to sip slowly if they are conscious.",
      "Fan them and continue cooling until help arrives or symptoms ease.",
    ],
    tip: "If confusion, loss of consciousness, or high fever (>104°F) develops — that is heat stroke. Call 911 immediately.",
  },
  {
    cat: "First Aid", icon: "🤢", title: "Choking — Heimlich manoeuvre",
    summary: "Hard abdominal thrusts can dislodge a blockage.",
    steps: [
      "Stand behind the person and wrap your arms around their waist.",
      "Make a fist with one hand, thumb side in, just above the belly button.",
      "Grasp your fist with the other hand.",
      "Give firm, upward inward thrusts — repeat up to 5 times.",
      "Alternate with 5 back blows between the shoulder blades if thrusts fail.",
    ],
    tip: "If the person becomes unconscious, lower them to the floor and call 911 — start CPR if trained.",
  },

  // ── Prevention ──
  {
    cat: "Prevention", icon: "🧼", title: "Handwashing that actually works",
    summary: "20 seconds with soap and water stops most common illnesses.",
    steps: [
      "Wet hands with clean running water (warm or cold).",
      "Apply soap and lather well — back of hands, between fingers, under nails.",
      "Scrub for at least 20 seconds (hum 'Happy Birthday' twice).",
      "Rinse thoroughly under running water.",
      "Dry with a clean towel or air-dry; use the towel to turn off the tap.",
    ],
    tip: "Wash before eating, after using the bathroom, after coughing/sneezing, and after touching animals or garbage.",
  },
  {
    cat: "Prevention", icon: "💧", title: "Staying hydrated",
    summary: "Most adults need 8–10 cups of water daily — more in heat or illness.",
    steps: [
      "Drink a glass of water first thing every morning before coffee or food.",
      "Carry a refillable bottle — sip consistently rather than drinking large amounts at once.",
      "Eat water-rich foods: cucumber, watermelon, oranges, lettuce.",
      "Check urine colour — pale yellow means well-hydrated; dark yellow means drink more.",
      "Increase intake when exercising, in hot weather, or when sick with fever.",
    ],
    tip: "Caffeinated drinks count but less efficiently — for every 2 cups of coffee, add an extra cup of water.",
  },
  {
    cat: "Prevention", icon: "😴", title: "Sleep hygiene basics",
    summary: "7–9 hours of quality sleep is your immune system's best friend.",
    steps: [
      "Go to bed and wake at the same time every day — including weekends.",
      "Keep the bedroom cool (65–68°F), dark, and quiet.",
      "Avoid screens for 30–60 min before bed — blue light suppresses melatonin.",
      "Avoid caffeine after 2 pm and heavy meals within 3 hours of sleep.",
      "If you can't sleep after 20 minutes, get up and do something calm until drowsy.",
    ],
    tip: "Chronic poor sleep raises the risk of heart disease, diabetes, obesity, and mental health conditions.",
  },
  {
    cat: "Prevention", icon: "🫁", title: "Prevent respiratory illness spread",
    summary: "Simple habits stop colds, flu, and COVID-like illnesses.",
    steps: [
      "Cover coughs and sneezes with the inside of your elbow — not your hand.",
      "Wear a mask in crowded enclosed spaces during high illness seasons.",
      "Ventilate rooms: open windows when possible, avoid recirculated air.",
      "Stay home when symptomatic — even a short absence cuts spread dramatically.",
      "Clean high-touch surfaces (phones, door handles, light switches) with disinfectant wipes daily.",
    ],
    tip: "Annual flu shots and staying up to date on vaccines are the highest-impact prevention steps.",
  },
  {
    cat: "Prevention", icon: "☀️", title: "Sun safety & skin care",
    summary: "Skin cancer is the most common US cancer — and mostly preventable.",
    steps: [
      "Apply SPF 30+ broad-spectrum sunscreen 15 min before going outside, every day.",
      "Reapply every 2 hours when outdoors, or after swimming/sweating.",
      "Wear protective clothing, a wide-brimmed hat, and UV-blocking sunglasses.",
      "Seek shade between 10am–4pm when UV rays are strongest.",
      "Examine your skin monthly — new moles, asymmetric shapes, or colour changes need a provider.",
    ],
    tip: "Even on cloudy days, 80% of UV rays reach the skin — make sunscreen a daily habit year-round.",
  },

  {
    cat: "Prevention", icon: "🦷", title: "Dental hygiene basics",
    summary: "Good dental habits prevent cavities, gum disease, and costly procedures.",
    steps: [
      "Brush twice daily for 2 minutes with a soft-bristle toothbrush and fluoride toothpaste.",
      "Replace your toothbrush every 3–4 months, or sooner if bristles are frayed — worn bristles clean far less effectively.",
      "Never share toothbrushes — they transfer bacteria and viruses between people.",
      "Store your toothbrush upright in open air, not in a closed container, so it dries between uses.",
      "Floss once daily — slide gently between each tooth in a C-shape, going below the gumline. Use a fresh section for each gap.",
    ],
    tip: "Not flossing leaves up to 40% of tooth surfaces uncleaned. Over time this leads to plaque buildup, gum inflammation (gingivitis), bone loss, and tooth loss — and has been linked to heart disease and diabetes.",
  },

  // ── Nutrition ──
  {
    cat: "Nutrition", icon: "🥦", title: "Eating for immunity",
    summary: "Specific foods measurably strengthen your immune response.",
    steps: [
      "Eat a rainbow: orange/red produce (bell peppers, carrots) is high in vitamin C and beta-carotene.",
      "Include zinc-rich foods weekly: beans, nuts, seeds, whole grains, lean meat.",
      "Add fermented foods for gut health: yoghurt, kefir, kimchi, sauerkraut.",
      "Limit ultra-processed foods — they trigger inflammation and weaken immune cells.",
      "Aim for 5 servings of fruits and vegetables daily — frozen counts and costs less.",
    ],
    tip: "Vitamin D deficiency is widespread and linked to poor immunity — ask your provider about a simple blood test.",
  },
  {
    cat: "Nutrition", icon: "🩸", title: "Managing blood sugar without medication",
    summary: "Small food and lifestyle changes have big effects on glucose.",
    steps: [
      "Choose whole grains over white bread/rice — they digest slower and spike blood sugar less.",
      "Pair carbs with protein or healthy fat at every meal to slow absorption.",
      "Eat smaller, more frequent meals rather than one or two large ones.",
      "Walk for 10–15 minutes after meals — movement uses glucose before it accumulates.",
      "Limit sugary drinks: one soda can raise blood sugar for 2+ hours.",
    ],
    tip: "If you have pre-diabetes, losing just 5–7% of body weight can reduce progression to diabetes by 58%.",
  },
  {
    cat: "Nutrition", icon: "❤️", title: "Heart-healthy eating habits",
    summary: "Most heart disease is preventable through consistent small choices.",
    steps: [
      "Replace saturated fats (butter, fatty meat) with unsaturated fats: olive oil, avocado, nuts.",
      "Eat fatty fish (salmon, sardines, mackerel) twice a week for omega-3s.",
      "Reduce sodium: cook at home, read labels, limit processed/canned foods.",
      "Increase fibre: oats, beans, flaxseed, and apples lower LDL cholesterol.",
      "Limit added sugar to under 25g/day for women and 36g/day for men.",
    ],
    tip: "The DASH and Mediterranean diets both have strong evidence behind heart health — neither requires expensive food.",
  },

  // ── Mental Health ──
  {
    cat: "Mental Health", icon: "🧘", title: "Breathing to calm anxiety",
    summary: "Controlled breathing activates your parasympathetic nervous system in minutes.",
    steps: [
      "Try box breathing: inhale 4 counts → hold 4 → exhale 4 → hold 4. Repeat 4 cycles.",
      "Or 4-7-8 breathing: inhale 4 → hold 7 → exhale slowly 8. Powerful for acute anxiety.",
      "Breathe from the belly, not the chest — place a hand on your stomach to check.",
      "Do this before a stressful event, during one, or to fall asleep.",
      "Pair with progressive muscle relaxation: tense then release muscle groups from toes to face.",
    ],
    tip: "Even 2 minutes of slow breathing lowers cortisol and heart rate — it works whether or not you believe it will.",
  },
  {
    cat: "Mental Health", icon: "🏃", title: "Exercise as medicine for mood",
    summary: "30 minutes of moderate activity is clinically comparable to antidepressants for mild–moderate depression.",
    steps: [
      "Start with 10-minute walks — even a short walk after meals lifts mood measurably.",
      "Choose movement you enjoy: dancing, gardening, cycling, swimming — adherence matters more than type.",
      "Exercise outside when possible — natural light boosts serotonin additionally.",
      "Aim for 150 min/week of moderate activity (brisk walk, cycling) or 75 min vigorous.",
      "Consistency over intensity: 5 days of 30 min beats 1 day of 2.5 hours.",
    ],
    tip: "Physical activity reduces risk of depression by 35%, anxiety by 48%, and dementia by up to 30% (WHO, 2023).",
  },
  {
    cat: "Mental Health", icon: "🗣️", title: "Talking about mental health",
    summary: "Naming what you feel is the first step to managing it.",
    steps: [
      "Name the emotion specifically — not just 'bad' but 'anxious', 'ashamed', 'lonely'. Specificity helps.",
      "Write it down: journaling for 15 min/day about thoughts and feelings reduces symptoms of depression.",
      "Talk to someone safe — a trusted friend, family member, or community leader.",
      "Use free or low-cost resources: Crisis Text Line (text HOME to 741741), NAMI Helpline 1-800-950-6264.",
      "If cost is a barrier, FQHCs (see No Insurance tab) offer behavioural health on sliding-scale fees.",
    ],
    tip: "Asking for help is not weakness — untreated mental health conditions worsen physical health outcomes and vice versa.",
  },
  {
    cat: "Mental Health", icon: "📵", title: "Digital detox & screen fatigue",
    summary: "Intentional screen breaks reduce stress, improve focus, and help sleep.",
    steps: [
      "Set a hard stop for social media: 30 min/day maximum has measurable mood benefits.",
      "Enable grayscale mode on your phone — colour is deliberately engaging; grey is not.",
      "Create 'phone-free' zones: the bedroom and dinner table.",
      "Take a 20-20-20 eye break: every 20 min, look at something 20 feet away for 20 seconds.",
      "Replace one 30-min scroll session per day with a walk, stretch, or 5-min breathing exercise.",
    ],
    tip: "Teens who use social media 5+ hours/day are 3× more likely to report depression (CDC, 2023). Limits apply to adults too.",
  },

  // ── Know When to Go ──
  {
    cat: "Know When to Go", icon: "🚨", title: "Call 911 immediately for these",
    summary: "Don't drive yourself — seconds matter.",
    steps: [
      "Chest pain, pressure, or tightening — especially with jaw, arm, or back pain.",
      "Sudden difficulty breathing or shortness of breath at rest.",
      "Signs of stroke: Face drooping, Arm weakness, Speech difficulty, Time to call (FAST).",
      "Severe allergic reaction: throat swelling, hives spreading rapidly, wheezing.",
      "Uncontrolled bleeding, unconsciousness, or seizure lasting more than 5 minutes.",
    ],
    tip: "When in doubt, call 911 — it is always better to be evaluated and sent home than to wait on a life-threatening emergency.",
  },
  {
    cat: "Know When to Go", icon: "🏥", title: "Urgent care vs. ER — which to choose",
    summary: "Urgent care is faster and cheaper for non-life-threatening issues.",
    steps: [
      "Urgent care: minor cuts needing stitches, UTIs, ear infections, sprains, mild fever, rashes.",
      "ER: chest pain, head injury, severe abdominal pain, broken bones, high fever in infants, strokes.",
      "Telehealth: prescription refills, mild colds, mental health check-ins, minor skin concerns.",
      "Primary care (next-day): ongoing conditions, routine prescriptions, annual physicals.",
      "Nurse hotlines (free): many insurers offer 24/7 nurse lines — check your plan.",
    ],
    tip: "Going to the ER for an urgent-care issue can cost 5–10× more. Use the No Insurance tab to find FQHCs that offer both walk-in and urgent care.",
  },
  {
    cat: "Know When to Go", icon: "🌡️", title: "Fever: when to treat and when to worry",
    summary: "Most fevers are your immune system working — but some need urgent attention.",
    steps: [
      "Adults: fever under 103°F — rest, fluids, acetaminophen or ibuprofen as directed.",
      "Adults: fever 103°F+ lasting more than 2 days or with stiff neck, rash, confusion → ER.",
      "Children under 3 months: any fever over 100.4°F → go to the ER immediately.",
      "Children 3 months–3 years: fever over 102.2°F lasting more than 2 days → provider.",
      "Never give aspirin to children — Reye's syndrome risk. Use children's acetaminophen or ibuprofen.",
    ],
    tip: "Fever itself isn't dangerous below 104°F in adults — but dehydration from fever is. Keep fluids going.",
  },
  {
    cat: "Know When to Go", icon: "📋", title: "Annual health checklist by age",
    summary: "Preventive screenings catch problems before they become expensive emergencies.",
    steps: [
      "All adults annually: blood pressure, weight/BMI, dental cleaning, vision check.",
      "Adults 18–39: STI screening if sexually active, mental health screen, skin check.",
      "Adults 40–64: cholesterol panel, blood glucose/diabetes screening, colorectal cancer screen (45+), mammogram (women 40+).",
      "Adults 65+: bone density scan, annual flu shot, pneumonia vaccine, hearing and vision.",
      "All ages: keep vaccinations current — flu annually, COVID boosters per CDC guidance, Tdap every 10 years.",
    ],
    tip: "Many FQHCs and community clinics provide all these screenings on a sliding scale — see the No Insurance tab.",
  },
];

export default function NovaHealth() {
  const [theme, setTheme] = useState("light");
  const [tab, setTab] = useState("home");
  const t = THEMES[theme];

  return (
    <div style={{ background: t.bg, color: "#000000", minHeight: "100vh", fontFamily: "system-ui, sans-serif", transition: "background 0.2s, color 0.2s" }}>
      <TopBar t={t} theme={theme} setTheme={setTheme} tab={tab} setTab={setTab} />
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px 60px" }}>
        {tab === "home" && <HomeTab t={t} setTab={setTab} />}
        {tab === "insurance" && <InsuranceTab t={t} />}
        {tab === "noinsurance" && <NoInsuranceTab t={t} />}
        {tab === "urgent" && <UrgentTab t={t} />}
        {tab === "costs"  && <ManageCareCosts t={t} />}
        {tab === "learn"  && <LearnTab  t={t} />}
      </div>
    </div>
  );
}

// ---------- Top nav ----------
function TopBar({ t, theme, setTheme, tab, setTab }) {
  return (
    <div style={{ borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, background: t.bg, zIndex: 10 }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Nova Health</div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 13,
                color: tab === tb.id ? t.accent : t.sub,
                fontWeight: tab === tb.id ? 700 : 400,
                padding: "4px 0",
                borderBottom: tab === tb.id ? `2px solid ${t.accent}` : "2px solid transparent",
                transition: "border-color 150ms, color 150ms",
              }}
            >
              {tb.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, border: `1px solid ${t.border}`, borderRadius: 8, padding: 3 }}>
          <ThemeBtn active={theme === "light"} onClick={() => setTheme("light")} icon={Sun} t={t} label="Light" />
          <ThemeBtn active={theme === "dark"} onClick={() => setTheme("dark")} icon={Moon} t={t} label="Dark" />
          <ThemeBtn active={theme === "colorblind"} onClick={() => setTheme("colorblind")} icon={Eye} t={t} label="Color-blind" />
        </div>
      </div>
    </div>
  );
}

function ThemeBtn({ active, onClick, icon: Icon, t, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "5px 8px", borderRadius: 6,
        border: "none", cursor: "pointer", background: active ? t.accentBg : "transparent", color: active ? t.accent : t.sub,
      }}
    >
      <Icon size={13} />
    </button>
  );
}

// ---------- Home / chat tab (real AI call) ----------
const NAV_CARDS = [
  { id: "insurance",   label: "Insurance lens",  desc: "Find providers by specialty, language & accessibility.",  color: "teal"  },
  { id: "noinsurance", label: "No insurance",    desc: "Free clinics, Medicaid, and financial aid near you.",     color: "amber" },
  { id: "urgent",      label: "Urgent help",     desc: "Photo analysis and voice emergency summary tools.",       color: "coral" },
  { id: "costs",       label: "Manage costs",    desc: "Understand care costs and manage your payment plan.",     color: "pink"  },
  { id: "learn",       label: "Learn",           desc: "First aid guides, prevention tips, and when to seek care.", color: "accent" },
];

function HomeTab({ t, setTab }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I'm Nova. Tell me your symptoms or describe what's going on, and I'll help you understand it — not diagnose it, just help you figure out what questions to ask and where to go next." },
  ]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [listening,   setListening]   = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const [sttError,    setSttError]    = useState("");
  const scrollRef      = useRef(null);
  const recognitionRef = useRef(null);

  // Set up SpeechRecognition once
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSttSupported(false); return; }
    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";
    rec.onresult = (e) => {
      let final = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += chunk;
        else interim += chunk;
      }
      // Append committed text; show interim in-place via a temporary suffix
      setInput(prev => {
        const base = prev.replace(/\u200B.*$/, ""); // strip previous interim marker
        return base + final + (interim ? "\u200B" + interim : "");
      });
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") setSttError("Microphone access denied.");
      else if (e.error !== "aborted") setSttError("Speech error — please try again.");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) return;
    setSttError("");
    if (listening) {
      recognitionRef.current.stop();
      // Strip the zero-width-space interim marker on stop
      setInput(prev => prev.replace(/\u200B.*$/, ""));
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // async function send() {
  //   // Strip interim marker before sending
  //   const text = input.replace(/\u200B.*$/, "").trim();
  //   if (!text || loading) return;
  //   if (listening) { recognitionRef.current?.stop(); setListening(false); }
  //   const userMsg = { role: "user", text };
  //   const next = [...messages, userMsg];
  //   setMessages(next);
  //   setInput("");
  //   setLoading(true);
  //   try {
  //     const res = await fetch("http://localhost:5001/api/chat", {
  //     //fetch("https://api.anthropic.com/v1/messages", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         model: "claude-sonnet-4-6",
  //         max_tokens: 400,
  //         system:
  //           "You are Nova, a warm, plain-language health information companion inside an app for people who may not have insurance. " +
  //           "You are NOT a doctor and must never diagnose or prescribe. Help the person understand possible explanations for a symptom in general terms, " +
  //           "suggest what to watch for, and always end by suggesting whether this sounds like something to monitor, something for a routine visit, " +
  //           "or something urgent. Keep responses under 120 words, conversational, no medical jargon without explaining it.",
  //         messages: next.map((m) => ({ role: m.role, content: m.text })),
  //       }),
  //     });
  //     const data = await res.json();
  //     const text2 = data?.content?.find((c) => c.type === "text")?.text || "Sorry, I couldn't process that just now.";
  //     setMessages((cur) => [...cur, { role: "assistant", text: text2 }]);
  //   } catch {
  //     setMessages((cur) => [...cur, { role: "assistant", text: "Something went wrong reaching Nova. Please try again." }]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  async function send() {
  const text = input.replace(/\u200B.*$/, "").trim();

  if (!text || loading) return;

  if (listening) {
    recognitionRef.current?.stop();
    setListening(false);
  }

  const userMsg = {
    role: "user",
    text,
  };

  const next = [...messages, userMsg];

  setMessages(next);
  setInput("");
  setLoading(true);

  try {
    //const response = await fetch("http://localhost:5001/api/chat", {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "symptoms",
        messages: next.map((message) => ({
          role: message.role,
          content: message.text,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Nova could not respond.");
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "assistant",
        text: data.message,
      },
    ]);
  } catch (error) {
    console.error("Nova frontend error:", error);

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "assistant",
        text:
          error.message ||
          "Something went wrong reaching Nova. Please try again.",
      },
    ]);
  } finally {
    setLoading(false);
  }
}

  // Displayed value: render interim portion (after \u200B) in muted italic via a layered approach.
  // Since <input> can't style substrings, we split into committed + interim for the placeholder hint.
  const zeroWidthIdx = input.indexOf("\u200B");
  const committedText = zeroWidthIdx >= 0 ? input.slice(0, zeroWidthIdx) : input;
  const interimHint   = zeroWidthIdx >= 0 ? input.slice(zeroWidthIdx + 1) : "";

  return (
    <div>
      {/* Nav cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        {NAV_CARDS.map(({ id, label, desc, color }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              textAlign: "left", cursor: "pointer", border: `1px solid ${t.border}`,
              borderRadius: 12, padding: "14px 14px 12px",
              background: t[color + "Bg"] || t.panel,
              transition: "opacity 150ms",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#000000", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.4 }}>{desc}</div>
            <div style={{ fontSize: 13, color: t.sub, marginTop: 8 }}>→</div>
          </button>
        ))}
      </div>

      <div style={{ background: t.amberBg, borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: t.amber, display: "flex", alignItems: "center", gap: 8 }}>
        <strong>26.7 million</strong>&nbsp;people are uninsured in the US — the No Insurance tab has clinics, Medicaid, and financial aid resources near you.
      </div>
      <div style={{ border: `1px solid ${t.border}`, borderRadius: 14, padding: 18, minHeight: 380, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, maxHeight: 420, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "78%", background: m.role === "user" ? t.accentBg : t.panel,
              color: m.role === "user" ? t.accent : t.ink, padding: "10px 14px", borderRadius: 14,
              borderBottomRightRadius: m.role === "user" ? 4 : 14, borderBottomLeftRadius: m.role === "user" ? 14 : 4,
              fontSize: 13.5, lineHeight: 1.5,
            }}>
              {m.text}
            </div>
          ))}
          {loading && <div style={{ fontSize: 12, color: t.mute, display: "flex", alignItems: "center", gap: 6 }}><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Nova is thinking…</div>}
          <div ref={scrollRef} />
        </div>

        {/* Input row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Listening indicator + interim preview */}
          {listening && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: t.coral }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.coral, display: "inline-block", animation: "homePulse 900ms ease-in-out infinite" }} aria-hidden="true" />
              {interimHint
                ? <span>Hearing: <em style={{ color: t.mute }}>{interimHint}</em></span>
                : <span>Listening… speak now</span>}
            </div>
          )}
          {sttError && (
            <div role="alert" style={{ fontSize: 12, color: t.coral }}>{sttError}</div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            {/* Text input — shows committed text only; interim shown above */}
            <input
              value={committedText}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={listening ? "Speak — or type here…" : "Describe what's going on..."}
              aria-label="Message to Nova"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 13,
                border: `1px solid ${listening ? t.coral : t.border}`,
                background: t.bg, color: t.ink,
                outline: "none",
                transition: "border-color 200ms ease-out",
              }}
            />

            {/* Mic button — only rendered if STT is supported */}
            {sttSupported && (
              <button
                onClick={toggleListening}
                aria-label={listening ? "Stop dictation" : "Dictate message"}
                aria-pressed={listening}
                title={listening ? "Stop dictation" : "Dictate message"}
                style={{
                  width: 42, height: 42, borderRadius: 10, border: "none", cursor: "pointer", flexShrink: 0,
                  background: listening ? t.coral : t.panel,
                  color: listening ? "#fff" : t.sub,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: listening ? `0 0 0 3px ${t.coral}40` : "none",
                  transition: "background 180ms ease-out, box-shadow 180ms ease-out",
                }}
              >
                {listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
            )}

            <button
              onClick={send}
              disabled={loading}
              style={{ background: t.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}
            >
              <Send size={14} /> Send
            </button>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 11, color: t.mute, marginTop: 10 }}>
        Nova gives general information, not a diagnosis. In an emergency, use the Urgent tab or call emergency services directly.
      </p>
      <style>{`@keyframes homePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }`}</style>
    </div>
  );
}

// ─── Insurance lens animation styles ─────────────────────────────────────────
const IL_STYLES = `
  @keyframes il-fadein  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes il-slidein { from { opacity:0; transform:translateX(-10px);} to { opacity:1; transform:translateX(0); } }
  @keyframes il-pop     { 0%{transform:scale(0.94);opacity:0} 60%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
  @keyframes il-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }

  .il-fadein  { animation: il-fadein  240ms ease-out both; }
  .il-slidein { animation: il-slidein 200ms ease-out both; }
  .il-pop     { animation: il-pop     260ms ease-out both; }

  /* Stagger delays — up to 12 items */
  .il-d0{animation-delay:0ms}   .il-d1{animation-delay:50ms}
  .il-d2{animation-delay:100ms} .il-d3{animation-delay:150ms}
  .il-d4{animation-delay:200ms} .il-d5{animation-delay:250ms}
  .il-d6{animation-delay:300ms} .il-d7{animation-delay:350ms}
  .il-d8{animation-delay:400ms} .il-d9{animation-delay:450ms}
  .il-d10{animation-delay:500ms}.il-d11{animation-delay:550ms}

  /* Provider cards — lift on hover */
  .il-card {
    transition: transform 200ms ease-out, box-shadow 200ms ease-out;
  }
  .il-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.10); }
  .il-card:focus-within { outline: 3px solid; outline-offset: 3px; }

  /* Filter pills + toggles */
  .il-pill {
    transition: background 160ms ease-out, border-color 160ms ease-out,
                color 160ms ease-out, transform 140ms ease-out;
  }
  .il-pill:hover  { transform: scale(1.05); }
  .il-pill:active { transform: scale(0.97); }
  .il-pill:focus  { outline: 3px solid; outline-offset: 2px; }

  /* Star rating buttons */
  .il-star {
    transition: transform 150ms ease-out;
  }
  .il-star:hover { transform: scale(1.3); }

  /* Accordion body */
  .il-accordion { animation: il-fadein 200ms ease-out both; }

  /* Age gate card */
  .il-agegate { animation: il-pop 300ms ease-out both; }

  /* Rated confirmation pulse */
  @keyframes il-rated { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1)} }
  .il-rated { animation: il-rated 300ms ease-out; }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .il-fadein,.il-slidein,.il-pop,.il-card,.il-pill,.il-star,
    .il-accordion,.il-agegate,.il-rated {
      animation: none !important;
      transition: none !important;
    }
  }
`;

// ---------- Insurance lens tab ----------
function InsuranceTab({ t }) {
  // Age gate
  const [ageConfirmed, setAgeConfirmed] = useState(null); // null | true | false

  // Filters
  const [zip,          setZip]          = useState("");
  const [zipError,     setZipError]     = useState(false);
  const [cityType,     setCityType]     = useState("all");    // all | downtown | rural
  const [specialty,    setSpecialty]    = useState("All");
  const [diversity,    setDiversity]    = useState("all");
  const [gender,       setGender]       = useState("all");
  const [language,     setLanguage]     = useState("all");
  const [insurance,    setInsurance]    = useState("all");    // all | low | medium | high
  const [aslOnly,      setAslOnly]      = useState(false);
  const [phoneOnly,    setPhoneOnly]    = useState(false);
  const [elevator,     setElevator]     = useState(false);
  const [ramp,         setRamp]         = useState(false);
  const [transport,    setTransport]    = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [nonprofit,    setNonprofit]    = useState(false);
  const [ratings,      setRatings]      = useState({});       // providerId -> 1-5
  const [showResources, setShowResources] = useState(false);
  const [resCat,       setResCat]       = useState("All");
  const [filterKey,    setFilterKey]    = useState(0);        // bumped to re-trigger card stagger
  const [ratedName,    setRatedName]    = useState("");       // triggers rated pulse

  // ── Age gate screen ──
  if (ageConfirmed === null) {
    return (
      <>
        <style>{IL_STYLES}</style>
        <div className="il-agegate" style={{ maxWidth: 460, margin: "60px auto", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🛡️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Insurance Lens</h2>
          <p style={{ fontSize: 14, color: t.sub, lineHeight: 1.7, marginBottom: 28 }}>
            This section contains health insurance and provider information intended for adults.<br />
            Are you 18 or older?
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => setAgeConfirmed(true)}
              className="il-pill"
              style={{ padding: "11px 32px", borderRadius: 10, background: t.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Yes, I'm 18+
            </button>
            <button onClick={() => setAgeConfirmed(false)}
              className="il-pill"
              style={{ padding: "11px 32px", borderRadius: 10, background: t.panel, color: t.sub, border: `1px solid ${t.border}`, fontSize: 14, cursor: "pointer" }}>
              No, I'm under 18
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Under-18 redirect ──
  if (ageConfirmed === false) {
    return (
      <>
        <style>{IL_STYLES}</style>
        <div className="il-agegate" style={{ maxWidth: 460, margin: "60px auto", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Resources for you</h2>
          <p style={{ fontSize: 13, color: t.sub, lineHeight: 1.7, marginBottom: 20 }}>
            If you're under 18, CHIP and Medicaid cover most children at no or low cost.<br />
            Check the <strong>No Insurance</strong> tab for the Children (0–18) age group — it has the right resources for you.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/" target="_blank" rel="noopener noreferrer"
              className="il-pill"
              style={{ padding: "10px 22px", borderRadius: 10, background: t.tealBg, color: t.teal, border: `1px solid ${t.teal}`, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              CHIP — Children's Insurance →
            </a>
            <button onClick={() => setAgeConfirmed(null)}
              className="il-pill"
              style={{ padding: "10px 22px", borderRadius: 10, background: "none", border: `1px solid ${t.border}`, color: t.sub, fontSize: 13, cursor: "pointer" }}>
              Back
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Filter logic ──
  function handleZip(e) {
    const v = e.target.value.replace(/\D/g, "").slice(0, 5);
    setZip(v);
    setZipError(v.length > 0 && v.length < 5);
    if (v.length === 5 || v.length === 0) setFilterKey(k => k + 1);
  }

  function applyFilter(setter, value) {
    setter(value);
    setFilterKey(k => k + 1);
  }

  // Resolve the entered ZIP to a state code (null if ZIP incomplete/unknown)
  const zipState = zip.length === 5 ? zipToState(zip) : null;
  const zipStateName = zipState ? STATE_NAMES[zipState] : null;

  const filtered = IL_PROVIDERS.filter(p => {
    // ZIP → state match: only show providers from the resolved state
    if (zipState && p.state !== zipState) return false;
    if (specialty !== "All" && p.specialty !== specialty) return false;
    if (insurance !== "all" && p.insurance !== insurance) return false;
    if (gender !== "all" && p.gender !== gender && p.gender !== "Mixed") return false;
    if (language !== "all" && !p.languages.includes(language)) return false;
    if (aslOnly && !p.asl) return false;
    if (phoneOnly && !p.phone) return false;
    if (elevator && !p.accessibility.includes("elevator")) return false;
    if (ramp && !p.accessibility.includes("ramp")) return false;
    if (transport && !p.accessibility.includes("transportation")) return false;
    if (verifiedOnly && !p.verified) return false;
    if (nonprofit && !p.nonprofit) return false;
    if (cityType === "rural" && !p.tags.includes("Rural")) return false;
    if (cityType === "downtown" && p.tags.includes("Rural")) return false;
    return true;
  });

  const resCats = ["All", "Government", "Community Clinic", "Nonprofit"];
  const filteredRes = IL_RESOURCES.filter(r => resCat === "All" || r.cat === resCat);

  const resCatStyle = {
    "Government":       { bg: "tealBg",   fg: "teal" },
    "Community Clinic": { bg: "accentBg", fg: "accent" },
    "Nonprofit":        { bg: "amberBg",  fg: "amber" },
  };

  const pill = (label, active, onClick) => (
    <button key={label} onClick={onClick} aria-pressed={active}
      className="il-pill"
      style={{
        borderRadius: 16, padding: "5px 13px", fontSize: 12, cursor: "pointer",
        background: active ? t.accentBg : t.panel,
        color: active ? t.accent : t.sub,
        fontWeight: active ? 700 : 400,
        border: `${active ? "2px" : "1px"} solid ${active ? t.accent : t.border}`,
      }}>{label}</button>
  );

  const toggle = (label, value, setValue, icon) => (
    <button key={label} onClick={() => { setValue(v => !v); setFilterKey(k => k + 1); }} aria-pressed={value}
      className="il-pill"
      style={{
        borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
        background: value ? t.tealBg : t.panel,
        color: value ? t.teal : t.sub,
        border: `${value ? "2px" : "1px"} solid ${value ? t.teal : t.border}`,
        fontWeight: value ? 700 : 400,
      }}>
      <span aria-hidden="true">{icon}</span> {label}
    </button>
  );

  return (
    <div>
      <style>{IL_STYLES}</style>

      {/* Back to age gate */}
      <div className="il-fadein il-d0" style={{ marginBottom: 12 }}>
        <button onClick={() => setAgeConfirmed(null)} className="il-pill"
          style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: t.sub, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
          ← Back
        </button>
      </div>

      <h2 className="il-fadein il-d1" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Insurance Lens</h2>
      <p className="il-fadein il-d2" style={{ fontSize: 13, color: t.sub, marginBottom: 18 }}>
        Find providers and resources that match your location, coverage, and accessibility needs — across the entire US market.
      </p>

      {/* ── Filter panel ── */}
      <div className="il-fadein il-d3" style={{ background: t.panel, borderRadius: 12, padding: "14px 16px", marginBottom: 20, border: `1px solid ${t.border}` }}>

        {/* Row 1: Location */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Location</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: t.mute }}>ZIP code</label>
              <input type="text" inputMode="numeric" placeholder="e.g. 90210" value={zip} onChange={handleZip} maxLength={5}
                style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${zipError ? t.coral : t.border}`, background: t.bg, color: t.ink, fontSize: 13, width: 110 }} />
              {zipError && <span role="alert" style={{ fontSize: 11, color: t.coral }}>⚠ 5 digits needed</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, color: t.mute }}>Community type</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["all","All areas"],["downtown","Downtown / Urban"],["rural","Rural"]].map(([id, lbl]) =>
                  pill(lbl, cityType === id, () => applyFilter(setCityType, id))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Specialty + Insurance level */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Specialty</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {IL_SPECIALTIES.map(s => pill(s, specialty === s, () => applyFilter(setSpecialty, s)))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Insurance level</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["all","Any"],["low","Low cost"],["medium","Medium"],["high","Full coverage"]].map(([id, lbl]) =>
                pill(lbl, insurance === id, () => applyFilter(setInsurance, id))
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Diversity / Gender / Language */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Diversity</label>
            <select value={diversity} onChange={e => applyFilter(setDiversity, e.target.value)}
              style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
              {[["all","Everyone"],["Black","Black / African American"],["Latino","Hispanic / Latino"],["Indigenous","Indigenous / Native American"],["Asian","Asian / Pacific Islander"],["LGBTQ+","LGBTQ+"]].map(([id, lbl]) =>
                <option key={id} value={id}>{lbl}</option>
              )}
            </select>
          </div>
          <div style={{ flex: "1 1 120px", display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Gender</label>
            <select value={gender} onChange={e => applyFilter(setGender, e.target.value)}
              style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
              {[["all","Everyone"],["Female","Female"],["Male","Male"],["Mixed","Non-binary / Mixed"]].map(([id, lbl]) =>
                <option key={id} value={id}>{lbl}</option>
              )}
            </select>
          </div>
          <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Language</label>
            <select value={language} onChange={e => applyFilter(setLanguage, e.target.value)}
              style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
              {[["all","All languages"],["English","English"],["Spanish","Spanish / Español"],["Mandarin","Mandarin"],["Hindi","Hindi"],["French","French"],["Twi","Twi"],["Yoruba","Yoruba"]].map(([id, lbl]) =>
                <option key={id} value={id}>{lbl}</option>
              )}
            </select>
          </div>
        </div>

        {/* Row 4: Accessibility + Provider toggles */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Accessibility &amp; Provider</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {toggle("Elevator", elevator, setElevator, "🛗")}
            {toggle("Ramp / Step-free", ramp, setRamp, "♿")}
            {toggle("Transportation help", transport, setTransport, "🚌")}
            {toggle("ASL interpreter", aslOnly, setAslOnly, "🤟")}
            {toggle("Phone consult", phoneOnly, setPhoneOnly, "📞")}
            {toggle("Verified provider", verifiedOnly, setVerifiedOnly, "✓")}
            {toggle("Nonprofit only", nonprofit, setNonprofit, "●")}
          </div>
        </div>
      </div>

      {/* ── ZIP state indicator ── */}
      {zip.length === 5 && (
        <div className="il-slidein" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          {zipStateName ? (
            <>
              <span style={{ color: t.teal, fontWeight: 700 }}>📍 Showing providers in {zipStateName} (ZIP {zip})</span>
              <button onClick={() => { setZip(""); setFilterKey(k => k + 1); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: t.mute, fontSize: 11, textDecoration: "underline", padding: 0 }}>
                Clear
              </button>
            </>
          ) : (
            <span style={{ color: t.amber, fontWeight: 600 }}>
              ⚠ ZIP {zip} not recognised — showing all providers. Try a different ZIP.
            </span>
          )}
        </div>
      )}

      {/* ── Provider results ── */}
      <div className="il-slidein il-d3" style={{ fontSize: 12, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Providers {zipStateName ? `in ${zipStateName}` : ""}</span>
        <span style={{ fontWeight: 400, fontSize: 11, color: t.mute }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div key={`providers-${filterKey}`} style={{ display: "grid", gap: 10, marginBottom: 28 }}>
        {filtered.map((p, i) => {
          const userRating = ratings[p.name];
          return (
            <div key={p.name}
              className={`il-card il-fadein il-d${Math.min(i, 11)}`}
              style={{ background: t.panel, borderRadius: 12, padding: "14px 16px", border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                {/* Left: name, specialty, meta */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                    {p.verified && (
                      <span title="Verified provider" style={{ fontSize: 10, background: t.tealBg, color: t.teal, borderRadius: 4, padding: "2px 7px", fontWeight: 700, border: `1px solid ${t.teal}` }}>✓ Verified</span>
                    )}
                    {p.nonprofit && (
                      <span style={{ fontSize: 10, background: t.amberBg, color: t.amber, borderRadius: 4, padding: "2px 7px", fontWeight: 700, border: `1px solid ${t.amber}` }}>● Nonprofit</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: t.sub, marginTop: 3 }}>
                    {p.specialty} · {p.distance}
                    {p.years && <span style={{ color: t.mute }}> · {p.years} yrs exp.</span>}
                    {p.gender !== "Mixed" && <span style={{ color: t.mute }}> · {p.gender}</span>}
                  </div>
                  {p.awards.length > 0 && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
                      {p.awards.map(a => (
                        <span key={a} style={{ fontSize: 10, background: t.pinkBg, color: t.pink, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.pink}` }}>🏆 {a}</span>
                      ))}
                    </div>
                  )}
                  {/* Languages + accessibility chips */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
                    {p.asl && <span style={{ fontSize: 10, background: t.accentBg, color: t.accent, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.accent}` }}>🤟 ASL</span>}
                    {p.phone && <span style={{ fontSize: 10, background: t.accentBg, color: t.accent, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.accent}` }}>📞 Phone</span>}
                    {p.accessibility.includes("elevator") && <span style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>🛗 Elevator</span>}
                    {p.accessibility.includes("ramp") && <span style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>♿ Ramp</span>}
                    {p.accessibility.includes("transportation") && <span style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>🚌 Transport</span>}
                    {p.languages.filter(l => l !== "English").map(l => (
                      <span key={l} style={{ fontSize: 10, background: t.panel, color: t.mute, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>{l}</span>
                    ))}
                  </div>
                </div>

                {/* Right: rating + insurance level */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: t.amber, fontSize: 13, fontWeight: 700 }}>
                    <Star size={13} fill={t.amber} stroke="none" /> {p.rating}
                  </div>
                  <div style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
                    background: p.insurance === "low" ? t.tealBg : p.insurance === "medium" ? t.amberBg : t.pinkBg,
                    color:      p.insurance === "low" ? t.teal   : p.insurance === "medium" ? t.amber   : t.pink,
                    border: `1px solid ${p.insurance === "low" ? t.teal : p.insurance === "medium" ? t.amber : t.pink}`,
                  }}>
                    {p.insurance === "low" ? "Low cost" : p.insurance === "medium" ? "Mid coverage" : "Full coverage"}
                  </div>
                </div>
              </div>

              {/* Rate my provider */}
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: t.mute }}>Rate this provider:</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star}
                      onClick={() => { setRatings(r => ({ ...r, [p.name]: star })); setRatedName(p.name); setTimeout(() => setRatedName(""), 350); }}
                      aria-label={`Rate ${p.name} ${star} star${star !== 1 ? "s" : ""}`}
                      className="il-star"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>
                      <Star size={15}
                        fill={userRating && star <= userRating ? t.amber : "none"}
                        stroke={userRating && star <= userRating ? t.amber : t.border} />
                    </button>
                  ))}
                </div>
                {userRating && (
                  <span className={ratedName === p.name ? "il-rated" : ""} style={{ fontSize: 11, color: t.teal }}>✓ Rated {userRating}/5</span>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ background: t.panel, borderRadius: 12, padding: "20px 16px", textAlign: "center", color: t.mute, fontSize: 13 }}>
            No providers match your current filters. Try broadening your search.
          </div>
        )}
      </div>

      {/* ── Medicare Physician Finder callout ── */}
      <div className="il-fadein il-d4" style={{
        background: t.tealBg, borderRadius: 12, border: `1px solid ${t.teal}`,
        padding: "14px 16px", marginBottom: 16, display: "flex", gap: 14, alignItems: "flex-start"
      }}>
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>🏥</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: t.teal, marginBottom: 4 }}>On Medicare? Use the official Physician Finder</div>
          <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.7, marginBottom: 10 }}>
            The <strong>Medicare Care Compare Physician Directory</strong> lets you search any Medicare-participating doctor by name, location, or specialty.
            Key filters: <strong>distance radius</strong>, <strong>medical specialty</strong>, <strong>group practice</strong>, and <strong>hospital affiliation</strong>.
            Look for the <em>"Medicare assignment"</em> status — doctors who accept assignment agree to charge only the Medicare-approved amount,
            which means lower out-of-pocket costs for you.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="https://www.medicare.gov/care-compare/?providerType=Physician"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: t.teal, borderRadius: 8, padding: "7px 16px", textDecoration: "none", display: "inline-block" }}>
              Find a Medicare Doctor →
            </a>
            <a href="https://www.medicare.gov/care-compare/"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 600, color: t.teal, background: "none", border: `1px solid ${t.teal}`, borderRadius: 8, padding: "7px 16px", textDecoration: "none", display: "inline-block" }}>
              Compare Hospitals &amp; Facilities →
            </a>
          </div>
        </div>
      </div>

      {/* ── Resources directory ── */}
      <div style={{ background: t.panel, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden", marginBottom: 16 }}>
        <button onClick={() => setShowResources(v => !v)} aria-expanded={showResources}
          style={{ width: "100%", background: "none", border: "none", padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: t.ink, display: "flex", alignItems: "center", gap: 7 }}>
            <span aria-hidden="true" style={{ color: t.accent }}>◈</span>
            Insurance &amp; Provider Resource Directory
          </span>
          <span style={{ color: t.mute, fontSize: 12, transition: "transform 200ms ease-out", transform: showResources ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
        </button>

        {showResources && (
          <div className="il-accordion" style={{ padding: "0 16px 16px" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {resCats.map(c => pill(c, resCat === c, () => setResCat(c)))}
            </div>
            <div key={`res-${resCat}`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {filteredRes.map((r, ri) => {
                const cs = resCatStyle[r.cat] || { bg: "panel", fg: "sub" };
                return (
                  <div key={r.link}
                    className={`il-card il-fadein il-d${Math.min(ri, 11)}`}
                    style={{ background: t[cs.bg], borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 6, borderLeft: `3px solid ${t[cs.fg]}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span aria-hidden="true" style={{ fontSize: 9, color: t[cs.fg] }}>{r.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: t[cs.fg], textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.cat}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: t.ink }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.6, flex: 1 }}>{r.body}</div>
                    <a href={r.link} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 600, color: t[cs.fg], textDecoration: "none", marginTop: 2 }}>
                      Open →
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Data sources ── */}
      <div style={{ fontSize: 11, color: t.mute, lineHeight: 1.7, paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
        Data &amp; references: BCBS Find Care · UnitedHealthcare Provider Directory · Aetna DocFind · Cigna HCP Directory · Health Net ProviderSearch ·
        Medicare Care Compare · HealthCare.gov Local Help · HRSA Find a Health Center · KFF Health Coverage by Gender · NIH/NIMHD Health Data Portal ·
        US Census Bureau P60-288 (2025) · CDC NCHS FastStats · AMA Physician Finder · MyHealthcareFinances.com (Triage Cancer &amp; Pfizer).
        💡 Network tiers can change — always call the provider's office directly to verify they still accept your exact sub-plan (e.g. Choice Plus, Select HMO, Open Access PPO).
      </div>
    </div>
  );
}

// ---------- No insurance tab ----------
// Sources: census.gov/SAHIE, KFF uninsured brief (2024), healthcare.gov,
//          medicaid.gov, unitedway.org, aspe.hhs.gov, dollarfor.org,
//          healthwellfoundation.org, USA.gov, hospital network financial-assistance pages

// All 48 contiguous states + DC (continental US)
const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" }, { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" }, { code: "DC", name: "Washington DC" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// Community types: drives HRSA search radius and context messaging
const COMMUNITY_TYPES = [
  { id: "any",      label: "Any community",  radius: 25, note: "" },
  { id: "downtown", label: "Downtown / Urban", radius: 5,  note: "Search radius: 5 miles — dense city center" },
  { id: "suburban", label: "Suburban",         radius: 15, note: "Search radius: 15 miles — suburban areas" },
  { id: "rural",    label: "Rural",            radius: 40, note: "Search radius: 40 miles — rural & frontier communities" },
];

// Build a location-aware HRSA Find a Health Center URL
function buildHrsaUrl({ zip, state, radius }) {
  const base = "https://findahealthcenter.hrsa.gov/";
  const params = new URLSearchParams();
  if (zip && /^\d{5}$/.test(zip.trim())) {
    params.set("zip", zip.trim());
    params.set("radius", String(radius));
  } else if (state) {
    params.set("state", state);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

// Build 211 URL (county/state aware)
function build211Url({ zip, state }) {
  if (zip && /^\d{5}$/.test(zip.trim())) return `https://www.211.org/search?zip=${zip.trim()}`;
  if (state) return `https://www.211.org/about-us/your-local-211?state=${state}`;
  return "https://www.211.org/";
}

// Build Medicaid eligibility URL by state
function buildMedicaidUrl(state) {
  if (!state) return "https://www.healthcare.gov/medicaid-chip/";
  return `https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/?state=${state}`;
}

const UNINSURED_STATS = {
  national: "9.8%",
  year: "2024",
  totalUninsured: "26.7 million",
  lowIncomeShare: "80%",
  workingFamiliesShare: "85%",
  colorShare: "64%",
  nonExpansionRate: "14.5%",
  expansionRate: "8.0%",
  source: "KFF / ACS 2024",
  sourceUrl: "https://www.kff.org/uninsured/key-facts-about-the-uninsured-population/",
};

// ── Age groups — uninsured rate + per-age resource catalogue ──────────────────
const AGE_GROUPS = [
  {
    id: "all",   label: "All ages",         rate: "9.8%",
    note: "National average across all ages 0–64 (KFF / ACS 2024)",
    resources: [],  // falls through to buildResourceCards() alone
  },
  {
    id: "0-18",  label: "Children (0–18)",  rate: "5.9%",
    note: "Lower rate due to broader Medicaid & CHIP eligibility for children.",
    resources: [
      { cat: "Government",      title: "CHIP — Children's Health Insurance Program",      body: "Free or low-cost health coverage for children in families that earn too much for Medicaid. Covers doctor visits, immunisations, dental, and vision.", link: "https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/", linkLabel: "Apply for CHIP →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicaid for Children",                           body: "Children in families at or below 138–300% FPL (varies by state) can enroll in Medicaid any time. No waiting period, no open-enrollment window.", link: "https://www.medicaid.gov/medicaid/eligibility/index.html", linkLabel: "Check eligibility →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Title V Maternal & Child Health Block Grant",     body: "State health departments fund preventive care, dental, developmental screenings and referrals for children with special needs through Title V.", link: "https://mchb.hrsa.gov/programs-impact/title-v-maternal-child-health-services-block-grant", linkLabel: "Find your state program →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "HRSA Community Health Centers — Pediatrics",    body: "FQHCs provide well-child visits, vaccinations, dental, and vision on a sliding-scale fee. No child turned away regardless of ability to pay.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a pediatric center →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "Children's Defense Fund",                         body: "National advocacy and direct-service org focused on child health, education, and poverty. Connects families to local coverage programs.", link: "https://www.childrensdefense.org/", linkLabel: "Find resources →", diversity: ["Black", "Latino", "Indigenous"], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "National Alliance for Mental Illness (NAMI) — Youth", body: "Free mental health resources, peer support, and helpline for children and teens. Available in multiple languages.", link: "https://www.nami.org/Support-Education/Teens-Young-Adults", linkLabel: "Youth mental health help →", diversity: [], gender: [], lang: ["Spanish", "Other"] },
      { cat: "Nonprofit",       title: "First Focus on Children",                         body: "Policy org connecting low-income families to federal programs including SNAP, WIC, and children's health coverage.", link: "https://firstfocus.org/", linkLabel: "Learn more →", diversity: [], gender: [], lang: [] },
      { cat: "Other",           title: "WIC — Women, Infants & Children",                 body: "Nutrition, breastfeeding support, and health referrals for children under 5 and pregnant/postpartum women.", link: "https://www.fns.usda.gov/wic", linkLabel: "Find WIC near you →", diversity: [], gender: ["Female"], lang: ["Spanish", "English", "Other"] },
    ],
  },
  {
    id: "19-25", label: "Young adults (19–25)", rate: "14.5%",
    note: "Highest uninsured rate of any group — often aged out of parents' plans and not yet employer-insured.",
    resources: [
      { cat: "Government",      title: "ACA Marketplace — Young Adult Plans",            body: "Catastrophic plans available under 30 with low premiums. Subsidies based on income. You can stay on a parent's plan until age 26.", link: "https://www.healthcare.gov/young-adults/", linkLabel: "Explore young adult coverage →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicaid Expansion (19–25)",                     body: "In expansion states, adults up to 138% FPL qualify for Medicaid. Apply year-round — no open-enrollment wait.", link: "https://www.healthcare.gov/medicaid-chip/adult-medicaid-eligibility/", linkLabel: "Check your state →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "HRSA Health Centers — Young Adult Services",    body: "FQHCs offer primary care, reproductive health, mental health, and substance use services on sliding-scale fees.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a clinic →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "Planned Parenthood",                            body: "Reproductive and sexual health care on a sliding scale. Services include STI testing, birth control, and annual exams for all genders.", link: "https://www.plannedparenthood.org/get-care", linkLabel: "Find a health center →", diversity: [], gender: ["Female", "LGBTQ+"], lang: ["Spanish", "English"] },
      { cat: "Nonprofit",       title: "NAMI Helpline — Young Adults",                   body: "Free, peer-led mental health support lines and text crisis services for young adults 18–25.", link: "https://www.nami.org/Support-Education/Teens-Young-Adults", linkLabel: "Get support →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Nonprofit",       title: "National LGBTQ Task Force",                      body: "Connects LGBTQ+ young adults to affirming healthcare, housing, and mental health resources nationwide.", link: "https://www.thetaskforce.org/", linkLabel: "Find affirming care →", diversity: [], gender: ["LGBTQ+"], lang: [] },
      { cat: "Rehab",           title: "SAMHSA — Substance Abuse Treatment Locator",     body: "Free and low-cost substance abuse treatment programs for young adults. Includes residential and outpatient options with sliding-scale fees.", link: "https://findtreatment.gov/", linkLabel: "Find treatment near you →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Other",           title: "Dollar For — Young Adult Medical Bills",          body: "Helps young adults apply for hospital charity care. 100% bill forgiveness for qualifying patients.", link: "https://dollarfor.org/", linkLabel: "Get help with your bill →", diversity: [], gender: [], lang: [] },
    ],
  },
  {
    id: "26-34", label: "Adults (26–34)",    rate: "14.1%",
    note: "High rate driven by loss of parental coverage at 26 and gap in employer-sponsored insurance.",
    resources: [
      { cat: "Government",      title: "ACA Marketplace — Adult Coverage",               body: "Compare subsidised plans at HealthCare.gov. Many adults at 100–400% FPL qualify for premium tax credits that significantly reduce monthly costs.", link: "https://www.healthcare.gov/see-plans/", linkLabel: "Compare plans →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicaid (Adults 26–34)",                        body: "Medicaid expansion covers adults up to 138% FPL in 41 states. Apply any time — no open-enrollment restrictions.", link: "https://www.medicaid.gov/medicaid/eligibility/index.html", linkLabel: "Check Medicaid eligibility →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Title X Family Planning",                        body: "Federally funded family planning clinics offer reproductive health care at low or no cost regardless of insurance status.", link: "https://opa.hhs.gov/grant-programs/title-x-service-grants/title-x-services-grantees", linkLabel: "Find a Title X clinic →", diversity: [], gender: ["Female", "LGBTQ+"], lang: [] },
      { cat: "Community Clinic", title: "HRSA Health Centers — Adult Primary Care",      body: "FQHCs provide comprehensive primary care on a sliding-scale fee schedule. Includes chronic disease management, dental, and behavioral health.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a health center →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "National Women's Law Center Health Resources",   body: "Resources on reproductive rights, insurance access, and poverty programs affecting women ages 26–34.", link: "https://nwlc.org/resource/nwlc-resources-on-poverty-income-and-health-insurance/", linkLabel: "Read resources →", diversity: [], gender: ["Female"], lang: [] },
      { cat: "Nonprofit",       title: "Families USA",                                   body: "Advocacy org with state-by-state guides to ACA enrollment, Medicaid, and free clinic access for working-age adults.", link: "https://familiesusa.org/", linkLabel: "Find coverage help →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Rehab",           title: "SAMHSA Behavioral Health Treatment Finder",      body: "Locator for free and low-cost mental health and substance use treatment programs. Filter by state, ZIP, and services offered.", link: "https://findtreatment.gov/", linkLabel: "Find a program →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Other",           title: "National Alliance for Mental Illness (NAMI)",    body: "Free mental health education, support groups, and a helpline (1-800-950-6264). Multilingual resources available.", link: "https://www.nami.org/help", linkLabel: "Get help →", diversity: [], gender: [], lang: ["Spanish", "English", "Other"] },
    ],
  },
  {
    id: "35-54", label: "Adults (35–54)",    rate: "~10%",
    note: "Mid-career adults — often self-employed or working part-time without employer-sponsored coverage.",
    resources: [
      { cat: "Government",      title: "ACA Marketplace — Mid-Life Adult Plans",         body: "Premiums rise with age but so do available subsidies. Adults 35–54 at 100–400% FPL often qualify for significant tax credits.", link: "https://www.healthcare.gov/see-plans/", linkLabel: "Shop plans →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicaid — Adults 35–54",                        body: "In expansion states, adults up to 138% FPL qualify regardless of employment status. Covers primary care, mental health, and chronic condition management.", link: "https://www.medicaid.gov/medicaid/eligibility/index.html", linkLabel: "Apply for Medicaid →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "ASPE State Uninsured Estimates — County-Level",  body: "HHS county-level tool to identify local coverage programs, outreach workers, and enrollment assistance near you.", link: "https://aspe.hhs.gov/reports/state-local-estimates-uninsured-population-2023", linkLabel: "View your county →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "HRSA Health Centers — Chronic Care",            body: "FQHCs manage diabetes, hypertension, and other chronic conditions on sliding-scale fees. Same-day and telehealth appointments available.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a center near you →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "HealthWell Foundation",                          body: "Grants for premiums, deductibles, and co-pays for adults with chronic or life-threatening illnesses.", link: "https://www.healthwellfoundation.org/", linkLabel: "Apply for a grant →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "National Council on Aging — Benefits Finder",    body: "Tool connecting adults 35–54 to federal and state benefit programs they may be missing: food, housing, utilities, and health.", link: "https://www.ncoa.org/public-policy-action/economic-security/benefits-access/benefits-checkup/", linkLabel: "Find your benefits →", diversity: [], gender: [], lang: [] },
      { cat: "Rehab",           title: "SAMHSA Mental Health & Addiction Treatment",     body: "Free and low-cost mental health and addiction programs. Midlife adults face elevated rates of depression and opioid use disorder.", link: "https://findtreatment.gov/", linkLabel: "Find a program →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Nonprofit",       title: "Black Women's Health Imperative",                body: "Programs and resources targeting health equity for Black women across chronic disease, mental health, and reproductive care.", link: "https://bwhi.org/", linkLabel: "Find resources →", diversity: ["Black"], gender: ["Female"], lang: [] },
      { cat: "Nonprofit",       title: "National Hispanic Medical Association",          body: "Connects Latino adults to bilingual primary care providers, community health workers, and coverage enrollment help.", link: "https://www.nhmamd.org/", linkLabel: "Find a provider →", diversity: ["Latino"], gender: [], lang: ["Spanish"] },
      { cat: "Other",           title: "Dollar For — Charity Care Navigator",            body: "Nonprofit that handles hospital charity care applications for mid-life adults facing large medical bills.", link: "https://dollarfor.org/", linkLabel: "Apply for bill forgiveness →", diversity: [], gender: [], lang: [] },
    ],
  },
  {
    id: "55-64", label: "Adults (55–64)",    rate: "7.4%",
    note: "Pre-Medicare gap — significant chronic disease burden; bridge programs available until Medicare eligibility at 65.",
    resources: [
      { cat: "Government",      title: "ACA Marketplace — Pre-Medicare Coverage",        body: "Adults 55–64 may qualify for Enhanced Silver plans with very low out-of-pocket costs. Subsidies are most generous at this age. Compare at HealthCare.gov.", link: "https://www.healthcare.gov/see-plans/", linkLabel: "Find a pre-Medicare plan →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicare Extra Help (Low-Income Subsidy)",        body: "If you're near Medicare age, Extra Help covers prescription drug costs. Full subsidy available below 135% FPL.", link: "https://www.medicare.gov/basics/costs/help/lower-costs", linkLabel: "Apply for Extra Help →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "State Pharmaceutical Assistance Programs",        body: "Many states provide prescription drug assistance to low-income adults 55–64 who are not yet on Medicare.", link: "https://www.medicare.gov/pharmaceutical-assistance-program/", linkLabel: "Find your state program →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "HRSA Health Centers — Older Adult Care",        body: "FQHCs provide chronic disease management, behavioral health, and dental services on sliding-scale fees for pre-Medicare adults.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a center →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "National Council on Aging — BenefitsCheckUp",    body: "Screen for 2,500+ federal and state benefit programs in minutes. Find health, utility, food, and housing help by ZIP code.", link: "https://www.benefitscheckup.org/", linkLabel: "Check your benefits →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "AARP Foundation",                                body: "Free legal aid, benefit enrollment assistance, and health coverage navigation for adults 50+. Includes AARP Foundation Tax-Aide.", link: "https://www.aarpfoundation.org/", linkLabel: "Get help →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Nonprofit",       title: "National Black Nurses Association",              body: "Community health programs, health fairs, and free screenings for Black adults 55+ across the US.", link: "https://www.nbna.org/", linkLabel: "Find a program →", diversity: ["Black"], gender: [], lang: [] },
      { cat: "Rehab",           title: "SAMHSA Older Adult Behavioral Health",           body: "Behavioral health and substance use resources specifically for adults 55+. Includes in-home services and telehealth options.", link: "https://www.samhsa.gov/older-adults", linkLabel: "Find services →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Other",           title: "HealthWell Foundation — Chronic Conditions",     body: "Financial grants for adults with chronic illnesses covering premiums, deductibles, and co-pays.", link: "https://www.healthwellfoundation.org/", linkLabel: "Apply for a grant →", diversity: [], gender: [], lang: [] },
      { cat: "Other",           title: "Elder Care Locator (AOA)",                       body: "US Administration on Aging hotline (1-800-677-1116) connects adults 60+ and their families to local health, transportation, and support services.", link: "https://eldercare.acl.gov/", linkLabel: "Find local services →", diversity: [], gender: [], lang: ["Spanish", "English", "Other"] },
    ],
  },
];

const DIVERSITY_OPTS = [
  { id: "all",       label: "All" },
  { id: "Black",     label: "Black / African American" },
  { id: "Latino",    label: "Hispanic / Latino" },
  { id: "Indigenous",label: "Indigenous / Native American" },
  { id: "Asian",     label: "Asian / Pacific Islander" },
  { id: "LGBTQ+",    label: "LGBTQ+" },
  { id: "Women",     label: "Women" },
];

const GENDER_OPTS = [
  { id: "all",    label: "All genders" },
  { id: "Female", label: "Female" },
  { id: "Male",   label: "Male" },
  { id: "LGBTQ+", label: "LGBTQ+ / Non-binary" },
];

const LANGUAGE_OPTS = [
  { id: "all",    label: "All languages" },
  { id: "English",label: "English" },
  { id: "Spanish",label: "Spanish / Español" },
  { id: "Other",  label: "Other languages" },
];

// Category badge colours (keyed to theme tokens)
const CAT_STYLE = {
  "Government":      { bg: "tealBg",  fg: "teal" },
  "Community Clinic":{ bg: "accentBg",fg: "accent" },
  "Nonprofit":       { bg: "amberBg", fg: "amber" },
  "Rehab":           { bg: "pinkBg",  fg: "pink" },
  "Other":           { bg: "panel",   fg: "sub" },
};

// Returns the subset of a given age-group's resources that match the active
// diversity / gender / language filters. An empty array on a filter field
// means "applies to everyone" and is never excluded.
function buildAgeResources({ ageId, diversity, gender, language }) {
  const grp = AGE_GROUPS.find(g => g.id === ageId);
  if (!grp || grp.resources.length === 0) return [];

  return grp.resources.filter(r => {
    const divMatch  = diversity === "all"  || r.diversity.length === 0 || r.diversity.includes(diversity)  || (diversity === "Women" && r.gender.includes("Female"));
    const genMatch  = gender   === "all"   || r.gender.length    === 0 || r.gender.includes(gender);
    const langMatch = language === "all"   || r.lang.length      === 0 || r.lang.includes(language);
    return divMatch && genMatch && langMatch;
  });
}

// Resource cards are now built dynamically from location context — see buildResourceCards()
function buildResourceCards({ zip, state, radius }) {
  const hrsaUrl = buildHrsaUrl({ zip, state, radius });
  const medicaidUrl = buildMedicaidUrl(state);
  const url211 = build211Url({ zip, state });
  const stateLabel = state ? ` in ${US_STATES.find(s => s.code === state)?.name || state}` : "";
  const zipLabel = zip && /^\d{5}$/.test(zip.trim()) ? ` near ${zip.trim()}` : "";
  const locationLabel = zipLabel || stateLabel;

  return [
    {
      title: "Community Health Centers",
      body: `Federally Qualified Health Centers (FQHCs) offer sliding-scale fees based on income — no one is turned away${locationLabel}. Search covers a ${radius}-mile radius.`,
      link: hrsaUrl,
      linkLabel: "Find a health center →",
    },
    {
      title: "Medicaid & CHIP",
      body: `If your income is at or below 138% FPL you likely qualify for Medicaid${stateLabel}. Children and pregnant women may qualify up to 200–300% FPL. No enrollment period.`,
      link: medicaidUrl,
      linkLabel: `Check eligibility${stateLabel} →`,
    },
    {
      title: "ACA Marketplace",
      body: `Even without a job you may qualify for subsidised coverage${stateLabel}. About 52% of uninsured people are eligible but haven't enrolled. Savings are based on income, not employment status.`,
      link: state
        ? `https://www.healthcare.gov/see-plans/#/plan/results?state=${state}`
        : "https://www.healthcare.gov/unemployed/",
      linkLabel: `Browse plans${stateLabel} →`,
    },
    {
      title: "Basic Health Program",
      body: `Some states run a Basic Health Program for adults at 133–200% FPL who don't qualify for Medicaid${stateLabel}. Check if your state participates.`,
      link: "https://www.medicaid.gov/basic-health-program",
      linkLabel: "Learn more →",
    },
    {
      title: "Hospital Financial Assistance",
      body: `Most nonprofit hospitals must offer charity care — many cover 100% of costs up to 200–300% FPL${locationLabel}. Ask for a financial counselor before or after any visit.`,
      link: state
        ? `https://www.usa.gov/health-insurance?state=${state}`
        : "https://www.usa.gov/health-insurance",
      linkLabel: "Find assistance programs →",
    },
    {
      title: "Dollar For — Medical Bill Aid",
      body: "Nonprofit that navigates hospital charity-care paperwork nationwide. Patients who qualify receive 100% forgiveness of qualifying medical bills.",
      link: "https://dollarfor.org/",
      linkLabel: "Get help with your bill →",
    },
    {
      title: "HealthWell Foundation",
      body: "Grants for insurance premiums, deductibles, and co-pays for people with chronic or life-threatening illnesses who can't afford treatment.",
      link: "https://www.healthwellfoundation.org/",
      linkLabel: "See if you qualify →",
    },
    {
      title: "211 — Find Local Help",
      body: `Dial 2-1-1 or search online to reach a navigator${locationLabel} who can connect you with free clinics, mental health services, and prescription assistance.`,
      link: url211,
      linkLabel: `Find local resources${locationLabel} →`,
    },
  ];
}

const FLORIDA_HOSPITALS = [
  { name: "HCA Florida Healthcare", free: "≤ 200% FPL", discount: "Up to 400% FPL", link: "https://www.hcafloridahealthcare.com/patient-resources/patient-financial-resources/financial-assistance" },
  { name: "Orlando Health", free: "≤ 225% FPL", discount: "Case-by-case", link: "https://www.orlandohealth.com/patients-and-visitors/patient-financial-resources/pay-your-bill/financial-assistance" },
  { name: "Baptist Health South Florida", free: "≤ 300% FPL", discount: "Sliding-scale", link: "https://baptisthealth.net/patient-resources/billing-and-financial-assistance/financial-assistance-program" },
  { name: "UHealth (Univ. of Miami)", free: "Medically necessary", discount: "Up to 400% FPL", link: "https://umiamihealth.org/en/billing-,-a-,-financial-information/financial-assistance" },
  { name: "Broward Health", free: "Sliding fee", discount: "Medicaid screening first", link: "https://www.browardhealth.org/patients-and-visitors/billing-and-insurance/financial-assistance-program" },
];

// ─── Animation keyframes injected once ────────────────────────────────────────
const NI_STYLES = `
  @keyframes ni-fadein  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes ni-slidein { from { opacity:0; transform:translateX(-8px);} to { opacity:1; transform:translateX(0); } }
  @keyframes ni-pop     { 0%{transform:scale(0.96);opacity:0} 60%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }
  @keyframes ni-bar     { from { width:0; } to { width: var(--bar-w); } }

  .ni-fadein  { animation: ni-fadein  220ms ease-out both; }
  .ni-slidein { animation: ni-slidein 180ms ease-out both; }
  .ni-pop     { animation: ni-pop     250ms ease-out both; }

  /* Stagger helpers — up to 12 items */
  .ni-d0{animation-delay:0ms}   .ni-d1{animation-delay:40ms}
  .ni-d2{animation-delay:80ms}  .ni-d3{animation-delay:120ms}
  .ni-d4{animation-delay:160ms} .ni-d5{animation-delay:200ms}
  .ni-d6{animation-delay:240ms} .ni-d7{animation-delay:280ms}
  .ni-d8{animation-delay:320ms} .ni-d9{animation-delay:360ms}
  .ni-d10{animation-delay:400ms}.ni-d11{animation-delay:440ms}

  /* Interactive elements */
  .ni-card {
    transition: transform 200ms ease-out, box-shadow 200ms ease-out;
    cursor: pointer;
  }
  .ni-card:hover  { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
  .ni-card:focus-within { outline: 3px solid currentColor; outline-offset: 2px; }

  .ni-agetile {
    transition: background 180ms ease-out, border-color 180ms ease-out,
                transform 180ms ease-out, box-shadow 180ms ease-out;
    cursor: pointer;
  }
  .ni-agetile:hover  { transform: translateY(-2px); box-shadow: 0 3px 10px rgba(0,0,0,0.09); }
  .ni-agetile:focus  { outline: 3px solid; outline-offset: 3px; }

  .ni-pill {
    transition: background 160ms ease-out, border-color 160ms ease-out,
                color 160ms ease-out, transform 140ms ease-out;
    cursor: pointer;
  }
  .ni-pill:hover  { transform: scale(1.04); }
  .ni-pill:focus  { outline: 3px solid; outline-offset: 2px; }

  .ni-link {
    transition: opacity 160ms ease-out, text-decoration-color 160ms ease-out;
    text-decoration: underline transparent;
  }
  .ni-link:hover  { opacity: 0.82; text-decoration-color: currentColor; }
  .ni-link:focus  { outline: 3px solid; outline-offset: 2px; border-radius: 2px; }

  .ni-accordion-btn {
    transition: background 160ms ease-out;
    cursor: pointer;
  }
  .ni-accordion-btn:hover  { background: rgba(0,0,0,0.04); }
  .ni-accordion-btn:focus  { outline: 3px solid; outline-offset: -3px; }

  .ni-select {
    transition: border-color 160ms ease-out, box-shadow 160ms ease-out;
  }
  .ni-select:focus { outline: 3px solid; outline-offset: 1px; box-shadow: 0 0 0 3px rgba(83,74,183,0.18); }

  .ni-input {
    transition: border-color 160ms ease-out, box-shadow 160ms ease-out;
  }
  .ni-input:focus { outline: 3px solid; outline-offset: 1px; }

  /* Bar chart animation */
  .ni-bar-fill { animation: ni-bar 600ms ease-out both; }

  /* Accordion body smooth expand */
  .ni-accordion-body {
    animation: ni-fadein 200ms ease-out both;
    overflow: hidden;
  }

  /* Colorblind: shape + pattern labels — never color alone */
  .ni-cat-badge { display: inline-flex; align-items: center; gap: 4px; }
  .ni-cat-badge::before {
    content: '';
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 2px;
    background: currentColor;
    opacity: 0.7;
    flex-shrink: 0;
  }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .ni-fadein, .ni-slidein, .ni-pop, .ni-bar-fill, .ni-accordion-body,
    .ni-card, .ni-agetile, .ni-pill, .ni-link, .ni-accordion-btn, .ni-select, .ni-input {
      animation: none !important;
      transition: none !important;
    }
  }
`;

// Category icon chars — colorblind-safe shape identifiers (used alongside colour)
const CAT_ICON = {
  "Government":       "▲",   // triangle = authoritative
  "Community Clinic": "◆",   // diamond  = community
  "Nonprofit":        "●",   // circle   = support
  "Rehab":            "■",   // square   = structured
  "Other":            "◇",   // open diamond = general
};

// Bar chart data for stats panel
const STAT_BARS = [
  { label: "Low-income families",        pct: 80, abbr: "80%" },
  { label: "Working families",           pct: 85, abbr: "85%" },
  { label: "People of color",            pct: 64, abbr: "64%" },
  { label: "Non-expansion states",       pct: 14.5, abbr: "14.5%", max: 20 },
  { label: "Expansion states",           pct: 8,   abbr: "8.0%",  max: 20 },
];

function NoInsuranceTab({ t }) {
  // Location filter state
  const [state,     setState]     = React.useState("");
  const [zip,       setZip]       = React.useState("");
  const [community, setCommunity] = React.useState("any");
  const [zipError,  setZipError]  = React.useState(false);
  // Age / diversity / gender / language filter state
  const [ageGroup,  setAgeGroup]  = React.useState("all");
  const [diversity, setDiversity] = React.useState("all");
  const [gender,    setGender]    = React.useState("all");
  const [language,  setLanguage]  = React.useState("all");
  // UI state
  const [showHospitals, setShowHospitals] = React.useState(false);
  const [ageKey,    setAgeKey]    = React.useState(0);  // bumped to re-trigger stagger

  const communityType  = COMMUNITY_TYPES.find(c => c.id === community) || COMMUNITY_TYPES[0];
  const hasLocation    = (zip && /^\d{5}$/.test(zip.trim())) || state !== "";
  const cards          = buildResourceCards({ zip, state, radius: communityType.radius });
  const activeAgeGroup = AGE_GROUPS.find(g => g.id === ageGroup) || AGE_GROUPS[0];
  const ageResources   = buildAgeResources({ ageId: ageGroup, diversity, gender, language });

  const stateObj     = US_STATES.find(s => s.code === state);
  const locationHeading = zip && /^\d{5}$/.test(zip.trim())
    ? `ZIP ${zip.trim()}${stateObj ? `, ${stateObj.name}` : ""}`
    : stateObj ? stateObj.name : null;

  function handleZipChange(e) {
    const v = e.target.value.replace(/\D/g, "").slice(0, 5);
    setZip(v);
    setZipError(v.length > 0 && v.length < 5);
  }

  function handleAgeChange(id) {
    setAgeGroup(id);
    setAgeKey(k => k + 1); // re-trigger card stagger
  }

  return (
    <div>
      {/* Inject animation styles once */}
      <style>{NI_STYLES}</style>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }} className="ni-fadein ni-d0">No insurance</h2>
      <p style={{ fontSize: 13, color: t.sub, marginBottom: 20 }} className="ni-fadein ni-d1">
        Resources for community clinics, public programs, financial assistance, and government coverage — wherever you are in the US.
      </p>

      {/* ── National stats banner ── */}
      <div className="ni-fadein ni-d2" style={{ background: t.amberBg, borderRadius: 12, padding: "14px 18px", marginBottom: 20, border: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {/* Big rate number */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.amber, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
              National uninsured rate ({UNINSURED_STATS.year})
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: t.amber, lineHeight: 1 }}>{UNINSURED_STATS.national}</div>
            <div style={{ fontSize: 11.5, color: t.sub, marginTop: 4 }}>{UNINSURED_STATS.totalUninsured} people ages 0–64</div>
          </div>

          {/* Horizontal bar chart — colorblind-safe (value labels + bars + patterns) */}
          <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
            {STAT_BARS.map((b, i) => {
              const max   = b.max || 100;
              const barW  = `${(b.pct / max) * 100}%`;
              return (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 10.5, color: t.sub, width: 160, flexShrink: 0, lineHeight: 1.3 }}>{b.label}</div>
                  <div style={{ flex: 1, background: t.border, borderRadius: 4, height: 10, overflow: "hidden", position: "relative" }}
                       role="img" aria-label={`${b.label}: ${b.abbr}`}>
                    <div
                      className="ni-bar-fill"
                      style={{
                        height: "100%", borderRadius: 4,
                        background: t.amber,
                        "--bar-w": barW,
                        width: barW,
                        animationDelay: `${i * 80 + 300}ms`,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.amber, width: 36, textAlign: "right", flexShrink: 0 }}>{b.abbr}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginLeft: "auto", alignSelf: "flex-end" }}>
            <a href={UNINSURED_STATS.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="ni-link" style={{ fontSize: 11, color: t.mute, textDecoration: "none" }}>
              Source: {UNINSURED_STATS.source} ↗
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          AGE GROUP FILTER
          ══════════════════════════════════════════════════════ */}
      <div className="ni-fadein ni-d3" style={{ background: t.panel, borderRadius: 12, padding: "14px 16px", marginBottom: 20, border: `1px solid ${t.border}` }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Uninsured rate by age group (2024)
          </div>
          <div style={{ fontSize: 11, color: t.mute }}>KFF / ACS 2024 — click a group to filter resources</div>
        </div>

        {/* Age-group tiles */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }} role="group" aria-label="Age group filter">
          {AGE_GROUPS.map(a => {
            const active = ageGroup === a.id;
            return (
              <button
                key={a.id}
                className="ni-agetile"
                onClick={() => handleAgeChange(a.id)}
                aria-pressed={active}
                style={{
                  background: active ? t.accentBg : t.bg,
                  border: `2px solid ${active ? t.accent : t.border}`,
                  borderRadius: 10, padding: "8px 13px", textAlign: "left",
                  // Colorblind: active state also shown via border-width (2px vs 1px) + bold
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: active ? t.accent : t.ink }}>{a.rate}</div>
                <div style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? t.accent : t.sub }}>{a.label}</div>
                {/* Colorblind indicator: underline on active */}
                {active && <div style={{ height: 2, borderRadius: 1, background: t.accent, marginTop: 4 }} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {/* Note — animates when age changes */}
        {activeAgeGroup.note && (
          <div key={`note-${ageGroup}`} className="ni-slidein" style={{ fontSize: 12, color: t.sub, marginBottom: 12, lineHeight: 1.5, paddingLeft: 10, borderLeft: `2px solid ${t.border}` }}>
            {activeAgeGroup.note}
          </div>
        )}

        {/* Diversity / Gender / Language — slides in when age ≠ all */}
        {ageGroup !== "all" && (
          <div className="ni-fadein" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 150px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>Diversity / community</label>
              <select className="ni-select" value={diversity} onChange={e => setDiversity(e.target.value)}
                style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
                {DIVERSITY_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 130px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>Gender</label>
              <select className="ni-select" value={gender} onChange={e => setGender(e.target.value)}
                style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
                {GENDER_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 130px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>Language</label>
              <select className="ni-select" value={language} onChange={e => setLanguage(e.target.value)}
                style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
                {LANGUAGE_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Age-group resource cards — staggered on group change ── */}
      {ageResources.length > 0 && (
        <div style={{ marginBottom: 20 }} key={`agecards-${ageKey}`}>
          <div className="ni-fadein ni-d0" style={{ fontSize: 12, fontWeight: 700, color: t.sub, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Resources for {activeAgeGroup.label}
            {locationHeading && <span style={{ fontWeight: 400, textTransform: "none", color: t.teal, marginLeft: 6 }}>— {locationHeading}</span>}
            <span style={{ fontWeight: 400, textTransform: "none", color: t.mute, fontSize: 11, marginLeft: 8 }}>
              {ageResources.length} result{ageResources.length !== 1 ? "s" : ""}
            </span>
          </div>

          {["Government", "Community Clinic", "Nonprofit", "Rehab", "Other"].map(cat => {
            const catCards = ageResources.filter(r => r.cat === cat);
            if (catCards.length === 0) return null;
            const cs = CAT_STYLE[cat];
            return (
              <div key={cat} style={{ marginBottom: 18 }}>
                {/* Category label with shape icon (colorblind-safe) */}
                <div className="ni-cat-badge" style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11, fontWeight: 700, borderRadius: 6,
                  padding: "3px 10px", marginBottom: 8,
                  background: t[cs.bg], color: t[cs.fg],
                }}>
                  <span aria-hidden="true" style={{ fontSize: 9 }}>{CAT_ICON[cat]}</span>
                  {cat}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                  {catCards.map((c, ci) => (
                    <div key={c.title}
                      className={`ni-card ni-fadein ni-d${Math.min(ci, 11)}`}
                      style={{
                        background: t[cs.bg], borderRadius: 12, padding: 14,
                        display: "flex", flexDirection: "column", gap: 6,
                        borderLeft: `3px solid ${t[cs.fg]}`,
                      }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: t[cs.fg] }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.6, flex: 1 }}>{c.body}</div>
                      {(c.diversity.length > 0 || c.lang.length > 0 || c.gender.length > 0) && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                          {c.diversity.map(d => <span key={d} style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>{d}</span>)}
                          {c.gender.map(g => <span key={g} style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>{g}</span>)}
                          {c.lang.map(l => <span key={l} style={{ fontSize: 10, background: t.panel, color: t.mute, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>{l}</span>)}
                        </div>
                      )}
                      <a
                        href={c.link.includes("findahealthcenter.hrsa.gov") ? buildHrsaUrl({ zip, state, radius: communityType.radius }) : c.link.includes("211.org") ? build211Url({ zip, state }) : c.link}
                        target="_blank" rel="noopener noreferrer"
                        className="ni-link"
                        style={{ fontSize: 12, fontWeight: 600, color: t[cs.fg], textDecoration: "none", marginTop: 2 }}>
                        {c.linkLabel}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Key insight callout ── */}
      <div className="ni-fadein ni-d4" style={{ background: t.accentBg, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12.5, color: t.accent, borderLeft: `4px solid ${t.accent}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Shape icon alongside color — colorblind safe */}
        <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>◉</span>
        <div>
          <strong>About 52% of uninsured people</strong> may be eligible for Medicaid or subsidised Marketplace coverage but haven't enrolled. The main barrier is cost of private insurance — cited by 62% of uninsured adults.
          <span style={{ color: t.mute, fontSize: 11, marginLeft: 8 }}>— KFF 2024</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          LOCATION FILTER
          ══════════════════════════════════════════════════════ */}
      <div className="ni-fadein ni-d5" style={{ background: t.panel, borderRadius: 12, padding: "14px 16px", marginBottom: 20, border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
          Find resources near you
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 160px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>State</label>
            <select className="ni-select" value={state} onChange={e => setState(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 13, cursor: "pointer" }}>
              <option value="">All states (continental US)</option>
              {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 120px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>ZIP code</label>
            <input className="ni-input" type="text" inputMode="numeric" placeholder="e.g. 33101"
              value={zip} onChange={handleZipChange} maxLength={5}
              style={{ padding: "8px 10px", borderRadius: 8, fontSize: 13, border: `1px solid ${zipError ? t.coral : t.border}`, background: t.bg, color: t.ink }} />
            {zipError && <span role="alert" style={{ fontSize: 11, color: t.coral, display: "flex", alignItems: "center", gap: 4 }}><span aria-hidden="true">⚠</span> Enter a 5-digit ZIP</span>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>Community type</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="group" aria-label="Community type filter">
            {COMMUNITY_TYPES.map(ct => {
              const active = community === ct.id;
              return (
                <button key={ct.id} className="ni-pill" onClick={() => setCommunity(ct.id)} aria-pressed={active}
                  style={{
                    borderRadius: 16, padding: "6px 14px", fontSize: 12,
                    background: active ? t.accentBg : t.bg,
                    color:      active ? t.accent   : t.sub,
                    fontWeight: active ? 700 : 400,
                    border: `${active ? "2px" : "1px"} solid ${active ? t.accent : t.border}`,
                    // Colorblind: active = bold + thicker border, not just colour
                  }}>
                  {ct.label}
                </button>
              );
            })}
          </div>
          {communityType.note && (
            <div key={community} className="ni-slidein" style={{ fontSize: 11, color: t.mute }}>{communityType.note}</div>
          )}
        </div>

        {hasLocation && (
          <div key={`loc-${state}-${zip}`} className="ni-slidein" style={{ marginTop: 10, fontSize: 12, color: t.teal, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden="true">✓</span>
            Showing resources for: {locationHeading || "selected state"} · {communityType.label}
            {" · "}
            <button onClick={() => { setState(""); setZip(""); setCommunity("any"); setZipError(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: t.mute, fontSize: 11, textDecoration: "underline", padding: 0 }}>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Resource cards grid ── */}
      <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Where to get care &amp; financial help
        {locationHeading && <span style={{ fontWeight: 400, textTransform: "none", marginLeft: 6, color: t.teal }}>— {locationHeading}</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 20 }}>
        {cards.map((c, i) => (
          <div key={c.title} className={`ni-card ni-fadein ni-d${Math.min(i, 11)}`}
            style={{ background: t.amberBg, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8, border: `1px solid ${t.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: t.amber }}>{c.title}</div>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.6, flex: 1 }}>{c.body}</div>
            <a href={c.link} target="_blank" rel="noopener noreferrer" className="ni-link"
              style={{ fontSize: 12, fontWeight: 600, color: t.amber, textDecoration: "none", marginTop: 2 }}>
              {c.linkLabel}
            </a>
          </div>
        ))}
      </div>

      {/* ── Florida hospital accordion ── */}
      <div style={{ background: t.panel, borderRadius: 10, marginBottom: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <button className="ni-accordion-btn" onClick={() => setShowHospitals(v => !v)}
          aria-expanded={showHospitals}
          style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: t.ink, display: "flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden="true" style={{ fontSize: 11, color: t.teal }}>{CAT_ICON["Community Clinic"]}</span>
            Florida hospital charity care thresholds
          </span>
          {/* Colorblind-safe: rotate icon + text label change */}
          <span style={{ fontSize: 12, color: t.mute, display: "flex", alignItems: "center", gap: 4, transition: "transform 200ms ease-out", transform: showHospitals ? "rotate(180deg)" : "rotate(0deg)" }}>
            ▼
          </span>
        </button>
        {showHospitals && (
          <div className="ni-accordion-body" style={{ padding: "0 16px 14px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Hospital network", "100% free care", "Discount range", "Apply"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: t.mute, fontWeight: 600, borderBottom: `1px solid ${t.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FLORIDA_HOSPITALS.map((h, i) => (
                  <tr key={h.name} className={`ni-fadein ni-d${i}`}
                    style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: "8px 8px", color: t.ink, fontSize: 12, fontWeight: 500 }}>{h.name}</td>
                    <td style={{ padding: "8px 8px", color: t.teal, fontSize: 12, fontWeight: 600 }}>{h.free}</td>
                    <td style={{ padding: "8px 8px", color: t.sub, fontSize: 12 }}>{h.discount}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <a href={h.link} target="_blank" rel="noopener noreferrer" className="ni-link"
                        style={{ fontSize: 11, color: t.accent, textDecoration: "none", fontWeight: 600 }}>Apply →</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Source attribution ── */}
      <div style={{ fontSize: 11, color: t.mute, lineHeight: 1.6, paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
        Statistics: KFF analysis of 2024 American Community Survey · U.S. Census Bureau SAHIE program (county estimates 2008–2024) ·
        ASPE State &amp; Local Uninsured Estimates (2023 ACS) · WHO/World Bank UHC data.
        Hospital charity care thresholds reflect publicly stated policies as of 2025 and may change — verify directly with each facility.
        In an emergency, use the Urgent tab or call emergency services.
      </div>
    </div>
  );
}

function StatPill({ label, value, t, highlight }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: highlight ? t.coral : t.amber }}>{value}</span>
      <span style={{ fontSize: 11, color: t.sub }}>{label}</span>
    </div>
  );
}

function CostLink({ href, label, sub, t }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: t.accent }}>{label}</span>
      <span style={{ fontSize: 11, color: t.mute, marginLeft: 6 }}>{sub}</span>
    </a>
  );
}

// ---------- Urgent tab — photo + voice report ----------
function UrgentTab({ t }) {
  // ── Photo section state ──
  const [file,         setFile]         = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [photoSummary, setPhotoSummary] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoCopied,  setPhotoCopied]  = useState(false);

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPhotoSummary(null);
    setPhotoCopied(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  function clearPhoto() {
    setFile(null);
    setPreview(null);
    setPhotoSummary(null);
    setPhotoCopied(false);
  }

  async function analyzePhoto() {
    if (!preview) return;
    setPhotoLoading(true);
    try {
      const [, mediaType, base64Data] = preview.match(/^data:(.+);base64,(.+)$/);
      //const res = await fetch("http://localhost:5001/api/analyze-photo", {
      const res = await fetch(`${API_BASE_URL}/api/analyze-photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaType, base64Data }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed.");
      setPhotoSummary(data?.summary || "Could not generate a summary.");
    } catch {
      setPhotoSummary("Something went wrong analyzing the photo. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  }

  function copyPhotoSummary() {
    if (!photoSummary) return;
    navigator.clipboard.writeText(photoSummary).then(() => {
      setPhotoCopied(true);
      setTimeout(() => setPhotoCopied(false), 2000);
    });
  }

  // ── Voice section state ──
  const [recording,    setRecording]    = useState(false);
  const [transcript,   setTranscript]   = useState("");
  const [interimText,  setInterimText]  = useState("");
  const [voiceSummary, setVoiceSummary] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceCopied,  setVoiceCopied]  = useState(false);
  const [supported,    setSupported]    = useState(true);
  const [micError,     setMicError]     = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onresult = (e) => {
      let finalText = "";
      let interim   = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk + " ";
        else interim += chunk;
      }
      if (finalText) setTranscript(prev => prev + finalText);
      setInterimText(interim);
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed") setMicError("Microphone access denied. Please allow microphone access in your browser and try again.");
      else if (e.error !== "aborted") setMicError(`Speech error: ${e.error}. Please try again.`);
      setRecording(false);
    };

    rec.onend = () => {
      setRecording(false);
      setInterimText("");
    };

    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, []);

  function toggleRecording() {
    if (!recognitionRef.current) return;
    setMicError("");
    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      setTranscript("");
      setInterimText("");
      setVoiceSummary(null);
      setVoiceCopied(false);
      recognitionRef.current.start();
      setRecording(true);
    }
  }

  function clearVoice() {
    if (recording) { try { recognitionRef.current?.stop(); } catch {} }
    setRecording(false);
    setTranscript("");
    setInterimText("");
    setVoiceSummary(null);
    setVoiceCopied(false);
    setMicError("");
  }

  async function buildVoiceSummary() {
    const text = (transcript + " " + interimText).trim();
    if (!text) return;
    setVoiceLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 320,
          system:
            "You are a medical documentation assistant. The user will give you a voice description of an emergency or medical event. " +
            "Extract and reformat it as a concise, clear emergency summary a paramedic or ER provider can read in seconds. " +
            "Use this structure: PATIENT / WHAT HAPPENED / SYMPTOMS / TIME / LOCATION (if mentioned). " +
            "Keep it under 120 words. Do not diagnose. Use plain language. If information is missing, omit that field.",
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      setVoiceSummary(data?.content?.find(c => c.type === "text")?.text || "Could not generate a summary. Please try again.");
    } catch {
      setVoiceSummary("Something went wrong. Please check your connection and try again.");
    } finally {
      setVoiceLoading(false);
    }
  }

  function copyVoiceSummary() {
    navigator.clipboard.writeText(voiceSummary || "").then(() => {
      setVoiceCopied(true);
      setTimeout(() => setVoiceCopied(false), 2000);
    });
  }

  const fullTranscript = transcript + (interimText || "");
  const hasVoiceContent = fullTranscript.trim().length > 0;

  return (
    <div>
      {/* Emergency banner */}
      <div style={{ background: t.coralBg, border: `1px solid ${t.coral}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
        <AlertTriangle size={16} color={t.coral} style={{ flexShrink: 0 }} />
        <span style={{ color: t.coral, fontWeight: 600 }}>Life-threatening emergency? Call 911 now.</span>
        <span style={{ color: t.sub, fontSize: 12, marginLeft: 4 }}>This tool does not contact emergency services.</span>
      </div>

      {/* ── Section 1: Photo ── */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Urgent</h2>
      <p style={{ fontSize: 13, color: t.sub, marginBottom: 16 }}>
        Take or upload a photo to get a plain-language description to share with a provider.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
        {/* Left: photo drop zone */}
        <div style={{ background: t.pinkBg, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
            border: `2px dashed ${preview ? t.pink : t.border}`, borderRadius: 10,
            padding: "24px 12px", cursor: "pointer", background: t.bg,
            transition: "border-color 200ms ease-out",
            minHeight: 160,
          }}>
            {preview
              ? <img src={preview} alt="Selected photo" style={{ maxHeight: 150, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }} />
              : (
                <>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Upload size={24} color={t.pink} />
                    <Camera size={24} color={t.pink} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.sub, textAlign: "center" }}>
                    Tap to upload or take a photo
                  </span>
                  <span style={{ fontSize: 11, color: t.mute }}>JPG, PNG, HEIC supported</span>
                </>
              )
            }
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              style={{ display: "none" }}
            />
          </label>

          {preview && (
            <button onClick={clearPhoto}
              style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "5px 0", fontSize: 12, color: t.mute, cursor: "pointer" }}>
              ✕ Remove photo
            </button>
          )}

          <button onClick={analyzePhoto} disabled={!preview || photoLoading}
            style={{
              width: "100%", background: preview ? t.pink : t.border,
              color: preview ? "#fff" : t.mute, border: "none", borderRadius: 8,
              padding: "10px 0", fontSize: 13, fontWeight: 700,
              cursor: preview && !photoLoading ? "pointer" : "not-allowed",
              transition: "background 200ms ease-out",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            {photoLoading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Analyzing…</> : "Analyze photo"}
          </button>
        </div>

        {/* Right: photo summary output */}
        <div style={{ background: t.panel, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Summary for your provider</div>
            {photoSummary && (
              <button onClick={copyPhotoSummary}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 600, color: photoCopied ? t.teal : t.accent, cursor: "pointer", transition: "color 200ms ease-out" }}>
                {photoCopied ? <Check size={12} /> : <Copy size={12} />}
                {photoCopied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          {!photoSummary && (
            <div style={{ fontSize: 12.5, color: t.mute, lineHeight: 1.6 }}>
              {photoLoading
                ? "Analyzing your photo…"
                : "Take or upload a photo then tap Analyze to see a shareable plain-language description."}
            </div>
          )}
          {photoSummary && (
            <div style={{ fontSize: 12.5, color: t.sub, whiteSpace: "pre-wrap", lineHeight: 1.7, flex: 1 }}>
              {photoSummary}
            </div>
          )}
          <div style={{ fontSize: 11, color: t.mute, borderTop: `1px solid ${t.border}`, paddingTop: 8, lineHeight: 1.5 }}>
            This describes visible characteristics only — not a diagnosis. Share with your provider or paste into a message.
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 24px" }}>
        <div style={{ flex: 1, height: 1, background: t.border }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: t.sub, fontSize: 13, fontWeight: 600 }}>
          <Mic size={14} />
          Voice report
        </div>
        <div style={{ flex: 1, height: 1, background: t.border }} />
      </div>

      {/* ── Section 2: Voice ── */}
      <p style={{ fontSize: 13, color: t.sub, marginBottom: 16 }}>
        Speak a brief description of what happened. The summary can be shared with a provider or read aloud to a dispatcher.
      </p>

      {!supported && (
        <div style={{ background: t.amberBg, border: `1px solid ${t.amber}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: t.amber, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Speech recognition not supported in this browser.</strong><br />
            <span style={{ fontSize: 12, color: t.sub }}>Use Chrome, Edge, or Safari on iOS 15+. You can still type your description in the text area below.</span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {/* Left: recording panel */}
        <div style={{ background: t.pinkBg, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <button
              onClick={toggleRecording}
              aria-label={recording ? "Stop recording" : "Start recording"}
              aria-pressed={recording}
              disabled={!supported && transcript.length === 0}
              style={{
                width: 72, height: 72, borderRadius: "50%", border: "none", cursor: "pointer",
                background: recording ? t.coral : t.pink,
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: recording
                  ? `0 0 0 6px ${t.coralBg}, 0 0 0 8px ${t.coral}40`
                  : `0 2px 12px ${t.pink}60`,
                transition: "background 200ms ease-out, box-shadow 200ms ease-out, transform 150ms ease-out",
                transform: recording ? "scale(1.06)" : "scale(1)",
              }}
            >
              {recording ? <MicOff size={28} /> : <Mic size={28} />}
            </button>

            <div style={{ fontSize: 13, fontWeight: 700, color: recording ? t.coral : t.sub, display: "flex", alignItems: "center", gap: 6 }}>
              {recording && (
                <span style={{
                  width: 8, height: 8, borderRadius: "50%", background: t.coral, display: "inline-block",
                  animation: "vrPulse 900ms ease-in-out infinite",
                }} aria-hidden="true" />
              )}
              {recording ? "Recording… tap to stop" : "Tap to start speaking"}
            </div>

            {micError && (
              <div role="alert" style={{ fontSize: 12, color: t.coral, textAlign: "center", maxWidth: 240, lineHeight: 1.5 }}>
                {micError}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              What you said
            </div>
            <textarea
              value={fullTranscript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Your spoken words will appear here… or type directly."
              rows={5}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                border: `1px solid ${recording ? t.coral : t.border}`,
                background: t.bg, color: t.ink, lineHeight: 1.6, resize: "vertical",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 200ms ease-out",
              }}
            />
            {interimText && (
              <div style={{ fontSize: 11.5, color: t.mute, fontStyle: "italic", marginTop: 4 }}>
                Hearing: "{interimText}"
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={buildVoiceSummary} disabled={!hasVoiceContent || voiceLoading}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                background: hasVoiceContent && !voiceLoading ? t.pink : t.border,
                color: hasVoiceContent && !voiceLoading ? "#fff" : t.mute,
                fontSize: 13, fontWeight: 700, cursor: hasVoiceContent && !voiceLoading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "background 200ms ease-out",
              }}>
              {voiceLoading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating…</> : "Generate summary"}
            </button>
            {hasVoiceContent && (
              <button onClick={clearVoice}
                style={{ padding: "9px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: "none", color: t.mute, fontSize: 12, cursor: "pointer" }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: voice summary */}
        <div style={{ background: t.panel, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Emergency summary</div>
            {voiceSummary && (
              <button onClick={copyVoiceSummary}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 600, color: voiceCopied ? t.teal : t.accent, cursor: "pointer", transition: "color 200ms ease-out" }}>
                {voiceCopied ? <Check size={12} /> : <Copy size={12} />}
                {voiceCopied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>

          {!voiceSummary && !voiceLoading && (
            <div style={{ fontSize: 12.5, color: t.mute, lineHeight: 1.6, flex: 1 }}>
              Speak or type what happened, then tap <strong>Generate summary</strong> to produce a structured description you can share with a provider or read to a dispatcher.
            </div>
          )}
          {voiceLoading && (
            <div style={{ fontSize: 12.5, color: t.mute, display: "flex", alignItems: "center", gap: 8 }}>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              Generating emergency summary…
            </div>
          )}
          {voiceSummary && (
            <div style={{ fontSize: 13, color: t.sub, whiteSpace: "pre-wrap", lineHeight: 1.75, flex: 1 }}>
              {voiceSummary}
            </div>
          )}

          {voiceSummary && (
            <div style={{ background: t.accentBg, borderRadius: 8, padding: "8px 12px", fontSize: 11.5, color: t.accent, lineHeight: 1.5 }}>
              Tap <strong>Copy</strong> above to paste into a text message, share with a dispatcher, or hand your phone to a first responder.
            </div>
          )}

          <div style={{ fontSize: 11, color: t.mute, borderTop: `1px solid ${t.border}`, paddingTop: 8, lineHeight: 1.5 }}>
            AI-generated summary — for provider communication only. Not a substitute for emergency services.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes vrPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.7); } }
      `}</style>
    </div>
  );
}

// ---------- Learn tab ----------
// ─── Learn tab animation styles ───────────────────────────────────────────────
const LT_STYLES = `
  @keyframes lt-fadein  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes lt-slidein { from { opacity:0; transform:translateX(-8px);  } to { opacity:1; transform:translateX(0); } }
  @keyframes lt-pop     { 0%{transform:scale(0.95);opacity:0} 60%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }
  @keyframes lt-expand  { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

  .lt-fadein  { animation: lt-fadein  220ms ease-out both; }
  .lt-slidein { animation: lt-slidein 180ms ease-out both; }
  .lt-pop     { animation: lt-pop     250ms ease-out both; }
  .lt-expand  { animation: lt-expand  200ms ease-out both; }

  .lt-d0{animation-delay:0ms}    .lt-d1{animation-delay:40ms}
  .lt-d2{animation-delay:80ms}   .lt-d3{animation-delay:120ms}
  .lt-d4{animation-delay:160ms}  .lt-d5{animation-delay:200ms}
  .lt-d6{animation-delay:240ms}  .lt-d7{animation-delay:280ms}
  .lt-d8{animation-delay:320ms}  .lt-d9{animation-delay:360ms}
  .lt-d10{animation-delay:400ms} .lt-d11{animation-delay:440ms}

  .lt-card {
    transition: transform 190ms ease-out, box-shadow 190ms ease-out, border-color 190ms ease-out;
    cursor: pointer;
  }
  .lt-card:hover  { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,0.09); }
  .lt-card:focus  { outline: 3px solid; outline-offset: 2px; }

  .lt-pill {
    transition: background 150ms ease-out, border-color 150ms ease-out,
                color 150ms ease-out, transform 130ms ease-out;
    cursor: pointer;
  }
  .lt-pill:hover  { transform: scale(1.05); }
  .lt-pill:active { transform: scale(0.97); }
  .lt-pill:focus  { outline: 3px solid; outline-offset: 2px; }

  .lt-step-item {
    animation: lt-slidein 180ms ease-out both;
  }

  @media (prefers-reduced-motion: reduce) {
    .lt-fadein,.lt-slidein,.lt-pop,.lt-expand,
    .lt-card,.lt-pill,.lt-step-item {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const LT_CAT_STYLE = {
  "First Aid":        { bg: "coralBg",   fg: "coral",  icon: "🩹" },
  "Prevention":       { bg: "tealBg",    fg: "teal",   icon: "🛡️" },
  "Nutrition":        { bg: "amberBg",   fg: "amber",  icon: "🥗" },
  "Mental Health":    { bg: "pinkBg",    fg: "pink",   icon: "🧠" },
  "Know When to Go":  { bg: "accentBg",  fg: "accent", icon: "🚦" },
};

function LearnTab({ t }) {
  const [activeCat,  setActiveCat]  = useState("All");
  const [openIdx,    setOpenIdx]    = useState(null);
  const [catKey,     setCatKey]     = useState(0);   // re-triggers stagger on category change

  function handleCat(cat) {
    setActiveCat(cat);
    setOpenIdx(null);
    setCatKey(k => k + 1);
  }

  const visible = activeCat === "All"
    ? LEARN_GUIDES
    : LEARN_GUIDES.filter(g => g.cat === activeCat);

  return (
    <div>
      <style>{LT_STYLES}</style>

      {/* Header */}
      <h2 className="lt-fadein lt-d0" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Learn</h2>
      <p className="lt-fadein lt-d1" style={{ fontSize: 13, color: t.sub, marginBottom: 18, lineHeight: 1.6 }}>
        First-aid steps you can do at home, prevention habits, nutrition tips, mental health tools, and how to know when to seek care.
      </p>

      {/* Stats banner */}
      <div className="lt-fadein lt-d2" style={{ background: t.amberBg, borderRadius: 12, padding: "12px 16px", marginBottom: 20, border: `1px solid ${t.border}`, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
        {[
          { val: "30+", label: "home-care guides" },
          { val: "7", label: "first-aid topics" },
          { val: "5", label: "categories" },
          { val: "CDC / WHO", label: "evidence-based sources" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.amber, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: t.mute, alignSelf: "flex-end" }}>
          Not a substitute for professional medical advice.
        </div>
      </div>

      {/* Category filter pills */}
      <div className="lt-fadein lt-d3" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }} role="group" aria-label="Filter by category">
        {LEARN_CATS.map(cat => {
          const active = activeCat === cat;
          const cs = LT_CAT_STYLE[cat];
          return (
            <button key={cat} onClick={() => handleCat(cat)} aria-pressed={active}
              className="lt-pill"
              style={{
                borderRadius: 20, padding: "6px 15px", fontSize: 12,
                background: active ? (cs ? t[cs.bg] : t.accentBg) : t.panel,
                color:      active ? (cs ? t[cs.fg] : t.accent)   : t.sub,
                fontWeight: active ? 700 : 400,
                border: `${active ? "2px" : "1px"} solid ${active ? (cs ? t[cs.fg] : t.accent) : t.border}`,
                display: "flex", alignItems: "center", gap: 5,
              }}>
              {cs && <span aria-hidden="true">{cs.icon}</span>}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Guide cards grid — re-keys on category change to replay stagger */}
      <div key={`guides-${catKey}`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {visible.map((g, i) => {
          const cs  = LT_CAT_STYLE[g.cat] || { bg: "panel", fg: "sub" };
          const isOpen = openIdx === i;
          return (
            <div key={g.title}
              className={`lt-card lt-fadein lt-d${Math.min(i, 11)}`}
              style={{
                background: t[cs.bg], borderRadius: 14,
                border: `${isOpen ? "2px" : "1px"} solid ${isOpen ? t[cs.fg] : t.border}`,
                overflow: "hidden",
              }}>

              {/* Card header — tap to open/close */}
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  padding: "14px 16px", textAlign: "left",
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{g.icon}</span>
                <div style={{ flex: 1 }}>
                  {/* Category badge */}
                  <div style={{ fontSize: 10, fontWeight: 700, color: t[cs.fg], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    {g.cat}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: t.ink, marginBottom: 4 }}>{g.title}</div>
                  <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}>{g.summary}</div>
                </div>
                {/* Chevron — rotates when open */}
                <span aria-hidden="true" style={{
                  fontSize: 11, color: t.mute, flexShrink: 0, marginTop: 4,
                  display: "inline-block",
                  transition: "transform 200ms ease-out",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}>▼</span>
              </button>

              {/* Expanded steps */}
              {isOpen && (
                <div className="lt-expand" style={{ padding: "0 16px 16px" }}>
                  <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                    {g.steps.map((step, si) => (
                      <li key={si}
                        className={`lt-step-item lt-d${Math.min(si, 11)}`}
                        style={{ fontSize: 12.5, color: t.sub, lineHeight: 1.6 }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                  {g.tip && (
                    <div className="lt-expand" style={{
                      marginTop: 12, padding: "9px 12px", borderRadius: 8,
                      background: t.bg, border: `1px solid ${t[cs.fg]}`,
                      fontSize: 12, color: t[cs.fg], lineHeight: 1.5,
                    }}>
                      <strong>💡 Tip: </strong>{g.tip}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="lt-fadein" style={{ marginTop: 28, fontSize: 11, color: t.mute, lineHeight: 1.7, paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
        Information sourced from CDC, WHO, American Red Cross, NIH MedlinePlus, and Mayo Clinic guidelines.
        These guides cover minor home-treatable situations only. When in doubt, use the <strong>Urgent</strong> tab or call your provider.
      </div>
    </div>
  );
}
