'''
This file is used by gunicorn on the server, its needed to run the app.
'''
from main import app
import sys

sys.path.insert(0,"/var/www/edurell/")

print (sys.version)
print (sys.path)
print ("Start")

if __name__ == "__main__":
        app.run()