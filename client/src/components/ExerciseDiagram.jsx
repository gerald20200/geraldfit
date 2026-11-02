import { useId } from 'react';

const colors = { player: '#F8FAFC', accent: '#6EE7B7', ball: '#FBBF24', cone: '#FB7185', line: 'rgba(248,250,252,.2)' };

function Marker({ x, y, label, fill = colors.player }) {
  return <g><circle cx={x} cy={y} r="8" fill={fill} stroke="#0B1522" strokeWidth="2" /><text x={x} y={y + 3} textAnchor="middle" className="diagram-marker-label">{label}</text></g>;
}

function Cone({ x, y, label }) {
  return <g><path d={`M${x} ${y - 7}l7 13h-14z`} fill={colors.cone} stroke="#0B1522" strokeWidth="1.5" /><text x={x} y={y + 20} textAnchor="middle" className="diagram-small-label">{label}</text></g>;
}

function Ball({ x, y }) {
  return <g><circle cx={x} cy={y} r="5" fill={colors.ball} stroke="#15221F" strokeWidth="1.5" /><path d={`M${x - 3} ${y}h6M${x} ${y - 3}v6`} stroke="#15221F" strokeWidth=".8" /></g>;
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
};

export default function ExerciseDiagram({ type = 'movement', title }) {
  const markerId = `arrow-${useId().replace(/:/g, '')}`;
  const renderDiagram = diagrams[type] || diagrams.movement;
  return <svg className="exercise-diagram" viewBox="0 0 440 190" role="img" aria-label={`${title}: ${type} drill setup and movement diagram`}>
    <defs><marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#6EE7B7" strokeWidth="1.5" /></marker></defs>
    <rect x="6" y="6" width="428" height="178" rx="4" className="diagram-pitch" />
    <path d="M220 7v176M7 95h426M174 7v178m92-178v178" className="diagram-field-line" />
    <circle cx="220" cy="95" r="28" className="diagram-field-line" fill="none" />
    {renderDiagram({ arrow: markerId })}
    <text x="16" y="22" className="diagram-caption">SETUP + MOVEMENT MAP</text>
  </svg>;
}