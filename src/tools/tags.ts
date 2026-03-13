import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerTagTools(server: McpServer): void {
  // list_tags
  server.tool(
    'list_tags',
    'List all tags in ActiveCampaign',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
      search: z.string().optional().describe('Search tags by name'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('tags', {
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

  // get_tag
  server.tool(
    'get_tag',
    'Get a single tag by ID in ActiveCampaign',
    {
      tag_id: z.string().describe('The tag ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`tags/${params.tag_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_tag
  server.tool(
    'create_tag',
    'Create a new tag in ActiveCampaign',
    {
      tag: z.string().describe('Tag name'),
      tagType: z.enum(['contact', 'template']).optional().default('contact').describe('Tag type'),
      description: z.string().optional().describe('Tag description'),
    },
    async (params) => {
      const client = getClient();
      const tagData: Record<string, unknown> = {
        tag: params.tag,
        tagType: params.tagType,
      };
      if (params.description) tagData['description'] = params.description;

      const data = await client.post('tags', { tag: tagData });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // delete_tag
  server.tool(
    'delete_tag',
    'Delete a tag from ActiveCampaign',
    {
      tag_id: z.string().describe('The tag ID to delete'),
    },
    async (params) => {
      const client = getClient();
      await client.delete(`tags/${params.tag_id}`);
      return {
        content: [{ type: 'text', text: `Tag ${params.tag_id} deleted successfully.` }],
        structuredContent: { success: true, tag_id: params.tag_id },
      };
    }
  );
}
