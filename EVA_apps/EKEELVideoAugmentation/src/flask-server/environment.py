from dotenv import load_dotenv
import os


if not load_dotenv(os.path.join(os.path.abspath(os.path.join(os.path.abspath(__file__), os.pardir,os.pardir, os.pardir, os.pardir)),"secrets.env")):
    raise Exception(f"Missing .env file in EVA_apps directory, add it or ask to the supervisor of the project")

MONGO_CLUSTER_USERNAME = os.getenv("MONGO_CLUSTER_USERNAME")
MONGO_CLUSTER_PASSWORD = os.getenv("MONGO_CLUSTER_PASSWORD")
EMAIL_ACCOUNT = os.getenv("EMAIL_ACCOUNT")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY")
APP_SECURITY_PASSWORD_SALT = os.getenv("APP_SECURITY_PASSWORD_SALT")
