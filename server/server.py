import mysql.connector
import os
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import jwt
from passlib.context import CryptContext
from typing import Optional

# Charger les variables d'environnement depuis le fichier .env (en local).
# Sur Vercel, les variables viennent du dashboard.
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
    """Ouvre une nouvelle connexion MySQL.

    En environnement serverless (Vercel) on ouvre/ferme une connexion par
    requête plutôt que de garder une connexion globale, qui serait coupée
    entre deux invocations.
    """
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        database=os.getenv("MYSQL_DATABASE"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD", os.getenv("MYSQL_ROOT_PASSWORD")),
        # Aiven impose SSL (ssl-mode=REQUIRED). On active TLS sans vérifier
        # le certificat CA (chiffrement requis, pas de VERIFY_CA).
        ssl_disabled=False,
    )


def get_db():
    """Dépendance FastAPI : fournit une connexion et la ferme après la requête."""
    conn = get_db_connection()
    try:
        yield conn
    finally:
        try:
            conn.close()
        except Exception:
            pass


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def ensure_admin(conn):
    """Crée la table admins et l'administrateur si nécessaire.

    Remplace l'ancien @app.on_event("startup") qui ne s'exécute pas de
    manière fiable sur Vercel. Idempotent (CREATE TABLE IF NOT EXISTS).
    """
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )
        """
    )

    if admin_email and admin_password:
        cursor.execute("SELECT id FROM admins WHERE email = %s", (admin_email,))
        if not cursor.fetchone():
            hashed_pw = get_password_hash(admin_password)
            cursor.execute(
                "INSERT INTO admins (email, password) VALUES (%s, %s)",
                (admin_email, hashed_pw),
            )
            conn.commit()


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


@app.get("/")
async def root():
    return {"status": "ok"}


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/login")
async def login(req: LoginRequest, conn=Depends(get_db)):
    try:
        ensure_admin(conn)
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
async def get_users(admin_email: Optional[str] = Depends(get_current_admin), conn=Depends(get_db)):
    try:
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
async def create_user(user: UserCreate, conn=Depends(get_db)):
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
        if err.errno == 1062:  # Duplicate entry
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        raise HTTPException(status_code=500, detail=str(err))


@app.delete("/users/{user_id}")
async def delete_user(user_id: int, admin_email: Optional[str] = Depends(get_current_admin), conn=Depends(get_db)):
    if not admin_email:
        raise HTTPException(status_code=401, detail="Non autorisé. Token admin requis.")

    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM utilisateurs WHERE id = %s", (user_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        return {"message": "Utilisateur supprimé avec succès"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
