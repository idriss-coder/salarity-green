import { Circle, Line, Polyline, Svg, Text } from "@react-pdf/renderer";
import { COLORS, FONTS } from "../theme";

interface CumulativeChartProps {
  series: Array<{ label: string; values: number[] }>;
  horizonYears: number;
  width: number;
  height: number;
}

function axisLabel(value: number): string {
  if (value === 0) return "0FCFA";
  if (value >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(1).replace(".", ",")} MdFCFA`;
  return `${Math.round(value / 1_000_000)} MFCFA`;
}

/** Courbe du coût cumulé sur N ans (page 9) : situation actuelle + scénarios, en SVG pur. */
export function CumulativeChart({ series, horizonYears, width, height }: CumulativeChartProps) {
  const left = 74;
  const right = 16;
  const top = 10;
  const bottom = 26;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const step = 300_000_000 * Math.max(1, Math.ceil(max / 1_500_000_000));
  const axisMax = Math.ceil(max / step) * step;
  const yTicks = Array.from({ length: Math.round(axisMax / step) + 1 }, (_, i) => i * step);
  const x = (year: number) => left + (year / horizonYears) * plotW;
  const y = (v: number) => top + plotH - (v / axisMax) * plotH;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {yTicks.map((tick) => (
        <Line
          key={tick}
          x1={left}
          y1={y(tick)}
          x2={left + plotW}
          y2={y(tick)}
          stroke={COLORS.chartGrid}
          strokeWidth={1}
        />
      ))}
      {yTicks.map((tick) => (
        <Text
          key={`l${tick}`}
          x={left - 8}
          y={y(tick) + 3}
          textAnchor="end"
          style={{ fontFamily: FONTS.body, fontSize: 9, fill: COLORS.chartMuted }}
        >
          {axisLabel(tick)}
        </Text>
      ))}
      {Array.from({ length: horizonYears + 1 }, (_, year) => (
        <Text
          key={`x${year}`}
          x={x(year)}
          y={top + plotH + 16}
          textAnchor="middle"
          style={{ fontFamily: FONTS.body, fontSize: 9, fill: COLORS.chartMuted }}
        >
          {String(year)}
        </Text>
      ))}
      {series.map((s, i) => {
        const color = COLORS.series[i % COLORS.series.length];
        const points = s.values.map((v, year) => `${x(year)},${y(v)}`).join(" ");
        return (
          <Polyline key={s.label} points={points} fill="none" stroke={color} strokeWidth={2} />
        );
      })}
      {series.map((s, i) =>
        s.values.map((v, year) => (
          <Circle
            key={`${s.label}-${year}`}
            cx={x(year)}
            cy={y(v)}
            r={2.4}
            fill={COLORS.series[i % COLORS.series.length]}
          />
        )),
      )}
    </Svg>
  );
}
