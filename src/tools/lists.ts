import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerListTools(server: McpServer): void {
  // list_lists
  server.tool(
    'list_lists',
    'List all email lists in ActiveCampaign',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('lists', {
        limit: params.limit,
        offset: params.offset,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_list
  server.tool(
    'get_list',
    'Get a single email list by ID in ActiveCampaign',
    {
      list_id: z.string().describe('The list ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`lists/${params.list_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_list
  server.tool(
    'create_list',
    'Create a new email list in ActiveCampaign',
    {
      name: z.string().describe('List name'),
      stringid: z.string().optional().describe('URL-safe list identifier (auto-generated if not provided)'),
      sender_url: z.string().url().optional().describe('Sender website URL'),
      sender_reminder: z.string().optional().describe('Why subscribers are receiving emails'),
    },
    async (params) => {
      const client = getClient();
      const list: Record<string, unknown> = {
        name: params.name,
        stringid: params.stringid ?? params.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        sender_url: params.sender_url ?? '',
        sender_reminder: params.sender_reminder ?? '',
      };
      const data = await client.post('lists', { list });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // update_list
  server.tool(
    'update_list',
    'Update an existing email list in ActiveCampaign',
    {
      list_id: z.string().describe('The list ID to update'),
      name: z.string().optional().describe('New list name'),
      sender_url: z.string().url().optional().describe('New sender website URL'),
      sender_reminder: z.string().optional().describe('Updated reminder text'),
    },
    async (params) => {
      const client = getClient();
      const list: Record<string, unknown> = {};
      if (params.name) list['name'] = params.name;
      if (params.sender_url) list['sender_url'] = params.sender_url;
      if (params.sender_reminder) list['sender_reminder'] = params.sender_reminder;

      const data = await client.put(`lists/${params.list_id}`, { list });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // delete_list
  server.tool(
    'delete_list',
    'Delete an email list from ActiveCampaign',
    {
      list_id: z.string().describe('The list ID to delete'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`lists/${params.list_id}`);
      return {
        content: [{ type: 'text', text: `List ${params.list_id} deleted successfully.` }],
        structuredContent: { success: true, list_id: params.list_id },
      };
    }
  );

  // subscribe_contact
  server.tool(
    'subscribe_contact',
    'Subscribe a contact to an email list in ActiveCampaign',
    {
      contact_id: z.string().describe('The contact ID to subscribe'),
      list_id: z.string().describe('The list ID to subscribe the contact to'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.post('contactLists', {
        contactList: {
          list: params.list_id,
          contact: params.contact_id,
          status: 1,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // unsubscribe_contact
  server.tool(
    'unsubscribe_contact',
    'Unsubscribe a contact from an email list in ActiveCampaign',
    {
      contact_id: z.string().describe('The contact ID to unsubscribe'),
      list_id: z.string().describe('The list ID to unsubscribe the contact from'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.post('contactLists', {
        contactList: {
          list: params.list_id,
          contact: params.contact_id,
          status: 2,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );
}
