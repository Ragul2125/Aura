"""
Quick script to refresh and update Notion activities
Run this after making updates in Notion

Usage:
    source venv/bin/activate  # Activate virtual environment first
    python refresh_activities.py
"""

import os
import sys

try:
    from notion_activity_tracker import NotionActivityTracker
except ImportError:
    print("❌ ERROR: notion_client module not found!")
    print("\nPlease activate your virtual environment first:")
    print("  source venv/bin/activate")
    print("\nOr install dependencies:")
    print("  pip install -r requirements.txt")
    sys.exit(1)

def refresh_activities():
    """Refresh activities from Notion"""
    
    token = os.getenv('NOTION_TOKEN')
    if not token:
        print("❌ ERROR: NOTION_TOKEN not set!")
        print("\nSet it with:")
        print('  export NOTION_TOKEN="your_token_here"')
        return
    
    print("🔄 Refreshing Notion activities...")
    print("=" * 60)
    
    try:
        tracker = NotionActivityTracker(notion_token=token)
        
        # Get all activities
        print("\n📥 Fetching latest data from Notion...")
        activities_json = tracker.get_activities_json(
            include_comments=True,
            include_databases=True,
            include_pages=True,
            pretty=True
        )
        
        # Save to file
        output_file = 'notion_activities.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(activities_json)
        
        # Parse to show summary
        import json
        data = json.loads(activities_json)
        
        print(f"\n✅ Successfully refreshed!")
        print(f"   Timestamp: {data.get('timestamp')}")
        print(f"   Total activities: {data.get('total_activities')}")
        print(f"\n   Pages: {sum(1 for a in data.get('activities', []) if a.get('type') == 'page')}")
        print(f"   Databases: {sum(1 for a in data.get('activities', []) if a.get('type') == 'database')}")
        print(f"   Comments: {sum(1 for a in data.get('activities', []) if a.get('type') == 'comment')}")
        
        # Show recent activities
        recent = data.get('activities', [])[:5]
        if recent:
            print(f"\n📋 Most recent activities:")
            for i, activity in enumerate(recent, 1):
                activity_type = activity.get('type', 'unknown')
                title = activity.get('title', 'Untitled')
                last_edited = activity.get('last_edited_time', 'N/A')
                print(f"   {i}. [{activity_type.upper()}] {title}")
                print(f"      Last edited: {last_edited}")
        
        print(f"\n💾 Saved to: {output_file}")
        print("\n" + "=" * 60)
        
        # Check if updates are recent
        from datetime import datetime
        current_time = datetime.now()
        json_time = datetime.fromisoformat(data.get('timestamp', ''))
        time_diff = (current_time - json_time).total_seconds()
        
        if time_diff < 60:
            print("✅ Data is fresh (fetched just now)")
        else:
            print(f"⚠️  Data was fetched {int(time_diff)} seconds ago")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nTroubleshooting:")
        print("1. Check that your NOTION_TOKEN is correct")
        print("2. Verify pages/databases are shared with your integration")
        print("3. Run: python debug_notion_access.py")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(refresh_activities())
