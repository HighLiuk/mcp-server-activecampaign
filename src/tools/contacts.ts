import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerContactTools(server: McpServer): void {
  // list_contacts
  server.tool(
    'list_contacts',
    'List all contacts in ActiveCampaign with pagination support',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Number of contacts per page'),
      offset: z.number().min(0).optional().default(0).describe('Offset for pagination'),
      email: z.string().optional().describe('Filter by email address'),
      search: z.string().optional().describe('Search contacts by name, org, phone or email'),
      status: z.number().optional().describe('Filter by status: 1=subscribed, 2=unsubscribed, -1=any'),
      orderby: z.string().optional().describe('Field to order by, e.g. "cdate"'),
      orders_direction: z.enum(['ASC', 'DESC']).optional().describe('Sort direction'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('contacts', {
        limit: params.limit,
        offset: params.offset,
        email: params.email,
        search: params.search,
        status: params.status,
        orderby: params.orderby,
        'orders[direction]': params.orders_direction,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_contact
  server.tool(
    'get_contact',
    'Get a single ActiveCampaign contact by ID',
    {
      contact_id: z.string().describe('The ActiveCampaign contact ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`contacts/${params.contact_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_contact
  server.tool(
    'create_contact',
    'Create a new contact in ActiveCampaign',
    {
      email: z.string().email().describe('Contact email address'),
      firstName: z.string().optional().describe('Contact first name'),
      lastName: z.string().optional().describe('Contact last name'),
      phone: z.string().optional().describe('Contact phone number'),
      orgname: z.string().optional().describe('Contact organization name'),
      fieldValues: z.array(z.object({
        field: z.string().describe('Field ID'),
        value: z.string().describe('Field value'),
      })).optional().describe('Custom field values'),
    },
    async (params) => {
      const client = getClient();
      const contact: Record<string, unknown> = { email: params.email };
      if (params.firstName) contact['firstName'] = params.firstName;
      if (params.lastName) contact['lastName'] = params.lastName;
      if (params.phone) contact['phone'] = params.phone;
      if (params.orgname) contact['orgname'] = params.orgname;
      if (params.fieldValues) contact['fieldValues'] = params.fieldValues;

      const data = await client.post('contacts', { contact });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // update_contact
  server.tool(
    'update_contact',
    'Update an existing ActiveCampaign contact',
    {
      contact_id: z.string().describe('The contact ID to update'),
      email: z.string().email().optional().describe('New email address'),
      firstName: z.string().optional().describe('New first name'),
      lastName: z.string().optional().describe('New last name'),
      phone: z.string().optional().describe('New phone number'),
      orgname: z.string().optional().describe('New organization name'),
      fieldValues: z.array(z.object({
        field: z.string().describe('Field ID'),
        value: z.string().describe('Field value'),
      })).optional().describe('Custom field values to update'),
    },
    async (params) => {
      const client = getClient();
      const contact: Record<string, unknown> = {};
      if (params.email) contact['email'] = params.email;
      if (params.firstName) contact['firstName'] = params.firstName;
      if (params.lastName) contact['lastName'] = params.lastName;
      if (params.phone) contact['phone'] = params.phone;
      if (params.orgname) contact['orgname'] = params.orgname;
      if (params.fieldValues) contact['fieldValues'] = params.fieldValues;

      const data = await client.put(`contacts/${params.contact_id}`, { contact });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // delete_contact
  server.tool(
    'delete_contact',
    'Delete a contact from ActiveCampaign',
    {
      contact_id: z.string().describe('The contact ID to delete'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`contacts/${params.contact_id}`);
      return {
        content: [{ type: 'text', text: `Contact ${params.contact_id} deleted successfully.` }],
        structuredContent: { success: true, contact_id: params.contact_id },
      };
    }
  );

  // search_contacts
  server.tool(
    'search_contacts',
    'Search for contacts in ActiveCampaign',
    {
      search: z.string().describe('Search query (name, email, phone, or organization)'),
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Offset for pagination'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('contacts', {
        search: params.search,
        limit: params.limit,
        offset: params.offset,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // add_tag_to_contact
  server.tool(
    'add_tag_to_contact',
    'Add a tag to a contact in ActiveCampaign',
    {
      contact_id: z.string().describe('The contact ID'),
      tag_id: z.string().describe('The tag ID to add'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.post('contactTags', {
        contactTag: {
          contact: params.contact_id,
          tag: params.tag_id,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // remove_tag_from_contact
  server.tool(
    'remove_tag_from_contact',
    'Remove a tag from a contact in ActiveCampaign',
    {
      contact_tag_id: z.string().describe('The contactTag association ID (not the tag ID — get from contact tags list)'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`contactTags/${params.contact_tag_id}`);
      return {
        content: [{ type: 'text', text: `Tag association ${params.contact_tag_id} removed.` }],
        structuredContent: { success: true, contact_tag_id: params.contact_tag_id },
      };
    }
  );

  // get_contact_deals
  server.tool(
    'get_contact_deals',
    'Get all deals associated with a contact',
    {
      contact_id: z.string().describe('The contact ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`contacts/${params.contact_id}/deals`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_contact_automations
  server.tool(
    'get_contact_automations',
    'Get all automations a contact is enrolled in',
    {
      contact_id: z.string().describe('The contact ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`contacts/${params.contact_id}/contactAutomations`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );
}
