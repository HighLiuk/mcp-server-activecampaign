import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerAccountTools(server: McpServer): void {
  // list_accounts
  server.tool(
    'list_accounts',
    'List all CRM accounts in ActiveCampaign. Supports an undocumented but functional fieldFilters parameter to filter accounts by custom field values server-side.',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
      search: z.string().optional().describe('Search accounts by name or domain'),
      orderby: z.string().optional().describe('Sort field, e.g. "name"'),
      fieldFilters: z.array(z.object({
        conds: z.array(z.object({
          id: z.union([z.number(), z.string()]).describe('Custom field ID (number) or built-in field name (e.g. "account_url")'),
          cond: z.enum(['contains', 'is-empty', 'is-not-empty']).describe('Filter condition'),
          value: z.string().optional().describe('Value to match (required for "contains")'),
        })).describe('Array of conditions (AND logic within a group)'),
      })).optional().describe('Filter accounts by custom field values (undocumented API feature used by the AC frontend). Each object is a condition group; conditions within a group use AND logic.'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const query: Record<string, string | number | boolean | undefined> = {
        limit: params.limit,
        offset: params.offset,
        search: params.search,
        orderby: params.orderby,
      };
      if (params.fieldFilters) {
        query['fieldFilters'] = JSON.stringify(params.fieldFilters);
      }
      const data = await client.get('accounts', query);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_account
  server.tool(
    'get_account',
    'Get a single CRM account by ID in ActiveCampaign',
    {
      account_id: z.string().describe('The account ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`accounts/${params.account_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_account
  server.tool(
    'create_account',
    'Create a new CRM account in ActiveCampaign',
    {
      name: z.string().describe('Account name'),
      accountUrl: z.string().optional().describe('Account website URL'),
      phone: z.string().optional().describe('Account phone number'),
      description: z.string().optional().describe('Account description'),
      fields: z.array(z.object({
        customFieldId: z.number().describe('Custom field ID'),
        fieldValue: z.string().describe('Field value'),
      })).optional().describe('Custom field values'),
    },
    async (params) => {
      const client = getClient();
      const account: Record<string, unknown> = { name: params.name };
      if (params.accountUrl) account['accountUrl'] = params.accountUrl;
      if (params.phone) account['phone'] = params.phone;
      if (params.description) account['description'] = params.description;
      if (params.fields) account['fields'] = params.fields;

      const data = await client.post('accounts', { account });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // update_account
  server.tool(
    'update_account',
    'Update an existing CRM account in ActiveCampaign',
    {
      account_id: z.string().describe('The account ID to update'),
      name: z.string().optional().describe('New account name'),
      accountUrl: z.string().optional().describe('New website URL'),
      phone: z.string().optional().describe('New phone number'),
      description: z.string().optional().describe('New description'),
    },
    async (params) => {
      const client = getClient();
      const account: Record<string, unknown> = {};
      if (params.name) account['name'] = params.name;
      if (params.accountUrl) account['accountUrl'] = params.accountUrl;
      if (params.phone) account['phone'] = params.phone;
      if (params.description) account['description'] = params.description;

      const data = await client.put(`accounts/${params.account_id}`, { account });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // delete_account
  server.tool(
    'delete_account',
    'Delete a CRM account from ActiveCampaign',
    {
      account_id: z.string().describe('The account ID to delete'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`accounts/${params.account_id}`);
      return {
        content: [{ type: 'text', text: `Account ${params.account_id} deleted successfully.` }],
        structuredContent: { success: true, account_id: params.account_id },
      };
    }
  );

  // add_contact_to_account
  server.tool(
    'add_contact_to_account',
    'Associate a contact with a CRM account in ActiveCampaign',
    {
      contact_id: z.string().describe('The contact ID'),
      account_id: z.string().describe('The account ID to associate the contact with'),
      jobTitle: z.string().optional().describe("Contact's job title at this account"),
    },
    async (params) => {
      const client = getClient();
      const accountContact: Record<string, unknown> = {
        contact: params.contact_id,
        account: params.account_id,
      };
      if (params.jobTitle) accountContact['jobTitle'] = params.jobTitle;

      const data = await client.post('accountContacts', { accountContact });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );
}
