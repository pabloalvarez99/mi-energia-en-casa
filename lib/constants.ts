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

// Tarifas eléctricas basadas en datos de la CNE 2024-2025
// Incluyen precio de nudo promedio + valor agregado de distribución + cargos por transmisión
export const electricityCostCLPPerKwhByRegion: Record<keyof typeof REGIONS, number> = {
  XV: 220, // Extremo norte - mayor costo por distancia
  I: 215,  // Norte
  II: 210, // Antofagasta - zona minera
  III: 205, // Atacama
  IV: 200, // Coquimbo
  V: 195,  // Valparaíso - zona central
  RM: 190, // Metropolitana - mayor eficiencia de transmisión
  VI: 195,  // O'Higgins
  VII: 200, // Maule
  XVI: 205, // Ñuble
  VIII: 195, // Biobío - zona industrial
  IX: 210,  // Araucanía - mayor distancia
  XIV: 215, // Los Ríos
  X: 220,   // Los Lagos - sur
  XI: 235,  // Aysén - sistemas medianos
  XII: 240, // Magallanes - sistemas aislados con gas natural y diésel
}

// Factor de emisión CO2 basado en datos del sistema eléctrico chileno
// Fuente: Our World in Data y reportes oficiales del sistema eléctrico nacional
// Sistema con 70% renovables y 30% fósiles (carbón, gas, diésel)
export const carbonFactorKgPerKwhByRegion: Record<keyof typeof REGIONS, number> = {
  XV: 0.25,  // Norte - alta penetración solar
  I: 0.28,   // Tarapacá - mix solar/térmica
  II: 0.32,  // Antofagasta - zona minera con térmica
  III: 0.22,  // Atacama - alta penetración renovable
  IV: 0.20,  // Coquimbo - eólico y solar
  V: 0.23,   // Valparaíso - mix balanceado
  RM: 0.22,  // Metropolitana - acceso a renovables
  VI: 0.24,  // O'Higgins
  VII: 0.21, // Maule - hidro y renovables
  XVI: 0.23, // Ñuble - mix renovable/térmica
  VIII: 0.26, // Biobío - mix industria/renovables
  IX: 0.19,  // Araucanía - alta penetración hidro
  XIV: 0.18, // Los Ríos - principalmente hidro
  X: 0.17,   // Los Lagos - hidro y biomasa
  XI: 0.35,  // Aysén - sistema mediano con diésel
  XII: 0.42, // Magallanes - gas natural y diésel
}

export const APPLIANCES: Record<string, ApplianceDefinition> = {
  // Línea blanca - Refrigeración
  refrigerator: { name: 'Refrigerador No Frost 300L', watts: 180 },
  refrigerator_small: { name: 'Refrigerador bajo mesón 150L', watts: 120 },
  refrigerator_large: { name: 'Refrigerador Side by Side 500L+', watts: 280 },
  freezer: { name: 'Congelador horizontal 200L', watts: 150 },
  wine_cooler: { name: 'Cava viñera', watts: 85 },
  
  // Cocina
  microwave: { name: 'Microondas 25L', watts: 1200 },
  oven_electric: { name: 'Horno eléctrico empotrable', watts: 2400 },
  cooktop_induction: { name: 'Cocina a inducción 4 quemadores', watts: 3000 },
  cooktop_electric: { name: 'Cocina eléctrica vitrocerámica', watts: 2200 },
  kettle: { name: 'Hervidor eléctrico 1.7L', watts: 1800 },
  coffee_maker: { name: 'Cafetera de filtro', watts: 800 },
  coffee_espresso: { name: 'Cafetera express', watts: 1400 },
  blender: { name: 'Licuadora 1.5L', watts: 350 },
  food_processor: { name: 'Multiprocesador de alimentos', watts: 500 },
  toaster: { name: 'Tostadora 2 rebanadas', watts: 900 },
  rice_cooker: { name: 'Arrocera 1L', watts: 350 },
  air_fryer: { name: 'Freidora de aire 3.5L', watts: 1300 },
  electric_grill: { name: 'Parrilla eléctrica', watts: 2000 },
  
  // Lavado y secado
  washing_machine: { name: 'Lavadora automática 7kg', watts: 450 },
  washing_machine_efficient: { name: 'Lavadora inverter A+++ 8kg', watts: 180 },
  washer_dryer: { name: 'Lavadora-secadora 7kg', watts: 1200 },
  dryer: { name: 'Secadora 7kg', watts: 2300 },
  dishwasher: { name: 'Lavavajillas 12 cubiertos', watts: 1400 },
  
  // Climatización
  ac_split: { name: 'Aire acondicionado split 12000 BTU', watts: 1100 },
  ac_portable: { name: 'Aire acondicionado portátil', watts: 900 },
  heater_panel: { name: 'Panel calefactor eléctrico', watts: 1500 },
  heater_ceramic: { name: 'Estufa cerámica', watts: 1800 },
  heat_pump: { name: 'Bomba de calor aire-aire', watts: 650 },
  fan: { name: 'Ventilador de pie', watts: 45 },
  ceiling_fan: { name: 'Ventilador de techo con luz', watts: 85 },
  
  // Entretenimiento y electrónicos
  tv_32: { name: 'Televisor LED 32" Full HD', watts: 80 },
  tv_55: { name: 'Televisor LED 55" 4K', watts: 130 },
  tv_65: { name: 'Televisor QLED 65" 4K', watts: 180 },
  soundbar: { name: 'Barra de sonido', watts: 120 },
  home_theater: { name: 'Home theater 5.1', watts: 300 },
  gaming_console: { name: 'Consola PlayStation/Xbox', watts: 165 },
  
  // Computación
  desktop_pc: { name: 'PC de escritorio', watts: 180 },
  laptop: { name: 'Notebook 15"', watts: 65 },
  tablet: { name: 'Tablet en uso', watts: 8 },
  monitor: { name: 'Monitor LED 24"', watts: 22 },
  printer_inkjet: { name: 'Impresora de tinta', watts: 30 },
  printer_laser: { name: 'Impresora láser', watts: 350 },
  router: { name: 'Router Wi-Fi', watts: 12 },
  
  // Iluminación
  led_bulb_9w: { name: 'Ampolleta LED 9W (60W equiv.)', watts: 9 },
  led_bulb_15w: { name: 'Ampolleta LED 15W (100W equiv.)', watts: 15 },
  led_strip: { name: 'Cinta LED por metro', watts: 14 },
  fluorescent_tube: { name: 'Tubo fluorescente T8', watts: 36 },
  halogen_bulb: { name: 'Ampolleta halógena 50W', watts: 50 },
  
  // Cuidado personal
  hair_dryer: { name: 'Secador de cabello 1800W', watts: 1800 },
  hair_straightener: { name: 'Plancha alisadora', watts: 180 },
  electric_shaver: { name: 'Afeitadora eléctrica', watts: 8 },
  electric_toothbrush: { name: 'Cepillo dental eléctrico', watts: 2 },
  
  // Limpieza
  vacuum_upright: { name: 'Aspiradora vertical', watts: 750 },
  vacuum_canister: { name: 'Aspiradora de trineo', watts: 850 },
  vacuum_robot: { name: 'Aspiradora robot', watts: 28 },
  steam_iron: { name: 'Plancha a vapor', watts: 1400 },
  garment_steamer: { name: 'Vaporizador de ropa', watts: 1200 },
  
  // Agua caliente y bombas
  water_heater_electric: { name: 'Calefón eléctrico instantáneo', watts: 5500 },
  water_heater_tank: { name: 'Termo eléctrico 80L', watts: 1500 },
  water_pump: { name: 'Bomba de agua periférica', watts: 800 },
  pool_pump: { name: 'Bomba de piscina', watts: 1200 },
  
  // Automatización y seguridad
  garage_door: { name: 'Motor portón corredizo', watts: 350 },
  security_camera: { name: 'Cámara de seguridad IP', watts: 12 },
  alarm_system: { name: 'Sistema de alarma', watts: 25 },
  smart_doorbell: { name: 'Timbre inteligente', watts: 4 },
  
  // Cargadores y dispositivos móviles
  phone_charger: { name: 'Cargador smartphone', watts: 20 },
  tablet_charger: { name: 'Cargador tablet', watts: 12 },
  laptop_charger: { name: 'Cargador notebook', watts: 90 },
  smartwatch_charger: { name: 'Cargador smartwatch', watts: 5 },
  
  // Herramientas eléctricas
  drill: { name: 'Taladro eléctrico', watts: 600 },
  angle_grinder: { name: 'Esmeril angular', watts: 850 },
  jigsaw: { name: 'Sierra caladora', watts: 400 },
  
  // Jardín y exterior
  lawn_mower: { name: 'Cortacésped eléctrico', watts: 1200 },
  hedge_trimmer: { name: 'Cortasetos eléctrico', watts: 450 },
  outdoor_lighting: { name: 'Iluminación exterior LED', watts: 25 },
} 