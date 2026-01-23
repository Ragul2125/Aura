"""
Debug script to check what pages/databases are accessible via Notion API
Helps troubleshoot why activities aren't showing up
"""

import os
from notion_activity_tracker import NotionActivityTracker

def debug_notion_access():
    """Check what's accessible and provide troubleshooting info"""
    
    token = os.getenv('NOTION_TOKEN')
    if not token:
        print("❌ ERROR: NOTION_TOKEN not set!")
        print("\nSet it with:")
        print('  export NOTION_TOKEN="your_token_here"')
        return
    
    print("=" * 60)
    print("NOTION ACCESS DEBUGGER")
    print("=" * 60)
    print()
    
    try:
        tracker = NotionActivityTracker(notion_token=token)
        
        # Search for pages
        print("🔍 Searching for accessible pages...")
        pages = tracker.get_all_pages()
        print(f"   Found {len(pages)} accessible pages")
        
        if pages:
            print("\n📄 Accessible Pages:")
            for i, page in enumerate(pages[:10], 1):  # Show first 10
                page_id = page.get('id')
                page_details = tracker.get_page_activity(page_id)
                title = page_details.get('title', 'Untitled') if page_details else 'Untitled'
                url = page_details.get('url', '') if page_details else ''
                print(f"   {i}. {title}")
                print(f"      ID: {page_id}")
                print(f"      URL: {url}")
                print()
        else:
            print("   ⚠️  No pages found!")
            print("\n   This usually means:")
            print("   1. No pages are shared with your integration")
            print("   2. Your integration token is invalid")
            print("   3. Your integration doesn't have workspace access")
        
        # Search for databases
        print("\n🔍 Searching for accessible databases...")
        databases = tracker.get_all_databases()
        print(f"   Found {len(databases)} accessible databases")
        
        if databases:
            print("\n🗄️  Accessible Databases:")
            for i, database in enumerate(databases[:10], 1):  # Show first 10
                db_id = database.get('id')
                db_details = tracker.get_database_activity(db_id)
                title = db_details.get('title', 'Untitled') if db_details else 'Untitled'
                url = db_details.get('url', '') if db_details else ''
                entry_count = db_details.get('entry_count', 0) if db_details else 0
                print(f"   {i}. {title}")
                print(f"      ID: {db_id}")
                print(f"      Entries: {entry_count}")
                print(f"      URL: {url}")
                print()
        else:
            print("   ⚠️  No databases found!")
        
        # Summary
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Total accessible pages: {len(pages)}")
        print(f"Total accessible databases: {len(databases)}")
        print()
        
        if len(pages) == 0 and len(databases) == 0:
            print("❌ PROBLEM: Nothing is accessible!")
            print("\n📋 SOLUTION STEPS:")
            print("   1. Go to your 'meeting' page in Notion")
            print("   2. Click the 'Share' button (top right)")
            print("   3. Click 'Add connections' or 'Connections'")
            print("   4. Find and select your integration")
            print("   5. Click 'Confirm' or 'Add'")
            print("   6. Run this script again to verify")
            print("\n   🔗 Integration page: https://www.notion.so/my-integrations")
        else:
            print("✅ Some pages/databases are accessible!")
            print("\n💡 TIP: If your 'meeting' page isn't listed above,")
            print("   you need to share it with your integration.")
            print("   See steps above.")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nPossible issues:")
        print("  1. Invalid Notion token")
        print("  2. Integration doesn't have workspace access")
        print("  3. Network/API connection issue")
        print("\nCheck your token at: https://www.notion.so/my-integrations")

if __name__ == "__main__":
    debug_notion_access()
