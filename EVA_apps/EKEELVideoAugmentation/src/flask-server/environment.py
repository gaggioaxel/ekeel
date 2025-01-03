"""
Environment configuration module.

This module loads environment variables from a `.env` file and provides access to these variables.

Attributes
----------
MONGO_CLUSTER_USERNAME : str
    Username for the MongoDB cluster.
MONGO_CLUSTER_PASSWORD : str
    Password for the MongoDB cluster.
EMAIL_ACCOUNT : str
    Email account used for sending emails.
EMAIL_PASSWORD : str
    Password for the email account.
APP_SECRET_KEY : str
    Secret key used for application security.
APP_SECURITY_PASSWORD_SALT : str
    Salt used for password hashing.

Raises
------
Exception
    If the `.env` file is missing in the EVA_apps directory.
"""
from dotenv import load_dotenv
import os
from pathlib import Path

if not load_dotenv(Path(__file__).parent.parent.parent.parent.joinpath("sharedSecrets", "secrets.env")):
    raise Exception(f"Missing .env file in EVA_apps directory, add it or ask to the supervisor of the project")

MONGO_CLUSTER_USERNAME = os.getenv("MONGO_CLUSTER_USERNAME")
MONGO_CLUSTER_PASSWORD = os.getenv("MONGO_CLUSTER_PASSWORD")
EMAIL_ACCOUNT = os.getenv("EMAIL_ACCOUNT")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY")
APP_SECURITY_PASSWORD_SALT = os.getenv("APP_SECURITY_PASSWORD_SALT")
