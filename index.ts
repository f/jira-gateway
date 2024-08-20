import { Application, Router, Context } from "https://deno.land/x/oak/mod.ts";

// Configuration
const API_SERVER = "https://pozitim.atlassian.net";

// Function to extract the API key from Basic Auth header
function extractApiKeyFromBasicAuth(authHeader: string): string | null {
  if (!authHeader.startsWith("Basic ")) {
    return null;
  }

  const encodedCredentials = authHeader.slice("Basic ".length);
  const decodedCredentials = atob(encodedCredentials);
  const [_, apiKey] = decodedCredentials.split(":");

  return apiKey || null;
}

// Proxy request to the appropriate API with the correct Authorization header
async function proxyRequest(ctx: Context, baseUrl: string, authHeader: string) {
  const url = `${baseUrl}${ctx.request.url.pathname}${ctx.request.url.search}`;
  const method = ctx.request.method;
  const headers = new Headers(ctx.request.headers);

  // Set the correct Authorization header
  headers.set("Authorization", authHeader);
  headers.set("X-Atlassian-Token", "no-check");

  // Remove the original host header and add API server as host
  headers.set("Host", new URL(baseUrl).host);

  const body = method !== "GET" && method !== "HEAD" ? await ctx.request.body({ type: "stream" }).value : undefined;

  console.log(`Proxying request to ${url}`);
  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  ctx.response.status = response.status;
  ctx.response.body = response.body;
  ctx.response.headers = response.headers;
}

// Create a new Oak application
const app = new Application();
const router = new Router();

// REST API routes with Basic Auth
router.all("/rest/api/2/:path*", async (ctx) => {
  const authHeader = ctx.request.headers.get("Authorization");

  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Authorization header is missing" };
    return;
  }

  // Proxy with the original Basic Auth header
  await proxyRequest(ctx, API_SERVER, authHeader);
});

// Agile API routes with Bearer Auth
router.all("/rest/agile/1.0/:path*", async (ctx) => {
  const authHeader = ctx.request.headers.get("Authorization");

  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Authorization header is missing" };
    return;
  }

  // Extract the API key from the Basic Auth header
  const apiKey = extractApiKeyFromBasicAuth(authHeader);

  if (!apiKey) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Invalid Basic authorization header" };
    return;
  }

  // Convert to Bearer token
  const bearerAuthHeader = `Bearer ${apiKey}`;

  // Proxy with the Bearer Auth header
  await proxyRequest(ctx, API_SERVER, bearerAuthHeader);
});

// Default route for unmatched paths
router.all("(.*)", (ctx) => {
  ctx.response.status = 404;
  ctx.response.body = { message: "Not Found" };
});

// Use the router and start the server
app.use(router.routes());
app.use(router.allowedMethods());

console.log("API Gateway is running on http://localhost:8000");
await app.listen({ port: 8000 });
