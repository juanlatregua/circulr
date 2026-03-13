// IPCC / MITECO emission factors (2024)
const FACTORS = {
  electricity_spain: 0.181, // kgCO2/kWh (mix eléctrico España 2024)
  gas: 0.202, // kgCO2/kWh
  transport_car: 0.171, // kgCO2/km
  waste_landfill: 580, // kgCO2/tonne
};

// Sector averages (tCO2e/employee/year) — approximate benchmarks
const SECTOR_AVERAGES: Record<string, number> = {
  industria: 8.5,
  hosteleria: 3.2,
  comercio: 2.8,
  servicios: 2.1,
  construccion: 6.4,
  transporte: 12.0,
  alimentacion: 4.5,
  otro: 3.5,
};

const EMPLOYEE_MIDPOINTS: Record<string, number> = {
  "1-5": 3,
  "6-20": 13,
  "21-50": 35,
  "51-200": 125,
  "200+": 300,
};

export interface CarbonInput {
  sector: string;
  employees: string;
  energy_kwh: number;
  gas_kwh?: number;
  transport_km: number;
  waste_tons?: number;
}

export interface CarbonResult {
  total_tco2e: number;
  scope1: { gas: number; transport: number; total: number };
  scope2: { electricity: number; total: number };
  scope3: { waste: number; total: number };
  per_employee: number;
  sector_average: number;
  sector: string;
  comparison: "below" | "average" | "above";
  quick_wins: string[];
}

export function calculateCarbon(input: CarbonInput): CarbonResult {
  const gasKg = (input.gas_kwh || 0) * FACTORS.gas;
  const transportKg = input.transport_km * FACTORS.transport_car;
  const electricityKg = input.energy_kwh * FACTORS.electricity_spain;
  const wasteKg = (input.waste_tons || 0) * FACTORS.waste_landfill;

  const scope1Total = gasKg + transportKg;
  const scope2Total = electricityKg;
  const scope3Total = wasteKg;
  const totalKg = scope1Total + scope2Total + scope3Total;
  const totalTco2e = totalKg / 1000;

  const employeeCount = EMPLOYEE_MIDPOINTS[input.employees] || 10;
  const perEmployee = totalTco2e / employeeCount;
  const sectorAvg = SECTOR_AVERAGES[input.sector] || 3.5;

  let comparison: "below" | "average" | "above";
  if (perEmployee < sectorAvg * 0.8) comparison = "below";
  else if (perEmployee > sectorAvg * 1.2) comparison = "above";
  else comparison = "average";

  // Generate contextual quick wins
  const quickWins: string[] = [];
  if (electricityKg > totalKg * 0.4) {
    quickWins.push("Cambia a un contrato de energía 100% renovable — puede reducir tu Alcance 2 hasta un 80%.");
  }
  if (transportKg > totalKg * 0.3) {
    quickWins.push("Implementa una política de viajes con videoconferencia como opción por defecto — reducción potencial del 40% en emisiones de transporte.");
  }
  if (wasteKg > totalKg * 0.2) {
    quickWins.push("Optimiza la separación de residuos y establece un programa de reciclaje — puede reducir emisiones por residuos un 60%.");
  }
  if (gasKg > totalKg * 0.2) {
    quickWins.push("Mejora el aislamiento térmico y considera una bomba de calor — reducción potencial del 50% en consumo de gas.");
  }
  if (quickWins.length < 3) {
    quickWins.push("Calcula tu huella mensualmente para detectar tendencias y establecer objetivos de reducción realistas.");
  }
  if (quickWins.length < 3) {
    quickWins.push("Forma a tu equipo en prácticas de eficiencia energética — el comportamiento puede reducir un 10-15% del consumo.");
  }

  return {
    total_tco2e: Math.round(totalTco2e * 100) / 100,
    scope1: {
      gas: Math.round(gasKg / 10) / 100,
      transport: Math.round(transportKg / 10) / 100,
      total: Math.round(scope1Total / 10) / 100,
    },
    scope2: {
      electricity: Math.round(electricityKg / 10) / 100,
      total: Math.round(scope2Total / 10) / 100,
    },
    scope3: {
      waste: Math.round(wasteKg / 10) / 100,
      total: Math.round(scope3Total / 10) / 100,
    },
    per_employee: Math.round(perEmployee * 100) / 100,
    sector_average: sectorAvg,
    sector: input.sector,
    comparison,
    quick_wins: quickWins.slice(0, 3),
  };
}
