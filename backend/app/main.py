from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Infinity8 API")

origins = [
    "http://localhost:3000",  # Next.js dev / Docker port
    "http://backend:8000", # Backend Docker port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/spaces")
async def list_spaces():
    # temporary mock data; later this comes from DB
    return [
        {
            "id": "private-office-kl-1",
            "name": "Private Office – KL Eco City",
            "type": "Private Office",
            "capacity": "4–6 pax",
            "price": "From RM1,800 / month",
        },
        {
            "id": "hot-desk-bangsar-1",
            "name": "Hot Desk – Bangsar South",
            "type": "Hot Desk",
            "capacity": "1 pax",
            "price": "From RM35 / day",
        },
    ]
