import { useId } from 'react';
import '../styles/exercise-diagram.css';

const colors = { player: '#3B82F6', accent: '#22D3A6', ball: '#FBBF24', cone: '#FBBF24', line: 'rgba(248,250,252,.2)' };

function Marker({ x, y, label, fill = colors.player }) {
  return <g><circle cx={x} cy={y} r="8" fill={fill} stroke="#0B1522" strokeWidth="2" /><text x={x} y={y + 3} textAnchor="middle" className="diagram-marker-label">{label}</text></g>;
}

function Cone({ x, y, label }) {
  return <g><path d={`M${x} ${y - 7}l7 13h-14z`} fill={colors.cone} stroke="#0B1522" strokeWidth="1.5" /><text x={x} y={y + 20} textAnchor="middle" className="diagram-small-label">{label}</text></g>;
}

function Ball({ x, y }) {
  return <g><circle cx={x} cy={y} r="5" fill={colors.ball} stroke="#15221F" strokeWidth="1.5" /><path d={`M${x - 3} ${y}h6M${x} ${y - 3}v6`} stroke="#15221F" strokeWidth=".8" /></g>;
}

function TargetMark({ x, y }) {
  return <g className="diagram-demo-target"><circle cx={x} cy={y} r="11" /><circle cx={x} cy={y} r="4" /></g>;
}

const diagrams = {
  passing: ({ arrow }) => <>
    <path d="M94 111L177 61L275 111L354 63" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={84} y={117} label="1" /><Marker x={182} y={55} label="2" /><Marker x={280} y={117} label="3" /><Cone x={356} y={57} label="GATE" /><Ball x={108} y={108} />
    <text x="88" y="151" className="diagram-label">SCAN</text><text x="244" y="151" className="diagram-label">OPEN BODY</text>
  </>,
  through_ball: ({ arrow }) => <>
    <path d="M70 120L168 94L350 52" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={63} y={123} label="1" /><Marker x={174} y={90} label="2" /><Cone x={256} y={76} label="GATE" /><Cone x={286} y={67} label="" /><Ball x={190} y={85} />
    <text x="64" y="153" className="diagram-label">SCAN</text><text x="311" y="89" className="diagram-label">RUN ONTO IT</text>
  </>,
  switching: ({ arrow }) => <>
    <path d="M74 139C148 134 206 104 351 49" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={70} y={140} label="1" /><Marker x={344} y={48} label="2" /><Ball x={105} y={132} />
    <path d="M85 47h38v25H85zM317 119h39v25h-39z" className="diagram-target" />
    <text x="83" y="38" className="diagram-label">PRESSURE</text><text x="301" y="159" className="diagram-label">FAR SIDE</text>
  </>,
  wall_receive: ({ arrow }) => <>
    <path d="M84 114L348 114L256 70" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <path d="M351 45v101" className="diagram-wall" /><Marker x={77} y={114} label="1" /><Marker x={250} y={68} label="2" /><Ball x={174} y={114} /><Cone x={224} y={140} label="PRESSURE" />
    <text x="83" y="151" className="diagram-label">PASS</text><text x="269" y="92" className="diagram-label">HALF-TURN</text>
  </>,
  shooting: ({ arrow }) => <>
    <path d="M60 119H113L152 91L200 75L276 43" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={56} y={119} label="1" /><Cone x={154} y={91} label="SET" /><Ball x={198} y={75} />
    <path d="M316 46h72v65h-72zM328 55v48m24-48v48m24-48v48M316 78h72" className="diagram-goal" />
    <circle cx="372" cy="56" r="8" fill="none" stroke={colors.accent} strokeDasharray="3 2" /><text x="337" y="132" className="diagram-label">FAR CORNER</text>
  </>,
  cut_in: ({ arrow }) => <>
    <path d="M62 145L117 137C149 132 157 93 198 88L288 55" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={58} y={147} label="W" /><Cone x={151} y={112} label="CUT" /><Ball x={128} y={132} />
    <path d="M316 46h72v65h-72zM328 55v48m24-48v48m24-48v48M316 78h72" className="diagram-goal" />
    <text x="51" y="171" className="diagram-label">WIDE START</text><text x="309" y="132" className="diagram-label">FAR CORNER</text>
  </>,
  dribbling: ({ arrow }) => <>
    <path d="M62 112C105 112 102 55 146 55S185 122 225 122S270 57 310 57L365 93" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={56} y={112} label="1" /><Cone x={145} y={55} label="2" /><Cone x={224} y={122} label="3" /><Cone x={310} y={57} label="4" /><Ball x={93} y={100} />
    <text x="60" y="153" className="diagram-label">CLOSE TOUCHES</text><text x="276" y="153" className="diagram-label">EXPLODE</text>
  </>,
  movement: ({ arrow }) => <>
    <path d="M79 111C116 111 120 135 151 130C181 125 181 84 217 75S274 75 331 58" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={72} y={111} label="1" /><Cone x={150} y={130} label="AWAY" /><Marker x={235} y={75} label="2" /><Cone x={331} y={58} label="BALL" />
    <text x="72" y="153" className="diagram-label">CHECK SHOULDER</text><text x="242" y="124" className="diagram-label">CURVE INTO SPACE</text>
  </>,
  defending: ({ arrow }) => <>
    <path d="M328 61L256 78L178 91" className="diagram-route diagram-route-defend" markerEnd={`url(#${arrow})`} />
    <Marker x={331} y={59} label="A" fill={colors.ball} /><Marker x={229} y={82} label="D" /><Ball x={311} y={65} />
    <path d="M45 46v84m0-42h73" className="diagram-zone" /><Cone x={112} y={88} label="GOAL SIDE" />
    <text x="55" y="153" className="diagram-label">SCREEN CENTRE</text><text x="253" y="122" className="diagram-label">JOCKEY, THEN STEP</text>
  </>,
  interception: ({ arrow }) => <>
    <path d="M70 54L365 135" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} /><path d="M202 143L235 93" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={66} y={52} label="P" fill={colors.ball} /><Marker x={214} y={111} label="D" /><Marker x={365} y={138} label="T" />
    <text x="61" y="83" className="diagram-label">PASS LANE</text><text x="244" y="91" className="diagram-label">STEP ACROSS</text>
  </>,
  aerial: ({ arrow }) => <>
    <path d="M72 55Q196 4 315 52" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} />
    <Marker x={197} y={88} label="1" /><Ball x={312} y={51} /><path d="M182 109l15-18 15 18m-15-18v38m-13-10-12 16m25-16 13 16" className="diagram-limb" />
    <path d="M98 143h243" className="diagram-zone" /><text x="121" y="163" className="diagram-label">TRACK → JUMP → LAND SOFTLY</text>
  </>,
  goalkeeping: ({ arrow }) => <>
    <path d="M44 38h84v96H44zM55 49v74m28-74v74m28-74v74M44 86h84" className="diagram-goal" />
    <path d="M86 90C151 92 218 95 310 55" className="diagram-route diagram-route-keeper" markerEnd={`url(#${arrow})`} />
    <Marker x={84} y={90} label="GK" /><Ball x={318} y={51} /><path d="M97 105l27 10m-26-10 5 26" className="diagram-limb" />
    <text x="145" y="72" className="diagram-label">SET & READ</text><text x="279" y="119" className="diagram-label">PUSH / REACH</text>
  </>,
  keeper_set: ({ arrow }) => <>
    <path d="M43 40h84v96H43zM55 51v74m28-74v74m28-74v74M43 88h84" className="diagram-goal" />
    <path d="M87 116Q176 54 310 61" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={86} y={116} label="GK" /><Ball x={310} y={61} /><Cone x={183} y={91} label="SET" />
    <text x="145" y="144" className="diagram-label">MOVE → SET → TRACK</text>
  </>,
  distribution: ({ arrow }) => <>
    <path d="M51 53h64v81H51z" className="diagram-goal" /><Marker x={83} y={93} label="GK" /><Ball x={125} y={96} />
    <path d="M127 96L235 67L365 60" className="diagram-route" markerEnd={`url(#${arrow})`} /><Cone x={238} y={66} label="SHORT" /><Cone x={365} y={60} label="LONG" />
    <text x="52" y="157" className="diagram-label">SECURE</text><text x="274" y="105" className="diagram-label">SCAN & RELEASE</text>
  </>,
  conditioning: ({ arrow }) => <>
    <path d="M78 120H357" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Cone x={75} y={120} label="START" /><Cone x={183} y={120} label="5 M" /><Cone x={357} y={120} label="10 M" />
    <Marker x={115} y={73} label="1" /><Marker x={230} y={73} label="2" /><text x="111" y="48" className="diagram-label">DRIVE</text><text x="218" y="48" className="diagram-label">RUN THROUGH</text>
    <path d="M202 143C247 164 143 164 124 144" className="diagram-recovery" markerEnd={`url(#${arrow})`} /><text x="182" y="170" className="diagram-small-label">WALK BACK / RECOVER</text>
  </>,
  home_gk: ({ arrow }) => <>
    <path d="M44 47h64v98H44zM55 56v80m21-80v80m22-80v80M44 96h64" className="diagram-goal" />
    <path d="M324 43v105m-9-95h18m-18 83h18" className="diagram-wall" /><text x="328" y="31" textAnchor="middle" className="diagram-small-label">WALL</text>
    <path d="M307 91C247 92 197 94 143 96" className="diagram-route" markerEnd={`url(#${arrow})`} /><path d="M144 96Q184 56 223 62" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} />
    <Marker x={137} y={98} label="GK" /><Ball x={302} y={90} /><path d="M133 108l-13 12m13-12 15 10m-15-10 2 17" className="diagram-limb" />
    <path d="M155 122h62m-8-7 8 7-8 7m-46-31h54m-8-7 8 7-8 7" className="diagram-recovery" markerEnd={`url(#${arrow})`} />
    <text x="220" y="145" className="diagram-label">3 YD SHUFFLE</text><text x="240" y="48" className="diagram-small-label">HIGH / LOW RETURN</text>
  </>,
  home_cb: ({ arrow }) => <>
    <path d="M83 125H328" className="diagram-zone" /><Cone x={83} y={125} label="START" /><Cone x={328} y={125} label="5 YD" />
    <path d="M99 100H307" className="diagram-route" markerEnd={`url(#${arrow})`} /><Marker x={109} y={97} label="1" /><Marker x={245} y={97} label="2" />
    <path d="M307 99L257 59" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} /><path d="M257 59L204 42" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={202} y={80} label="CB" /><Ball x={202} y={32} /><path d="M199 88v22m-10-12 10-10 10 10m-18 12 8-8 8 8" className="diagram-limb" />
    <text x="277" y="79" className="diagram-small-label">45° DROP-STEP</text><text x="219" y="150" className="diagram-label">JUMP → SOFT LAND</text>
  </>,
  home_fullback: ({ arrow }) => <>
    <path d="M348 32v130" className="diagram-wall" /><text x="358" y="25" className="diagram-small-label">TOUCHLINE</text>
    <Cone x={94} y={126} label="START" /><Cone x={190} y={126} label="1" /><Cone x={291} y={126} label="2 / 15 YD" />
    <path d="M96 105H301" className="diagram-route" markerEnd={`url(#${arrow})`} /><Marker x={123} y={101} label="FB" /><Ball x={181} y={100} />
    <path d="M303 103L216 58" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} /><path d="M300 140C248 164 145 164 98 140" className="diagram-recovery" markerEnd={`url(#${arrow})`} />
    <text x="224" y="46" className="diagram-small-label">LOW CROSS IN</text><text x="149" y="173" className="diagram-small-label">TURN → CONTROLLED RECOVERY</text>
  </>,
  home_cdm: ({ arrow }) => <>
    <path d="M121 47h174v99H121z" className="diagram-zone" /><Cone x={121} y={47} label="1" /><Cone x={295} y={47} label="2" /><Cone x={295} y={146} label="3" /><Cone x={121} y={146} label="4" />
    <path d="M143 97H274M274 104H144" className="diagram-route" markerEnd={`url(#${arrow})`} /><Marker x={205} y={98} label="6" /><Ball x={198} y={118} />
    <path d="M326 47v99" className="diagram-wall" /><path d="M216 98L318 74" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} />
    <text x="199" y="33" textAnchor="middle" className="diagram-small-label">5 × 5 YD BOX</text><text x="315" y="163" className="diagram-small-label">WALL PASS</text>
  </>,
  home_cm: ({ arrow }) => <>
    <path d="M220 137V50M220 82H115M220 82H325" className="diagram-zone" /><Cone x={220} y={137} label="START" /><Cone x={220} y={50} label="10 YD" /><Cone x={115} y={82} label="5 YD" /><Cone x={325} y={82} label="5 YD" />
    <path d="M205 128V58M205 77H124M235 77H316M235 61V126" className="diagram-route" markerEnd={`url(#${arrow})`} /><Marker x={220} y={105} label="CM" /><Ball x={222} y={155} />
    <path d="M123 143Q205 177 306 143" className="diagram-recovery" markerEnd={`url(#${arrow})`} /><text x="219" y="30" textAnchor="middle" className="diagram-small-label">FORWARD → SHUFFLE → SCAN</text>
  </>,
  home_cam: ({ arrow }) => <>
    <path d="M55 39h330v116H55zM55 97h76" className="diagram-zone" /><path d="M347 51h38v92h-38z" className="diagram-goal" />
    <Marker x={119} y={110} label="CAM" /><Ball x={91} y={111} /><Cone x={211} y={91} label="DEFENDER" />
    <path d="M99 111Q149 118 181 94L251 69" className="diagram-route" markerEnd={`url(#${arrow})`} /><path d="M253 69L335 70" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} />
    <text x="137" y="143" className="diagram-small-label">HALF-TURN</text><text x="265" y="56" className="diagram-small-label">CUT → FINISH</text><text x="65" y="31" className="diagram-small-label">OUTSIDE THE BOX</text>
  </>,
  home_widemid: ({ arrow }) => <>
    <path d="M352 33v125" className="diagram-wall" /><text x="359" y="25" className="diagram-small-label">SIDELINE</text>
    <Marker x={94} y={130} label="WM" /><Ball x={121} y={121} /><path d="M129 119L333 68" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} />
    <path d="M333 69L195 91L282 58" className="diagram-route" markerEnd={`url(#${arrow})`} /><Cone x={194} y={91} label="ONE-TWO" />
    <path d="M288 67L211 133" className="diagram-recovery" markerEnd={`url(#${arrow})`} /><path d="M300 78L229 138" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <text x="91" y="155" className="diagram-small-label">PASS + MOVE</text><text x="219" y="39" className="diagram-small-label">BURST → LOW CROSS</text>
  </>,
  home_winger: ({ arrow }) => <>
    <path d="M55 39h330v116H55zM55 97h76" className="diagram-zone" /><path d="M347 51h38v92h-38z" className="diagram-goal" />
    <path d="M83 132C144 130 153 117 183 97L246 68Q297 47 341 69" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <Marker x={91} y={129} label="W" /><Ball x={121} y={125} /><Cone x={183} y={97} label="CHOP" /><Marker x={257} y={66} label="CUT" />
    <path d="M258 72Q303 97 335 67" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} />
    <text x="80" y="151" className="diagram-small-label">DRIVE AT CONE</text><text x="250" y="126" className="diagram-small-label">CURL TO FAR POST</text>
  </>,
  home_forward: ({ arrow }) => <>
    <path d="M56 39h328v116H56zM56 97h76m252 0h-70" className="diagram-zone" /><path d="M347 51h37v92h-37z" className="diagram-goal" />
    <Marker x={175} y={105} label="ST" /><Cone x={210} y={109} label="DEF" /><Ball x={151} y={108} />
    <path d="M80 108L151 108L192 91Q228 75 263 91L330 70" className="diagram-route" markerEnd={`url(#${arrow})`} />
    <path d="M217 126Q244 149 268 121" className="diagram-opponent-route" markerEnd={`url(#${arrow})`} />
    <text x="67" y="88" className="diagram-small-label">RECEIVE</text><text x="163" y="145" className="diagram-small-label">SHIELD → SPIN</text><text x="276" y="54" className="diagram-small-label">QUICK SHOT</text>
  </>,
};

const motionRoutes = {
  home_gk: [[137, 98], [230, 98], [137, 116], [137, 98], [137, 98]],
  home_cb: [[109, 97], [245, 97], [257, 59], [202, 42], [202, 80]],
  home_fullback: [[123, 101], [190, 101], [300, 105], [216, 58], [100, 140]],
  home_cdm: [[205, 98], [270, 98], [144, 98], [220, 118], [205, 98]],
  home_cm: [[220, 137], [220, 50], [115, 82], [325, 82], [220, 137]],
  home_cam: [[119, 110], [91, 111], [181, 94], [251, 69], [335, 70]],
  home_widemid: [[94, 130], [121, 121], [333, 68], [282, 58], [229, 138]],
  home_winger: [[91, 129], [121, 125], [183, 97], [257, 66], [335, 67]],
  home_forward: [[175, 105], [151, 108], [210, 109], [268, 121], [330, 70]],
};

const demoTargets = {
  home_gk: [302, 90], home_cb: [202, 32], home_fullback: [216, 58], home_cdm: [318, 74],
  home_cm: [222, 155], home_cam: [366, 97], home_widemid: [211, 133], home_winger: [366, 97], home_forward: [366, 97],
};

function pointOnRoute(points, progress) {
  const scaledProgress = Math.min(0.9999, Math.max(0, progress)) * (points.length - 1);
  const segment = Math.floor(scaledProgress);
  const amount = scaledProgress - segment;
  const start = points[segment];
  const end = points[segment + 1];
  return { x: start[0] + (end[0] - start[0]) * amount, y: start[1] + (end[1] - start[1]) * amount };
}

export default function ExerciseDiagram({ type = 'movement', title, animationProgress = null }) {
  const markerId = `arrow-${useId().replace(/:/g, '')}`;
  const gridId = `pitch-grid-${useId().replace(/:/g, '')}`;
  const renderDiagram = diagrams[type] || diagrams.movement;
  const animatedPlayer = animationProgress === null ? null : pointOnRoute(motionRoutes[type] || motionRoutes.home_cm, animationProgress);
  const isPitchVideo = animationProgress !== null;
  const pitchOffset = isPitchVideo ? 30 : 0;
  const target = demoTargets[type];
  return <svg className={`exercise-diagram ${isPitchVideo ? 'diagram-video-mode' : ''}`} viewBox={isPitchVideo ? '0 0 440 250' : '0 0 440 190'} role="img" aria-label={`${title}: ${type} drill setup and movement diagram`}>
    <defs><marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#22D3A6" strokeWidth="1.5" /></marker><pattern id={gridId} width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" className="diagram-grid-line" /></pattern></defs>
    <rect x="6" y="6" width="428" height={isPitchVideo ? '238' : '178'} rx="4" className="diagram-pitch" />
    {isPitchVideo && <rect x="6" y="6" width="428" height="238" fill={`url(#${gridId})`} className="diagram-pitch-grid" />}
    {isPitchVideo ? <g transform={`translate(0 ${pitchOffset})`}><path d="M220 7v176M7 95h426M174 7v178m92-178v178" className="diagram-field-line" /><circle cx="220" cy="95" r="28" className="diagram-field-line" fill="none" />{renderDiagram({ arrow: markerId })}</g> : <><path d="M220 7v176M7 95h426M174 7v178m92-178v178" className="diagram-field-line" /><circle cx="220" cy="95" r="28" className="diagram-field-line" fill="none" />{renderDiagram({ arrow: markerId })}</>}
    {isPitchVideo && target && <TargetMark x={target[0]} y={target[1] + pitchOffset} />}
    {animatedPlayer && <g className="diagram-moving-player" transform={`translate(${animatedPlayer.x} ${animatedPlayer.y + pitchOffset})`} aria-hidden="true"><circle className="diagram-player-halo" r="13" /><circle className="diagram-player-head" cx="0" cy="-7" r="3.5" /><path className="diagram-player-body" d="M0 -3v10m0-7-5 4m5-4 5 4m-5 3-4 7m4-7 4 7" /></g>}
    {!isPitchVideo && <text x="16" y="22" className="diagram-caption">SETUP + MOVEMENT MAP</text>}
  </svg>;
}