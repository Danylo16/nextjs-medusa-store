export function getEnv(name: string): string {
  const val = process.env[name];
  if (!val || !val.trim()) throw new Error(`ENV ${name} is missing`);
  return val;
}
