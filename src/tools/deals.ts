import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerDealTools(server: McpServer): void {
  // list_deals
  server.tool(
    'list_deals',
    'List all deals in ActiveCampaign CRM with pagination',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
      search: z.string().optional().describe('Search query'),
      stage: z.string().optional().describe('Filter by stage ID'),
      group: z.string().optional().describe('Filter by pipeline/group ID'),
      status: z.number().optional().describe('Filter by status: 0=open, 1=won, 2=lost'),
      orderby: z.string().optional().describe('Sort field'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('deals', {
        limit: params.limit,
        offset: params.offset,
        search: params.search,
        stage: params.stage,
        group: params.group,
        status: params.status,
        orderby: params.orderby,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_deal
  server.tool(
    'get_deal',
    'Get a single deal by ID from ActiveCampaign CRM',
    {
      deal_id: z.string().describe('The deal ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`deals/${params.deal_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_deal
  server.tool(
    'create_deal',
    'Create a new deal in ActiveCampaign CRM',
    {
      title: z.string().describe('Deal title'),
      value: z.number().optional().describe('Deal value in cents (e.g. 10000 = $100.00)'),
      currency: z.string().optional().default('USD').describe('Currency code, e.g. "usd"'),
      stage: z.string().optional().describe('Stage ID for the deal'),
      group: z.string().optional().describe('Pipeline/group ID'),
      owner: z.string().optional().describe('Owner user ID'),
      contact: z.string().optional().describe('Primary contact ID'),
      status: z.number().optional().default(0).describe('Status: 0=open, 1=won, 2=lost'),
      description: z.string().optional().describe('Deal description'),
    },
    async (params) => {
      const client = getClient();
      const deal: Record<string, unknown> = {
        title: params.title,
        currency: params.currency ?? 'usd',
        status: params.status ?? 0,
      };
      if (params.value !== undefined) deal['value'] = params.value;
      if (params.stage) deal['stage'] = params.stage;
      if (params.group) deal['group'] = params.group;
      if (params.owner) deal['owner'] = params.owner;
      if (params.contact) deal['contact'] = params.contact;
      if (params.description) deal['description'] = params.description;

      const data = await client.post('deals', { deal });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // update_deal
  server.tool(
    'update_deal',
    'Update an existing deal in ActiveCampaign CRM',
    {
      deal_id: z.string().describe('The deal ID to update'),
      title: z.string().optional().describe('New deal title'),
      value: z.number().optional().describe('New deal value in cents'),
      currency: z.string().optional().describe('New currency code'),
      stage: z.string().optional().describe('New stage ID'),
      group: z.string().optional().describe('New pipeline/group ID'),
      owner: z.string().optional().describe('New owner user ID'),
      status: z.number().optional().describe('New status: 0=open, 1=won, 2=lost'),
      description: z.string().optional().describe('New description'),
    },
    async (params) => {
      const client = getClient();
      const deal: Record<string, unknown> = {};
      if (params.title) deal['title'] = params.title;
      if (params.value !== undefined) deal['value'] = params.value;
      if (params.currency) deal['currency'] = params.currency;
      if (params.stage) deal['stage'] = params.stage;
      if (params.group) deal['group'] = params.group;
      if (params.owner) deal['owner'] = params.owner;
      if (params.status !== undefined) deal['status'] = params.status;
      if (params.description) deal['description'] = params.description;

      const data = await client.put(`deals/${params.deal_id}`, { deal });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // delete_deal
  server.tool(
    'delete_deal',
    'Delete a deal from ActiveCampaign CRM',
    {
      deal_id: z.string().describe('The deal ID to delete'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`deals/${params.deal_id}`);
      return {
        content: [{ type: 'text', text: `Deal ${params.deal_id} deleted successfully.` }],
        structuredContent: { success: true, deal_id: params.deal_id },
      };
    }
  );

  // move_deal_stage
  server.tool(
    'move_deal_stage',
    'Move a deal to a different pipeline stage',
    {
      deal_id: z.string().describe('The deal ID to move'),
      stage_id: z.string().describe('The target stage ID'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.put(`deals/${params.deal_id}`, {
        deal: { stage: params.stage_id },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // list_deal_stages
  server.tool(
    'list_deal_stages',
    'List all deal stages (pipeline stages) in ActiveCampaign',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
      order: z.string().optional().describe('Order field, e.g. "title"'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('dealStages', {
        limit: params.limit,
        offset: params.offset,
        order: params.order,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_deal_note
  server.tool(
    'create_deal_note',
    'Add a note to a deal in ActiveCampaign',
    {
      deal_id: z.string().describe('The deal ID to add the note to'),
      note: z.string().describe('The note text content'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.post(`deals/${params.deal_id}/notes`, {
        note: { note: params.note },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // add_deal_contact
  server.tool(
    'add_deal_contact',
    'Associate a contact with a deal in ActiveCampaign',
    {
      deal_id: z.string().describe('The deal ID'),
      contact_id: z.string().describe('The contact ID to associate with the deal'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.post(`deals/${params.deal_id}/dealContacts`, {
        dealContact: {
          deal: params.deal_id,
          contact: params.contact_id,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );
}
