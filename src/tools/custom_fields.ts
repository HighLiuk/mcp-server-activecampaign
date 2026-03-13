import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerCustomFieldTools(server: McpServer): void {
  // list_fields
  server.tool(
    'list_fields',
    'List all custom contact fields in ActiveCampaign',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('fields', {
        limit: params.limit,
        offset: params.offset,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_field
  server.tool(
    'get_field',
    'Get a single custom field by ID in ActiveCampaign',
    {
      field_id: z.string().describe('The custom field ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`fields/${params.field_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_field
  server.tool(
    'create_field',
    'Create a new custom contact field in ActiveCampaign',
    {
      title: z.string().describe('Field label/title'),
      type: z.enum(['text', 'textarea', 'date', 'datetime', 'dropdown', 'radio', 'checkbox', 'hidden', 'listbox', 'currency']).describe('Field input type'),
      description: z.string().optional().describe('Field description'),
      isrequired: z.number().optional().default(0).describe('Is field required: 0=no, 1=yes'),
      perstag: z.string().optional().describe('Personalization tag for this field'),
      defval: z.string().optional().describe('Default value'),
    },
    async (params) => {
      const client = getClient();
      const field: Record<string, unknown> = {
        title: params.title,
        type: params.type,
        isrequired: params.isrequired ?? 0,
      };
      if (params.description) field['description'] = params.description;
      if (params.perstag) field['perstag'] = params.perstag;
      if (params.defval) field['defval'] = params.defval;

      const data = await client.post('fields', { field });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // update_field
  server.tool(
    'update_field',
    'Update an existing custom field in ActiveCampaign',
    {
      field_id: z.string().describe('The custom field ID to update'),
      title: z.string().optional().describe('New field title'),
      description: z.string().optional().describe('New field description'),
      isrequired: z.number().optional().describe('Is field required: 0=no, 1=yes'),
      defval: z.string().optional().describe('New default value'),
    },
    async (params) => {
      const client = getClient();
      const field: Record<string, unknown> = {};
      if (params.title) field['title'] = params.title;
      if (params.description) field['description'] = params.description;
      if (params.isrequired !== undefined) field['isrequired'] = params.isrequired;
      if (params.defval) field['defval'] = params.defval;

      const data = await client.put(`fields/${params.field_id}`, { field });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // delete_field
  server.tool(
    'delete_field',
    'Delete a custom field from ActiveCampaign',
    {
      field_id: z.string().describe('The custom field ID to delete'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`fields/${params.field_id}`);
      return {
        content: [{ type: 'text', text: `Field ${params.field_id} deleted successfully.` }],
        structuredContent: { success: true, field_id: params.field_id },
      };
    }
  );

  // list_field_values
  server.tool(
    'list_field_values',
    'List all custom field values for a specific contact',
    {
      contact_id: z.string().describe('The contact ID to get field values for'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`contacts/${params.contact_id}/fieldValues`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_field_value
  server.tool(
    'create_field_value',
    'Set or update a custom field value for a contact in ActiveCampaign',
    {
      contact_id: z.string().describe('The contact ID'),
      field_id: z.string().describe('The custom field ID'),
      value: z.string().describe('The value to set for this field'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.post('fieldValues', {
        fieldValue: {
          contact: params.contact_id,
          field: params.field_id,
          value: params.value,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );
}
