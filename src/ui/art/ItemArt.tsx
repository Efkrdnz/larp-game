import type { ShopItem } from '../../engine/data/shopItems';
import { defaultCustom } from '../../engine/data/shopItems';
import CarArt, { type CarCustom } from './CarArt';
import HomeArt, { type HomeCustom } from './HomeArt';
import WatchArt, { type WatchCustom } from './WatchArt';
import { HeliArt, JetArt, YachtArt } from './VehicleArt';

interface Props {
  item: ShopItem;
  custom?: Record<string, string | number | boolean>;
  /** Game minute-of-day, used for the time on watches and day/night on homes. */
  minuteOfDay?: number;
  className?: string;
}

/** Renders any shop item procedurally with its customisation applied. */
export default function ItemArt({ item, custom, minuteOfDay = 600, className = 'w-full h-auto' }: Props) {
  const c = { ...defaultCustom(item), ...(custom ?? {}) };
  const a = item.art;
  switch (a.kind) {
    case 'car':
      return <CarArt body={a.body} custom={c as unknown as CarCustom} className={className} />;
    case 'home':
      return <HomeArt style={a.style} custom={c as unknown as HomeCustom} hour={Math.floor(minuteOfDay / 60)} className={className} />;
    case 'watch':
      return <WatchArt style={a.style} metal={a.metal} label={a.label} bezel={a.bezel} custom={c as unknown as WatchCustom} minutes={minuteOfDay} className={className} />;
    case 'yacht':
      return <YachtArt size={a.size} hull={String(c.hull)} name={String(c.name ?? '')} lights={Boolean(c.lights)} className={className} />;
    case 'jet':
      return <JetArt size={a.size} livery={String(c.livery)} tail={String(c.tail ?? '')} className={className} />;
    case 'heli':
      return <HeliArt size={a.size} livery={String(c.livery)} tail={String(c.tail ?? '')} className={className} />;
  }
}

/** Backdrop gradient per category for catalogue cards. */
export function artBackdrop(item: ShopItem): string {
  switch (item.art.kind) {
    case 'car':
      return 'bg-[radial-gradient(ellipse_at_50%_80%,#2a3446_0%,#111722_70%)]';
    case 'watch':
      return 'bg-[radial-gradient(ellipse_at_50%_40%,#3a2f1b_0%,#120f0a_75%)]';
    default:
      return 'bg-ink-900';
  }
}
