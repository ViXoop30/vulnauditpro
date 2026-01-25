
import React from 'react';
import { VulnerabilityReport } from './types.ts';

export const SYSTEM_INSTRUCTION = `Eres un Senior Security Researcher y Experto en Pentesting. Tu objetivo es recibir datos brutos de escaneos de vulnerabilidades (logs, JSON de Nuclei, outputs de Nmap) y transformarlos en un informe de auditoría técnica de alto nivel.

Reglas de Análisis:
1. Filtro de Falsos Positivos: Analiza si la vulnerabilidad detectada tiene sentido lógico. Si algo parece un error de configuración menor, no lo eleves a crítico.
2. Enfoque en Remediación: Para cada vulnerabilidad, DEBES proporcionar el bloque de código corregido (Secure Code) y, si es posible deducirlo, el código vulnerable (Vulnerable Code).
3. Clasificación: Usa el estándar de severidad CVSS v3.1 (Baja, Media, Alta, Crítica).
4. Idioma: Responde siempre en Español.

Debes responder exclusivamente en formato JSON estructurado.`;

export const SAMPLE_DATA = {
  url: "https://elreydelchurrascon.cl/",
  logs: `[2024-06-01] [nuclei] [wordpress-detect] https://elreydelchurrascon.cl/ (Version 6.0.1 - Outdated)
[2024-06-01] [nuclei] [wp-directory-listing] https://elreydelchurrascon.cl/wp-content/uploads/ (200 OK)
[2024-06-01] [nuclei] [xmlrpc-bruteforce] https://elreydelchurrascon.cl/xmlrpc.php (Vulnerable to multicall)
[2024-06-01] [nmap] Port 3306 (MySQL) open to 0.0.0.0/0. Banner: 5.7.42-log
[2024-06-01] [http-header] Missing HSTS, Content-Security-Policy and X-Frame-Options.`
};

// Mock report for demo mode (when API key is invalid)
export const MOCK_REPORT: VulnerabilityReport = {
  resumen_ejecutivo: {
    total_hallazgos: 5,
    riesgo_global: "ALTO - Múltiples vulnerabilidades críticas detectadas"
  },
  vulnerabilidades: [
    {
      tipo: "WordPress Desactualizado",
      severidad: "Alta",
      cwe_id: "CWE-1104",
      endpoint_afectado: "https://elreydelchurrascon.cl/",
      descripcion: "Se detectó WordPress 6.0.1 en ejecución, una versión obsoleta con vulnerabilidades conocidas de XSS y escalada de privilegios.",
      poc_payload: "Version: 6.0.1 (CVE-2022-21664, CVE-2022-21663)",
      remediacion_tecnica: {
        explicacion: "Actualizar WordPress a la última versión estable (6.4+). Realizar backups antes de actualizar y probar en staging.",
        codigo_vulnerable: "WordPress Version 6.0.1\nReleased: 2022-05-24\nEnd of Life: 2022-11-01",
        codigo_corregido: "# Actualización vía WP-CLI\nwp core update --version=6.4.2\nwp core verify-checksums\nwp plugin update --all"
      }
    },
    {
      tipo: "Directory Listing Habilitado",
      severidad: "Media",
      cwe_id: "CWE-548",
      endpoint_afectado: "https://elreydelchurrascon.cl/wp-content/uploads/",
      descripcion: "El directorio de uploads permite listar archivos, exponiendo potencialmente información sensible o archivos de respaldo.",
      poc_payload: "GET /wp-content/uploads/ HTTP/1.1\nResponse: 200 OK (Index of /wp-content/uploads/)",
      remediacion_tecnica: {
        explicacion: "Deshabilitar directory listing en Apache mediante configuración .htaccess o directiva del servidor.",
        codigo_vulnerable: "# .htaccess actual\n# No hay restricción de listado",
        codigo_corregido: "# .htaccess corregido\nOptions -Indexes\n<IfModule mod_autoindex.c>\n  IndexIgnore *\n</IfModule>"
      }
    },
    {
      tipo: "XML-RPC Brute Force Vulnerable",
      severidad: "Crítica",
      cwe_id: "CWE-307",
      endpoint_afectado: "https://elreydelchurrascon.cl/xmlrpc.php",
      descripcion: "El endpoint XML-RPC permite ataques de fuerza bruta amplificados mediante system.multicall, permitiendo probar múltiples credenciales en una sola petición.",
      poc_payload: `POST /xmlrpc.php HTTP/1.1
Content-Type: text/xml

<methodCall>
  <methodName>system.multicall</methodName>
  <params>
    <param><value><array><data>
      <value><struct>
        <member><name>methodName</name>
        <value><string>wp.getUsersBlogs</string></value></member>
      </struct></value>
    </data></array></value></param>
  </params>
</methodCall>`,
      remediacion_tecnica: {
        explicacion: "Desactivar completamente XML-RPC si no se utiliza, o implementar rate limiting agresivo.",
        codigo_vulnerable: "// wp-config.php sin protección\ndefine('WP_DEBUG', false);",
        codigo_corregido: `// wp-config.php con protección
add_filter('xmlrpc_enabled', '__return_false');

// .htaccess adicional
<Files xmlrpc.php>
  Order Deny,Allow
  Deny from all
</Files>`
      }
    },
    {
      tipo: "MySQL Expuesto Públicamente",
      severidad: "Crítica",
      cwe_id: "CWE-284",
      endpoint_afectado: "0.0.0.0:3306",
      descripcion: "El puerto MySQL 3306 está abierto a Internet (0.0.0.0/0), permitiendo intentos de conexión directa desde cualquier origen.",
      poc_payload: "nmap -sV -p3306 [IP]\nPORT     STATE SERVICE VERSION\n3306/tcp open  mysql   MySQL 5.7.42-log",
      remediacion_tecnica: {
        explicacion: "Configurar firewall para permitir acceso MySQL solo desde localhost o IPs autorizadas específicas.",
        codigo_vulnerable: "# /etc/mysql/mysql.conf.d/mysqld.cnf\nbind-address = 0.0.0.0\nport = 3306",
        codigo_corregido: `# /etc/mysql/mysql.conf.d/mysqld.cnf
bind-address = 127.0.0.1
port = 3306

# Firewall (iptables)
iptables -A INPUT -p tcp --dport 3306 -s 127.0.0.1 -j ACCEPT
iptables -A INPUT -p tcp --dport 3306 -j DROP`
      }
    },
    {
      tipo: "Headers de Seguridad Faltantes",
      severidad: "Media",
      cwe_id: "CWE-693",
      endpoint_afectado: "https://elreydelchurrascon.cl/",
      descripcion: "Ausencia de headers HTTP de seguridad críticos: HSTS, Content-Security-Policy, X-Frame-Options. Esto expone a ataques de clickjacking, MITM y XSS.",
      poc_payload: "curl -I https://elreydelchurrascon.cl/\n\nMissing:\n- Strict-Transport-Security\n- Content-Security-Policy\n- X-Frame-Options",
      remediacion_tecnica: {
        explicacion: "Implementar headers de seguridad mediante configuración del servidor web (Apache/Nginx) o a nivel de aplicación.",
        codigo_vulnerable: "# Sin headers de seguridad",
        codigo_corregido: `# Apache .htaccess / httpd.conf
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`
      }
    }
  ]
};

export const SeverityColors: Record<string, string> = {
  "Baja": "bg-blue-500/20 text-blue-400 border-blue-500/50",
  "Media": "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  "Alta": "bg-orange-500/20 text-orange-400 border-orange-500/50",
  "Crítica": "bg-red-500/20 text-red-400 border-red-500/50"
};

export const Icons = {
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
  ),
  Code: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
  ),
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><polyline points="21 3 21 8 16 8" /></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  WhatsApp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.8.9L22 4l-1.5 6.5Z" /></svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
  )
};
