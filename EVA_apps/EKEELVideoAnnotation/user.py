from flask_login import UserMixin
from config import login
from db_mongo import users


class User(UserMixin):
    def __init__(self, email):
        self.email = email
        u = users.find_one({"email": email})

        self.name = u["name"]
        self.surname = u["surname"]
        self.complete_name = u["name"] + " " + u["surname"]
        self.mongodb_id = str(u["_id"])

    def get_id(self):
        return self.email

    @login.user_loader
    def load_user(email):
        u = users.find_one({"email": email})
        if not u:
            return None
        return User(email=u['email'])
