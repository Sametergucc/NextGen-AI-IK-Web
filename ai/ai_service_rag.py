from fastapi import FastAPI
from pydantic import BaseModel
import openai  # OpenAI artık embeimport openaidding için kullanılmayacak
import faiss
import numpy as np
from docx import Document
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import openai
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# Aşağıdaki model importlarını kendi projenin model dosyasına göre düzenle
# from models import User, LeaveRequest
# .env'den anahtar oku (hem .env hem doğrudan anahtar desteği)
dotenv_path = os.path.join(os.path.dirname(__file__), '../.env')
load_dotenv(dotenv_path)
openai.api_key = os.getenv("OPENAI_API_KEY") or "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"
app = FastAPI()

DATABASE_URL = "sqlite:///./test.db"  # Kendi veritabanı bağlantı adresini buraya yazabilirsin

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Word'den Kuralları Oku ---
def read_rules_from_word(file_path):
    doc = Document(file_path)
    rules = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            rules.append(text)
    return rules

def read_rules_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return [item['kural'] for item in data]

kurallar = read_rules_from_json("izin_politikalari.json")

# --- HuggingFace Sentence Transformers ile Embedding ---
embedder = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')

def get_embedding(text):
    emb = embedder.encode([text])[0]
    return emb.astype(np.float32)

print("Kurallar embedding'e hazırlanıyor...")
rule_embeddings = np.array([get_embedding(rule) for rule in kurallar])
print("Embedding işlemi tamamlandı.")
index = faiss.IndexFlatL2(rule_embeddings.shape[1])
index.add(rule_embeddings)

# --- Sorguya En Uygun Kuralı Bul ---
def find_relevant_rule(query, rules, index):
    query_emb = get_embedding(query)
    D, I = index.search(np.array([query_emb]), k=1)
    return rules[I[0][0]]

# --- AI Prompt'una Kuralı Ekle ve Sonucu Al ---
def get_ai_suggestion(leave_request, relevant_rule):
    prompt = (
        f"Şirket politikası: {relevant_rule}\n"
        f"Talep: {leave_request}\n"
        f"Lütfen sadece İK birimine hitap eden, kısa ve kesin bir öneri cümlesi kur. "
        f"Kurala göre bu talep onaylanmalı mı, reddedilmeli mi? Sadece 1 cümleyle, gerekçeli ve kesin bir şekilde yanıt ver."
    )
    print('Seçilen kural:', relevant_rule)
    print('AI prompt:', prompt)
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=100
    )
    return response.choices[0].message["content"]

# --- FastAPI Model ---
from typing import List, Optional

class LeaveRequest(BaseModel):
    employeeId: int
    firstName: str = ""
    lastName: str = ""
    startDate: str
    endDate: str
    department: str
    reason: str
    kidem: Optional[float] = None
    dogum_gunu: Optional[str] = None
    pozisyon: Optional[str] = None
    izinli_sayisi: Optional[int] = None
    toplam_sayi: Optional[int] = None
    dogum_gunu_kullandi_mi: Optional[bool] = None
    pozisyonda_izinliler: Optional[List[dict]] = None
    ise_baslama: Optional[str] = None  # "YYYY-MM-DD" formatında

RESMI_TATILLER = [
    "2024-04-23", "2024-05-01", "2024-05-19", "2024-07-15",
    "2024-08-30", "2024-10-29", "2025-01-01"
]

def is_sunday(date_str):
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.weekday() == 6  # Pazartesi=0, Pazar=6

def count_sundays_and_holidays(start, end):
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    end_dt = datetime.strptime(end, "%Y-%m-%d")
    total = 0
    for i in range((end_dt - start_dt).days + 1):
        day = start_dt + timedelta(days=i)
        if day.weekday() == 6 or day.strftime("%Y-%m-%d") in RESMI_TATILLER:
            total += 1
    return total

def get_pozisyonda_izinliler(department, pozisyon, startDate, endDate):
    # Burada veritabanından çekilecek. Şimdilik örnek veri:
    # Aynı departman ve pozisyonda, aynı tarihlerde izinli olanlar
    return [
        {"employeeId": 2, "kidem": 3.5},
        {"employeeId": 3, "kidem": 1.8}
    ]

def is_kopru_izni(start, end):
    # Köprü izni: Resmi tatil ile hafta sonu arasında kalan tek gün
    # Örnek: Cumartesi (hafta sonu), Pazar (hafta sonu), Pazartesi (izin), Salı (resmi tatil)
    # veya Perşembe (resmi tatil), Cuma (izin), Cumartesi (hafta sonu)
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    end_dt = datetime.strptime(end, "%Y-%m-%d")
    if (end_dt - start_dt).days != 0:
        return False
    day = start_dt
    prev_day = day - timedelta(days=1)
    next_day = day + timedelta(days=1)
    # Önceki gün resmi tatil, sonraki gün hafta sonu veya tersi
    if (prev_day.strftime("%Y-%m-%d") in RESMI_TATILLER and next_day.weekday() >= 5) or \
       (next_day.strftime("%Y-%m-%d") in RESMI_TATILLER and prev_day.weekday() >= 5):
        return True
    return False

def check_all_rules(req, user_info=None, departman_info=None, izinli_sayisi=None, toplam_sayi=None, dogum_gunu_kullandi_mi=None, pozisyonda_izinliler=None):
    # İzin gün sayısı hesaplaması en başta!
    try:
        izin_gun_sayisi = (datetime.strptime(req.endDate, "%Y-%m-%d") - datetime.strptime(req.startDate, "%Y-%m-%d")).days + 1
    except Exception:
        izin_gun_sayisi = 1

    # Kıdem hesaplama ve diğer kurallar bundan sonra çalışacak
    ise_baslama = getattr(req, "ise_baslama", None)
    start_date = req.startDate
    if ise_baslama:
        try:
            ise_baslama_dt = datetime.strptime(ise_baslama, "%Y-%m-%d")
            izin_baslangic_dt = datetime.strptime(start_date, "%Y-%m-%d")
            kidem_gun = (izin_baslangic_dt - ise_baslama_dt).days
            kidem = kidem_gun / 365.25
            if kidem <= 0:
                print(f"Kıdem negatif veya sıfır çıktı, düzeltildi: {kidem}")
                kidem = 0.01
        except Exception as e:
            print(f"Kıdem hesaplama hatası: {e}")
            kidem = user_info.get("kidem", 1.0) if user_info else 1.0
    else:
        kidem = user_info.get("kidem", 1.0) if user_info else 1.0
    if kidem is None:
        kidem = 1.0
    try:
        kidem = float(kidem)
    except Exception as e:
        print(f"Kıdem float'a çevrilemedi: {e}")
        kidem = 1.0
    kidem = round(kidem, 2)
    print(f"Kıdem: {kidem}, ise_baslama: {ise_baslama}, start_date: {start_date}")

    # --- ÖNCELİKLİ KURALLAR ---
    # 1. Köprü izni kontrolü (daha esnek)
    print(f"Köprü izni kontrolü: start: {req.startDate}, end: {req.endDate}, RESMI_TATILLER: {RESMI_TATILLER}")
    try:
        start_dt = datetime.strptime(req.startDate, "%Y-%m-%d")
        end_dt = datetime.strptime(req.endDate, "%Y-%m-%d")
        for i in range((end_dt - start_dt).days + 1):
            day = start_dt + timedelta(days=i)
            prev_day = day - timedelta(days=1)
            next_day = day + timedelta(days=1)
            print(f"Köprü günü kontrolü: day={day}, prev_day={prev_day}, next_day={next_day}, prev_day_resmi={prev_day.strftime('%Y-%m-%d') in RESMI_TATILLER}, next_day_resmi={next_day.strftime('%Y-%m-%d') in RESMI_TATILLER}, next_day_weekend={next_day.weekday() >= 5}, prev_day_weekend={prev_day.weekday() >= 5}")
            if (
                (day.strftime("%Y-%m-%d") not in RESMI_TATILLER)
                and (
                    (prev_day.strftime("%Y-%m-%d") in RESMI_TATILLER and next_day.weekday() >= 5)
                    or (next_day.strftime("%Y-%m-%d") in RESMI_TATILLER and prev_day.weekday() >= 5)
                )
            ):
                print("Köprü izni kuralı tetiklendi! day:", day)
                return "kopru_izni", f"Köprü izni: {day.strftime('%Y-%m-%d')} günü resmi tatil ile hafta sonu arasında."
    except Exception as e:
        print(f"Köprü izni kontrolünde hata: {e}")

    # 2. Doğum günü izni (daha esnek)
    dogum_gunu = user_info.get("dogum_gunu", None) if user_info else None
    dogum_gunu_kullandi_mi = dogum_gunu_kullandi_mi if dogum_gunu_kullandi_mi is not None else False
    print(f"Doğum günü kontrolü: dogum_gunu: {dogum_gunu}, kullandi_mi: {dogum_gunu_kullandi_mi}, start: {req.startDate}, end: {req.endDate}")
    if dogum_gunu and not dogum_gunu_kullandi_mi:
        try:
            dogum_gunu_dt = datetime.strptime(dogum_gunu, "%Y-%m-%d")
            start_dt = datetime.strptime(req.startDate, "%Y-%m-%d")
            end_dt = datetime.strptime(req.endDate, "%Y-%m-%d")
            print(f"Doğum günü aralığı kontrolü: start_dt={start_dt}, end_dt={end_dt}, dogum_gunu_dt={dogum_gunu_dt}")
            if start_dt <= dogum_gunu_dt <= end_dt:
                print("Doğum günü izni kuralı tetiklendi!")
                return "dogum_gunu", "Doğum günü izni uygundur."
        except Exception as e:
            print(f"Doğum günü kontrolünde hata: {e}")

    # 3. Pozisyon çakışması (daha sağlam)
    print(f"Pozisyonda izinliler kontrolü: {pozisyonda_izinliler}, talep_pozisyon: {req.pozisyon}, talep_department: {req.department}, talep_kidem: {kidem}")
    if pozisyonda_izinliler:
        for izinli in pozisyonda_izinliler:
            print(f"Çakışan izinli: {izinli}")


            if (
                izinli.get('employeeId') != req.employeeId
                and izinli.get('pozisyon') == req.pozisyon
                and izinli.get('department', req.department) == req.department
                and izinli.get('kidem', 0) > kidem
            ):
                print(f"Pozisyon çakışması kuralı tetiklendi! izinli_kidem: {izinli.get('kidem')}, talep_kidem: {kidem}")
                return "pozisyon_cakisma", f"Aynı pozisyonda izin çakışması var, kıdemi fazla olan çalışana öncelik verilir. (izinli_kidem: {izinli.get('kidem')}, talep_kidem: {kidem})"

    # Diğer önemli kurallarda da logları güçlendiriyorum
    # 1. Haftada 6 gün çalışılır, Pazar günleri tatildir.
    pazar_kontrol = all(is_sunday((datetime.strptime(req.startDate, "%Y-%m-%d") + timedelta(days=i)).strftime("%Y-%m-%d"))
           for i in range((datetime.strptime(req.endDate, "%Y-%m-%d") - datetime.strptime(req.startDate, "%Y-%m-%d")).days + 1))
    print(f"Pazar kontrolü: {pazar_kontrol}, start: {req.startDate}, end: {req.endDate}")
    if pazar_kontrol:
        print(f"Pazar tatil kuralı tetiklendi! start: {req.startDate}, end: {req.endDate}")
        return "pazar_tatil", "Pazar günleri tatildir, bu günlerde izin talebine gerek yoktur."

    # 2. Dönemsel yasak
    print(f"Dönemsel yasak kontrolü: {req.startDate} - {req.endDate}, reason: {req.reason}")
    if req.startDate >= "2024-12-01" and req.endDate <= "2025-01-15":
        if req.reason.lower() not in ["sağlık", "vefat", "acil"]:
            print(f"Dönemsel yasak kuralı tetiklendi! reason: {req.reason}")
            return "dönemsel_yasak", "1 Aralık 2024 - 15 Ocak 2025 arası sadece acil durum izinleri verilir."
    # 3. Proje bazlı yasak
    print(f"Proje yasağı kontrolü: department: {req.department}, start: {req.startDate}, end: {req.endDate}")
    if req.department == "Ankara Otoyol Projesi" and req.startDate >= "2024-06-18" and req.endDate <= "2024-07-02":
        print("Proje yasağı (Ankara Otoyol) tetiklendi!")
        return "proje_yasak", "Ankara Otoyol Projesi için bu tarihlerde izin kullanılamaz."
    if req.department == "İstanbul Marina" and req.startDate >= "2024-09-08" and req.endDate <= "2024-09-22":
        print("Proje yasağı (İstanbul Marina) tetiklendi!")
        return "proje_yasak", "İstanbul Marina için bu tarihlerde izin kullanılamaz."
    if req.department == "İzmir Konut Projesi" and req.startDate >= "2024-12-03" and req.endDate <= "2024-12-17":
        print("Proje yasağı (İzmir Konut) tetiklendi!")
        return "proje_yasak", "İzmir Konut Projesi için bu tarihlerde izin kullanılamaz."
    # 4. Yaz dönemi limiti
    print(f"Yaz dönemi limiti kontrolü: {req.startDate} - {req.endDate}, izin_gun_sayisi: {izin_gun_sayisi}")
    if req.startDate >= "2024-06-01" and req.endDate <= "2024-08-31" and izin_gun_sayisi > 6:
        print(f"Yaz dönemi limiti kuralı tetiklendi! izin_gun_sayisi: {izin_gun_sayisi}")
        return "yaz_donemi_limit", "1 Haziran - 31 Ağustos 2024 arası en fazla 6 gün izin kullanılabilir."
    # 5. Departman limiti
    print(f"Departman limiti kontrolü: izinli_sayisi: {izinli_sayisi}, toplam_sayi: {toplam_sayi}, oran: {izinli_sayisi / toplam_sayi if toplam_sayi else 'N/A'}")
    if izinli_sayisi is not None and toplam_sayi is not None:
        if izinli_sayisi / toplam_sayi > 0.2:
            print(f"Departman limiti kuralı tetiklendi! oran: {izinli_sayisi / toplam_sayi}")
            return "departman_limiti", "Departmanda aynı anda izinli olan çalışan sayısı %20'yi geçemez."
    # 6. Acil durum limiti (Pazar ve resmi tatil hariç)
    print(f"Acil durum kontrolü: reason: {req.reason}, izin_gun_sayisi: {izin_gun_sayisi}")
    if req.reason.lower() in ["sağlık", "vefat", "acil"]:
        hariç_gunler = count_sundays_and_holidays(req.startDate, req.endDate)
        efektif_izin = izin_gun_sayisi - hariç_gunler
        print(f"Acil durum efektif izin: {efektif_izin}, hariç_gunler: {hariç_gunler}")
        if efektif_izin > 5:
            print("Acil durum limiti kuralı tetiklendi!")
            return "acil_durum_limit", "Acil durumlarda (Pazar ve resmi tatil hariç) en fazla 5 gün izin verilir."
    # 7. Resmi tatil kontrolü
    print(f"Resmi tatil kontrolü: start: {req.startDate}, end: {req.endDate}")
    if req.startDate in RESMI_TATILLER or req.endDate in RESMI_TATILLER:
        print("Resmi tatil kuralı tetiklendi!")
        return "resmi_tatil", "Bu tarihler resmi tatil."
    # 8. Hiçbir kural ihlal edilmedi
    print("Hiçbir kural ihlal edilmedi, onay verildi!")
    return "onay", "İzin talebi uygundur."

# --- FastAPI endpoint ---
from fastapi import Depends
# from database import get_db  # SQLAlchemy session dependency

@app.post("/analyze-leave")
async def analyze_leave(req: LeaveRequest):
    user_info = {
        "kidem": req.kidem,
        "dogum_gunu": req.dogum_gunu,
        "pozisyon": req.pozisyon
    }
    departman_info = {}
    izinli_sayisi = req.izinli_sayisi
    toplam_sayi = req.toplam_sayi
    dogum_gunu_kullandi_mi = req.dogum_gunu_kullandi_mi
    pozisyonda_izinliler = req.pozisyonda_izinliler

    etiket, mesaj = check_all_rules(
        req,
        user_info=user_info,
        departman_info=departman_info,
        izinli_sayisi=izinli_sayisi,
        toplam_sayi=toplam_sayi,
        dogum_gunu_kullandi_mi=dogum_gunu_kullandi_mi,
        pozisyonda_izinliler=pozisyonda_izinliler
    )
    if etiket != "onay":
        return {"result": f"[{etiket}] {mesaj}"}
    # AI'ya aktarmadan direkt onay mesajı dön
    return {"result": "Tüm kurallar uygun, izin talebi onaylandı."} 