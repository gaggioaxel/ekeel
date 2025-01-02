"""
Loads private data environment

Raises
------
Exception: if missing env file
"""


from dotenv import load_dotenv
import os
from pathlib import Path

env_file = Path(__file__).parent.parent.joinpath("sharedSecrets").joinpath("secrets.env")

if not env_file.exists():
    print(env_file)
    raise Exception(f"Missing .env file in EVA_apps directory, add it or ask to the supervisor of the project")

load_dotenv(env_file)

MONGO_CLUSTER_USERNAME = os.getenv("MONGO_CLUSTER_USERNAME")
MONGO_CLUSTER_PASSWORD = os.getenv("MONGO_CLUSTER_PASSWORD")
EMAIL_ACCOUNT = os.getenv("EMAIL_ACCOUNT")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY")
APP_SECURITY_PASSWORD_SALT = os.getenv("APP_SECURITY_PASSWORD_SALT")
