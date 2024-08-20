# JIRA API Gateway

## Overview
JIRA Gateway is a Deno-based API service that acts as a gateway between your application and the JIRA API. It proxies requests to the appropriate JIRA API endpoint, ensuring that the necessary authorization headers are included.

## Features
- **Issue Management**: Easily create, update, and transition issues in JIRA.
- **Project Insights**: Programmatically retrieve details about projects, sprints, and boards.
- **User Operations**: Manage users and roles via the API.
- **Custom Queries**: Execute JQL (JIRA Query Language) queries for customized data retrieval.

## Installation
Since this is a Deno project, no installation is required. Simply import the module directly into your Deno application.

## Deployment
You can deploy this application directly to [Deno Deploy](https://deno.com/deploy) with minimal configuration. Simply link your GitHub repository to Deno Deploy, and it will automatically build and deploy your application.

## Configuration
To configure the JIRA Gateway, set the following environment variables:
- `API_SERVER`: Your JIRA server instance.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue on GitHub. Make sure to follow the code style and include tests for any new features.

## License
This project is licensed under the MIT License.
