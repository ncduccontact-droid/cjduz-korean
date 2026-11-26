// Bespoke Colorful 3D Puff-Keycap Icon System — Hand-crafted in the D ● TOPIK Mascot Aesthetic
// Zero OS/phone emojis: every icon has chubby rounded geometry, 3D bottom lip, glossy glint & vibrant distinct palette.

export function dTopikMascotHTML(size = 36) {
  const h = Math.round(size * 0.94);
  return `<img src="/media/d_topik_mascot.png" width="${size}" height="${h}" alt="D ● TOPIK" class="dtopik-mascot-img" style="width:${size}px;height:auto;object-fit:contain;display:inline-block;vertical-align:middle;flex-shrink:0;" />`;
}

export function dTopikLogoFullHTML(height = 38) {
  return `<img src="/media/d_topik_logo.png" height="${height}" alt="D ● TOPIK" class="dtopik-logo-img" style="height:${height}px;width:auto;object-fit:contain;display:block;flex-shrink:0;" />`;
}

export function dTopikWordmarkHTML() {
  return `<span class="dtopik-wordmark">D <span class="dtopik-dot">●</span> TOPIK</span>`;
}

export const daisyLogoSVG = dTopikMascotHTML;

const COLOR_ICONS = {
  // Jade-Mint Puff House + Warm Sun Door
  home: `
    <path d="M4 11.2L12 4.6l8 6.6V19.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-8.3z" fill="#0D9488"/>
    <path d="M4 10.2L12 3.6l8 6.6V18a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18v-7.8z" fill="#2DD4BF"/>
    <path d="M2.8 11L12 3.3 21.2 11" stroke="#0B253C" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="9.5" y="13" width="5" height="7.5" rx="2" fill="#FBBF24" stroke="#0B253C" stroke-width="1.5"/>
    <circle cx="12" cy="9.2" r="1.6" fill="#FFFFFF"/>
  `,

  // Sky-Cobalt 3D Textbook + Golden Bookmark
  book: `
    <rect x="4.5" y="4.5" width="15" height="17" rx="3.5" fill="#0369A1"/>
    <rect x="4.5" y="3" width="15" height="16.8" rx="3.5" fill="#38BDF8"/>
    <path d="M7.5 3h3.8v6.6l-1.9-1.4-1.9 1.4V3z" fill="#FBBF24"/>
    <rect x="7.5" y="12" width="9" height="2" rx="1" fill="#FFFFFF"/>
    <rect x="7.5" y="15.2" width="6" height="1.8" rx="0.9" fill="#E0F2FE"/>
    <path d="M5 17.5a2.2 2.2 0 0 1 2.2-2.2h12.3v2.5a2.2 2.2 0 0 1-2.2 2.2H7.2A2.2 2.2 0 0 1 5 17.8z" fill="#FFFFFF" fill-opacity="0.92"/>
  `,

  // Warm Tangerine-Amber 3D Workbook + Mint Check
  workbook: `
    <rect x="4.5" y="4.5" width="15" height="17" rx="3.5" fill="#C2410C"/>
    <rect x="4.5" y="3" width="15" height="16.8" rx="3.5" fill="#FB923C"/>
    <rect x="7" y="5.8" width="10" height="11.2" rx="2" fill="#FFFFFF"/>
    <path d="M9.2 10.8l1.6 1.6 3.5-3.5" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="9" y="14.2" width="6" height="1.6" rx="0.8" fill="#FDBA74"/>
  `,

  // Coral + Aqua Stacked 3D Keycap Flashcards (with mascot visor wink!)
  cards: `
    <rect x="7.5" y="3" width="13.5" height="15" rx="3.5" transform="rotate(7 7.5 3)" fill="#FB7185"/>
    <rect x="3" y="6.8" width="14.5" height="15" rx="3.8" fill="#0D9488"/>
    <rect x="3" y="5" width="14.5" height="14.8" rx="3.8" fill="#2DD4BF"/>
    <rect x="5.4" y="7.8" width="9.7" height="6" rx="2" fill="#0B253C"/>
    <path d="M7.3 11.4l1.1-1.3 1.1 1.3M11.1 11.4l1.1-1.3 1.1 1.3" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="6" y="15.6" width="3.6" height="2.2" rx="0.9" fill="#FFFFFF"/>
    <rect x="10.8" y="15.6" width="3.6" height="2.2" rx="0.9" fill="#FFFFFF"/>
  `,

  // Ruby-Coral Mascot TV Console (YouTube Shorts / Video)
  video: `
    <rect x="2.5" y="6.5" width="19" height="13.5" rx="4.5" fill="#BE123C"/>
    <rect x="2.5" y="4.8" width="19" height="13.5" rx="4.5" fill="#FB7185"/>
    <rect x="5" y="7" width="14" height="8.5" rx="2.5" fill="#0B253C"/>
    <path d="M10.4 9.1l4.6 2.2-4.6 2.2V9.1z" fill="#FDE047"/>
    <rect x="12.5" y="16.2" width="3" height="1.5" rx="0.7" fill="#FFFFFF"/>
    <rect x="16.2" y="16.2" width="3" height="1.5" rx="0.7" fill="#FFFFFF"/>
    <path d="M18.5 2.4l-1 1.6M21.2 4l-1.5 1" stroke="#FB7185" stroke-width="1.8" stroke-linecap="round"/>
  `,

  // Royal Indigo-Violet 3D Exam Clipboard + Gold Star
  exam: `
    <rect x="4.5" y="5.2" width="15" height="16.8" rx="3.8" fill="#4338CA"/>
    <rect x="4.5" y="3.6" width="15" height="16.5" rx="3.8" fill="#818CF8"/>
    <rect x="7" y="6.8" width="10" height="11" rx="2" fill="#FFFFFF"/>
    <rect x="9" y="2.2" width="6" height="3.2" rx="1.6" fill="#FBBF24" stroke="#0B253C" stroke-width="1.3"/>
    <path d="M8.8 10.2h6.4M8.8 13h6.4M8.8 15.6h4" stroke="#6366F1" stroke-width="1.8" stroke-linecap="round"/>
  `,

  // Golden Amber & Teal 3D Compass
  compass: `
    <circle cx="12" cy="12.8" r="9" fill="#B45309"/>
    <circle cx="12" cy="11.4" r="9" fill="#FBBF24"/>
    <circle cx="12" cy="11.4" r="6.4" fill="#FFFFFF"/>
    <polygon points="15.6,7.8 13.3,12.7 10.7,10.1" fill="#F43F5E"/>
    <polygon points="8.4,15 10.7,10.1 13.3,12.7" fill="#0D9488"/>
    <circle cx="12" cy="11.4" r="1.3" fill="#0B253C"/>
  `,

  // Electric Orchid-Violet Puff Magic Sparkle + Gold & Mint Stars
  sparkle: `
    <path d="M11.5 3.8l2.1 5.1 5.1 2.1-5.1 2.1-2.1 5.1-2.1-5.1-5.1-2.1 5.1-2.1 2.1-5.1z" fill="#7E22CE"/>
    <path d="M11.5 2.6l2.1 5.1 5.1 2.1-5.1 2.1-2.1 5.1-2.1-5.1-5.1-2.1 5.1-2.1 2.1-5.1z" fill="#C084FC"/>
    <circle cx="10.2" cy="8.4" r="1.2" fill="#FFFFFF" fill-opacity="0.85"/>
    <path d="M18.8 14.5l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9.9-2.2z" fill="#FACC15"/>
    <circle cx="5.2" cy="17.8" r="1.6" fill="#2DD4BF"/>
  `,

  // Vivid Sky-Blue 3D Speaker + Mascot Sound-Wave Pills
  speaker: `
    <path d="M3.5 10.4h3.6l4.9-4v12.8l-4.9-4H3.5A1.8 1.8 0 0 1 1.7 13.4v-1.2a1.8 1.8 0 0 1 1.8-1.8z" fill="#0369A1"/>
    <path d="M3.5 9.2h3.6l4.9-4v12.8l-4.9-4H3.5A1.8 1.8 0 0 1 1.7 12.2V11a1.8 1.8 0 0 1 1.8-1.8z" fill="#38BDF8"/>
    <rect x="4" y="10.4" width="2.2" height="2.4" rx="1" fill="#FFFFFF" fill-opacity="0.8"/>
    <path d="M15.6 9.2a4.2 4.2 0 0 1 0 5.6" stroke="#F59E0B" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M18.6 6.8a7.5 7.5 0 0 1 0 10.4" stroke="#10B981" stroke-width="2.4" stroke-linecap="round"/>
  `,

  // Studio Berry-Violet Headphones + Coral Earcups
  headphones: `
    <path d="M4.5 13v-1.2a7.5 7.5 0 0 1 15 0V13" stroke="#6366F1" stroke-width="3" stroke-linecap="round"/>
    <rect x="2.8" y="12.5" width="4.6" height="7.5" rx="2.3" fill="#BE123C"/>
    <rect x="2.8" y="11.5" width="4.6" height="7.2" rx="2.3" fill="#FB7185"/>
    <rect x="16.6" y="12.5" width="4.6" height="7.5" rx="2.3" fill="#BE123C"/>
    <rect x="16.6" y="11.5" width="4.6" height="7.2" rx="2.3" fill="#FB7185"/>
    <rect x="4" y="13" width="1.2" height="3" rx="0.6" fill="#FFFFFF" fill-opacity="0.8"/>
    <rect x="17.8" y="13" width="1.2" height="3" rx="0.6" fill="#FFFFFF" fill-opacity="0.8"/>
  `,

  // Hot Coral-Rose Studio Mic + Mint Base
  mic: `
    <rect x="8.5" y="3.8" width="7" height="11" rx="3.5" fill="#BE123C"/>
    <rect x="8.5" y="2.6" width="7" height="10.8" rx="3.5" fill="#FB7185"/>
    <path d="M10.5 6.2h3M10.5 8.8h3" stroke="#0B253C" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M6.2 11.8a5.8 5.8 0 0 0 11.6 0" stroke="#0D9488" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M12 17.6v3M8.8 20.8h6.4" stroke="#0D9488" stroke-width="2.3" stroke-linecap="round"/>
  `,

  // Sunny Mango-Orange Chubby Pencil + Coral Eraser
  pen: `
    <path d="M15.4 3.6a2.8 2.8 0 0 1 4 4L9.2 17.8 4 19.5l1.7-5.2L15.4 3.6z" fill="#EA580C"/>
    <path d="M15.4 2.8a2.8 2.8 0 0 1 4 4L9.2 17 4 18.7l1.7-5.2L15.4 2.8z" fill="#FBBF24"/>
    <path d="M15.4 2.8a2.8 2.8 0 0 1 4 4l-1.8 1.8-4-4 1.8-1.8z" fill="#FB7185"/>
    <path d="M4 18.7l3.1-1-2.1-2.1-1 3.1z" fill="#0B253C"/>
  `,

  // 3D Plump Honey-Gold Star
  star: `
    <path d="M12 4.2l2.6 5.1 5.6.8-4.1 4 .9 5.6L12 17.1 7 19.7l.9-5.6-4.1-4 5.6-.8L12 4.2z" fill="#D97706"/>
    <path d="M12 2.8l2.6 5.1 5.6.8-4.1 4 .9 5.6L12 15.7 7 18.3l.9-5.6-4.1-4 5.6-.8L12 2.8z" fill="#FACC15"/>
    <circle cx="10.2" cy="9.2" r="1.2" fill="#FFFFFF" fill-opacity="0.85"/>
  `,

  // Juicy Lime-Emerald Puff Sprout + Sun Dot
  sprout: `
    <path d="M12 20.5v-8.5" stroke="#15803D" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M12 13.2C7.2 13.2 4.5 10 4.5 5.8c4.4 0 7.5 2.8 7.5 7.4z" fill="#22C55E"/>
    <path d="M12 11.4c4.5 0 7.5-2.8 7.5-6.8-4.5 0-7.5 2.5-7.5 6.8z" fill="#4ADE80"/>
    <circle cx="12" cy="4.2" r="1.8" fill="#FACC15"/>
  `,

  // Cyan-Sky Glossy Magnifier + Amber Handle
  search: `
    <path d="M15.8 15.8l4.4 4.4" stroke="#F59E0B" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="10.8" cy="10.8" r="7" fill="#E0F2FE" stroke="#0EA5E9" stroke-width="2.6"/>
    <path d="M8 8.2a3.8 3.8 0 0 1 4.2-.8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
  `,

  // Candy Artist Palette with 4 Popping Dots
  palette: `
    <path d="M12 4.2a8.3 8.3 0 0 0 0 16.6c1.5 0 2.4-.9 2.4-2.1 0-.6-.2-1.1-.6-1.5-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2.1-2H17a3.4 3.4 0 0 0 3.4-3.4C20.4 7.2 16.6 4.2 12 4.2z" fill="#D97706"/>
    <path d="M12 3a8.3 8.3 0 0 0 0 16.6c1.5 0 2.4-.9 2.4-2.1 0-.6-.2-1.1-.6-1.5-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2.1-2H17a3.4 3.4 0 0 0 3.4-3.4C20.4 6 16.6 3 12 3z" fill="#FDE68A"/>
    <circle cx="7.8" cy="10.4" r="1.5" fill="#F43F5E"/>
    <circle cx="11.2" cy="7.3" r="1.5" fill="#10B981"/>
    <circle cx="15.2" cy="8.8" r="1.5" fill="#3B82F6"/>
    <circle cx="8.6" cy="14.4" r="1.4" fill="#A855F7"/>
  `,

  // Sky Puff Cloud + Emerald Check Badge
  cloud: `
    <path d="M7.2 19.2h9.6a4.2 4.2 0 0 0 .6-8.3A5.8 5.8 0 0 0 6 9.6a4.7 4.7 0 0 0 1.2 9.6z" fill="#0284C7"/>
    <path d="M7.2 17.8h9.6a4.2 4.2 0 0 0 .6-8.3A5.8 5.8 0 0 0 6 8.2a4.7 4.7 0 0 0 1.2 9.6z" fill="#7DD3FC"/>
    <circle cx="16.8" cy="16.8" r="4.2" fill="#10B981"/>
    <path d="M15 16.8l1.3 1.3 2.5-2.6" stroke="#FFFFFF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // Teal-Sky Mascot User Tile
  user: `
    <rect x="3.5" y="4.5" width="17" height="16.5" rx="5" fill="#0D9488"/>
    <rect x="3.5" y="3" width="17" height="16.5" rx="5" fill="#2DD4BF"/>
    <circle cx="12" cy="9.2" r="3.3" fill="#FFFFFF"/>
    <path d="M6.8 17.6c1.1-2.5 3-3.7 5.2-3.7s4.1 1.2 5.2 3.7" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
  `,

  // Tri-Color 3D Keycap Chart Bars
  chart: `
    <rect x="3.5" y="12.5" width="4.5" height="8" rx="1.8" fill="#38BDF8"/>
    <rect x="9.8" y="8.5" width="4.5" height="12" rx="1.8" fill="#FBBF24"/>
    <rect x="16" y="4.5" width="4.5" height="16" rx="1.8" fill="#10B981"/>
    <circle cx="5.8" cy="9.2" r="1.5" fill="#FB7185"/>
  `,

  // Mint & Coral Twin Mascot Speech Bubbles
  chat: `
    <path d="M9.5 5.5h9A2.8 2.8 0 0 1 21.3 8.3v5a2.8 2.8 0 0 1-2.8 2.8H17l-2.6 2.4v-2.4H9.5a2.8 2.8 0 0 1-2.8-2.8v-5A2.8 2.8 0 0 1 9.5 5.5z" fill="#FB7185"/>
    <path d="M5.5 3.5h9.5a2.8 2.8 0 0 1 2.8 2.8v5.4a2.8 2.8 0 0 1-2.8 2.8H9.8l-3.3 2.8v-2.8H5.5a2.8 2.8 0 0 1-2.8-2.8V6.3a2.8 2.8 0 0 1 2.8-2.8z" fill="#2DD4BF"/>
    <rect x="5.2" y="6.2" width="10" height="5.2" rx="1.8" fill="#0B253C"/>
    <circle cx="8" cy="8.8" r="1" fill="#FFFFFF"/>
    <circle cx="10.3" cy="8.8" r="1" fill="#FFFFFF"/>
    <circle cx="12.6" cy="8.8" r="1" fill="#FFFFFF"/>
  `,

  // 3-Layer Colorful Diamond Stack
  layers: `
    <path d="M12 12.2L3.5 16.6 12 21l8.5-4.4L12 12.2z" fill="#FBBF24"/>
    <path d="M12 8L3.5 12.4 12 16.8l8.5-4.4L12 8z" fill="#818CF8"/>
    <path d="M12 3.6L3.5 8 12 12.4 8.5 8 12 3.6z" fill="#2DD4BF"/>
    <path d="M12 3.6L3.5 8 12 12.4 20.5 8 12 3.6z" fill="#2DD4BF"/>
  `,

  // Glowing Lemon-Gold Idea Bulb + 3 Mascot Rays
  bulb: `
    <path d="M9.5 17.5h5v2a1.8 1.8 0 0 1-1.8 1.8h-1.4a1.8 1.8 0 0 1-1.8-1.8v-2z" fill="#475569"/>
    <path d="M12 4a6.5 6.5 0 0 0-3.8 11.8c.7.5 1.2 1.2 1.3 2h5c.1-.8.6-1.5 1.3-2A6.5 6.5 0 0 0 12 4z" fill="#FACC15"/>
    <circle cx="10.2" cy="8.8" r="1.6" fill="#FFFFFF" fill-opacity="0.85"/>
    <path d="M12 1.6v1.4M18.8 4.4l-1 1M5.2 4.4l1 1" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
  `,

  // Crimson-Coral Bullseye + Teal Dart
  target: `
    <circle cx="12" cy="12.5" r="8.5" fill="#BE123C"/>
    <circle cx="12" cy="11.8" r="8.5" fill="#FB7185"/>
    <circle cx="12" cy="11.8" r="5.5" fill="#FFFFFF"/>
    <circle cx="12" cy="11.8" r="2.6" fill="#FACC15"/>
    <path d="M19.5 4.3L12.6 11.2" stroke="#0B253C" stroke-width="2.1" stroke-linecap="round"/>
    <polygon points="19.5,2.5 21.5,4.5 18.8,5.2" fill="#2DD4BF"/>
  `,

  // Golden Champion Trophy + Coral Star
  trophy: `
    <path d="M8.5 19h7v2.2h-7V19z" fill="#B45309"/>
    <path d="M10.8 15h2.4v4h-2.4v-4z" fill="#D97706"/>
    <path d="M6.5 4.5h11v4.8a5.5 5.5 0 0 1-11 0V4.5z" fill="#FACC15"/>
    <path d="M6.5 6H4.5a2 2 0 0 0 0 4h2M17.5 6h2a2 2 0 0 1 0 4h-2" stroke="#F59E0B" stroke-width="2.1" stroke-linecap="round"/>
    <circle cx="12" cy="8.8" r="1.8" fill="#FB7185"/>
  `,

  // Emerald 3D Keycap Check Badge
  check: `
    <rect x="3" y="4.5" width="18" height="17" rx="5" fill="#047857"/>
    <rect x="3" y="3" width="18" height="16.8" rx="5" fill="#10B981"/>
    <path d="M7.8 11.6l3 3 5.6-5.8" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // Rose-Red 3D Keycap Cross Badge
  cross: `
    <rect x="3" y="4.5" width="18" height="17" rx="5" fill="#BE123C"/>
    <rect x="3" y="3" width="18" height="16.8" rx="5" fill="#F43F5E"/>
    <path d="M8.8 8.2l6.4 6.4M15.2 8.2l-6.4 6.4" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  `,

  // Amber-Orange 3D Warning Keycap
  warn: `
    <path d="M10.3 4.8a2 2 0 0 1 3.4 0l7.1 12.4a2 2 0 0 1-1.7 3H4.9a2 2 0 0 1-1.7-3l7.1-12.4z" fill="#B45309"/>
    <path d="M10.3 3.5a2 2 0 0 1 3.4 0l7.1 12.4a2 2 0 0 1-1.7 3H4.9a2 2 0 0 1-1.7-3l7.1-12.4z" fill="#FBBF24"/>
    <path d="M12 8.6v4.4" stroke="#0B253C" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="12" cy="15.8" r="1.3" fill="#0B253C"/>
  `,

  // Coral-Red 3D Pushpin
  pin: `
    <path d="M12 14.5v6.5" stroke="#64748B" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M7 14.5h10l-1.6-4.2V6.5h1.1V4H7.5v2.5h1.1v3.8L7 14.5z" fill="#F43F5E"/>
    <rect x="8.5" y="4.5" width="7" height="1.5" rx="0.7" fill="#FDA4AF"/>
  `,

  // Sky-Blue & Coral 3D Stopwatch
  clock: `
    <rect x="9.5" y="2" width="5" height="2.4" rx="1.2" fill="#F43F5E"/>
    <circle cx="12" cy="13.4" r="8.2" fill="#0284C7"/>
    <circle cx="12" cy="12.4" r="8.2" fill="#38BDF8"/>
    <circle cx="12" cy="12.4" r="5.8" fill="#FFFFFF"/>
    <path d="M12 9.2v3.4l2.4 1.6" stroke="#F43F5E" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // Mint-Sky Chubby Loop / Refresh Arrows
  refresh: `
    <rect x="3" y="4" width="18" height="16.5" rx="5" fill="#E0F2FE"/>
    <path d="M7.5 10.5A4.8 4.8 0 0 1 16 8.2" stroke="#0EA5E9" stroke-width="2.3" stroke-linecap="round"/>
    <polygon points="16.8,5.8 17.6,9.6 13.8,9" fill="#0EA5E9"/>
    <path d="M16.5 13.5A4.8 4.8 0 0 1 8 15.8" stroke="#10B981" stroke-width="2.3" stroke-linecap="round"/>
    <polygon points="7.2,18.2 6.4,14.4 10.2,15" fill="#10B981"/>
  `,

  // Coral-Crimson Waving Pennant Flag
  flag: `
    <path d="M6 3.5v17" stroke="#0B253C" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M6.5 4.5h11.5l-2.4 4 2.4 4H6.5v-8z" fill="#F43F5E"/>
    <circle cx="6" cy="3.5" r="1.6" fill="#FBBF24"/>
  `,

  // Emerald 3D Play Keycap
  play: `
    <rect x="3" y="4.5" width="18" height="17" rx="5" fill="#0D9488"/>
    <rect x="3" y="3" width="18" height="16.8" rx="5" fill="#2DD4BF"/>
    <path d="M9.8 7.6l6.4 3.8-6.4 3.8V7.6z" fill="#FFFFFF"/>
  `,

  // Coral 3D Stop Keycap
  stop: `
    <rect x="3" y="4.5" width="18" height="17" rx="5" fill="#BE123C"/>
    <rect x="3" y="3" width="18" height="16.8" rx="5" fill="#FB7185"/>
    <rect x="8.5" y="8" width="7" height="7" rx="1.6" fill="#FFFFFF"/>
  `,

  // D-TOPIK Mascot Twin 3D Keycap Keyboard
  keyboard: `
    <rect x="2.5" y="6.5" width="19" height="13" rx="4" fill="#0284C7"/>
    <rect x="2.5" y="5" width="19" height="12.8" rx="4" fill="#38BDF8"/>
    <rect x="5.2" y="7.8" width="4" height="3.4" rx="1" fill="#FFFFFF"/>
    <rect x="10" y="7.8" width="4" height="3.4" rx="1" fill="#FFFFFF"/>
    <rect x="14.8" y="7.8" width="4" height="3.4" rx="1" fill="#FDE047"/>
    <rect x="6.8" y="12.6" width="10.4" height="2.6" rx="1" fill="#FFFFFF"/>
  `,

  // Teal-Gold Jigsaw Word Block
  puzzle: `
    <rect x="4.5" y="6.5" width="13" height="13" rx="3.2" fill="#0D9488"/>
    <rect x="4.5" y="5.2" width="13" height="12.8" rx="3.2" fill="#2DD4BF"/>
    <circle cx="11" cy="4.2" r="2.3" fill="#2DD4BF"/>
    <circle cx="18.3" cy="11.6" r="2.3" fill="#FBBF24"/>
    <circle cx="9.2" cy="9.6" r="1.2" fill="#FFFFFF" fill-opacity="0.85"/>
  `,

  // Glossy Teal-Sky Eye
  eye: `
    <path d="M2.5 12s3.6-6.2 9.5-6.2 9.5 6.2 9.5 6.2-3.6 6.2-9.5 6.2S2.5 12 2.5 12z" fill="#E0F2FE" stroke="#0EA5E9" stroke-width="2"/>
    <circle cx="12" cy="12" r="3.6" fill="#0D9488"/>
    <circle cx="12" cy="12" r="1.6" fill="#0B253C"/>
    <circle cx="13.2" cy="10.8" r="0.9" fill="#FFFFFF"/>
  `,

  // Warm Sunny 3D Folder
  folder: `
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4.2l2 2.2h6.8A2.5 2.5 0 0 1 21 9.7v8.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-11z" fill="#D97706"/>
    <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4.2l2 2.2h6.8A2.5 2.5 0 0 1 21 8.7v8.6a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.3V6.5z" fill="#FBBF24"/>
    <rect x="5.5" y="9.5" width="13" height="7.5" rx="1.8" fill="#FEF3C7"/>
  `,

  // Indigo-Mint 3D Save / Backup Tile
  save: `
    <rect x="3.5" y="4.5" width="17" height="17" rx="4" fill="#4338CA"/>
    <rect x="3.5" y="3" width="17" height="16.8" rx="4" fill="#6366F1"/>
    <rect x="7" y="3" width="10" height="6" rx="1.5" fill="#E0E7FF"/>
    <rect x="6.5" y="12" width="11" height="6" rx="2" fill="#2DD4BF"/>
  `,

  // Sky-Emerald 3D Upload / Import Tile
  upload: `
    <rect x="3.5" y="4.5" width="17" height="17" rx="4.5" fill="#0369A1"/>
    <rect x="3.5" y="3" width="17" height="16.8" rx="4.5" fill="#38BDF8"/>
    <path d="M12 15.5V7.5m0 0L8.6 10.9M12 7.5l3.4 3.4" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="7.5" y="16.8" width="9" height="1.8" rx="0.9" fill="#FDE047"/>
  `,

  // Amber-Teal 3D Package Box (Anki .apkg)
  box: `
    <path d="M4 8.2L12 4l8 4.2v8.6L12 21l-8-4.2V8.2z" fill="#F59E0B"/>
    <path d="M4 8.2L12 12.4l8-4.2L12 4 4 8.2z" fill="#FDE047"/>
    <path d="M12 12.4V21l8-4.2V8.2l-8 4.2z" fill="#D97706"/>
    <path d="M8 6.1l8 4.2" stroke="#0D9488" stroke-width="2.2" stroke-linecap="round"/>
  `,

  // Electric Gold Lightning Bolt
  bolt: `
    <polygon points="13.5,2.5 5.5,13.2 11.5,13.2 10.2,21.5 18.5,10.5 12.5,10.5" fill="#FACC15" stroke="#EA580C" stroke-width="1.4" stroke-linejoin="round"/>
  `,

  // Cute Mint-Lime Shell Turtle (Slow 0.75x Audio!)
  turtle: `
    <circle cx="18.8" cy="13.2" r="2.4" fill="#4ADE80"/>
    <circle cx="19.4" cy="12.7" r="0.6" fill="#0B253C"/>
    <path d="M5.2 15.2a6.5 6.5 0 0 1 12.6 0H5.2z" fill="#10B981"/>
    <path d="M7.5 11.2h8" stroke="#A7F3D0" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="6.5" y="15.2" width="2.4" height="3" rx="1.1" fill="#22C55E"/>
    <rect x="14" y="15.2" width="2.4" height="3" rx="1.1" fill="#22C55E"/>
  `,

  // Violet-Aqua 3D Gear
  gear: `
    <circle cx="12" cy="12" r="7.5" fill="#818CF8" stroke="#4F46E5" stroke-width="1.8" stroke-dasharray="3.2 2"/>
    <circle cx="12" cy="12" r="3.4" fill="#FDE047"/>
  `,

  // Cyan-Violet X-Ray Sentence Scanner
  xray: `
    <rect x="3.5" y="4.5" width="17" height="16" rx="4" fill="#0B253C"/>
    <rect x="6" y="8" width="12" height="2.2" rx="1.1" fill="#2DD4BF"/>
    <rect x="6" y="12" width="8" height="2.2" rx="1.1" fill="#C084FC"/>
    <path d="M3 10.5h18" stroke="#FACC15" stroke-width="1.8" stroke-linecap="round"/>
  `,

  // Glossy Korean Taegeuk Coin (Replaces KR Flag Emoji)
  kr: `
    <circle cx="12" cy="12" r="8.8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <path d="M12 5.5a6.5 6.5 0 0 1 6.5 6.5 3.25 3.25 0 0 1-6.5 0 3.25 3.25 0 0 0-6.5 0A6.5 6.5 0 0 1 12 5.5z" fill="#F43F5E"/>
    <path d="M12 18.5a6.5 6.5 0 0 1-6.5-6.5 3.25 3.25 0 0 0 6.5 0 3.25 3.25 0 0 1 6.5 0 6.5 6.5 0 0 1-6.5 6.5z" fill="#2563EB"/>
  `,

  // Emerald 3D Plus Keycap
  plus: `
    <rect x="3.5" y="4.5" width="17" height="17" rx="4.5" fill="#0D9488"/>
    <rect x="3.5" y="3" width="17" height="16.8" rx="4.5" fill="#2DD4BF"/>
    <path d="M12 7.5v8M8 11.5h8" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  `
};

export function ico(name, size = 18) {
  const inner = COLOR_ICONS[name] || COLOR_ICONS.sparkle;
  return `<svg class="cj-ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${inner}</svg>`;
}
