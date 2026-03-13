import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerAutomationTools(server: McpServer): void {
  // list_automations
  server.tool(
    'list_automations',
    'List all automations in ActiveCampaign',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
      search: z.string().optional().describe('Search automations by name'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('automations', {
        limit: params.limit,
        offset: params.offset,
        search: params.search,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_automation
  server.tool(
    'get_automation',
    'Get a single automation by ID in ActiveCampaign',
    {
      automation_id: z.string().describe('The automation ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`automations/${params.automation_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // add_contact_to_automation
  server.tool(
    'add_contact_to_automation',
    'Enroll a contact in an ActiveCampaign automation',
    {
      contact_id: z.string().describe('The contact ID to enroll'),
      automation_id: z.string().describe('The automation ID to enroll the contact in'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.post('contactAutomations', {
        contactAutomation: {
          contact: params.contact_id,
          automation: params.automation_id,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // remove_contact_from_automation
  server.tool(
    'remove_contact_from_automation',
    'Remove a contact from an ActiveCampaign automation',
    {
      contact_automation_id: z.string().describe('The contactAutomation ID (not the automation ID — get from get_contact_automations)'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`contactAutomations/${params.contact_automation_id}`);
      return {
        content: [{ type: 'text', text: `Contact removed from automation (contactAutomation: ${params.contact_automation_id}).` }],
        structuredContent: { success: true, contact_automation_id: params.contact_automation_id },
      };
    }
  );
}
