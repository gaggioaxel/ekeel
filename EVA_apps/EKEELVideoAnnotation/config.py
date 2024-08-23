from audio import WHISPER_MODEL

from flask import Flask
from flask_bootstrap import Bootstrap
from flask_login import LoginManager
from environment import APP_SECRET_KEY,APP_SECURITY_PASSWORD_SALT


class ReverseProxied(object):

    def __init__(self, app, script_name=None, scheme=None, server=None):
        self.app = app
        self.script_name = script_name
        self.scheme = scheme
        self.server = server

    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_SCRIPT_NAME', '') or self.script_name
        if script_name:
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]
        scheme = environ.get('HTTP_X_SCHEME', '') or self.scheme
        if scheme:
            environ['wsgi.url_scheme'] = scheme
        server = environ.get('HTTP_X_FORWARDED_SERVER', '') or self.server
        if server:
            environ['HTTP_HOST'] = server
        return self.app(environ, start_response)

app = Flask(__name__)
app.wsgi_app = ReverseProxied(app.wsgi_app, script_name='/annotator')
Bootstrap(app)
app.config['SECRET_KEY'] = APP_SECRET_KEY
app.config['SECURITY_PASSWORD_SALT'] = APP_SECURITY_PASSWORD_SALT
app.config['APPLICATION_ROOT'] = '/annotator'
login = LoginManager(app)
login.login_view = 'login'