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
    name: 'Programa #Refriclaje',
    description: 'Recambio de refrigeradores antiguos por modelos eficientes con 40% descuento',
    institution: 'Global Environmental Facility - Fundación Chile - Sodimac',
    website: 'https://www.refriclaje.cl'
  },
  {
    name: 'Casa Solar',
    description: 'Subsidio para instalación de sistemas fotovoltaicos residenciales',
    institution: 'Ministerio de Energía - Agencia de Sostenibilidad Energética',
    website: 'https://asechile.cl'
  },
  {
    name: 'Acondicionamiento Térmico de Viviendas',
    description: 'Subsidio hasta 140 UF para mejorar aislación térmica',
    institution: 'Ministerio de Vivienda y Urbanismo (MINVU)',
    website: 'https://www.chileatiende.gob.cl'
  },
  {
    name: 'Programa de Recambio de Calefactores',
    description: 'Recambio de calefactores a leña por sistemas más eficientes',
    institution: 'Ministerio del Medio Ambiente',
    website: 'https://www.chileatiende.gob.cl'
  },
  {
    name: 'Tarifa Eléctrica de Equidad',
    description: 'Descuentos en cuenta de electricidad para hogares vulnerables',
    institution: 'Ministerio de Energía',
    website: 'https://www.cne.cl'
  }
]

// Información sobre etiquetas de eficiencia energética en Chile
export const ENERGY_LABELS = {
  description: 'Chile cuenta con etiquetado de eficiencia energética para 25 tipos de artefactos',
  website: 'https://www.top-ten.cl',
  grades: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
  recommendation: 'Siempre prefiere productos con calificación A, A+ o superior'
}

// Información específica por región basada en investigación oficial
export const REGIONAL_CONTEXT = {
  'XV': {
    climate: 'Desértico costero',
    mainChallenges: ['Calor extremo', 'Alta radiación solar', 'Escasez hídrica'],
    energyProfile: 'Alto potencial solar, demanda de refrigeración',
    economicContext: 'Minería, agricultura, turismo fronterizo',
    infrastructure: 'Red eléctrica estable, sistemas de riego tecnificado'
  },
  'I': {
    climate: 'Desértico absoluto',
    mainChallenges: ['Altas temperaturas', 'Sequedad extrema', 'Amplitud térmica'],
    energyProfile: 'Excelente recurso solar, industria minera',
    economicContext: 'Gran minería del cobre, industria química',
    infrastructure: 'Sistemas industriales de alta demanda energética'
  },
  'II': {
    climate: 'Desértico costero e interior',
    mainChallenges: ['Clima árido', 'Altas temperaturas diurnas', 'Vientos costeros'],
    energyProfile: 'Líder en energía solar, gran demanda minera',
    economicContext: 'Cobre, litio, astronomía',
    infrastructure: 'Hub energético del norte, interconexión SING'
  },
  'III': {
    climate: 'Desértico marginal',
    mainChallenges: ['Sequedad', 'Oscilación térmica', 'Vientos'],
    energyProfile: 'Alto potencial solar y eólico',
    economicContext: 'Minería del hierro y cobre, agricultura de oasis',
    infrastructure: 'Sistemas de bombeo solar, riego tecnificado'
  },
  'IV': {
    climate: 'Semi-árido con influencia marina',
    mainChallenges: ['Sequía recurrente', 'Vientos costeros', 'Heladas'],
    energyProfile: 'Excelente recurso eólico y solar',
    economicContext: 'Agricultura, minería, turismo',
    infrastructure: 'Parques eólicos, sistemas de riego eficiente'
  },
  'V': {
    climate: 'Mediterráneo costero',
    mainChallenges: ['Escasez hídrica', 'Contaminación urbana', 'Crecimiento urbano'],
    energyProfile: 'Consumo urbano alto, potencial renovable',
    economicContext: 'Puerto principal, industria, turismo',
    infrastructure: 'Gran consumo urbano, refinerías'
  },
  'RM': {
    climate: 'Mediterráneo continental',
    mainChallenges: ['Contaminación atmosférica', 'Isla de calor urbano', 'Alta demanda'],
    energyProfile: 'Mayor consumo del país (205 kWh/mes promedio)',
    economicContext: 'Centro económico, servicios, industria',
    infrastructure: 'Red compleja, alta densidad poblacional'
  },
  'VI': {
    climate: 'Mediterráneo continental',
    mainChallenges: ['Sequía', 'Heladas', 'Calefacción estacional'],
    energyProfile: 'Agroindustria, consumo estacional',
    economicContext: 'Agricultura, ganadería, minería del cobre',
    infrastructure: 'Sistemas de riego, industrias agrícolas'
  },
  'VII': {
    climate: 'Mediterráneo de interior',
    mainChallenges: ['Precipitaciones variables', 'Heladas', 'Calefacción'],
    energyProfile: 'Hidroelectricidad, biomasa forestal',
    economicContext: 'Agricultura, silvicultura, industria',
    infrastructure: 'Centrales hidroeléctricas, industria maderera'
  },
  'XVI': {
    climate: 'Mediterráneo lluvioso',
    mainChallenges: ['Frío invernal', 'Humedad', 'Calefacción residencial'],
    energyProfile: 'Uso intensivo de biomasa, hidroelectricidad',
    economicContext: 'Agricultura, silvicultura',
    infrastructure: 'Redes rurales, sistemas a leña'
  },
  'VIII': {
    climate: 'Oceánico templado',
    mainChallenges: ['Contaminación por leña', 'Frío invernal', 'Lluvia'],
    energyProfile: 'Alto consumo de calefacción, industria forestal',
    economicContext: 'Industria pesada, celulosa, carbón',
    infrastructure: 'Termoeléctricas, industrias energo-intensivas'
  },
  'IX': {
    climate: 'Templado lluvioso',
    mainChallenges: ['Contaminación atmosférica crítica', 'Uso de leña húmeda', 'Pobreza energética'],
    energyProfile: 'Temuco: segunda ciudad más contaminada (después Beijing)',
    economicContext: 'Agricultura, ganadería, turismo',
    infrastructure: 'Problema crítico de calefacción residencial'
  },
  'XIV': {
    climate: 'Templado oceánico',
    mainChallenges: ['Alta pluviosidad', 'Frío húmedo', 'Dependencia de leña'],
    energyProfile: 'Gran potencial hidroeléctrico',
    economicContext: 'Industria cervecera, turismo, agricultura',
    infrastructure: 'Hidroeléctricas de pasada, turismo sustentable'
  },
  'X': {
    climate: 'Templado lluvioso',
    mainChallenges: ['Frío intenso', 'Lluvias abundantes', 'Aislamiento geográfico'],
    energyProfile: 'Dependencia de leña, potencial renovable',
    economicContext: 'Acuicultura, turismo, ganadería',
    infrastructure: 'Sistemas aislados, microhidráulica'
  },
  'XI': {
    climate: 'Frío oceánico',
    mainChallenges: ['Clima extremo', 'Aislamiento', 'Altos costos energéticos'],
    energyProfile: 'Sistemas aislados, dependencia de combustibles',
    economicContext: 'Ganadería, turismo de aventura',
    infrastructure: 'Microredes, sistemas híbridos renovables'
  },
  'XII': {
    climate: 'Frío de estepa patagónica',
    mainChallenges: ['Vientos extremos', 'Frío intenso', 'Lejanía'],
    energyProfile: 'Excelente recurso eólico, gas natural',
    economicContext: 'Ganadería ovina, turismo, gas',
    infrastructure: 'Sistemas eólicos, redes locales'
  }
} as const

export const SEASONAL_RECOMMENDATIONS = {
  'XV': {
    verano: ['Maximizar refrigeración eficiente', 'Usar protección solar', 'Aprovechar energía solar'],
    invierno: ['Reducir calefacción nocturna', 'Mantener refrigeración', 'Optimizar iluminación natural'],
    tips: ['Instalar paneles solares', 'Usar aires acondicionados inverter', 'Aislación térmica de techos']
  },
  'I': {
    verano: ['Refrigeración industrial eficiente', 'Protección solar extrema', 'Sistemas de enfriamiento evaporativo'],
    invierno: ['Calefacción nocturna mínima', 'Aprovechar masa térmica', 'Mantener equipos de frío'],
    tips: ['Techos reflectivos blancos', 'Sistemas de refrigeración industrial', 'Aprovechamiento solar máximo']
  },
  'II': {
    verano: ['Aire acondicionado eficiente', 'Ventilación nocturna', 'Protección solar'],
    invierno: ['Calefacción moderada', 'Aprovechar sol matinal', 'Ventilación controlada'],
    tips: ['Paneles solares fotovoltaicos', 'Bombas de calor', 'Aislación térmica en muros']
  },
  'III': {
    verano: ['Refrigeración diurna', 'Ventilación cruzada', 'Sombreamiento'],
    invierno: ['Calefacción selectiva', 'Captación solar pasiva', 'Aislación nocturna'],
    tips: ['Sistemas híbridos solar-eólico', 'Climatización zonal', 'Ventanas de doble vidrio']
  },
  'IV': {
    verano: ['Ventilación marina', 'Refrigeración nocturna', 'Sombreamiento móvil'],
    invierno: ['Calefacción anti-heladas', 'Captación solar', 'Protección del viento'],
    tips: ['Aprovechamiento eólico', 'Calefont solar', 'Aislación de pisos']
  },
  'V': {
    verano: ['Ventilación marina nocturna', 'Sombreamiento', 'Refrigeración eficiente'],
    invierno: ['Calefacción central', 'Captación solar', 'Hermeticidad'],
    tips: ['Sistemas solares térmicos', 'Calefacción a gas eficiente', 'Mejoramiento térmico']
  },
  'RM': {
    verano: ['Climatización eficiente', 'Ventilación nocturna', 'Evitar isla de calor'],
    invierno: ['Calefacción limpia', 'Aislación térmica', 'Ventilación controlada'],
    tips: ['Reemplazo de calefactores', 'Aislación de muros y techos', 'Sistemas de climatización inverter']
  },
  'VI': {
    verano: ['Refrigeración agrícola', 'Ventilación nocturna', 'Protección solar'],
    invierno: ['Calefacción anti-heladas', 'Aislación rural', 'Calentadores solares'],
    tips: ['Sistemas de riego solar', 'Calefacción a pellets', 'Mejoramiento térmico rural']
  },
  'VII': {
    verano: ['Ventilación natural', 'Refrigeración industrial', 'Sombreamiento'],
    invierno: ['Calefacción a biomasa limpia', 'Aislación térmica', 'Hermeticidad'],
    tips: ['Calentadores solares', 'Estufas eficientes', 'Aislación de viviendas sociales']
  },
  'XVI': {
    verano: ['Ventilación natural', 'Refrigeración moderada', 'Aprovechamiento solar'],
    invierno: ['Calefacción eficiente', 'Leña seca certificada', 'Aislación completa'],
    tips: ['Estufas de doble cámara', 'Aislación térmica integral', 'Calefont solar']
  },
  'VIII': {
    verano: ['Ventilación húmeda', 'Deshumidificación', 'Sombreamiento'],
    invierno: ['Calefacción limpia obligatoria', 'Leña seca', 'Aislación térmica máxima'],
    tips: ['Recambio de estufas', 'Programa de aislación térmica', 'Calefacción distrital']
  },
  'IX': {
    verano: ['Ventilación anti-humedad', 'Deshumidificación', 'Aprovechamiento solar limitado'],
    invierno: ['CALEFACCIÓN LIMPIA CRÍTICA', 'Leña certificada seca', 'Aislación térmica urgente'],
    tips: ['RECAMBIO OBLIGATORIO estufas', 'Subsidios de aislación', 'Calefacción eléctrica nocturna']
  },
  'XIV': {
    verano: ['Ventilación constante', 'Deshumidificación', 'Aprovechamiento solar ocasional'],
    invierno: ['Calefacción eficiente húmeda', 'Leña muy seca', 'Aislación anti-humedad'],
    tips: ['Estufas herméticas', 'Aislación con barrera de vapor', 'Sistemas de ventilación']
  },
  'X': {
    verano: ['Calefacción nocturna', 'Deshumidificación constante', 'Ventilación anti-humedad'],
    invierno: ['CALEFACCIÓN INTENSA', 'Leña seca premium', 'Aislación térmica máxima'],
    tips: ['Sistemas de calefacción central', 'Aislación térmica completa', 'Bombas de calor geotérmicas']
  },
  'XI': {
    verano: ['Calefacción moderada', 'Protección del viento', 'Sistemas híbridos'],
    invierno: ['Calefacción extrema', 'Combustibles premium', 'Aislación total'],
    tips: ['Sistemas híbridos renovables', 'Aislación extrema', 'Calefacción de respaldo']
  },
  'XII': {
    verano: ['Protección eólica', 'Calefacción básica', 'Sistemas eólicos'],
    invierno: ['Calefacción anti-viento extremo', 'Combustibles de calidad', 'Hermeticidad total'],
    tips: ['Aprovechamiento eólico', 'Aislación contra viento', 'Sistemas de calefacción robustos']
  }
} as const

export const REGIONAL_PROGRAMS = {
  'IX': [
    'Plan de Descontaminación Atmosférica (crítico)',
    'Programa de Recambio de Calefactores (obligatorio)',
    'Subsidio Leña Seca Certificada',
    'Programa de Aislación Térmica de Emergencia',
    'Fiscalización de Emisiones Residenciales'
  ],
  'VIII': [
    'Plan de Descontaminación del Gran Concepción',
    'Programa de Recambio de Estufas a Leña',
    'Mejoramiento Térmico de Viviendas',
    'Centros de Acopio de Leña Seca',
    'Programa de Calefacción Distrital'
  ],
  'XIV': [
    'Programa Centros Integrales de Biomasa',
    'Subsidio para Leña Seca',
    'Mejoramiento de Estufas Rurales',
    'Programa de Aislación Térmica Rural',
    'Incentivos para Calentadores Solares'
  ],
  'X': [
    'Programa de Calefacción Limpia',
    'Subsidios para Bombas de Calor',
    'Mejoramiento Térmico de Viviendas Australes',
    'Programa de Leña Seca Certificada',
    'Sistemas de Calefacción Distrital'
  ],
  'RM': [
    'Plan de Prevención y Descontaminación Atmosférica',
    'Programa de Recambio de Calefactores',
    'Subsidios de Acondicionamiento Térmico',
    'Programa Techos Solares',
    'Mejoramiento Energético de Edificios Públicos'
  ],
  'II': [
    'Programa de Energía Solar Residencial',
    'Incentivos para Sistemas Fotovoltaicos',
    'Programa de Eficiencia en Minería',
    'Sistemas de Refrigeración Eficiente',
    'Aprovechamiento Solar Térmico'
  ],
  'V': [
    'Programa de Eficiencia Energética Portuaria',
    'Techos Solares en Edificios Públicos',
    'Mejoramiento Térmico Urbano',
    'Sistemas de Calefacción Eficiente',
    'Programa de Movilidad Eléctrica'
  ]
} as const

export const REGIONAL_CONSUMPTION_PATTERNS = {
  'RM': {
    averageMonthly: 205, // kWh/mes
    peakSeason: 'invierno',
    mainUses: ['Calefacción (45%)', 'Agua caliente (23%)', 'Electrodomésticos (20%)', 'Iluminación (12%)'],
    challengeMonths: ['Junio', 'Julio', 'Agosto'],
    tipicalHour: '19:00-22:00'
  },
  'IX': {
    averageMonthly: 180,
    peakSeason: 'invierno',
    mainUses: ['Calefacción a leña (60%)', 'Agua caliente (20%)', 'Electrodomésticos (15%)', 'Iluminación (5%)'],
    challengeMonths: ['Mayo a Septiembre'],
    tipicalHour: '18:00-23:00'
  },
  'II': {
    averageMonthly: 220,
    peakSeason: 'verano',
    mainUses: ['Refrigeración (40%)', 'Procesos industriales (35%)', 'Electrodomésticos (15%)', 'Iluminación (10%)'],
    challengeMonths: ['Diciembre', 'Enero', 'Febrero'],
    tipicalHour: '14:00-17:00'
  },
  'VIII': {
    averageMonthly: 190,
    peakSeason: 'invierno',
    mainUses: ['Calefacción (55%)', 'Agua caliente (25%)', 'Electrodomésticos (15%)', 'Iluminación (5%)'],
    challengeMonths: ['Junio a Agosto'],
    tipicalHour: '18:00-22:00'
  },
  'X': {
    averageMonthly: 170,
    peakSeason: 'invierno',
    mainUses: ['Calefacción (65%)', 'Agua caliente (20%)', 'Electrodomésticos (10%)', 'Iluminación (5%)'],
    challengeMonths: ['Mayo a Septiembre'],
    tipicalHour: '17:00-23:00'
  }
} as const

// Información específica de clima por región
export const CLIMATE_ZONES = {
  'XV': { zone: 1, type: 'Árido costero', heating: 'Mínima', cooling: 'Alta' },
  'I': { zone: 1, type: 'Desértico absoluto', heating: 'Mínima', cooling: 'Muy Alta' },
  'II': { zone: 1, type: 'Desértico', heating: 'Baja', cooling: 'Alta' },
  'III': { zone: 2, type: 'Semi-árido', heating: 'Baja', cooling: 'Media' },
  'IV': { zone: 2, type: 'Semi-árido costero', heating: 'Media', cooling: 'Media' },
  'V': { zone: 3, type: 'Mediterráneo costero', heating: 'Media', cooling: 'Media' },
  'RM': { zone: 3, type: 'Mediterráneo continental', heating: 'Media-Alta', cooling: 'Media' },
  'VI': { zone: 4, type: 'Mediterráneo interior', heating: 'Alta', cooling: 'Baja' },
  'VII': { zone: 4, type: 'Mediterráneo lluvioso', heating: 'Alta', cooling: 'Baja' },
  'XVI': { zone: 5, type: 'Templado', heating: 'Alta', cooling: 'Mínima' },
  'VIII': { zone: 5, type: 'Templado lluvioso', heating: 'Muy Alta', cooling: 'Mínima' },
  'IX': { zone: 6, type: 'Templado frío', heating: 'Extrema', cooling: 'Mínima' },
  'XIV': { zone: 6, type: 'Oceánico templado', heating: 'Muy Alta', cooling: 'Mínima' },
  'X': { zone: 6, type: 'Templado húmedo', heating: 'Extrema', cooling: 'Mínima' },
  'XI': { zone: 7, type: 'Frío oceánico', heating: 'Extrema', cooling: 'Nula' },
  'XII': { zone: 7, type: 'Frío de estepa', heating: 'Extrema', cooling: 'Nula' }
} as const 