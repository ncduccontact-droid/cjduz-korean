// Cute Soft-Rounded Duo-Tone SVG Icon System & Kawaii Smiling Daisy Mascot for CJDUZ

export function daisyLogoSVG(size = 34) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <g transform="translate(32,32)">
        <g fill="#FFFFFF" stroke="rgba(15,23,42,0.08)" stroke-width="1">
          <ellipse rx="8.5" ry="21" transform="rotate(0)"/>
          <ellipse rx="8.5" ry="21" transform="rotate(45)"/>
          <ellipse rx="8.5" ry="21" transform="rotate(90)"/>
          <ellipse rx="8.5" ry="21" transform="rotate(135)"/>
        </g>
        <circle r="11.5" fill="#FDE047" stroke="#F59E0B" stroke-width="2.2"/>
        <circle cx="-4.2" cy="-1.2" r="1.45" fill="#422006"/>
        <circle cx="4.2" cy="-1.2" r="1.45" fill="#422006"/>
        <ellipse cx="-6.3" cy="1.8" rx="2.1" ry="1.2" fill="#FB7185" opacity="0.65"/>
        <ellipse cx="6.3" cy="1.8" rx="2.1" ry="1.2" fill="#FB7185" opacity="0.65"/>
        <path d="M-3 2.2 Q0 5.1 3 2.2" stroke="#422006" stroke-width="1.7" stroke-linecap="round" fill="none"/>
      </g>
    </svg>
  `;
}

const ICON_PATHS = {
  home: `<path d="M4 10.5L12 4l8 6.5V19a2 2 0 0 1-2 2h-3.5v-5.2a1.5 1.5 0 0 0-1.5-1.5h-2a1.5 1.5 0 0 0-1.5 1.5V21H6a2 2 0 0 1-2-2v-8.5z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  book: `<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5V5.5z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 8h6M9 11.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  cards: `<rect x="3.5" y="6" width="13" height="14" rx="3" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2"/><path d="M8.5 4h9A2.5 2.5 0 0 1 20 6.5v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 12.5l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  sprout: `<path d="M12 21v-9" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M12 13C7.5 13 5 10 5 6c4 0 7 2.5 7 7z" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 11c4.2 0 7-2.6 7-6.5-4.2 0-7 2.4-7 6.5z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  headphones: `<path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><rect x="3.5" y="12.5" width="4" height="6.5" rx="2" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/><rect x="16.5" y="12.5" width="4" height="6.5" rx="2" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>`,
  video: `<rect x="3.5" y="5" width="17" height="14" rx="4" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2"/><path d="M10.2 9.2l5.3 2.8-5.3 2.8V9.2z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
  pen: `<path d="M15.8 4.2a2.4 2.4 0 0 1 3.4 3.4L8.8 18 4 19.2 5.2 14.4 15.8 4.2z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13.8 6.2l3.4 3.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  star: `<path d="M12 3.6l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8 2.5-5z" fill="currentColor" fill-opacity="0.24" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  layers: `<path d="M12 4L3.5 8.5 12 13l8.5-4.5L12 4z" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3.5 12.8L12 17.3l8.5-4.5M3.5 16.8L12 21.3l8.5-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  exam: `<rect x="5" y="3.5" width="14" height="17" rx="3" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M8.5 8.5h7M8.5 12.5h7M8.5 16.5h4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  cloud: `<path d="M7.5 18.5h9.2a4.3 4.3 0 0 0 .6-8.5A5.8 5.8 0 0 0 6.1 8.8 4.8 4.8 0 0 0 7.5 18.5z" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9.8 13.8l1.7 1.7 3.3-3.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  search: `<circle cx="11" cy="11" r="6.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  palette: `<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2.3-.9 2.3-2.1 0-.6-.2-1.1-.6-1.5-.3-.4-.5-.9-.5-1.4 0-1.2 1-2.1 2.2-2.1H17a3.5 3.5 0 0 0 3.5-3.5C20.5 6.8 16.6 3.5 12 3.5z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="8.2" cy="10.2" r="1.2" fill="currentColor"/><circle cx="11.5" cy="7.6" r="1.2" fill="currentColor"/><circle cx="15.3" cy="9.2" r="1.2" fill="currentColor"/>`,
  user: `<circle cx="12" cy="8.5" r="3.8" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="2"/><path d="M5.2 19.5c1.4-3 3.9-4.5 6.8-4.5s5.4 1.5 6.8 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  mic: `<rect x="9" y="3.5" width="6" height="10.5" rx="3" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="2"/><path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  sparkle: `<path d="M12 3.5l1.9 4.8 4.8 1.9-4.8 1.9L12 17l-1.9-4.9-4.8-1.9 4.8-1.9L12 3.5z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" fill="currentColor"/>`,
  chart: `<rect x="4" y="12" width="4" height="8" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/><rect x="10" y="8" width="4" height="12" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/><rect x="16" y="4.5" width="4" height="15.5" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>`,
  speaker: `<path d="M5 9.5h3.5L13 5.5v13l-4.5-4H5a1.5 1.5 0 0 1-1.5-1.5v-2A1.5 1.5 0 0 1 5 9.5z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16.2 9a4.5 4.5 0 0 1 0 6M18.8 6.8a7.8 7.8 0 0 1 0 10.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  compass: `<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="2"/><path d="M15.2 8.8l-2 5.1-5.1 2 2-5.1 5.1-2z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
  upload: `<path d="M12 15V5m0 0L8.2 8.8M12 5l3.8 3.8" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 15.5v2A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  chat: `<path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H11l-4 3.5V15H7.5A2.5 2.5 0 0 1 5 12.5v-6z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`
};

export function ico(name, size = 18) {
  const inner = ICON_PATHS[name] || ICON_PATHS.sparkle;
  return `<svg class="cj-ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${inner}</svg>`;
}
