const INJECTION_PATTERNS = [
  /ignora\s+(tus|las|todas)\s+instrucciones/i,
  /ignore\s+(your|all|the)\s+instructions/i,
  /eres\s+ahora/i,
  /you\s+are\s+now/i,
  /system\s*prompt/i,
  /\bDAN\b/,
  /jailbreak/i,
  /nuevo\s+rol/i,
  /new\s+role/i,
  /actua\s+como/i,
  /act\s+as/i,
  /pretend\s+to\s+be/i,
];

export function sanitizeInput(input: string): {
  clean: string;
  isInjection: boolean;
} {
  let clean = input.trim().slice(0, 500);
  clean = clean.replace(/<[^>]*>/g, "");
  clean = clean.replace(/\0/g, "");
  const isInjection = INJECTION_PATTERNS.some((pattern) => pattern.test(clean));
  return { clean, isInjection };
}
