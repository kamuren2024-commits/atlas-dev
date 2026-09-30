export interface HttpServerConfig {
  host: string;
  port: number;
}

export function resolveHttpServerConfig(env: NodeJS.ProcessEnv = process.env): HttpServerConfig {
  const portValue = env.PORT?.trim();
  const port = portValue ? Number(portValue) : 3000;

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return {
    host: env.HOST?.trim() || '0.0.0.0',
    port,
  };
}
