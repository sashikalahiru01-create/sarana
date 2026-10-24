// Generated from reference/sarana-story.html (the scene art only). The animation lives in ScrollStory.tsx.
// Element ids (#dog, #stand, #house, ...) are the hooks the GSAP timeline uses; do not rename them.

export function StoryScene({ dogLabel }: { dogLabel: string }) {
  return (
    <>
      <defs>
      <radialGradient id="furBody" cx=".4" cy=".3" r=".75"><stop offset="0" stopColor="#EFBB7E"/><stop offset=".6" stopColor="#D99A57"/><stop offset="1" stopColor="#A9672F"/></radialGradient>
      <radialGradient id="furHead" cx=".42" cy=".35" r=".7"><stop offset="0" stopColor="#F1C188"/><stop offset=".65" stopColor="#DA9C5A"/><stop offset="1" stopColor="#B07036"/></radialGradient>
      <linearGradient id="earFur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9A5A28"/><stop offset="1" stopColor="#C07E43"/></linearGradient>
      <radialGradient id="muzzle" cx=".5" cy=".35" r=".7"><stop offset="0" stopColor="#FFF1DB"/><stop offset="1" stopColor="#E8C08E"/></radialGradient>
      <radialGradient id="nose" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#5A4438"/><stop offset=".5" stopColor="#1E1712"/><stop offset="1" stopColor="#0A0705"/></radialGradient>
      <radialGradient id="rim" cx=".2" cy=".2" r=".8"><stop offset="0" stopColor="#FFE7A3" stopOpacity=".75"/><stop offset="1" stopColor="#FFE7A3" stopOpacity="0"/></radialGradient>
      <linearGradient id="coat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7CF55"/><stop offset=".55" stopColor="#E9AE24"/><stop offset="1" stopColor="#C28512"/></linearGradient>
      <linearGradient id="cardigan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3BA58D"/><stop offset="1" stopColor="#1F7562"/></linearGradient>
      <radialGradient id="skin" cx=".35" cy=".35" r=".75"><stop offset="0" stopColor="#A9714B"/><stop offset=".7" stopColor="#8A5A3C"/><stop offset="1" stopColor="#6A412A"/></radialGradient>
      <linearGradient id="vest" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3DB873"/><stop offset="1" stopColor="#22804B"/></linearGradient>
      <radialGradient id="skin2" cx=".35" cy=".35" r=".75"><stop offset="0" stopColor="#8E5E3E"/><stop offset=".7" stopColor="#6E4A32"/><stop offset="1" stopColor="#523422"/></radialGradient>
      <radialGradient id="lampGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFE9A8" stopOpacity=".7"/><stop offset="1" stopColor="#FFE9A8" stopOpacity="0"/></radialGradient>
      <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE9A8" stopOpacity=".35"/><stop offset="1" stopColor="#FFE9A8" stopOpacity=".04"/></linearGradient>
      <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B2342"/><stop offset="1" stopColor="#0B1024"/></linearGradient>
      <linearGradient id="roadWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C79B6E"/><stop offset="1" stopColor="#A57A52"/></linearGradient>
      <radialGradient id="puddle" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFE9A8" stopOpacity=".45"/><stop offset=".5" stopColor="#5C6FA8" stopOpacity=".35"/><stop offset="1" stopColor="#2B3760" stopOpacity="0"/></radialGradient>
      <radialGradient id="screenGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#BFD8FF" stopOpacity=".55"/><stop offset="1" stopColor="#BFD8FF" stopOpacity="0"/></radialGradient>
      <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="far"><feGaussianBlur stdDeviation="1.2"/></filter>
      <filter id="dustBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter>
      <radialGradient id="sunGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFF0B8" stopOpacity=".95"/><stop offset=".35" stopColor="#FFD76A" stopOpacity=".45"/><stop offset="1" stopColor="#FFD76A" stopOpacity="0"/></radialGradient>
      <radialGradient id="sunBeam" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="620"><stop offset="0" stopColor="#FFF3C4" stopOpacity=".7"/><stop offset=".45" stopColor="#FFF3C4" stopOpacity=".28"/><stop offset="1" stopColor="#FFF3C4" stopOpacity="0"/></radialGradient>
      </defs>

      {/* sunshine (scene 5): the sun sits behind the house; its beams are drawn later, in front.
          #sunPos is placed by ScrollStory so the sun stays in view on desktop and on phones. */}
      <g id="sun" opacity="0">
      <g id="sunPos" transform="translate(150 125)">
      <circle r="190" fill="url(#sunGlow)"/>
      <g id="sunRays" stroke="#FFB32E" strokeWidth="7" strokeLinecap="round">
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} y1="-62" y2={i % 2 ? -86 : -106} transform={`rotate(${i * 22.5})`} />
      ))}
      </g>
      <circle r="50" fill="#FFC93C"/>
      <circle r="44" fill="#FFD76A"/>
      <circle r="35" fill="#FFF0B8"/>
      </g>
      </g>

      {/* far city */}
      <g id="city" filter="url(#far)">
      <g fill="#182247">
      <rect x="-20" y="150" width="120" height="300"/><rect x="110" y="190" width="90" height="260"/><rect x="210" y="120" width="110" height="330"/>
      <rect x="560" y="170" width="100" height="280"/><rect x="670" y="110" width="130" height="340"/><rect x="810" y="160" width="100" height="290"/><rect x="920" y="200" width="100" height="250"/>
      </g>
      <g fill="#F5C76A" opacity=".55">
      <rect x="20" y="180" width="10" height="14"/><rect x="60" y="230" width="10" height="14"/><rect x="140" y="220" width="10" height="14"/><rect x="250" y="160" width="10" height="14"/><rect x="280" y="250" width="10" height="14"/>
      <rect x="590" y="200" width="10" height="14"/><rect x="700" y="150" width="10" height="14"/><rect x="760" y="220" width="10" height="14"/><rect x="840" y="190" width="10" height="14"/><rect x="950" y="240" width="10" height="14"/>
      </g>
      </g>
      
      {/* house (scene 5) */}
      <g id="house" opacity="0">
      <rect x="300" y="200" width="460" height="240" rx="8" fill="#FFF3E2"/>
      <rect x="300" y="200" width="460" height="240" rx="8" fill="#E8C9A4" opacity=".25"/>
      <path d="M270 210 L530 80 L790 210 Z" fill="#C8643A"/>
      <path d="M270 210 L530 80 L790 210 L770 220 L530 100 L290 220Z" fill="#A54E2C"/>
      <rect x="640" y="250" width="70" height="70" rx="8" fill="#FFD27A"/><path d="M675 250v70M640 285h70" stroke="#E2AD52" strokeWidth="4"/>
      <rect x="340" y="250" width="70" height="70" rx="8" fill="#FFD27A"/><path d="M375 250v70M340 285h70" stroke="#E2AD52" strokeWidth="4"/>
      <rect x="500" y="300" width="64" height="140" rx="6" fill="#8C4A2A"/><circle cx="552" cy="372" r="4" fill="#F2B544"/>
      <ellipse cx="860" cy="430" rx="60" ry="14" fill="#6F9E5B"/><circle cx="840" cy="400" r="34" fill="#7DB067"/><circle cx="880" cy="392" r="28" fill="#8DBD74"/>
      </g>
      
      {/* street wall with shop shutters */}
      <g id="street">
      <rect x="-3000" y="300" width="7000" height="142" fill="#1E2747"/>
      <g fill="#2A3459" stroke="#222B4D" strokeWidth="2">
      <rect x="600" y="318" width="170" height="124"/><rect x="800" y="318" width="170" height="124"/>
      </g>
      <g stroke="#1E2747" strokeWidth="2" opacity=".8">
      <path d="M600 332h170M600 346h170M600 360h170M600 374h170M600 388h170M600 402h170M600 416h170M600 430h170"/>
      <path d="M800 332h170M800 346h170M800 360h170M800 374h170M800 388h170M800 402h170M800 416h170M800 430h170"/>
      </g>
      <rect x="600" y="306" width="170" height="12" fill="#C0392B" opacity=".55"/>
      <rect x="800" y="306" width="170" height="12" fill="#2E86AB" opacity=".45"/>
      </g>
      
      {/* lamp */}
      <g id="lamp">
      <circle cx="300" cy="150" r="90" fill="url(#lampGlow)"/>
      <polygon id="coneShape" points="282,158 318,158 470,440 130,440" fill="url(#cone)"/>
      <rect x="292" y="140" width="10" height="302" rx="4" fill="#2F3A5E"/>
      <path d="M274 140 h46 a7 7 0 0 1 7 7 v6 h-60 v-6 a7 7 0 0 1 7 -7z" fill="#2F3A5E"/>
      <rect x="280" y="152" width="34" height="6" rx="3" fill="#FFF0BF"/>
      </g>
      
      {/* ground */}
      <rect id="groundNight" x="-3000" y="440" width="7000" height="130" fill="url(#road)"/>
      <rect id="groundWarm" x="-3000" y="440" width="7000" height="130" fill="url(#roadWarm)" opacity="0"/>
      <rect x="-3000" y="440" width="7000" height="8" fill="#000" opacity=".15"/>
      <g id="puddles">
      <ellipse cx="300" cy="490" rx="150" ry="16" fill="url(#puddle)"/>
      <ellipse cx="780" cy="515" rx="110" ry="12" fill="url(#puddle)"/>
      <g id="splashes" fill="none" stroke="#B9C9F0" strokeWidth="1.5" opacity=".7"></g>
      </g>
      
      {/* passers-by who don't stop */}
      <g id="passers" fill="#070B1A" opacity=".88">
      <g transform="translate(860,440)">
      <path d="M-8 -110 L-12 0 M8 -110 L12 0" stroke="#070B1A" strokeWidth="12" strokeLinecap="round"/>
      <path d="M-22 -200 Q0 -210 22 -200 L26 -100 L-26 -100Z"/><circle cx="0" cy="-222" r="17"/>
      <path d="M-62 -232 Q0 -300 62 -232 Q0 -248 -62 -232Z"/><path d="M0 -266 L0 -200" stroke="#070B1A" strokeWidth="3"/>
      </g>
      <g transform="translate(980,440) scale(.92)">
      <path d="M-8 -110 L-14 0 M8 -110 L14 0" stroke="#070B1A" strokeWidth="12" strokeLinecap="round"/>
      <path d="M-24 -200 Q0 -212 24 -200 L28 -100 L-28 -100Z"/><circle cx="0" cy="-224" r="17"/>
      <rect x="16" y="-170" width="22" height="30" rx="4"/>
      </g>
      </g>
      
      {/* dog */}
      <g transform="translate(276,190) scale(.72)">
      <g id="dog">
      <ellipse cx="200" cy="350" rx="135" ry="16" fill="#000" opacity=".35" filter="url(#soft)"/>
      <g className="dog-hit" id="dogHit" role="button" tabIndex={0} aria-label={dogLabel}>
      <g id="tail"><path d="M282 300 C 330 290, 352 255, 340 220" stroke="#B87437" strokeWidth="22" fill="none" strokeLinecap="round"/><path d="M285 298 C 326 288, 346 258, 338 230" stroke="#E2A866" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".6"/></g>
      <g id="body">
      <ellipse cx="200" cy="290" rx="100" ry="64" fill="url(#furBody)"/>
      <ellipse cx="200" cy="306" rx="54" ry="44" fill="url(#muzzle)"/>
      <rect x="146" y="298" width="38" height="52" rx="19" fill="url(#furBody)"/>
      <rect x="216" y="298" width="38" height="52" rx="19" fill="url(#furBody)"/>
      <ellipse cx="165" cy="346" rx="22" ry="10" fill="#F6DDB6"/>
      <ellipse cx="235" cy="346" rx="22" ry="10" fill="#F6DDB6"/>
      <path d="M156 346v-6M164 347v-7M174 346v-6M226 346v-6M234 347v-7M244 346v-6" stroke="#C9A27A" strokeWidth="2" strokeLinecap="round"/>
      <g stroke="#B07036" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".45">
      <path d="M118 270q6 -6 12 -4"/><path d="M128 300q6 -6 12 -4"/><path d="M262 262q6 -6 12 -2"/><path d="M270 290q6 -6 12 -2"/>
      </g>
      {/* street dust and mud: gone once he is cared for (scene 5) */}
      <g className="dust" filter="url(#dustBlur)">
      <ellipse cx="160" cy="262" rx="30" ry="14" transform="rotate(-12 160 262)" fill="#6B4A2B" opacity=".28"/>
      <ellipse cx="236" cy="316" rx="30" ry="12" fill="#6B4A2B" opacity=".24"/>
      <ellipse cx="256" cy="284" rx="15" ry="9" fill="#5A4128" opacity=".3"/>
      <ellipse cx="128" cy="304" rx="14" ry="9" fill="#5A4128" opacity=".26"/>
      <ellipse cx="165" cy="336" rx="19" ry="11" fill="#5A4128" opacity=".34"/>
      <ellipse cx="235" cy="337" rx="19" ry="10" fill="#5A4128" opacity=".34"/>
      <ellipse cx="165" cy="347" rx="23" ry="9" fill="#8A7358" opacity=".5"/>
      <ellipse cx="235" cy="347" rx="23" ry="9" fill="#8A7358" opacity=".5"/>
      </g>
      <g className="dust" fill="#4A3520" opacity=".5">
      <circle cx="148" cy="268" r="2.2"/><circle cx="176" cy="254" r="1.6"/><circle cx="190" cy="274" r="2"/><circle cx="224" cy="262" r="1.8"/>
      <circle cx="244" cy="300" r="2.4"/><circle cx="210" cy="326" r="1.8"/><circle cx="132" cy="288" r="1.8"/><circle cx="172" cy="324" r="2.2"/>
      <circle cx="258" cy="268" r="1.6"/><circle cx="122" cy="322" r="1.6"/>
      </g>
      {/* collar and tag: only a home gives him one (scene 5) */}
      <g id="collar" opacity="0">
      <path d="M146 228 Q200 246 254 228 L254 242 Q200 260 146 242Z" fill="#1F8A70"/>
      <circle cx="200" cy="256" r="9" fill="#F2B544"/><circle cx="197" cy="253" r="3" fill="#FFE7A0"/>
      </g>
      </g>
      <g id="head">
      <g id="earL"><path d="M150 128 C 122 84, 126 50, 148 40 C 174 56, 180 98, 174 128 Z" fill="url(#earFur)"/><path d="M156 116 C 142 86, 144 64, 150 56 C 164 72, 166 96, 164 116 Z" fill="#E9A79A" opacity=".75"/></g>
      <g id="earR"><path d="M250 128 C 278 84, 274 50, 252 40 C 226 56, 220 98, 226 128 Z" fill="url(#earFur)"/><path d="M244 116 C 258 86, 256 64, 250 56 C 236 72, 234 96, 236 116 Z" fill="#E9A79A" opacity=".75"/></g>
      <circle cx="200" cy="165" r="82" fill="url(#furHead)"/>
      <ellipse cx="238" cy="146" rx="30" ry="28" fill="#B9773D" opacity=".75"/>
      <g stroke="#B07036" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".5">
      <path d="M170 92q6 -8 14 -6"/><path d="M196 88q6 -8 14 -4"/><path d="M128 150q-2 -8 4 -14"/><path d="M272 150q2 -8 -4 -14"/>
      </g>
      <g className="dust" filter="url(#dustBlur)">
      <ellipse cx="152" cy="116" rx="24" ry="11" transform="rotate(-24 152 116)" fill="#6B4A2B" opacity=".26"/>
      <ellipse cx="236" cy="190" rx="17" ry="9" fill="#5A4128" opacity=".22"/>
      <ellipse cx="206" cy="102" rx="20" ry="8" fill="#6B4A2B" opacity=".2"/>
      <ellipse cx="132" cy="176" rx="12" ry="8" fill="#5A4128" opacity=".24"/>
      </g>
      <g className="dust" fill="#4A3520" opacity=".5">
      <circle cx="174" cy="108" r="1.8"/><circle cx="214" cy="116" r="1.5"/><circle cx="244" cy="128" r="2"/><circle cx="140" cy="140" r="1.6"/><circle cx="168" cy="204" r="1.4"/>
      </g>
      <ellipse id="dogRim" cx="150" cy="120" rx="70" ry="60" fill="url(#rim)"/>
      <g className="eye" id="eyeL"><ellipse className="socket" cx="170" cy="160" rx="17" ry="16" fill="#FFFFFF" stroke="#3A2614" strokeWidth="2.5"/><g id="pupilL"><circle cx="170" cy="161" r="9" fill="#0A0705"/><circle cx="173.5" cy="156.5" r="3" fill="#fff"/><circle cx="167" cy="165" r="1.3" fill="#fff" opacity=".8"/></g></g>
      <g className="eye" id="eyeR"><ellipse className="socket" cx="230" cy="160" rx="17" ry="16" fill="#FFFFFF" stroke="#3A2614" strokeWidth="2.5"/><g id="pupilR"><circle cx="230" cy="161" r="9" fill="#0A0705"/><circle cx="233.5" cy="156.5" r="3" fill="#fff"/><circle cx="227" cy="165" r="1.3" fill="#fff" opacity=".8"/></g></g>
      <g id="sadFace">
      <path d="M150 140 L184 130" stroke="#6B3D1A" strokeWidth="5" strokeLinecap="round"/>
      <path d="M250 140 L216 130" stroke="#6B3D1A" strokeWidth="5" strokeLinecap="round"/>
      <path id="tear" d="M158 180 q-5 9 0 13 q5 -4 0 -13z" fill="#A9D6F2"/>
      </g>
      <ellipse cx="200" cy="205" rx="44" ry="31" fill="url(#muzzle)"/>
      <path d="M200 196 V214" stroke="#B48A62" strokeWidth="2"/>
      <g fill="#9A7350" opacity=".6"><circle cx="178" cy="206" r="1.6"/><circle cx="186" cy="212" r="1.6"/><circle cx="214" cy="206" r="1.6"/><circle cx="222" cy="212" r="1.6"/></g>
      <ellipse cx="200" cy="189" rx="15" ry="11" fill="url(#nose)"/>
      <ellipse cx="195" cy="185" rx="4" ry="2.2" fill="#fff" opacity=".45"/>
      <g id="sadMouth"><path d="M182 224 Q200 213 218 224" stroke="#1E1712" strokeWidth="4" fill="none" strokeLinecap="round"/></g>
      <g id="happyFace" opacity="0">
      <path d="M150 134 Q166 124 184 130" stroke="#6B3D1A" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M250 134 Q234 124 216 130" stroke="#6B3D1A" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <circle cx="146" cy="198" r="12" fill="#EE9A8E" opacity=".45"/>
      <circle cx="254" cy="198" r="12" fill="#EE9A8E" opacity=".45"/>
      </g>
      <g id="happyMouth" opacity="0">
      <path d="M190 220 Q200 252 210 220Z" fill="#E8707A"/><path d="M200 224 V240" stroke="#C4505C" strokeWidth="2"/>
      <path d="M178 212 Q200 232 222 212" stroke="#1E1712" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </g>
      <g id="barkMouth" opacity="0">
      <path d="M176 210 Q200 204 224 210 Q222 252 200 254 Q178 252 176 210Z" fill="#3A1712"/>
      <ellipse cx="200" cy="243" rx="13" ry="8" fill="#E8707A"/>
      <path d="M183 210 l3.5 9 l3.5 -9Z M210 210 l3.5 9 l3.5 -9Z" fill="#FFFFFF"/>
      <path d="M176 210 Q200 204 224 210" stroke="#1E1712" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      </g>
      </g>
      </g>
      </g>
      </g>
      
      {/* bowl */}
      <g id="bowl" opacity="0">
      <ellipse cx="500" cy="440" rx="38" ry="6" fill="#000" opacity=".3" filter="url(#soft)"/>
      <ellipse cx="500" cy="420" rx="32" ry="7" fill="#7A3A22"/>
      <circle cx="490" cy="416" r="5" fill="#8A5A2B"/><circle cx="501" cy="413" r="5" fill="#A06A35"/><circle cx="511" cy="417" r="5" fill="#8A5A2B"/>
      <path d="M466 418 h68 l-8 18 h-52 z" fill="#E4572E"/><path d="M470 422 h60" stroke="#FF8A65" strokeWidth="2" opacity=".6"/>
      </g>
      
      {/* leash (scene 5) */}
      <path id="leash" d="M672 294 Q560 400 430 362" stroke="#C0392B" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0"/>
      
      {/* woman: standing with phone */}
      <g transform="translate(700,440)">
      <g id="stand">
      <ellipse cx="0" cy="2" rx="50" ry="8" fill="#000" opacity=".35" filter="url(#soft)"/>
      <path d="M-14 -118 L-18 -8" stroke="#2D3957" strokeWidth="20" strokeLinecap="round"/>
      <path d="M12 -118 L16 -8" stroke="#26304A" strokeWidth="20" strokeLinecap="round"/>
      <ellipse cx="-26" cy="-4" rx="16" ry="7" fill="#151A27"/><ellipse cx="10" cy="-4" rx="16" ry="7" fill="#151A27"/>
      <path d="M-32 -246 Q0 -260 32 -246 L46 -108 Q0 -96 -46 -108 Z" fill="url(#coat)"/>
      <path d="M-4 -250 L-6 -104" stroke="#B57A10" strokeWidth="2"/>
      <path d="M14 -160 h20 v14 h-20z" fill="#D3961A"/>
      <g id="armDown"><path d="M24 -236 Q38 -190 30 -150" stroke="#E2A523" strokeWidth="18" fill="none" strokeLinecap="round"/><circle cx="30" cy="-146" r="8" fill="#8A5A3C"/></g>
      <g id="armBack"><path d="M-22 -236 Q-36 -190 -28 -150" stroke="#EDB935" strokeWidth="18" fill="none" strokeLinecap="round"/><circle cx="-28" cy="-146" r="8" fill="#8A5A3C"/></g>
      <rect x="-8" y="-262" width="16" height="18" rx="6" fill="#6A412A"/>
      <circle cx="-2" cy="-284" r="25" fill="url(#skin)"/>
      <path d="M-26 -286 q-6 6 0 9" stroke="#5E3822" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="-14" cy="-289" rx="2.6" ry="3.3" fill="#120C08"/>
      <path d="M-21 -297 q6 -3 12 0" stroke="#1B1411" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <path d="M-20 -272 q5 -2 10 0" stroke="#5A2F1E" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M-26 -292 Q-26 -320 2 -320 Q32 -318 32 -284 Q32 -258 16 -252 L12 -274 Q8 -302 -22 -300 Z" fill="#DFA21E"/>
      <path d="M-22 -300 Q8 -302 12 -274" stroke="#B57A10" strokeWidth="2" fill="none"/>
      <g id="armPhone" opacity="0">
      <circle cx="-40" cy="-280" r="40" fill="url(#screenGlow)"/>
      <path d="M-22 -236 Q-58 -214 -54 -262" stroke="#EDB935" strokeWidth="18" fill="none" strokeLinecap="round"/>
      <circle cx="-54" cy="-268" r="8" fill="#8A5A3C"/>
      <rect x="-68" y="-298" width="13" height="25" rx="3" fill="#0E1322"/>
      <rect x="-67" y="-296" width="5" height="21" rx="2" fill="#9CC3FF" opacity=".5"/>
      </g>
      </g>
      </g>
      
      {/* volunteer (a different person): kneeling, feeding & petting */}
      <g transform="translate(590,440)">
      <g id="crouch" opacity="0">
      <ellipse cx="10" cy="2" rx="70" ry="9" fill="#000" opacity=".3" filter="url(#soft)"/>
      <path d="M6 -72 L32 -12 L72 -10" stroke="#5E5B42" strokeWidth="22" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="80" cy="-8" rx="15" ry="7" fill="#2A2420"/>
      <path d="M-4 -76 L-46 -68 L-48 -8" stroke="#6E6B50" strokeWidth="22" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="-58" cy="-4" rx="17" ry="7" fill="#2A2420"/>
      <path d="M-40 -184 Q-12 -198 14 -182 L32 -66 Q2 -52 -30 -68 Z" fill="url(#vest)"/>
      <path d="M-36 -150 L22 -158 L26 -136 L-32 -128Z" fill="#F4F1E8" opacity=".9"/>
      <circle cx="-4" cy="-143" r="5" fill="#1F8A70"/>
      <path d="M8 -174 Q2 -156 -4 -142" stroke="#2E9A60" strokeWidth="20" fill="none" strokeLinecap="round"/>
      <path d="M-4 -142 Q-22 -116 -40 -98" stroke="#6E4A32" strokeWidth="15" fill="none" strokeLinecap="round"/><circle cx="-42" cy="-94" r="8" fill="#6E4A32"/>
      <rect x="-42" y="-200" width="16" height="16" rx="6" fill="#583824"/>
      <circle cx="-36" cy="-214" r="24" fill="url(#skin2)"/>
      <path d="M-58 -214 q-6 6 0 9" stroke="#4A2C1A" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M-52 -219 q4 -4 9 0" stroke="#120C08" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
      <path d="M-54 -201 q6 5 12 1" stroke="#3A1E12" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <path d="M-58 -206 Q-50 -190 -30 -192 Q-18 -194 -14 -206" stroke="#1B1411" strokeWidth="5" fill="none" opacity=".35" strokeLinecap="round"/>
      <path d="M-14 -228 Q-10 -210 -16 -200" stroke="#1B1411" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M-60 -224 Q-58 -246 -34 -246 Q-10 -246 -10 -222 Z" fill="#1F6F5A"/>
      <path d="M-60 -225 L-80 -222 Q-74 -217 -58 -218Z" fill="#185A49"/>
      <circle cx="-34" cy="-236" r="4" fill="#F4F1E8"/>
      <g id="petArm"><path d="M-30 -176 Q-46 -168 -60 -162" stroke="#33A867" strokeWidth="20" fill="none" strokeLinecap="round"/><path d="M-60 -162 Q-82 -154 -100 -150" stroke="#6E4A32" strokeWidth="15" fill="none" strokeLinecap="round"/><ellipse cx="-106" cy="-150" rx="11" ry="8" fill="#6E4A32"/></g>
      </g>
      </g>
      
      {/* woman: at home, no raincoat, smiling, holding the leash */}
      <g transform="translate(700,440)">
      <g id="home" opacity="0">
      <ellipse cx="0" cy="2" rx="50" ry="8" fill="#000" opacity=".25" filter="url(#soft)"/>
      <path d="M-14 -118 L-18 -8" stroke="#3A4A6E" strokeWidth="20" strokeLinecap="round"/>
      <path d="M12 -118 L16 -8" stroke="#34436A" strokeWidth="20" strokeLinecap="round"/>
      <ellipse cx="-26" cy="-4" rx="16" ry="7" fill="#F1F1F1"/><ellipse cx="10" cy="-4" rx="16" ry="7" fill="#E4E4E4"/>
      <path d="M-30 -246 Q0 -258 30 -246 L40 -112 Q0 -102 -40 -112 Z" fill="url(#cardigan)"/>
      <path d="M-10 -248 L-4 -200 L4 -248Z" fill="#F7E7D2"/>
      <path d="M24 -236 Q38 -190 30 -150" stroke="#2A8C78" strokeWidth="18" fill="none" strokeLinecap="round"/><circle cx="30" cy="-146" r="8" fill="#8A5A3C"/>
      <path d="M-22 -236 Q-36 -190 -28 -150" stroke="#34A089" strokeWidth="18" fill="none" strokeLinecap="round"/><circle cx="-28" cy="-146" r="8" fill="#8A5A3C"/>
      <rect x="-8" y="-262" width="16" height="18" rx="6" fill="#6A412A"/>
      <circle cx="-2" cy="-284" r="25" fill="url(#skin)"/>
      <path d="M-26 -286 q-6 6 0 9" stroke="#5E3822" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M-18 -290 q4 -4 9 0" stroke="#120C08" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
      <path d="M-22 -274 q8 7 16 1" stroke="#5A2F1E" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <circle cx="-10" cy="-278" r="5" fill="#C9705A" opacity=".35"/>
      <path d="M-24 -292 Q-22 -314 0 -312 Q24 -310 26 -286 Q26 -270 18 -262 L14 -280 Q4 -300 -24 -292Z" fill="#1B1411"/>
      <circle cx="22" cy="-308" r="11" fill="#1B1411"/>
      <ellipse cx="8" cy="-284" rx="4" ry="6" fill="#6A412A"/>
      </g>
      </g>
      
      {/* photo that flies out of the phone (scene 2) */}
      <g transform="translate(300,70)">
      <g id="polaroid" opacity="0">
      <rect x="0" y="0" width="120" height="140" rx="6" fill="#FFFFFF"/>
      <rect x="8" y="8" width="104" height="96" rx="3" fill="#1A2550"/>
      <circle cx="60" cy="66" r="28" fill="url(#furHead)"/><path d="M38 52 C 32 40, 36 30, 42 28 C 48 34, 50 44, 48 54Z" fill="#9A5A28" transform="rotate(-80 44 54)"/><path d="M82 52 C 88 40, 84 30, 78 28 C 72 34, 70 44, 72 54Z" fill="#9A5A28"/>
      <circle cx="51" cy="62" r="3.5" fill="#1A120C"/><circle cx="69" cy="62" r="3.5" fill="#1A120C"/><ellipse cx="60" cy="74" rx="5" ry="3.5" fill="#1A120C"/>
      <rect x="14" y="114" width="60" height="6" rx="3" fill="#D8DCE6"/><rect x="14" y="124" width="38" height="6" rx="3" fill="#E6E9F0"/>
      </g>
      </g>
      
      {/* map card (scene 3) */}
      <g transform="translate(290,50)">
      <g id="map" opacity="0">
      <rect x="0" y="0" width="240" height="180" rx="20" fill="#EAF2EC"/>
      <path d="M0 90 L240 60" stroke="#fff" strokeWidth="13"/><path d="M95 0 L125 180" stroke="#fff" strokeWidth="10"/><path d="M0 145 L240 130" stroke="#F7FBF8" strokeWidth="6"/>
      <rect x="160" y="14" width="56" height="36" rx="8" fill="#CFE5D7"/><rect x="18" y="104" width="64" height="30" rx="8" fill="#CBE0EE"/>
      <circle cx="40" cy="40" r="6" fill="#2E86AB"/><circle cx="40" cy="40" r="12" fill="#2E86AB" opacity=".2"/>
      <circle id="ripple" cx="140" cy="100" r="10" fill="none" stroke="#E4572E" strokeWidth="3" opacity="0"/>
      <g id="pin"><path d="M140 100 c-13 -16 -22 -26 -22 -38 a22 22 0 0 1 44 0 c0 12 -9 22 -22 38z" fill="#E4572E"/><circle cx="140" cy="62" r="8" fill="#fff"/></g>
      </g>
      </g>
      
      {/* hearts */}
      <g id="hearts">
      <path className="heart" transform="translate(360,170)" d="M0 -6 C -6 -16 -20 -8 -12 4 L0 16 L12 4 C 20 -8 6 -16 0 -6Z" fill="#E4572E" opacity="0"/>
      <path className="heart" transform="translate(560,150) scale(.8)" d="M0 -6 C -6 -16 -20 -8 -12 4 L0 16 L12 4 C 20 -8 6 -16 0 -6Z" fill="#F2B544" opacity="0"/>
      <path className="heart" transform="translate(470,110) scale(1.2)" d="M0 -6 C -6 -16 -20 -8 -12 4 L0 16 L12 4 C 20 -8 6 -16 0 -6Z" fill="#E4572E" opacity="0"/>
      </g>

      {/* sunbeams fanning out from the sun over the home scene (scene 5) */}
      <g id="sunBeams" opacity="0" pointerEvents="none" style={{ mixBlendMode: "screen" }} transform="translate(150 125)">
      <polygon points="0,0 250,510 440,430" fill="url(#sunBeam)"/>
      <polygon points="0,0 480,330 640,230" fill="url(#sunBeam)" opacity=".8"/>
      <polygon points="0,0 70,520 230,520" fill="url(#sunBeam)" opacity=".7"/>
      </g>
      {/* dust motes drifting in the light */}
      <g id="sunMotes" opacity="0" pointerEvents="none" fill="#FFF3C4">
      {[
        [330, 300, 2.4], [400, 250, 1.8], [470, 330, 2.6], [520, 200, 1.8], [560, 380, 2.2],
        [610, 270, 2.4], [300, 390, 1.8], [450, 160, 2], [640, 340, 2.2], [380, 190, 1.6],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} className="mote" cx={cx} cy={cy} r={r} />
      ))}
      </g>

      <rect id="nightTint" x="-3000" y="0" width="7000" height="600" fill="#0D1838" opacity=".22" pointerEvents="none" style={{ mixBlendMode: "multiply" }}/>
      <g id="rain" stroke="#A9BEE6" strokeWidth="1.6" strokeLinecap="round" opacity=".55"></g>
      <rect id="flash" x="-3000" y="0" width="7000" height="600" fill="#fff" opacity="0" pointerEvents="none"/>
    </>
  );
}
