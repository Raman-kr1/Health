import google.generativeai as genai
from ..config import get_settings

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def analyze_symptoms(self, symptoms: str, health_history: dict = None):
        prompt = f"""
        As a health assistant AI, analyze the following symptoms and provide insights.
        Note: This is for informational purposes only and not a medical diagnosis.
        
        Symptoms: {symptoms}
        
        Recent Health Data:
        {health_history if health_history else 'No recent data available'}
        
        Please provide:
        1. Possible conditions (with disclaimer)
        2. Severity assessment (low/medium/high)
        3. Recommended actions
        4. When to seek immediate medical attention
        
        Format the response in a clear, structured way.
        """
        
        response = self.model.generate_content(prompt)
        return response.text
    
    async def check_medicine_interaction(self, medicines: list):
        prompt = f"""
        Check for potential interactions between these medicines:
        {', '.join(medicines)}
        
        Provide:
        1. Known interactions
        2. Severity of interactions
        3. Precautions to take
        4. General safety advice
        
        Include a disclaimer about consulting healthcare professionals.
        """
        
        response = self.model.generate_content(prompt)
        return response.text