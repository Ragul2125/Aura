import re
import json
from services.prompt import taskAnalyzerPrompts
from services.llmService import LLMInterface
def parseLLMJson(llm_output):
    """
    Extract and parse JSON from LLM output, ignoring extra text or <think> tags.
    """
    if isinstance(llm_output, dict):
        return llm_output

    # Try to find the first JSON code block
    match = re.search(r"```json\s*(\{.*?\})\s*```", llm_output, flags=re.DOTALL)
    if match:
        llm_output = match.group(1)
    else:
        # Fallback: try to find any standalone JSON-like object
        match = re.search(r"(\{.*\})", llm_output, flags=re.DOTALL)
        if match:
            llm_output = match.group(1)

    try:
        parsed = json.loads(llm_output)
    except json.JSONDecodeError:
        parsed = {
            "answer": llm_output.strip(),
            "is_fulfilled": False,
            "require_diagram": False,
            "diagram_search_queries": [],
            "error": "Could not parse JSON from LLM output"
        }

    # Ensure all expected keys exist
    defaults = {
        "answer": "",
        "is_fulfilled": False,
        "require_diagram": False,
        "diagram_search_queries": []
    }
    for key, value in defaults.items():
        parsed.setdefault(key, value)

    return parsed


def extract_clean_answer(llm_output: str) -> str:
    """
    Extract the final answer from LLM output by removing <think> tags.
    Works whether the output is plain text or includes JSON/code blocks.
    """
    if not llm_output:
        return ""

    # Remove <think>...</think> sections
    cleaned = re.sub(r"<think>.*?</think>", "", llm_output, flags=re.DOTALL).strip()

    # Remove JSON code block markers if any
    cleaned = re.sub(r"^```(?:json)?|```$", "", cleaned, flags=re.MULTILINE).strip()
    
    return cleaned

def extract_json_from_llm_response(text: str):
    """
    Extracts JSON object or list from LLM output.
    Handles ```json blocks and raw JSON.
    Returns a Python dict or list.
    """
    if not isinstance(text, str):
        raise ValueError("Input must be a string.")

    # Remove ```json or ``` markers
    cleaned = re.sub(r"```(?:json)?|```", "", text, flags=re.IGNORECASE).strip()

    # Try to find JSON array or object using regex
    # Using non-greedy match might be safer if there is trailing text, 
    # but for now let's stick to simple cleaning and parsing.
    match = re.search(r"(\{.*\}|\[.*\])", cleaned, flags=re.DOTALL)

    if not match:
        # If regex fails, try parsing the cleaned text directly in case it's just a number or string
        json_str = cleaned
    else:
        json_str = match.group(0)

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        try:
            import ast
            return ast.literal_eval(json_str)
        except (ValueError, SyntaxError) as e:
            print("Error parsing JSON:", e)
            print("moving to fall back")
            # interface = LLMInterface()
            # content = json_str    
            # reformationPrompt = f"""You will be given text that is intended to be valid JSON but may be malformed, truncated, or contain extra characters due to token limits.
            # input: {content}
            # Your task:
            # 1. Recover and reconstruct the JSON so that it is valid and syntactically correct (but don't change the json schema).
            # 2. Preserve all fields and values that are present.
            # 3. If a value is clearly truncated, fill it with a reasonable placeholder such as:
            # - "" for strings
            # - 0 for numbers
            # - [] for arrays
            # - {{}} for objects
            # 4. Do NOT remove any fields unless they are completely unrecoverable.
            # 5. Do NOT add extra fields that were not present in the original structure.
            # 6. Output ONLY valid JSON — no explanations, no markdown, no code fences.
            # 7. return the output in the same format as the input.

            # If the input is not JSON-like at all, return:
            # {{}}
            # """
            # print("\n" + "="*80)
            # print("FALLBACK REFORMATION PROMPT:")
            # print("="*80)
            # print(reformationPrompt)
            # print("="*80 + "\n")
            # response = interface.nvidiaResponse(prompt=reformationPrompt, model="mistralai/mixtral-8x7b-instruct-v0.1")
            # return extract_clean_answer(response)
             
            raise ValueError(f"Extracted content is not valid JSON. Content: {json_str[:100]}... Error: {e}")


class taskProcessor:
    def __init__(self):
        self.taskAnalyzerPrompts = taskAnalyzerPrompts()
        self.LLMInterface = LLMInterface()

    def processTasks(self, tasks):
        prompt = self.taskAnalyzerPrompts.tastCategorizer(tasks)
        llm_output = self.LLMInterface.nvidiaResponse(prompt=prompt, model="mistralai/mixtral-8x7b-instruct-v0.1")
        return extract_json_from_llm_response(llm_output)
    
    def processHealthTasks(self, tasks, health_condition, health_issue):
        prompt = self.taskAnalyzerPrompts.healthAnalyzerPrompts(tasks, health_condition, health_issue)
        llm_output = self.LLMInterface.nvidiaResponse(prompt=prompt, model="mistralai/mixtral-8x7b-instruct-v0.1")
        return extract_json_from_llm_response(llm_output)

    def screenTimeAnalyzer(self, screenTimeData):
        prompt = self.taskAnalyzerPrompts.screenTimeAnalyzerPrompt(screenTimeData)
        llm_output = self.LLMInterface.nvidiaResponse(prompt=prompt, model="mistralai/mixtral-8x7b-instruct-v0.1")
        return extract_json_from_llm_response(llm_output)

    def defaultEnergyLookup(self, defaultHabitate):
        prompt = self.taskAnalyzerPrompts.defaultEneryLookup(defaultHabitate)
        llm_output = self.LLMInterface.nvidiaResponse(prompt=prompt, model="mistralai/mixtral-8x7b-instruct-v0.1")
        return llm_output

    def 

    

