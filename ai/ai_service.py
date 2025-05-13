from fastapi import FastAPI
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

openai.api_key = os.getenv("OPENAI_API_KEY")

class LeaveRequest(BaseModel):
    employeeId: int
    startDate: str
    endDate: str
    department: str
    reason: str

@app.post("/analyze-leave")
async def analyze_leave(req: LeaveRequest):
    try:
        prompt = (
            f"Bir çalışan izin talebinde bulunuyor.\n"
            f"Çalışan: {getattr(req, 'firstName', '')} {getattr(req, 'lastName', '')}\n"
            f"Departman: {req.department}\n"
            f"Başlangıç: {req.startDate}\n"
            f"Bitiş: {req.endDate}\n"
            f"Neden: {req.reason}\n"
            f"Lütfen sadece İK departmanına hitap eden, çok kısa ve net bir öneri cümlesi kur. "
            f'"Şirket kuralına göre resmi izinler en fazla 5 gündür, bu talebin reddedilmesi önerilmektedir." gibi bir cümleyle yanıt ver. '
            f'Çalışana değil, onaylayıcıya konuş. Sadece 1 cümle yaz.'
        )
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        return {"result": response.choices[0].message["content"]}
    except Exception as e:
        print("AI Servis Hatası:", e)
        return {"error": str(e)} 