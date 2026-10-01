// Minimal inline icon set (stroke icons, 24x24).
import type { SVGProps } from 'react';

const base = (d: React.ReactNode) =>
  function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        {d}
      </svg>
    );
  };

export const IconHome = base(<path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10" />);
export const IconChart = base(<><path d="M4 19h16" /><path d="m5 15 4-5 4 3 6-7" /></>);
export const IconNews = base(<><rect x="3" y="5" width="15" height="15" rx="2" /><path d="M18 9h3v9a2 2 0 0 1-2 2M7 9h7M7 13h7M7 17h4" /></>);
export const IconWallet = base(<><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 10h18M16 15h2" /></>);
export const IconBag = base(<><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>);
export const IconKey = base(<><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M16 7l2 2" /></>);
export const IconDice = base(<><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /><circle cx="15" cy="9" r="1" fill="currentColor" /><circle cx="9" cy="15" r="1" fill="currentColor" /></>);
export const IconSkull = base(<><path d="M12 3a8 8 0 0 0-5 14.2V20h10v-2.8A8 8 0 0 0 12 3Z" /><circle cx="9" cy="11" r="1.5" /><circle cx="15" cy="11" r="1.5" /><path d="M10 20v-2M14 20v-2" /></>);
export const IconReceipt = base(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>);
export const IconGear = base(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>);
export const IconMore = base(<><circle cx="5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="12" r="1.2" fill="currentColor" /></>);
export const IconBell = base(<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>);
export const IconPlay = base(<path d="M7 5v14l11-7L7 5Z" fill="currentColor" />);
export const IconPause = base(<><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></>);
export const IconFast = base(<path d="M4 6v12l8-6-8-6Zm8 0v12l8-6-8-6Z" fill="currentColor" />);
export const IconX = base(<path d="M6 6l12 12M18 6 6 18" />);
export const IconScale = base(<><path d="M12 3v18M7 21h10M4 7h16" /><path d="m4 7-2.5 6a3 3 0 0 0 5 0L4 7ZM20 7l-2.5 6a3 3 0 0 0 5 0L20 7Z" /></>);
export const IconLock = base(<><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>);
export const IconFire = base(<path d="M12 21c4 0 7-2.7 7-6.5 0-4-3-6-4-9.5-2 2-2.5 4-2.5 5.5C11 9 10 7.5 10 5c-3 2.5-5 6-5 9.5C5 18.3 8 21 12 21Z" />);
