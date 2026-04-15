import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerAccountCustomFieldTools(server: McpServer): void {
  // ── Account Custom Field Meta (field definitions) ──

  // list_account_custom_fields
  server.tool(
    'list_account_custom_fields',
    'List all custom account field definitions in ActiveCampaign',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('accountCustomFieldMeta', {
        limit: params.limit,
        offset: params.offset,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_account_custom_field
  server.tool(
    'get_account_custom_field',
    'Get a single custom account field definition by ID',
    {
      field_id: z.string().describe('The custom account field ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`accountCustomFieldMeta/${params.field_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_account_custom_field
  server.tool(
    'create_account_custom_field',
    'Create a new custom account field definition in ActiveCampaign',
    {
      fieldLabel: z.string().describe('Human-readable field label'),
      fieldType: z.enum(['text', 'textarea', 'date', 'datetime', 'dropdown', 'radio', 'checkbox', 'hidden', 'listbox', 'currency']).describe('Field input type'),
      fieldDescription: z.string().optional().describe('Field description'),
      isRequired: z.number().optional().default(0).describe('Is field required: 0=no, 1=yes'),
      fieldDefault: z.string().optional().describe('Default value'),
      fieldOptions: z.array(z.string()).optional().describe('Options for dropdown/radio/listbox fields'),
    },
    async (params) => {
      const client = getClient();
      const field: Record<string, unknown> = {
        fieldLabel: params.fieldLabel,
        fieldType: params.fieldType,
        isRequired: params.isRequired ?? 0,
      };
      if (params.fieldDescription) field['fieldDescription'] = params.fieldDescription;
      if (params.fieldDefault) field['fieldDefault'] = params.fieldDefault;
      if (params.fieldOptions) field['fieldOptions'] = params.fieldOptions;

      const data = await client.post('accountCustomFieldMeta', { accountCustomFieldMetum: field });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // update_account_custom_field
  server.tool(
    'update_account_custom_field',
    'Update an existing custom account field definition',
    {
      field_id: z.string().describe('The custom account field ID to update'),
      fieldLabel: z.string().optional().describe('New field label'),
      fieldDescription: z.string().optional().describe('New field description'),
      isRequired: z.number().optional().describe('Is field required: 0=no, 1=yes'),
      fieldDefault: z.string().optional().describe('New default value'),
    },
    async (params) => {
      const client = getClient();
      const field: Record<string, unknown> = {};
      if (params.fieldLabel) field['fieldLabel'] = params.fieldLabel;
      if (params.fieldDescription) field['fieldDescription'] = params.fieldDescription;
      if (params.isRequired !== undefined) field['isRequired'] = params.isRequired;
      if (params.fieldDefault) field['fieldDefault'] = params.fieldDefault;

      const data = await client.put(`accountCustomFieldMeta/${params.field_id}`, { accountCustomFieldMetum: field });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // delete_account_custom_field
  server.tool(
    'delete_account_custom_field',
    'Delete a custom account field definition from ActiveCampaign',
    {
      field_id: z.string().describe('The custom account field ID to delete'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`accountCustomFieldMeta/${params.field_id}`);
      return {
        content: [{ type: 'text', text: `Account custom field ${params.field_id} deleted successfully.` }],
        structuredContent: { success: true, field_id: params.field_id },
      };
    }
  );

  // ── Account Custom Field Data (actual values) ──

  // list_account_custom_field_values
  server.tool(
    'list_account_custom_field_values',
    'List all custom field values, optionally filtered by account ID',
    {
      limit: z.number().min(1).max(100).optional().default(100).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
      account_id: z.string().optional().describe('Filter by account ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const query: Record<string, string | number | boolean | undefined> = {
        limit: params.limit,
        offset: params.offset,
      };
      if (params.account_id) {
        query['filters[customerAccountId]'] = params.account_id;
      }
      const data = await client.get('accountCustomFieldData', query);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_account_custom_field_value
  server.tool(
    'get_account_custom_field_value',
    'Get a single custom account field value by ID',
    {
      field_value_id: z.string().describe('The custom account field value ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`accountCustomFieldData/${params.field_value_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_account_custom_field_value
  server.tool(
    'create_account_custom_field_value',
    'Set a custom field value on a CRM account',
    {
      account_id: z.string().describe('The account ID'),
      custom_field_id: z.string().describe('The custom account field ID'),
      field_value: z.string().describe('The value to set'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.post('accountCustomFieldData', {
        accountCustomFieldDatum: {
          customerAccountId: params.account_id,
          customFieldId: params.custom_field_id,
          fieldValue: params.field_value,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // update_account_custom_field_value
  server.tool(
    'update_account_custom_field_value',
    'Update an existing custom field value on a CRM account',
    {
      field_value_id: z.string().describe('The custom account field value ID to update'),
      field_value: z.string().describe('The new value'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.put(`accountCustomFieldData/${params.field_value_id}`, {
        accountCustomFieldDatum: {
          fieldValue: params.field_value,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // delete_account_custom_field_value
  server.tool(
    'delete_account_custom_field_value',
    'Delete a custom field value from a CRM account',
    {
      field_value_id: z.string().describe('The custom account field value ID to delete'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`accountCustomFieldData/${params.field_value_id}`);
      return {
        content: [{ type: 'text', text: `Account custom field value ${params.field_value_id} deleted successfully.` }],
        structuredContent: { success: true, field_value_id: params.field_value_id },
      };
    }
  );

  // bulk_create_account_custom_field_values
  server.tool(
    'bulk_create_account_custom_field_values',
    'Bulk create custom field values on CRM accounts',
    {
      values: z.array(z.object({
        customerAccountId: z.string().describe('The account ID'),
        customFieldId: z.string().describe('The custom field ID'),
        fieldValue: z.string().describe('The value to set'),
      })).describe('Array of field values to create'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.post('accountCustomFieldData/bulkCreate', params.values);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // bulk_update_account_custom_field_values
  server.tool(
    'bulk_update_account_custom_field_values',
    'Bulk update existing custom field values on CRM accounts',
    {
      values: z.array(z.object({
        id: z.string().describe('The field value ID to update'),
        fieldValue: z.string().describe('The new value'),
      })).describe('Array of field values to update'),
    },
    async (params) => {
      const client = getClient();
      const data = await client.patch('accountCustomFieldData/bulkUpdate', params.values);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );
}
