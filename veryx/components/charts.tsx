'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const GOLD = '#dfa629';
const BLUE = '#3b82f6';
const GREEN = '#22c55e';
const RED = '#ef4444';
const MUTED = '#7587b9';

const tooltipStyle = {
  backgroundColor: '#0b1228',
  border: '1px solid #1f2a4d',
  borderRadius: 8,
  fontSize: 12,
  color: '#e2e8f0',
};

/** Revenue vs AI cost vs margin trend (§23A.3 / §23B.1). */
export function RevenueCostChart({
  data,
}: {
  data: { day: string; revenue: number; cost: number; margin: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1f2a4d" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
        <Area type="monotone" dataKey="revenue" name="Revenue £" stroke={GOLD} fill="url(#rev)" strokeWidth={2} />
        <Area type="monotone" dataKey="cost" name="AI cost £" stroke={RED} fill="transparent" strokeWidth={1.5} />
        <Area type="monotone" dataKey="margin" name="Margin £" stroke={GREEN} fill="transparent" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** S-curve: planned vs actual vs forecast progress (§23C.4). */
export function SCurveChart({
  data,
}: {
  data: { period: string; planned: number; actual: number | null; forecast: number | null }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid stroke="#1f2a4d" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="period" stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="planned" name="Planned (baseline)" stroke={BLUE} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="actual" name="Actual" stroke={GOLD} strokeWidth={2} dot={false} />
        <Line
          type="monotone"
          dataKey="forecast"
          name="AI forecast"
          stroke={GREEN}
          strokeWidth={1.5}
          strokeDasharray="6 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Ranked horizontal bar (top tenants / top consumers — §23A.3, §23A.9). */
export function RankedBarChart({
  data,
  unit = '',
}: {
  data: { name: string; value: number }[];
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="#1f2a4d" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} width={140} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()}${unit}`, '']} />
        <Bar dataKey="value" fill={GOLD} radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Provider / model split donut (§23A.7). */
export function SplitDonut({ data }: { data: { name: string; value: number }[] }) {
  const colors = [GOLD, BLUE, GREEN, MUTED, RED];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '']} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Budget waterfall rendered as composed bars (§23C.5). */
export function BudgetBars({
  data,
}: {
  data: { label: string; value: number; tone?: 'gold' | 'red' | 'green' | 'blue' }[];
}) {
  const toneMap = { gold: GOLD, red: RED, green: GREEN, blue: BLUE } as const;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
        <CartesianGrid stroke="#1f2a4d" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" stroke={MUTED} fontSize={10} tickLine={false} axisLine={false} interval={0} />
        <YAxis stroke={MUTED} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`£${v.toLocaleString()}`, '']} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
          {data.map((d, i) => (
            <Cell key={i} fill={toneMap[d.tone ?? 'gold']} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
