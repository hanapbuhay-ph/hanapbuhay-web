import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ActivityTrendPoint } from '../hooks/use-dashboard'

interface AnalyticsChartProps {
  data?: ActivityTrendPoint[]
  series?: ChartSeries
}

export type ChartSeries = 'all' | 'bookings' | 'verifications' | 'active_jobs'

export function AnalyticsChart({
  data = [],
  series = 'all',
}: AnalyticsChartProps) {
  const showSeries = (key: Exclude<ChartSeries, 'all'>) =>
    series === 'all' || series === key

  return (
    <ResponsiveContainer width='100%' height={260}>
      <AreaChart data={data}>
        <CartesianGrid
          vertical={false}
          strokeDasharray='3 3'
          stroke='#e5e7eb'
          opacity={0.45}
        />
        <XAxis
          dataKey='label'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ stroke: '#22c55e', strokeOpacity: 0.25, strokeWidth: 1 }}
          contentStyle={{
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'rgba(255,255,255,0.96)',
          }}
          formatter={(value, name) => [value ?? 0, name]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        {showSeries('bookings') && (
          <Area
            type='monotone'
            dataKey='bookings'
            stroke='currentColor'
            className='text-primary'
            fill='currentColor'
            fillOpacity={0.1}
            strokeWidth={2.5}
          />
        )}
        {showSeries('verifications') && (
          <Area
            type='monotone'
            dataKey='verifications'
            stroke='currentColor'
            className='text-amber-500'
            fill='currentColor'
            fillOpacity={0.08}
            strokeWidth={2}
          />
        )}
        {showSeries('active_jobs') && (
          <Area
            type='monotone'
            dataKey='active_jobs'
            stroke='currentColor'
            className='text-slate-500'
            fill='currentColor'
            fillOpacity={0.06}
            strokeWidth={2}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
