// ================= ROSTER =================
// Wrestlers, the referee and strike tuning now live in data/roster.json and data/moves.json.
/*@@DATA@@*/
const ROSTER=DATA.roster.wrestlers.filter(c=>!c.testOnly||(q=>q.has('test')||q.has('tag')||q.has('rumble'))(new URLSearchParams(location.search))); // new wrestlers: test link only for now
const REF=DATA.roster.referee;


const CARDNAME=DATA.roster.cardNames;
const cardName=ch=>(CARDNAME[ch.id]||ch.short||ch.name).toUpperCase();

const ATK=DATA.moves.strikes;
const WIND={punch:0.04,kick:0.07,stomp:0.06};const windOf=s=>G.windOn?(WIND[s]||0):0;
const CTR=DATA.moves.counters;
const HITTABLE=new Set(['idle','walk','punch','kick','hit','whiff','stomp','jump','dropkick','perch','whipped','whip','runline','block','run']);
const GRABBABLE=new Set(['idle','walk','punch','kick','hit','whiff','stomp','block']);
function basePose(){return{lean:0.08,af:[0.55,1.9],ab:[0.3,2.0],lf:[0.3,-0.5],lb:[-0.22,0.12],rot:0,dy:0,plant:true,hipY:-52};}

