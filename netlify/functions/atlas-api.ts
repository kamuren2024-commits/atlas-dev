interface NetlifyFunctionEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  rawUrl: string;
  body: string | null;
  isBase64Encoded?: boolean;
}

interface NetlifyFunctionResponse {
  statusCode: number;
  headers: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body: string;
}

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export const config = { path: '/api/*' };

export default async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
  const configuredOrigin = process.env.ATLAS_API_ORIGIN;
  if (!configuredOrigin) {
    return jsonResponse(503, { error: 'Atlas API origin is not configured.' });
  }

  let upstreamOrigin: URL;
  try {
    upstreamOrigin = new URL(configuredOrigin);
  } catch {
    return jsonResponse(500, { error: 'Atlas API origin is invalid.' });
  }

  const isLocalHttp = ['localhost', '127.0.0.1', '[::1]'].includes(upstreamOrigin.hostname);
  if (
    !['https:', 'http:'].includes(upstreamOrigin.protocol) ||
    (upstreamOrigin.protocol !== 'https:' && !isLocalHttp) ||
    upstreamOrigin.pathname !== '/' ||
    upstreamOrigin.search ||
    upstreamOrigin.hash ||
    upstreamOrigin.username ||
    upstreamOrigin.password
  ) {
    return jsonResponse(500, { error: 'Atlas API origin must be an HTTPS origin.' });
  }

  try {
    const incomingUrl = new URL(event.rawUrl);
    const upstreamUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, upstreamOrigin.origin);
    const headers = new Headers();

    for (const [name, value] of Object.entries(event.headers)) {
      if (value && !HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
        headers.set(name, value);
      }
    }

    const body = event.body && event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD'
      ? event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : event.body
      : undefined;
    const upstreamResponse = await fetch(upstreamUrl, {
      method: event.httpMethod,
      headers,
      body,
      redirect: 'manual',
    });
    const responseHeaders: Record<string, string> = {};

    upstreamResponse.headers.forEach((value, name) => {
      if (!['content-encoding', 'content-length', 'set-cookie'].includes(name.toLowerCase())) {
        responseHeaders[name] = value;
      }
    });

    const setCookies = upstreamResponse.headers.getSetCookie();
    return {
      statusCode: upstreamResponse.status,
      headers: responseHeaders,
      ...(setCookies.length ? { multiValueHeaders: { 'set-cookie': setCookies } } : {}),
      body: await upstreamResponse.text(),
    };
  } catch {
    return jsonResponse(502, { error: 'Atlas identity service is unavailable.' });
  }
}

function jsonResponse(statusCode: number, body: Record<string, string>): NetlifyFunctionResponse {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}