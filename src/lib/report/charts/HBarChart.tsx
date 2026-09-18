import { Line, Rect, Svg, Text } from "@react-pdf/renderer";
import { COLORS, FONTS } from "../theme";

interface HBarChartProps {
  bars: Array<{ label: string; amount: number }>;
  width: number;
  height: number;
}

/** Choisit un pas d'axe « rond » (en FCFA) donnant 4 à 6 graduations. */
function niceStep(max: number): number {
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * magnitude);
  return candidates.find((c) => c >= rough) ?? candidates[candidates.length - 1];
}

function axisLabel(value: number): string {
  if (value === 0) return "0FCFA";
  return `${Math.round(value / 1_000_000)} MFCFA`;
}

/** Histogramme horizontal des coûts annuels (page 4), en SVG pur. */
export function HBarChart({ bars, width, height }: HBarChartProps) {
  const labelWidth = 150;
  const paddingRight = 24;
  const paddingTop = 8;
  const axisHeight = 26;
  const plotX = labelWidth;
  const plotW = width - labelWidth - paddingRight;
  const plotH = height - paddingTop - axisHeight;
  const max = Math.max(...bars.map((b) => b.amount), 1);
  const step = niceStep(max);
  const axisMax = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(axisMax / step) + 1 }, (_, i) => i * step);
  const slot = plotH / bars.length;
  const barH = Math.min(30, slot * 0.62);
  const x = (v: number) => plotX + (v / axisMax) * plotW;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {ticks.map((tick) => (
        <Line
          key={tick}
          x1={x(tick)}
          y1={paddingTop}
          x2={x(tick)}
          y2={paddingTop + plotH}
          stroke={COLORS.chartGrid}
          strokeWidth={1}
        />
      ))}
      {bars.map((bar, i) => {
        const y = paddingTop + i * slot + (slot - barH) / 2;
        return (
          <Rect
            key={bar.label}
            x={plotX}
            y={y}
            width={Math.max(2, x(bar.amount) - plotX)}
            height={barH}
            rx={3}
            fill={COLORS.chartBar}
          />
        );
      })}
      {bars.map((bar, i) => (
        <Text
          key={bar.label}
          x={plotX - 10}
          y={paddingTop + i * slot + slot / 2 + 4}
          textAnchor="end"
          style={{ fontFamily: FONTS.body, fontSize: 11, fill: COLORS.chartText }}
        >
          {bar.label}
        </Text>
      ))}
      {ticks.map((tick) => (
        <Text
          key={`t${tick}`}
          x={x(tick)}
          y={paddingTop + plotH + 18}
          textAnchor="middle"
          style={{ fontFamily: FONTS.body, fontSize: 10, fill: COLORS.chartMuted }}
        >
          {axisLabel(tick)}
        </Text>
      ))}
    </Svg>
  );
}
