"""
Simple runner for NyaySetu AI Backend.
Usage: python run.py
"""
import uvicorn

if __name__ == "__main__":
    print("Starting NyaySetu AI Backend on http://localhost:8000 ...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
