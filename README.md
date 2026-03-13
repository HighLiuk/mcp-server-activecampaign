# mcp-server-activecampaign

> **Production-quality MCP server for the ActiveCampaign API v3** — 58 tools for CRM and email automation.

ActiveCampaign is the leading CRM + email marketing automation platform used by 180K+ businesses. This MCP server gives AI assistants full access to ActiveCampaign's capabilities via the [Model Context Protocol](https://modelcontextprotocol.io/).

---

## Features

- **58 tools** across 10 categories
- **Full TypeScript** with strict mode and Zod input validation
- **Pagination** on all list tools (offset/limit)
- **Structured output** (`structuredContent`) on every tool
- **Read-only hints** on all GET/list/search tools
- API version: v3

---

## Tools Reference

### Contacts (10 tools)
| Tool | Description |
|------|-------------|
| `list_contacts` | List contacts with pagination |
| `get_contact` | Get contact by ID |
| `create_contact` | Create a new contact |
| `update_contact` | Update an existing contact |
| `delete_contact` | Delete a contact |
| `search_contacts` | Search contacts |
| `add_tag_to_contact` | Add a tag to a contact |
| `remove_tag_from_contact` | Remove a tag from a contact |
| `get_contact_deals` | Get deals for a contact |
| `get_contact_automations` | Get automations for a contact |

### Deals (9 tools)
| Tool | Description |
|------|-------------|
| `list_deals` | List CRM deals with pagination |
| `get_deal` | Get deal by ID |
| `create_deal` | Create a new deal |
| `update_deal` | Update an existing deal |
| `delete_deal` | Delete a deal |
| `move_deal_stage` | Move a deal to a different stage |
| `list_deal_stages` | List all pipeline stages |
| `create_deal_note` | Add a note to a deal |
| `add_deal_contact` | Associate a contact with a deal |

### Lists (7 tools)
| Tool | Description |
|------|-------------|
| `list_lists` | List all email lists |
| `get_list` | Get list by ID |
| `create_list` | Create a new list |
| `update_list` | Update a list |
| `delete_list` | Delete a list |
| `subscribe_contact` | Subscribe contact to a list |
| `unsubscribe_contact` | Unsubscribe contact from a list |

### Campaigns (5 tools)
| Tool | Description |
|------|-------------|
| `list_campaigns` | List all campaigns |
| `get_campaign` | Get campaign by ID |
| `create_campaign` | Create a new campaign |
| `send_campaign` | Send or schedule a campaign |
| `list_campaign_links` | List tracked links in a campaign |

### Automations (4 tools)
| Tool | Description |
|------|-------------|
| `list_automations` | List all automations |
| `get_automation` | Get automation by ID |
| `add_contact_to_automation` | Enroll contact in automation |
| `remove_contact_from_automation` | Remove contact from automation |

### Tags (4 tools)
| Tool | Description |
|------|-------------|
| `list_tags` | List all tags |
| `get_tag` | Get tag by ID |
| `create_tag` | Create a new tag |
| `delete_tag` | Delete a tag |

### Custom Fields (7 tools)
| Tool | Description |
|------|-------------|
| `list_fields` | List all custom fields |
| `get_field` | Get custom field by ID |
| `create_field` | Create a new custom field |
| `update_field` | Update a custom field |
| `delete_field` | Delete a custom field |
| `list_field_values` | Get field values for a contact |
| `create_field_value` | Set a field value for a contact |

### Accounts (6 tools)
| Tool | Description |
|------|-------------|
| `list_accounts` | List CRM accounts |
| `get_account` | Get account by ID |
| `create_account` | Create a new account |
| `update_account` | Update an account |
| `delete_account` | Delete an account |
| `add_contact_to_account` | Associate contact with account |

### Forms (2 tools)
| Tool | Description |
|------|-------------|
| `list_forms` | List all forms |
| `get_form` | Get form by ID |

### Messages (4 tools)
| Tool | Description |
|------|-------------|
| `list_messages` | List email messages |
| `get_message` | Get message by ID |
| `create_message` | Create an email template |
| `update_message` | Update an email template |

---

## Setup

### 1. Get your ActiveCampaign API Credentials

1. Log into your [ActiveCampaign](https://www.activecampaign.com/) account
2. Go to **Settings → Developer → API Access**
3. Copy your **URL** (e.g. `https://yourname.api-us1.com`) and **API Key**

### 2. Install and Build

```bash
git clone https://github.com/BusyBee3333/activecampaign-mcp-2026-complete.git
cd activecampaign-mcp-2026-complete
npm install
npm run build
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env and set AC_API_URL and AC_API_KEY
```

### 4. Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "activecampaign": {
      "command": "node",
      "args": ["/path/to/activecampaign-mcp-2026-complete/dist/index.js"],
      "env": {
        "AC_API_URL": "https://youraccountname.api-us1.com/api/3",
        "AC_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 5. Add to Cursor / other MCP clients

```json
{
  "mcp": {
    "servers": {
      "activecampaign": {
        "command": "node",
        "args": ["/path/to/activecampaign-mcp-2026-complete/dist/index.js"],
        "env": {
          "AC_API_URL": "https://youraccountname.api-us1.com/api/3",
          "AC_API_KEY": "your_api_key_here"
        }
      }
    }
  }
}
```

---

## Usage Examples

Once connected to your MCP client:

```
"List all my contacts tagged as 'VIP'"
"Create a new deal worth $5,000 in the Closing stage"
"Search for contacts at Acme Corp"
"Subscribe contact 123 to my Newsletter list"
"Add contact 456 to the Welcome automation"
"Get all custom field values for contact 789"
"Create a tag called 'Hot Lead'"
```

---

## API Reference

- [ActiveCampaign API Docs](https://developers.activecampaign.com/reference/overview)
- API Version: v3
- Base URL: `https://{ACCOUNT}.api-us1.com/api/3/`

---

## License

MIT
