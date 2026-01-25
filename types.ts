export interface Vulnerability {
  tipo: string;
  cwe_id: string;
  severidad: string;
  endpoint_afectado: string;
  descripcion: string;
  poc_payload: string;
  remediacion_tecnica: {
    explicacion: string;
    codigo_corregido: string;
    codigo_vulnerable?: string;
  };
}

export interface VulnerabilityReport {
  resumen_ejecutivo: { total_hallazgos: number; riesgo_global: string; };
  vulnerabilidades: Vulnerability[];
}

export interface User {
  id: string;
  username: string;
  role: string;
  status: string;
}