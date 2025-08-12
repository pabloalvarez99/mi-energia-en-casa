'use client'

import { useState } from 'react'
import { formatCurrencyCLP, formatNumber } from '@/lib/format'

interface SavingsCalculatorProps {
  currentMonthlyKwh: number
  costPerKwh: number
}

export default function SavingsCalculator({ currentMonthlyKwh, costPerKwh }: SavingsCalculatorProps) {
  const [savingsPercentage, setSavingsPercentage] = useState(20)
  
  const potentialSavings = {
    kwh: currentMonthlyKwh * (savingsPercentage / 100),
    monthly: (currentMonthlyKwh * (savingsPercentage / 100)) * costPerKwh,
    annual: (currentMonthlyKwh * (savingsPercentage / 100)) * costPerKwh * 12,
  }
  
  const savingsTips = [
    { percentage: 10, measure: 'Cambiar a iluminación LED', investment: 150000 },
    { percentage: 15, measure: 'Desconectar aparatos en standby', investment: 50000 },
    { percentage: 20, measure: 'Optimizar uso de climatización', investment: 0 },
    { percentage: 25, measure: 'Actualizar electrodomésticos antiguos', investment: 1500000 },
    { percentage: 30, measure: 'Instalar paneles solares', investment: 8000000 },
  ]
  
  const currentTip = savingsTips.find(tip => tip.percentage >= savingsPercentage) || savingsTips[savingsTips.length - 1]
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Calculadora de Ahorro Potencial</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-3">
            Porcentaje de ahorro objetivo: <span className="text-brand">{savingsPercentage}%</span>
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={savingsPercentage}
            onChange={(e) => setSavingsPercentage(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${savingsPercentage * 2}%, rgba(255,255,255,0.2) ${savingsPercentage * 2}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-white/60 mt-2">
            <span>5%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-white/70 mb-1">Ahorro mensual</div>
            <div className="text-xl font-bold text-success">
              {formatCurrencyCLP(potentialSavings.monthly)}
            </div>
            <div className="text-xs text-white/60">
              {formatNumber(potentialSavings.kwh)} kWh
            </div>
          </div>
          
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-white/70 mb-1">Ahorro anual</div>
            <div className="text-xl font-bold text-success">
              {formatCurrencyCLP(potentialSavings.annual)}
            </div>
            <div className="text-xs text-white/60">
              {formatNumber(potentialSavings.kwh * 12)} kWh
            </div>
          </div>
          
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-white/70 mb-1">En 5 años</div>
            <div className="text-xl font-bold text-success">
              {formatCurrencyCLP(potentialSavings.annual * 5)}
            </div>
            <div className="text-xs text-white/60">
              Ahorro acumulado
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-brand/10 to-success/10 rounded-lg border border-brand/20">
          <h4 className="font-semibold mb-2">Medida recomendada</h4>
          <p className="text-sm text-white/90 mb-2">{currentTip.measure}</p>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/70">Inversión estimada:</span>
            <span className="font-medium">{formatCurrencyCLP(currentTip.investment)}</span>
          </div>
          {currentTip.investment > 0 && potentialSavings.monthly > 0 && (
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-white/70">Retorno de inversión:</span>
              <span className="font-medium text-success">
                {Math.ceil(currentTip.investment / potentialSavings.monthly)} meses
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white/90">Medidas de ahorro por impacto:</h4>
          {savingsTips.map((tip, index) => (
            <div 
              key={index}
              className={`p-2 rounded-lg border ${
                tip.percentage <= savingsPercentage 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/80">{tip.measure}</span>
                <span className={`text-xs font-medium ${
                  tip.percentage <= savingsPercentage ? 'text-success' : 'text-white/60'
                }`}>
                  {tip.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 