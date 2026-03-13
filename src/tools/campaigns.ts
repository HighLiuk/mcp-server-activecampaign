import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerCampaignTools(server: McpServer): void {
  // list_campaigns
  server.tool(
    'list_campaigns',
    'List all campaigns in ActiveCampaign',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
      status: z.number().optional().describe('Filter by status: 0=draft, 1=scheduled, 2=sending, 3=sent, 5=disabled'),
      search: z.string().optional().describe('Search query'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('campaigns', {
        limit: params.limit,
        offset: params.offset,
        status: params.status,
        search: params.search,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_campaign
  server.tool(
    'get_campaign',
    'Get a single campaign by ID in ActiveCampaign',
    {
      campaign_id: z.string().describe('The campaign ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`campaigns/${params.campaign_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_campaign
  server.tool(
    'create_campaign',
    'Create a new email campaign in ActiveCampaign',
    {
      name: z.string().describe('Campaign name'),
      type: z.enum(['single', 'recurring', 'split', 'responder', 'reminder', 'activerss', 'text', 'sms']).optional().default('single').describe('Campaign type'),
      subject: z.string().describe('Email subject line'),
      fromname: z.string().describe('Sender display name'),
      fromemail: z.string().email().describe('Sender email address'),
      replyto: z.string().email().optional().describe('Reply-to email address'),
      lists: z.array(z.string()).min(1).describe('Array of list IDs to send to'),
      message: z.string().optional().describe('Message ID (HTML template)'),
      segmentid: z.string().optional().describe('Segment ID to target within lists'),
    },
    async (params) => {
      const client = getClient();
      const campaign: Record<string, unknown> = {
        name: params.name,
        type: params.type,
        subject: params.subject,
        fromname: params.fromname,
        fromemail: params.fromemail,
        replyto: params.replyto ?? params.fromemail,
      };
      if (params.message) campaign['message'] = params.message;
      if (params.segmentid) campaign['segmentid'] = params.segmentid;

      // Build lists array
      campaign['lists'] = params.lists.map((id) => ({ id }));

      const data = await client.post('campaigns', { campaign });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // send_campaign
  server.tool(
    'send_campaign',
    'Send or schedule a campaign in ActiveCampaign',
    {
      campaign_id: z.string().describe('The campaign ID to send'),
      scheduled_date: z.string().optional().describe('ISO 8601 scheduled send time; if omitted, sends immediately'),
    },
    async (params) => {
      const client = getClient();
      const sendTime = params.scheduled_date ?? new Date(Date.now() + 60000).toISOString().slice(0, 19).replace('T', ' ');
      const data = await client.put(`campaigns/${params.campaign_id}`, {
        campaign: {
          status: 1, // scheduled
          sdate: sendTime,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // list_campaign_links
  server.tool(
    'list_campaign_links',
    'Get all tracked links in a campaign',
    {
      campaign_id: z.string().describe('The campaign ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`campaigns/${params.campaign_id}/links`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );
}
