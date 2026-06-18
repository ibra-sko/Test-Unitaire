import mysql.connector
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a connection to the database
conn = mysql.connector.connect(
    database=os.getenv("MYSQL_DATABASE"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_ROOT_PASSWORD"),
    port=3306,
    host=os.getenv("MYSQL_HOST")
)

@app.get("/users")
async def get_users():
    cursor = conn.cursor(dictionary=True) # dictionary=True pour avoir un rendu JSON plus clair
    sql_select_Query = "select * from utilisateurs"
    cursor.execute(sql_select_Query)
    # get all records
    records = cursor.fetchall()
    print("Total number of rows in table: ", cursor.rowcount)
    # renvoyer nos données et 200 code OK
    return {'utilisateurs': records}

class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: str
    dateNaissance: str
    ville: str
    codePostal: str

@app.post("/users")
async def create_user(user: UserCreate):
    try:
        cursor = conn.cursor()
        sql_insert_query = """
        INSERT INTO utilisateurs (nom, prenom, email, date_naissance, ville, code_postal)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql_insert_query, (user.nom, user.prenom, user.email, user.dateNaissance, user.ville, user.codePostal))
        conn.commit()
        return {"message": "Utilisateur créé avec succès"}
    except mysql.connector.Error as err:
        if err.errno == 1062: # Duplicate entry
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        raise HTTPException(status_code=500, detail=str(err))
