import { useEffect, useRef } from 'react';
import { ColorType, CrosshairMode, createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import { chartTime } from '../../engine/calendar';
import type { Bar } from '../../engine/types';

interface Props {
  bars: Bar[];
  mode: 'candles' | 'line';
  showSma: boolean;
  intraday: boolean;
  height?: number;
  /** Changes whenever the dataset is swapped (timeframe/ticker) so we refit. */
  datasetKey: string;
  markers?: { t: number; up: boolean; text: string }[];
  /** Fixed number of bar slots to show (e.g. a full trading day), instead of fitting. */
  slots?: number;
}

function sma(bars: Bar[], n: number) {
  const out: { time: UTCTimestamp; value: number }[] = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].c;
    if (i >= n) sum -= bars[i - n].c;
    if (i >= n - 1) out.push({ time: chartTime(bars[i].t) as UTCTimestamp, value: sum / n });
  }
  return out;
}

export default function CandleChart({ bars, mode, showSma, intraday, height = 380, datasetKey, markers = [], slots }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const main = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | null>(null);
  const vol = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeries = useRef<ISeriesApi<'Line'> | null>(null);
  const lastKey = useRef('');
  const lastLen = useRef(0);

  // Create chart once per mode.
  useEffect(() => {
    if (!el.current) return;
    const c = createChart(el.current, {
      height,
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#8d99ad', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 },
      grid: { vertLines: { color: 'rgba(58,70,89,0.25)' }, horzLines: { color: 'rgba(58,70,89,0.25)' } },
      rightPriceScale: { borderColor: '#263042' },
      timeScale: { borderColor: '#263042', timeVisible: intraday, secondsVisible: false, rightOffset: 4 },
      crosshair: { mode: CrosshairMode.Normal },
      handleScroll: { vertTouchDrag: false },
    });
    chart.current = c;
    main.current =
      mode === 'candles'
        ? c.addCandlestickSeries({ upColor: '#22c55e', downColor: '#ef4444', borderVisible: false, wickUpColor: '#22c55e', wickDownColor: '#ef4444' })
        : c.addAreaSeries({ lineColor: '#f0b429', topColor: 'rgba(240,180,41,0.35)', bottomColor: 'rgba(240,180,41,0.02)', lineWidth: 2 });
    vol.current = c.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: 'vol' });
    c.priceScale('vol').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    main.current.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.22 } });
    smaSeries.current = c.addLineSeries({ color: '#a78bfa', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
    lastKey.current = '';
    return () => {
      c.remove();
      chart.current = null;
    };
  }, [mode, intraday, height]);

  // Push data. Full reset on dataset change, cheap update for the live bar.
  useEffect(() => {
    const c = chart.current;
    const m = main.current;
    if (!c || !m || !vol.current || !smaSeries.current) return;
    const toMain = (b: Bar) =>
      mode === 'candles' ? { time: chartTime(b.t) as UTCTimestamp, open: b.o, high: b.h, low: b.l, close: b.c } : { time: chartTime(b.t) as UTCTimestamp, value: b.c };
    const toVol = (b: Bar) => ({ time: chartTime(b.t) as UTCTimestamp, value: b.v, color: b.c >= b.o ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)' });
    const key = `${datasetKey}|${mode}`;
    if (key !== lastKey.current || bars.length < lastLen.current || bars.length - lastLen.current > 1) {
      (m as ISeriesApi<'Candlestick'>).setData(bars.map(toMain) as never);
      vol.current.setData(bars.map(toVol));
      if (key !== lastKey.current || slots) {
        if (slots) c.timeScale().setVisibleLogicalRange({ from: -1, to: slots });
        else c.timeScale().fitContent();
      }
      lastKey.current = key;
    } else if (bars.length) {
      const b = bars[bars.length - 1];
      (m as ISeriesApi<'Candlestick'>).update(toMain(b) as never);
      vol.current.update(toVol(b));
    }
    lastLen.current = bars.length;
    smaSeries.current.setData(showSma ? sma(bars, 20) : []);
    const first = bars[0]?.t ?? 0;
    m.setMarkers(
      markers
        .filter((mk) => mk.t >= first)
        .map((mk) => ({
          time: chartTime(mk.t - (mk.t % (intraday ? 5 : 1440))) as UTCTimestamp,
          position: mk.up ? ('belowBar' as const) : ('aboveBar' as const),
          color: mk.up ? '#22c55e' : '#ef4444',
          shape: mk.up ? ('arrowUp' as const) : ('arrowDown' as const),
          text: mk.text,
        }))
        .sort((a, b) => a.time - b.time),
    );
  });

  return <div ref={el} style={{ height }} className="w-full" />;
}
