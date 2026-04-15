import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerContactTools } from './contacts.js';
import { registerDealTools } from './deals.js';
import { registerListTools } from './lists.js';
import { registerCampaignTools } from './campaigns.js';
import { registerAutomationTools } from './automations.js';
import { registerTagTools } from './tags.js';
import { registerCustomFieldTools } from './custom_fields.js';
import { registerAccountTools } from './accounts.js';
import { registerFormTools } from './forms.js';
import { registerMessageTools } from './messages.js';
import { registerAccountCustomFieldTools } from './account_custom_fields.js';

export function registerAllTools(server: McpServer): void {
  registerContactTools(server);              // 10 tools
  registerDealTools(server);                 // 9 tools
  registerListTools(server);                 // 7 tools
  registerCampaignTools(server);             // 5 tools
  registerAutomationTools(server);           // 4 tools
  registerTagTools(server);                  // 4 tools
  registerCustomFieldTools(server);          // 7 tools
  registerAccountTools(server);              // 6 tools
  registerFormTools(server);                 // 2 tools
  registerMessageTools(server);              // 4 tools
  registerAccountCustomFieldTools(server);   // 12 tools
  // Total: 70 tools
}
