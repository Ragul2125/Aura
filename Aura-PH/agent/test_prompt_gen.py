from services.prompt import taskAnalyzerPrompts

def test_tastCategorizer():
    prompts = taskAnalyzerPrompts()
    tasks = ["Write code for new feature", "Email client about delay", "Go for a run", "Design database schema"]
    prompt = prompts.tastCategorizer(tasks)
    
    print("Generated Prompt:")
    print("-" * 20)
    print(prompt)
    print("-" * 20)

if __name__ == "__main__":
    test_tastCategorizer()
