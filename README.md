# JIRA Gateway

## Overview
JIRA Gateway is a Deno-based API service that acts as a gateway between your application and the JIRA API. It proxies requests to the appropriate JIRA API endpoint, ensuring that the necessary authorization headers are included.

## Features
- **Issue Management**: Easily create, update, and transition issues in JIRA.
- **Project Insights**: Programmatically retrieve details about projects, sprints, and boards.
- **User Operations**: Manage users and roles via the API.
- **Custom Queries**: Execute JQL (JIRA Query Language) queries for customized data retrieval.

## Installation
Since this is a Deno project, no installation is required. Simply import the module directly into your Deno application.

## Usage
Here's an example of how to set up and use the JIRA Gateway in your Deno application:
```typescript
import { Application, Router, Context } from "https://deno.land/x/oak/mod.ts";

const API_SERVER = "https://your-jira-instance.atlassian.net";

async function proxyRequest(ctx: Context, baseUrl: string, authHeader: string) {
  const url = `${baseUrl}${ctx.request.url.pathname}${ctx.request.url.search}`;
  const method = ctx.request.method;
  const headers = new Headers(ctx.request.headers);

  headers.set("Authorization", authHeader);
  headers.set("X-Atlassian-Token", "no-check");
  headers.set("Host", new URL(baseUrl).host);

  const body = method !== "GET" && method !== "HEAD" ? await ctx.request.body({ type: "stream" }).value : undefined;

  console.log(`Proxying request to ${url}`);
  const response = await fetch(url, { method, headers, body });

  ctx.response.status = response.status;
  ctx.response.body = response.body;
  ctx.response.headers = response.headers;
}

const app = new Application();
const router = new Router();

router.all("/:path*", async (ctx) => {
  const authHeader = ctx.request.headers.get("Authorization");

  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Authorization header is missing" };
    return;
  }

  await proxyRequest(ctx, API_SERVER, authHeader);
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("API Gateway is running on http://localhost:8000");
await app.listen({ port: 8000 });
```

## Deployment
You can deploy this application directly to [Deno Deploy](https://deno.com/deploy) with minimal configuration. Simply link your GitHub repository to Deno Deploy, and it will automatically build and deploy your application.

## Configuration
To configure the JIRA Gateway, set the following environment variables:
- `JIRA_USERNAME`: Your JIRA account username.
- `JIRA_API_TOKEN`: Your JIRA API token.
- `JIRA_URL`: The base URL of your JIRA instance.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue on GitHub. Make sure to follow the code style and include tests for any new features.

## License
This project is licensed under the MIT License.

## Contact
For any inquiries, please contact us at [support@yourcompany.com](mailto:support@yourcompany.com).
