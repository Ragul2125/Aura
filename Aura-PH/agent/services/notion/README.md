# Notion Activity Tracker

A Python tool to fetch and track all activities from your Notion workspace and export them as JSON.

## Features

- ✅ Fetch all pages and their metadata
- ✅ Fetch all databases and entry counts
- ✅ Retrieve comments on pages
- ✅ Track creation and last edited timestamps
- ✅ Export all activities as structured JSON

## Quick Start - Get Your Notion Token

**🔑 Direct Link to Create Integration:**
👉 **https://www.notion.so/my-integrations**

1. Click **"+ New integration"**
2. Name it (e.g., "Activity Tracker")
3. Select your workspace
4. Click **"Submit"**
5. Copy the **"Internal Integration Token"** (starts with `secret_`)
6. Use it: `export NOTION_TOKEN="secret_your_token_here"`

## Setup

### Prerequisites

1. **Notion Integration Token**: You need to create a Notion integration and get an API token.
   
   **Step-by-step guide:**
   
   a. **Go to Notion Integrations page:**
      - Visit: https://www.notion.so/my-integrations
      - Or go to: https://www.notion.so → Click your profile/avatar → Settings & Members → Connections → Develop or manage integrations
   
   b. **Create a new integration:**
      - Click the **"+ New integration"** button (top right)
      - Fill in the details:
        - **Name**: Give it a name (e.g., "Activity Tracker")
        - **Associated workspace**: Select your workspace
        - **Type**: Select "Internal" (for personal use)
        - **Capabilities**: You can leave defaults or customize
      - Click **"Submit"**
   
   c. **Copy your token:**
      - After creating, you'll see a page with your integration details
      - Look for **"Internal Integration Token"** or **"Secret"**
      - Click **"Show"** or **"Copy"** to reveal the token
      - The token looks like: `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
      - **⚠️ Important**: Copy and save this token securely - you won't be able to see it again!
   
   d. **Example token format:**
      ```
      secret_AbCdEf1234567890GhIjKlMnOpQrStUvWxYz
      ```

2. **Share Pages/Databases**: Make sure to share the pages/databases you want to track with your integration.
   - Open the page/database in Notion
   - Click the "..." menu → "Add connections" → Select your integration

### Installation

**Option 1: Using Virtual Environment (Recommended)**

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Or use the setup script:
```bash
chmod +x setup.sh
./setup.sh
source venv/bin/activate
```

**Option 2: User Installation (if virtual env doesn't work)**

```bash
pip install --user -r requirements.txt
```

## Usage

```bash
# Activate virtual environment (if using one)
source venv/bin/activate

# Set environment variable
export NOTION_TOKEN="your_notion_token_here"

# Run the tracker
python notion_activity_tracker.py
```

Or pass token as argument:
```bash
python notion_activity_tracker.py "your_notion_token_here"
```

**To refresh after making updates in Notion:**
```bash
# Run the tracker again to fetch latest data
python notion_activity_tracker.py

# Or use the refresh script
python refresh_activities.py
```

## Output

The script will:
1. Print all activities to the console as formatted JSON
2. Save the results to `notion_activities.json`

### JSON Structure

```json
{
  "timestamp": "2025-01-23T12:00:00",
  "total_activities": 10,
  "activities": [
    {
      "type": "page",
      "id": "page-id",
      "title": "Page Title",
      "created_time": "2025-01-01T00:00:00.000Z",
      "last_edited_time": "2025-01-23T10:00:00.000Z",
      "created_by": "user-id",
      "last_edited_by": "user-id",
      "url": "https://notion.so/...",
      "archived": false,
      "properties": {...}
    },
    {
      "type": "database",
      "id": "database-id",
      "title": "Database Title",
      "entry_count": 25,
      ...
    },
    {
      "type": "comment",
      "page_id": "page-id",
      "created_time": "2025-01-20T15:00:00.000Z",
      ...
    }
  ]
}
```

## Activities Tracked

The tool tracks the following activities:

1. **Pages**:
   - Creation time
   - Last edited time
   - Creator and last editor
   - Page properties
   - URL and archive status

2. **Databases**:
   - Creation time
   - Last edited time
   - Entry count
   - Database properties

3. **Comments**:
   - Comment text
   - Creation time
   - Commenter information
   - Associated page

## Programmatic Usage

You can also use the tracker in your own Python code:

```python
from notion_activity_tracker import NotionActivityTracker

# Initialize
tracker = NotionActivityTracker(notion_token="your_token")

# Get activities as JSON string
json_output = tracker.get_activities_json(pretty=True)

# Or get as Python dictionary
activities = tracker.collect_all_activities()
```

## Limitations

⚠️ **Important Notes**:

1. **No Native Activity Log**: Notion API doesn't provide a direct "activity log" endpoint. This tool reconstructs activity by:
   - Checking page/database metadata (created/edited times)
   - Retrieving comments
   - Querying current state of pages/databases

2. **Historical Changes**: The API doesn't provide historical change logs. You can only see:
   - When items were created
   - When items were last edited
   - Current state of items

3. **Real-time Tracking**: For real-time activity tracking, consider:
   - Using Notion Webhooks (if available)
   - Polling the API periodically
   - Storing snapshots and comparing changes

4. **Permissions**: Only pages/databases shared with your integration will be accessible.

## Troubleshooting

### "Notion token is required" error
- Make sure you've set the `NOTION_TOKEN` environment variable or passed it as an argument

### "Where do I find my integration token?"
If you already created an integration but can't find the token:
1. Go to https://www.notion.so/my-integrations
2. Find your integration in the list
3. Click on it to open details
4. If the token is hidden, you'll need to create a new integration (tokens can't be viewed after creation)
5. Or check if you saved it somewhere (password manager, notes, etc.)

### "Object not found" errors
- Ensure the pages/databases are shared with your integration
- Check that your integration token is valid
- Make sure you clicked "Add connections" on each page/database you want to track

### Empty results
- Verify your integration has access to the workspace
- Check that pages/databases are shared with the integration
- Try sharing a test page with your integration first

### Updates not showing in JSON
**The tracker doesn't auto-refresh!** After updating in Notion:
1. **Run the tracker again**: `python notion_activity_tracker.py`
2. **Check the page is shared**: The updated page must be shared with your integration
3. **Verify the update**: Make sure you actually edited the page (not just viewed it)
4. **Check timestamp**: The JSON shows when it was last fetched - run again to get latest data

## How to Share Pages/Databases with Integration

**⚠️ IMPORTANT**: Pages/databases must be shared with your integration to be tracked!

1. **Open the page/database** in Notion
2. Click **"Share"** button (top right) or **"..."** menu
3. Select **"Add connections"** or **"Connections"**
4. Find and select **your integration**
5. Click **"Confirm"**

**To create activities:**
- Create/edit pages → Updates `last_edited_time`
- Add database entries → Updates entry count
- Add comments → Creates comment activities

**Debug Access:**
Run `python debug_notion_access.py` to check what pages/databases are accessible.

## Alternative: Notion Webhooks

For real-time activity tracking, consider using Notion's webhook system (if available) to receive notifications when changes occur.

## License

MIT
