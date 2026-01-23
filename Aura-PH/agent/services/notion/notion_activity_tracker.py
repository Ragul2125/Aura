import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from notion_client import Client


class NotionActivityTracker:
    """Track and retrieve activities from Notion workspace"""
    
    def __init__(self, notion_token: Optional[str] = None):
        """
        Initialize Notion client
        
        Args:
            notion_token: Notion integration token (or set NOTION_TOKEN env var)
        """
        self.token = notion_token or os.getenv('NOTION_TOKEN')
        if not self.token:
            raise ValueError("Notion token is required. Set NOTION_TOKEN env var or pass as parameter")
        
        self.client = Client(auth=self.token)
    
    def get_all_pages(self, database_id: Optional[str] = None) -> List[Dict]:
        """
        Get all pages from workspace or specific database
        
        Args:
            database_id: Optional database ID to filter pages
        
        Returns:
            List of page objects
        """
        pages = []
        try:
            if database_id:
                # Query specific database
                response = self.client.databases.query(database_id=database_id)
                pages = response.get('results', [])
            else:
                # Search all pages (limited to accessible ones)
                response = self.client.search(filter={"property": "object", "value": "page"})
                pages = response.get('results', [])
        except Exception as e:
            print(f"Error fetching pages: {e}")
        
        return pages
    
    def get_page_activity(self, page_id: str) -> Dict[str, Any]:
        """
        Get activity information for a specific page
        
        Args:
            page_id: The Notion page ID
        
        Returns:
            Dictionary with page activity information
        """
        try:
            page = self.client.pages.retrieve(page_id)
            
            activity = {
                "type": "page",
                "id": page_id,
                "title": self._extract_title(page),
                "created_time": page.get('created_time'),
                "last_edited_time": page.get('last_edited_time'),
                "created_by": page.get('created_by', {}).get('id', 'unknown'),
                "last_edited_by": page.get('last_edited_by', {}).get('id', 'unknown'),
                "url": page.get('url', ''),
                "archived": page.get('archived', False),
                "properties": self._extract_properties(page)
            }
            
            return activity
        except Exception as e:
            print(f"Error fetching page activity for {page_id}: {e}")
            return {}
    
    def get_database_activity(self, database_id: str) -> Dict[str, Any]:
        """
        Get activity information for a specific database
        
        Args:
            database_id: The Notion database ID
        
        Returns:
            Dictionary with database activity information
        """
        try:
            database = self.client.databases.retrieve(database_id)
            
            # Get recent entries
            entries = self.client.databases.query(database_id=database_id)
            
            activity = {
                "type": "database",
                "id": database_id,
                "title": self._extract_title(database),
                "created_time": database.get('created_time'),
                "last_edited_time": database.get('last_edited_time'),
                "created_by": database.get('created_by', {}).get('id', 'unknown'),
                "last_edited_by": database.get('last_edited_by', {}).get('id', 'unknown'),
                "url": database.get('url', ''),
                "entry_count": len(entries.get('results', [])),
                "properties": list(database.get('properties', {}).keys())
            }
            
            return activity
        except Exception as e:
            print(f"Error fetching database activity for {database_id}: {e}")
            return {}
    
    def get_comments(self, page_id: str) -> List[Dict[str, Any]]:
        """
        Get comments for a page
        
        Args:
            page_id: The Notion page ID
        
        Returns:
            List of comment objects
        """
        comments = []
        try:
            response = self.client.comments.list(block_id=page_id)
            comments = response.get('results', [])
            
            formatted_comments = []
            for comment in comments:
                formatted_comments.append({
                    "id": comment.get('id'),
                    "created_time": comment.get('created_time'),
                    "last_edited_time": comment.get('last_edited_time'),
                    "created_by": comment.get('created_by', {}).get('id', 'unknown'),
                    "rich_text": self._extract_rich_text(comment.get('rich_text', []))
                })
            
            return formatted_comments
        except Exception as e:
            print(f"Error fetching comments for {page_id}: {e}")
            return []
    
    def get_all_databases(self) -> List[Dict]:
        """
        Get all databases from workspace
        
        Returns:
            List of database objects
        """
        databases = []
        try:
            response = self.client.search(filter={"property": "object", "value": "database"})
            databases = response.get('results', [])
        except Exception as e:
            print(f"Error fetching databases: {e}")
        
        return databases
    
    def get_user_info(self, user_id: str) -> Dict[str, Any]:
        """
        Get user information
        
        Args:
            user_id: The Notion user ID
        
        Returns:
            Dictionary with user information
        """
        try:
            user = self.client.users.retrieve(user_id)
            return {
                "id": user.get('id'),
                "name": user.get('name', 'Unknown'),
                "type": user.get('type', 'unknown'),
                "avatar_url": user.get('avatar_url', '')
            }
        except Exception as e:
            print(f"Error fetching user info for {user_id}: {e}")
            return {"id": user_id, "name": "Unknown"}
    
    def collect_all_activities(self, include_comments: bool = True, 
                              include_databases: bool = True,
                              include_pages: bool = True) -> List[Dict[str, Any]]:
        """
        Collect all activities from Notion workspace
        
        Args:
            include_comments: Whether to include comments
            include_databases: Whether to include database activities
            include_pages: Whether to include page activities
        
        Returns:
            List of all activity dictionaries
        """
        all_activities = []
        
        # Get all pages
        if include_pages:
            print("Fetching pages...")
            pages = self.get_all_pages()
            for page in pages:
                page_id = page.get('id')
                activity = self.get_page_activity(page_id)
                if activity:
                    all_activities.append(activity)
                    
                    # Get comments for each page if requested
                    if include_comments:
                        comments = self.get_comments(page_id)
                        for comment in comments:
                            all_activities.append({
                                "type": "comment",
                                "page_id": page_id,
                                **comment
                            })
        
        # Get all databases
        if include_databases:
            print("Fetching databases...")
            databases = self.get_all_databases()
            for database in databases:
                database_id = database.get('id')
                activity = self.get_database_activity(database_id)
                if activity:
                    all_activities.append(activity)
        
        # Sort by last edited time (most recent first)
        all_activities.sort(
            key=lambda x: x.get('last_edited_time', ''),
            reverse=True
        )
        
        return all_activities
    
    def get_activities_json(self, include_comments: bool = True,
                           include_databases: bool = True,
                           include_pages: bool = True,
                           pretty: bool = True) -> str:
        """
        Get all activities as JSON string
        
        Args:
            include_comments: Whether to include comments
            include_databases: Whether to include database activities
            include_pages: Whether to include page activities
            pretty: Whether to format JSON with indentation
        
        Returns:
            JSON string of all activities
        """
        activities = self.collect_all_activities(
            include_comments=include_comments,
            include_databases=include_databases,
            include_pages=include_pages
        )
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "total_activities": len(activities),
            "activities": activities
        }
        
        if pretty:
            return json.dumps(result, indent=2, ensure_ascii=False)
        else:
            return json.dumps(result, ensure_ascii=False)
    
    def _extract_title(self, obj: Dict) -> str:
        """Extract title from Notion object"""
        if 'properties' in obj:
            # For pages/databases with properties
            title_prop = obj.get('properties', {}).get('title', {})
            if title_prop:
                title_array = title_prop.get('title', [])
                if title_array:
                    return ''.join([text.get('plain_text', '') for text in title_array])
        
        # For regular pages
        if 'title' in obj:
            title_array = obj.get('title', [])
            if title_array:
                return ''.join([text.get('plain_text', '') for text in title_array])
        
        return "Untitled"
    
    def _extract_properties(self, page: Dict) -> Dict:
        """Extract properties from a page"""
        properties = {}
        page_props = page.get('properties', {})
        
        for prop_name, prop_value in page_props.items():
            prop_type = prop_value.get('type', 'unknown')
            properties[prop_name] = {
                "type": prop_type,
                "value": self._extract_property_value(prop_value, prop_type)
            }
        
        return properties
    
    def _extract_property_value(self, prop: Dict, prop_type: str) -> Any:
        """Extract value from a property based on its type"""
        if prop_type == 'title':
            return self._extract_rich_text(prop.get('title', []))
        elif prop_type == 'rich_text':
            return self._extract_rich_text(prop.get('rich_text', []))
        elif prop_type == 'number':
            return prop.get('number')
        elif prop_type == 'select':
            return prop.get('select', {}).get('name')
        elif prop_type == 'multi_select':
            return [item.get('name') for item in prop.get('multi_select', [])]
        elif prop_type == 'date':
            return prop.get('date')
        elif prop_type == 'checkbox':
            return prop.get('checkbox')
        elif prop_type == 'url':
            return prop.get('url')
        elif prop_type == 'email':
            return prop.get('email')
        elif prop_type == 'phone_number':
            return prop.get('phone_number')
        else:
            return str(prop)
    
    def _extract_rich_text(self, rich_text_array: List) -> str:
        """Extract plain text from rich text array"""
        return ''.join([text.get('plain_text', '') for text in rich_text_array])


def main():
    """Main function to demonstrate usage"""
    import sys
    
    # Get token from environment or command line
    token = os.getenv('NOTION_TOKEN')
    if len(sys.argv) > 1:
        token = sys.argv[1]
    
    if not token:
        print("Usage: python notion_activity_tracker.py [NOTION_TOKEN]")
        print("Or set NOTION_TOKEN environment variable")
        sys.exit(1)
    
    # Initialize tracker
    tracker = NotionActivityTracker(notion_token=token)
    
    # Get all activities as JSON
    print("Collecting Notion activities...")
    activities_json = tracker.get_activities_json(
        include_comments=True,
        include_databases=True,
        include_pages=True,
        pretty=True
    )
    
    # Print to console
    print("\n" + "="*50)
    print("NOTION ACTIVITIES JSON")
    print("="*50)
    print(activities_json)
    
    # Save to file
    output_file = 'notion_activities.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(activities_json)
    
    print(f"\nActivities saved to {output_file}")


if __name__ == "__main__":
    main()
