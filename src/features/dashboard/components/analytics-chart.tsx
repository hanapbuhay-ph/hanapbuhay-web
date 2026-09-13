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
}

export function AnalyticsChart({ data = [] }: AnalyticsChartProps) {
  return (
    <ResponsiveContainer width='100%' height={260}>
      <AreaChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' stroke='#e5e7eb' opacity={0.45} />
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
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'rgba(255,255,255,0.96)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          }}
          formatter={(value, name) => [value ?? 0, name]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Area
          type='monotone'
          dataKey='bookings'
          stroke='currentColor'
          className='text-primary'
          fill='currentColor'
          fillOpacity={0.18}
          strokeWidth={2.5}
        />
        <Area
          type='monotone'
          dataKey='verifications'
          stroke='currentColor'
          className='text-amber-500'
          fill='currentColor'
          fillOpacity={0.12}
          strokeWidth={2}
        />
        <Area
          type='monotone'
          dataKey='active_jobs'
          stroke='currentColor'
          className='text-slate-500'
          fill='currentColor'
          fillOpacity={0.08}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
