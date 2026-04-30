# With Dev Container (VS Code)
1. Install "Dev Containers" extension
2. Click "Reopen in Container" (bottom-left)
3. VS Code opens terminal **inside container**
4. Run same commands above

## Manual Setup
# Backend
```sh
cd backend
python3.11 -m venv venv
source venv/bin/activate # macOS/Linux
venv\Scripts\activate  # Windows
uvicorn app.main:app --reload
```

# Frontend
```sh
cd frontend
npm run dev
```

## Issues you may encounter
- If `pip install -r requirements.txt` does not complete fully and throws an error, then run:
  1. `pip cache purge`
  2. `pip install --upgrade pip`
  3. `pip install -r requirements.txt`
