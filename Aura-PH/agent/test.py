from services.promptProcessor import taskProcessor

taskProcessor = taskProcessor()
input = {
  "user_id": "u123",
  "date": "2026-01-23",
  "tasks": [
    {
      "task_id": "t001",
      "title": "Debug Flask login API issue",
      "description": "Fix JWT auth bug and test with Postman",
      "duration_minutes": 90,
      "deadline": "2026-01-23",
      "priority": 5,
      "context": "laptop",
      "tags": ["backend", "flask", "urgent"]
    },
    {
      "task_id": "t002",
      "title": "Create PPT for AURA project",
      "description": "Design slides + pitch script + architecture diagram",
      "duration_minutes": 120,
      "deadline": "2026-01-24",
      "priority": 4,
      "context": "laptop",
      "tags": ["presentation", "design"]
    },
    {
      "task_id": "t003",
      "title": "Reply to mentor emails",
      "description": "Send updates about hackathon project progress",
      "duration_minutes": 20,
      "deadline": "2026-01-23",
      "priority": 3,
      "context": "mobile",
      "tags": ["communication"]
    },
    {
      "task_id": "t004",
      "title": "Go for gym workout",
      "description": "Strength training + 15 min cardio",
      "duration_minutes": 60,
      "deadline": "2026-01-23",
      "priority": 3,
      "context": "anywhere",
      "tags": ["health", "fitness"]
    },
    {
      "task_id": "t005",
      "title": "Update Notion daily progress report",
      "description": "Write what was done today, blockers, and tomorrow plan",
      "duration_minutes": 15,
      "deadline": "2026-01-23",
      "priority": 2,
      "context": "mobile",
      "tags": ["notion", "admin"]
    }
  ]
}
input_health = [{'task': 'Debug Flask login API issue', 'category': 'Deep Work'}, {'task': 'Create PPT for AURA project', 'category': 'Creative Work'}, {'task': 'Reply to mentor emails', 'category': 'Admin / Shallow'}, {'task': 'Go for gym workout', 'category': 'Physical / Lifestyle'}, {'task': 'Update Notion daily progress report', 'category': 'Admin / Shallow'}]
health_condition = "cold sensitive guy"
health_issue = "headache"
inputStamps = {
  "session_end_time": "2026-01-23T19:14:01.254837",
  "screen": {
    "total_on_time_sec": 98,
    "total_off_time_sec": 2
  },
  "battery": {
    "start_level_percent": 65,
    "end_level_percent": 65,
    "drain_percent": 0
  },
  "apps": [
    {
      "app": "com.android.settings",
      "foreground_time_sec": 2
    },
    {
      "app": "com.sec.android.app.launcher",
      "foreground_time_sec": 13
    },
    {
      "app": "com.whatsapp",
      "foreground_time_sec": 31
    },
    {
      "app": "com.instagram.android",
      "foreground_time_sec": 82
    }
  ]
}
print(taskProcessor.screenTimeAnalyzer(inputStamps))