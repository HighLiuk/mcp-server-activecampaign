import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getClient } from '../client.js';

export function registerMessageTools(server: McpServer): void {
  // list_messages
  server.tool(
    'list_messages',
    'List all email messages (templates) in ActiveCampaign',
    {
      limit: z.number().min(1).max(100).optional().default(20).describe('Results per page'),
      offset: z.number().min(0).optional().default(0).describe('Pagination offset'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get('messages', {
        limit: params.limit,
        offset: params.offset,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // get_message
  server.tool(
    'get_message',
    'Get a single email message (template) by ID in ActiveCampaign',
    {
      message_id: z.string().describe('The message ID'),
    },
    { readOnlyHint: true },
    async (params) => {
      const client = getClient();
      const data = await client.get(`messages/${params.message_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // create_message
  server.tool(
    'create_message',
    'Create a new email message (template) in ActiveCampaign',
    {
      name: z.string().describe('Message name'),
      subject: z.string().describe('Email subject line'),
      fromname: z.string().describe('Sender display name'),
      fromemail: z.string().email().describe('Sender email address'),
      replyto: z.string().email().optional().describe('Reply-to email address'),
      html: z.string().describe('HTML email body content'),
      text: z.string().optional().describe('Plain text version of the email'),
      charset: z.string().optional().default('utf-8').describe('Character set'),
    },
    async (params) => {
      const client = getClient();
      const message: Record<string, unknown> = {
        name: params.name,
        subject: params.subject,
        fromname: params.fromname,
        fromemail: params.fromemail,
        replyto: params.replyto ?? params.fromemail,
        html: params.html,
        text: params.text ?? '',
        charset: params.charset ?? 'utf-8',
      };
      const data = await client.post('messages', { message });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );

  // update_message
  server.tool(
    'update_message',
    'Update an existing email message (template) in ActiveCampaign',
    {
      message_id: z.string().describe('The message ID to update'),
      name: z.string().optional().describe('New message name'),
      subject: z.string().optional().describe('New subject line'),
      fromname: z.string().optional().describe('New sender display name'),
      fromemail: z.string().email().optional().describe('New sender email address'),
      replyto: z.string().email().optional().describe('New reply-to email address'),
      html: z.string().optional().describe('New HTML email content'),
      text: z.string().optional().describe('New plain text content'),
    },
    async (params) => {
      const client = getClient();
      const message: Record<string, unknown> = {};
      if (params.name) message['name'] = params.name;
      if (params.subject) message['subject'] = params.subject;
      if (params.fromname) message['fromname'] = params.fromname;
      if (params.fromemail) message['fromemail'] = params.fromemail;
      if (params.replyto) message['replyto'] = params.replyto;
      if (params.html) message['html'] = params.html;
      if (params.text) message['text'] = params.text;

      const data = await client.put(`messages/${params.message_id}`, { message });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: data as Record<string, unknown>,
      };
    }
  );
}
