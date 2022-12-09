const isTest = process.env['JEST_WORKER_ID'] !== undefined;

export function getVariable(variable: string): string {
  let value = process.env[variable];

  if (!value && isTest) {
    value = `{ "TEST": "[getVariable] ES UN TEST, usar process.env['${variable}'] = 'VALOR_QUE_QUIERES') si quiere forzar un valor" }`;
  } else if (!value) {
    throw new Error(`Variable not exist: ${variable}`);
  }

  return value;
}

export function toJSON(variable: unknown): string {
  return JSON.stringify(variable, null, 2);
}
