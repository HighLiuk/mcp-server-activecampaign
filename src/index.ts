#!/usr/bin/env node
/**
 * ActiveCampaign MCP Server
 *
 * Production-quality MCP server for the ActiveCampaign API v3.
 * Provides 58 tools for CRM and email automation.
 *
 * Docs: https://developers.activecampaign.com/reference/overview
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAllTools } from './tools/index.js';

async function main(): Promise<void> {
  // Validate required environment variables
  if (!process.env['AC_API_URL']) {
    console.error('Error: AC_API_URL environment variable is required');
    console.error('Example: https://youraccountname.api-us1.com/api/3');
    process.exit(1);
  }
  if (!process.env['AC_API_KEY']) {
    console.error('Error: AC_API_KEY environment variable is required');
    console.error('Get your API key from: Settings → Developer → API Access');
    process.exit(1);
  }

  const server = new McpServer({
    name: 'mcp-server-activecampaign',
    version: '1.0.0',
  });

  // Register all 58 tools across 10 categories
  registerAllTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('ActiveCampaign MCP Server running on stdio');
  console.error('Tools: contacts(10), deals(9), lists(7), campaigns(5), automations(4), tags(4), custom_fields(7), accounts(6), forms(2), messages(4) = 58 total');
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
