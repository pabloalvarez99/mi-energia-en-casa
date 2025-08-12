'use client'

import { formatNumber, formatCurrencyCLP } from '@/lib/format'

interface ChartData {
  name: string
  kwh: number
  cost: number
}

interface ConsumptionChartProps {
  data: ChartData[]
  title?: string
}

export default function ConsumptionChart({ data, title = 'Distribución de Consumo' }: ConsumptionChartProps) {
  if (data.length === 0) return null
  
  const maxKwh = Math.max(...data.map(d => d.kwh))
  const totalKwh = data.reduce((sum, d) => sum + d.kwh, 0)
  
  // Tomar los top 5 consumidores
  const topData = [...data].sort((a, b) => b.kwh - a.kwh).slice(0, 5)
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <div className="space-y-4">
        {topData.map((item, index) => {
          const percentage = (item.kwh / totalKwh) * 100
          const barWidth = (item.kwh / maxKwh) * 100
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-white/90">
                  {index + 1}. {item.name}
                </span>
                <span className="text-xs text-white/60">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out flex items-center px-2"
                    style={{
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, 
                        ${percentage > 30 ? '#ef4444' : percentage > 15 ? '#f59e0b' : '#22c55e'} 0%, 
                        ${percentage > 30 ? '#dc2626' : percentage > 15 ? '#d97706' : '#16a34a'} 100%)`
                    }}
                  >
                    <span className="text-xs text-white font-medium whitespace-nowrap">
                      {formatNumber(item.kwh)} kWh
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-white/60">
                <span>Costo mensual:</span>
                <span className="font-medium text-white/80">
                  {formatCurrencyCLP(item.cost)}
                </span>
              </div>
            </div>
          )
        })}
        
        {data.length > 5 && (
          <div className="pt-2 border-t border-white/10 text-xs text-white/60 text-center">
            Y {data.length - 5} electrodomésticos más...
          </div>
        )}
      </div>
      
      <div className="mt-6 p-3 bg-white/5 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">Total mensual:</span>
          <div className="text-right">
            <div className="font-semibold">{formatNumber(totalKwh)} kWh</div>
            <div className="text-xs text-white/60">{formatCurrencyCLP(data.reduce((sum, d) => sum + d.cost, 0))}</div>
          </div>
        </div>
      </div>
    </div>
  )
} 