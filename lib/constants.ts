import type { ApplianceDefinition } from './types'

export const REGIONS = {
  'XV': { name: 'Arica y Parinacota' },
  'I': { name: 'Tarapacá' },
  'II': { name: 'Antofagasta' },
  'III': { name: 'Atacama' },
  'IV': { name: 'Coquimbo' },
  'V': { name: 'Valparaíso' },
  'RM': { name: 'Metropolitana' },
  'VI': { name: 'O\'Higgins' },
  'VII': { name: 'Maule' },
  'XVI': { name: 'Ñuble' },
  'VIII': { name: 'Biobío' },
  'IX': { name: 'La Araucanía' },
  'XIV': { name: 'Los Ríos' },
  'X': { name: 'Los Lagos' },
  'XI': { name: 'Aysén' },
  'XII': { name: 'Magallanes' },
} as const

// Tarifas eléctricas basadas en datos reales de distribuidoras chilenas 2024-2025
export const ELECTRICITY_RATES = {
  'XV': 155, // CLP/kWh - Eliqsa
  'I': 158,  // CLP/kWh - Eliqsa
  'II': 142, // CLP/kWh - Edesur
  'III': 145, // CLP/kWh - Edesur
  'IV': 168, // CLP/kWh - Elecda
  'V': 165,  // CLP/kWh - Chilquinta
  'RM': 162, // CLP/kWh - Enel/Chilectra
  'VI': 158, // CLP/kWh - CGE
  'VII': 160, // CLP/kWh - CGE
  'XVI': 163, // CLP/kWh - CGE
  'VIII': 155, // CLP/kWh - CGE
  'IX': 157, // CLP/kWh - Frontel
  'XIV': 159, // CLP/kWh - Saesa
  'X': 161,  // CLP/kWh - Saesa
  'XI': 175, // CLP/kWh - Edelmag
  'XII': 172, // CLP/kWh - Edelmag
} as const

// Factor de emisión CO2 sistema eléctrico chileno actualizado 2024
export const CO2_FACTOR = 0.31 // kg CO2/kWh (SEN Chile)

// Electrodomésticos populares en Chile con consumos reales del mercado
export const COMMON_APPLIANCES: ApplianceDefinition[] = [
  // === REFRIGERACIÓN (Datos reales de mercado chileno) ===
  { name: 'Refrigerador Samsung RS65R (600L)', watts: 133 }, // 40 kWh/mes = 133W promedio
  { name: 'Refrigerador Hisense RC-70WS (535L)', watts: 120 }, // 35.91 kWh/mes = 120W promedio
  { name: 'Refrigerador Midea Bottom Freezer (262L)', watts: 74 }, // 22.26 kWh/mes = 74W promedio
  { name: 'Refrigerador No Frost Tradicional (300L)', watts: 100 }, // Promedio mercado chileno
  { name: 'Refrigerador Side by Side (500L+)', watts: 140 }, // Promedio modelos grandes
  { name: 'Frigobar / Mini refrigerador', watts: 85 },
  { name: 'Congelador / Freezer', watts: 120 },

  // === TELEVISORES (Datos mercado chileno) ===
  { name: 'Smart TV LED 43" (Clase A)', watts: 85 }, // Datos Enel Chile
  { name: 'Smart TV LED 55"', watts: 110 },
  { name: 'Smart TV LED 65"', watts: 140 },
  { name: 'Smart TV OLED 55"', watts: 135 },
  { name: 'TV antigua CRT 32"', watts: 180 }, // Aún común en Chile

  // === LAVADO Y SECADO (Mercado chileno) ===
  { name: 'Lavadora Automática 11kg Clase A', watts: 500 }, // Durante el ciclo
  { name: 'Lavadora Automática 8kg', watts: 400 },
  { name: 'Lavadora-Secadora', watts: 2200 }, // Modo secado
  { name: 'Secadora Eléctrica 7kg Clase A', watts: 2100 },
  { name: 'Centrifuga', watts: 350 },

  // === CALEFACCIÓN (Datos específicos de Chile) ===
  { name: 'Estufa Eléctrica Halógena 1200W', watts: 1200 },
  { name: 'Estufa Eléctrica Convector 2000W', watts: 2000 },
  { name: 'Radiador Eléctrico de Aceite', watts: 1500 },
  { name: 'Estufa Infrarroja', watts: 1000 },
  { name: 'Aire Acondicionado Split (Modo Calor)', watts: 1800 },
  { name: 'Calefactor Cerámico', watts: 1500 },

  // === COCINA (Productos comunes en Chile) ===
  { name: 'Microondas 20L', watts: 700 }, // Dato Enel Chile
  { name: 'Microondas 28L', watts: 900 },
  { name: 'Horno Eléctrico Empotrable', watts: 2500 },
  { name: 'Horno Eléctrico de Mesa', watts: 1200 },
  { name: 'Encimera Eléctrica 2 platos', watts: 2000 },
  { name: 'Encimera Vitrocerámica 4 platos', watts: 3000 },
  { name: 'Hervidor Eléctrico', watts: 1800 }, // Dato Enel Chile
  { name: 'Cafetera Eléctrica', watts: 800 },
  { name: 'Tostadora', watts: 900 },
  { name: 'Batidora', watts: 350 },
  { name: 'Licuadora', watts: 400 },
  { name: 'Sandwichera', watts: 750 },
  { name: 'Parrilla Eléctrica', watts: 1400 },
  { name: 'Freidora Eléctrica', watts: 1500 },
  { name: 'Olla Arrocera', watts: 500 },

  // === AGUA CALIENTE ===
  { name: 'Ducha Eléctrica / Calentador', watts: 4500 }, // Muy común en Chile
  { name: 'Termo Eléctrico 80L', watts: 2000 },
  { name: 'Termo Eléctrico 150L', watts: 3000 },

  // === LIMPIEZA ===
  { name: 'Aspiradora', watts: 1400 },
  { name: 'Robot Aspirador', watts: 25 },
  { name: 'Plancha a Vapor', watts: 2200 },
  { name: 'Lavavajillas', watts: 1800 },

  // === TECNOLOGÍA Y ENTRETENIMIENTO ===
  { name: 'Computador de Escritorio', watts: 200 },
  { name: 'Notebook', watts: 65 },
  { name: 'PlayStation / Xbox', watts: 150 },
  { name: 'Equipo de Música', watts: 100 },
  { name: 'Proyector', watts: 250 },

  // === ILUMINACIÓN ===
  { name: 'Ampolleta LED 9W', watts: 9 },
  { name: 'Ampolleta LED 15W', watts: 15 },
  { name: 'Ampolleta Fluorescente Compacta 20W', watts: 20 },
  { name: 'Ampolleta Incandescente 60W', watts: 60 }, // Prohibidas pero aún en uso
  { name: 'Tubo LED 18W', watts: 18 },

  // === VARIOS ===
  { name: 'Ventilador de Techo', watts: 75 },
  { name: 'Ventilador de Mesa', watts: 45 },
  { name: 'Deshumidificador', watts: 650 },
  { name: 'Purificador de Aire', watts: 50 },
  { name: 'Router WiFi', watts: 12 },
  { name: 'Decodificador TV', watts: 15 },
  { name: 'Cargador de Celular', watts: 5 },
  { name: 'Impresora Láser', watts: 500 }, // Durante impresión
]

// Consejos de eficiencia energética específicos para Chile (fuente: Ministerio de Energía)
export const ENERGY_SAVING_TIPS = [
  {
    category: 'Vivienda',
    tips: [
      'Instala sellos de puertas y ventanas para conservar la temperatura',
      'Aprovecha la luz del sol para iluminar y calefaccionar tu vivienda',
      'Ventila tu hogar abriendo las ventanas al menos 10 minutos al día',
      'Si usas leña, prefiere siempre leña seca o pellet sobre leña húmeda',
      'Mantén la calefacción entre 19°-21°C en invierno, 24°C en verano',
    ]
  },
  {
    category: 'Cocina',
    tips: [
      'Instala aireadores en la llave del lavaplatos para ahorrar agua y gas',
      'Cocina con las ollas tapadas para mayor eficiencia',
      'Desconecta el microondas después de usarlo',
      'Al calentar agua, guarda la que no uses en un termo',
      'Usa la "lavaza" para prelavar la loza antes de enjuagar',
    ]
  },
  {
    category: 'Baño',
    tips: [
      'Toma duchas más cortas para ahorrar agua y gas',
      'Regula el calefón a la temperatura adecuada',
      'Si tienes calefón con llama piloto, apágala después de usar',
      'Instala aireadores en llaves de ducha y lavamanos',
    ]
  },
  {
    category: 'Iluminación',
    tips: [
      'Prefiere ampolletas LED - ahorran hasta 80% vs incandescentes',
      'Elige ampolletas con etiqueta de eficiencia A, A+ o superior',
      'Apaga las luces que no estés usando',
      'Limpia ventanas para obtener más luz natural',
    ]
  },
  {
    category: 'Electrodomésticos',
    tips: [
      'Prefiere productos con etiqueta A, A+ o superior',
      'Desconecta artefactos que no uses - evita "consumo vampiro"',
      'Usa el refrigerador a potencia mínima, no al máximo',
      'No introduzcas alimentos calientes al refrigerador',
      'Usa lavadora y lavavajillas solo con carga completa',
      'No es necesario lavar con agua caliente',
    ]
  },
  {
    category: 'Transporte',
    tips: [
      'Prefiere caminar, bicicleta o transporte público',
      'Practica conducción eficiente para ahorrar combustible',
      'Al comprar auto, revisa su consumo en www.consumovehicular.cl',
    ]
  }
]

// Programas gubernamentales de eficiencia energética en Chile
export const GOVERNMENT_PROGRAMS = [
  {
    name: 'Programa de Recambio de Refrigeradores',
    description: 'Subsidio para cambiar refrigeradores antiguos por modelos eficientes',
    institution: 'Ministerio de Energía - ASE',
    website: 'https://energia.gob.cl'
  },
  {
    name: 'Casa Solar',
    description: 'Subsidio para instalar paneles solares residenciales',
    institution: 'Ministerio de Energía',
    website: 'https://energia.gob.cl'
  },
  {
    name: 'Acondicionamiento Térmico',
    description: 'Subsidio para mejorar aislación térmica de viviendas (140 UF)',
    institution: 'MINVU',
    website: 'https://www.minvu.cl'
  },
  {
    name: 'Subsidio Eléctrico',
    description: 'Descuentos en cuenta de luz para familias vulnerables',
    institution: 'Ministerio de Energía',
    website: 'https://energia.gob.cl'
  },
  {
    name: 'Leña Más Seca',
    description: 'Programa para promover el uso de leña seca y reducir contaminación',
    institution: 'Ministerio de Medio Ambiente',
    website: 'https://mma.gob.cl'
  }
]

// Información sobre etiquetas de eficiencia energética en Chile
export const ENERGY_LABELS = {
  description: 'Chile cuenta con etiquetado de eficiencia energética para 25 tipos de artefactos',
  website: 'https://www.top-ten.cl',
  grades: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
  recommendation: 'Siempre prefiere productos con calificación A, A+ o superior'
}

// Datos climáticos específicos por región para cálculos de calefacción
export const CLIMATE_DATA = {
  'XV': { zone: 'Desértico', heatingMonths: 3, coolingMonths: 0 },
  'I': { zone: 'Desértico', heatingMonths: 3, coolingMonths: 0 },
  'II': { zone: 'Desértico', heatingMonths: 3, coolingMonths: 1 },
  'III': { zone: 'Desértico', heatingMonths: 4, coolingMonths: 1 },
  'IV': { zone: 'Semiárido', heatingMonths: 5, coolingMonths: 2 },
  'V': { zone: 'Mediterráneo', heatingMonths: 6, coolingMonths: 1 },
  'RM': { zone: 'Mediterráneo', heatingMonths: 6, coolingMonths: 2 },
  'VI': { zone: 'Mediterráneo', heatingMonths: 6, coolingMonths: 1 },
  'VII': { zone: 'Mediterráneo', heatingMonths: 7, coolingMonths: 1 },
  'XVI': { zone: 'Mediterráneo', heatingMonths: 7, coolingMonths: 0 },
  'VIII': { zone: 'Templado Húmedo', heatingMonths: 8, coolingMonths: 0 },
  'IX': { zone: 'Templado Húmedo', heatingMonths: 9, coolingMonths: 0 },
  'XIV': { zone: 'Templado Lluvioso', heatingMonths: 9, coolingMonths: 0 },
  'X': { zone: 'Templado Lluvioso', heatingMonths: 9, coolingMonths: 0 },
  'XI': { zone: 'Subantártico', heatingMonths: 10, coolingMonths: 0 },
  'XII': { zone: 'Subantártico', heatingMonths: 10, coolingMonths: 0 },
}

// Información sobre consumo promedio por hogar en Chile
export const CHILE_CONSUMPTION_DATA = {
  averageMonthlyConsumption: 180, // kWh/mes promedio hogar chileno
  percentageByUse: {
    heating: 36.6, // % del consumo residencial
    lighting: 16.8,
    appliances: 19.4,
    waterHeating: 12.3,
    cooking: 8.2,
    other: 6.7
  },
  seasonalVariation: {
    winter: 1.35, // Factor multiplicador invierno
    summer: 0.85, // Factor multiplicador verano
    spring: 1.0,
    autumn: 1.1
  }
} 