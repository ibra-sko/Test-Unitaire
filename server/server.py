import mysql.connector
import os
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import jwt
from passlib.context import CryptContext
from typing import Optional

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

SECRET_KEY = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", "default-secret-key"))
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db_connection():
    return mysql.connector.connect(
        database=os.getenv("MYSQL_DATABASE"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD", os.getenv("MYSQL_ROOT_PASSWORD")),
        port=3306,
        host=os.getenv("MYSQL_HOST")
    )

conn = get_db_connection()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@app.on_event("startup")
async def startup_event():
    # Initialisation de l'administrateur UNIQUEMENT depuis les variables d'environnement
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    try:
        conn.ping(reconnect=True, attempts=3, delay=2)
        cursor = conn.cursor()
        # Créer la table si elle n'existe pas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        """)
        
        # S'assurer que les identifiants ont bien été fournis via l'environnement
        if admin_email and admin_password:
            # Vérifier si l'admin existe déjà
            cursor.execute("SELECT id FROM admins WHERE email = %s", (admin_email,))
            if not cursor.fetchone():
                hashed_pw = get_password_hash(admin_password)
                cursor.execute("INSERT INTO admins (email, password) VALUES (%s, %s)", (admin_email, hashed_pw))
                conn.commit()
                print(f"Administrateur {admin_email} initialisé avec succès.")
    except Exception as e:
        print("Erreur lors de l'initialisation de l'administrateur :", e)

def get_current_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except jwt.PyJWTError:
        return None

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(req: LoginRequest):
    try:
        conn.ping(reconnect=True, attempts=1, delay=0)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM admins WHERE email = %s", (req.email,))
        admin = cursor.fetchone()
        
        if not admin or not verify_password(req.password, admin['password']):
            raise HTTPException(status_code=401, detail="Identifiants incorrects")
            
        token = jwt.encode({"sub": admin['email']}, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))

@app.get("/users")
async def get_users(admin_email: Optional[str] = Depends(get_current_admin)):
    try:
        conn.ping(reconnect=True, attempts=1, delay=0)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM utilisateurs")
        records = cursor.fetchall()
        
        if admin_email:
            # L'admin voit tout
            return {'utilisateurs': records}
        else:
            # Le public ne voit que des infos réduites
            reduced_records = [
                {"id": r["id"], "nom": r["nom"], "prenom": r["prenom"], "ville": r["ville"]}
                for r in records
            ]
            return {'utilisateurs': reduced_records}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))

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
        conn.ping(reconnect=True, attempts=1, delay=0)
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

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, admin_email: Optional[str] = Depends(get_current_admin)):
    if not admin_email:
        raise HTTPException(status_code=401, detail="Non autorisé. Token admin requis.")
        
    try:
        conn.ping(reconnect=True, attempts=1, delay=0)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM utilisateurs WHERE id = %s", (user_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        return {"message": "Utilisateur supprimé avec succès"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
