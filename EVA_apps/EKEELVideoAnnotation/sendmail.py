import smtplib
from flask import render_template, url_for

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from itsdangerous import URLSafeTimedSerializer

from config import app
from environment import EMAIL_ACCOUNT, EMAIL_PASSWORD

class MailSender:
    """
    Contains email contents, connection settings and recipient settings. Has functions to compose and send mail. MailSenders are tied to an SMTP server, which must be specified when the instance is created. The default SMTP server is Google's Gmail server, with a connection over TLS.

    :param in_username: Username for mail server login (required)
    :param in_password: Password for mail server login (required)
    :param in_server: SMTP server to connect to (default is Gmail)
    :param use_SSL: Select whether to connect over SSL (True) or TLS (False) (default is TLS). Keep in mind that SMTP servers use different ports for SSL and TLS.

    """
    def __init__(self, in_username, in_password, in_server=("smtp.gmail.com", 587), use_SSL=False):
        self.username = in_username
        self.password = in_password
        self.server_name = in_server[0]
        self.server_port = in_server[1]
        self.use_SSL = use_SSL

        if self.use_SSL:
            self.smtpserver = smtplib.SMTP_SSL(self.server_name, self.server_port)
        else:
            self.smtpserver = smtplib.SMTP(self.server_name, self.server_port)
        self.connected = False
        self.recipients = []

    def __str__(self):
        return "Type: Mail Sender \n" \
               "Connection to server {}, port {} \n" \
               "Connected: {} \n" \
               "Username: {}, Password: {}".format(self.server_name, self.server_port, self.connected, self.username, self.password)

    def set_message(self, in_plaintext, in_subject="", in_from=None, in_htmltext=None):
        """
        Creates the MIME message to be sent by e-mail. Optionally allows adding subject and 'from' field. Sets up empty recipient fields. To use html messages specify an htmltext input

        :param in_plaintext: Plaintext email body (required even when HTML message is specified, as fallback)
        :param in_subject: Subject line (optional)
        :param in_from: Sender address (optional, whether this setting is copied by the SMTP server depends on the server's settings)
        :param in_htmltext: HTML version of the email body (optional) (If you want to use an HTML message but set it later, pass an empty string here)
        """

        if in_htmltext is not None:
            self.html_ready = True
        else:
            self.html_ready = False

        if self.html_ready:
            self.msg = MIMEMultipart('alternative')  # 'alternative' allows attaching an html version of the message later
            self.msg.attach(MIMEText(in_plaintext, 'plain'))
            self.msg.attach(MIMEText(in_htmltext, 'html'))
        else:
            self.msg = MIMEText(in_plaintext, 'plain')

        self.msg['Subject'] = in_subject
        if in_from is None:
            self.msg['From'] = self.username
        else:
            self.msg['From'] = in_from
        self.msg["To"] = None
        self.msg["CC"] = None
        self.msg["BCC"] = None

    def clear_message(self):
        """
        Remove the whole email body. If both plaintext and html are attached both are removed
        """
        self.msg.set_payload("")

    def set_subject(self, in_subject):
        self.msg.replace_header("Subject", in_subject)

    def set_from(self, in_from):
        self.msg.replace_header("From", in_from)

    def set_plaintext(self, in_body_text):
        """
        Set plaintext message: replaces entire payload if no html is used, otherwise replaces the plaintext only

        :param in_body_text: Plaintext email body, replaces old plaintext email body
        """
        if not self.html_ready:
            self.msg.set_payload(in_body_text)
        else:
            payload = self.msg.get_payload()
            payload[0] = MIMEText(in_body_text)
            self.msg.set_payload(payload)

    def set_html(self, in_html):
        """
        Replace HTML version of the email body. The plaintext version is unaffected.

        :param in_html: HTML email body, replaces old HTML email body
        """
        try:
            payload = self.msg.get_payload()
            payload[1] = MIMEText(in_html, 'html')
            self.msg.set_payload(payload)
        except TypeError:
            print("ERROR: "
                  "Payload is not a list. Specify an HTML message with in_htmltext in MailSender.set_message()")
            raise

    def set_recipients(self, in_recipients):
        """
        Sets the list of recipients' email addresses. This is used by the email sending functions.

        :param in_recipients: All recipients to whom the email should be sent (Must be a list, even when there is only one recipient)
        """
        if not isinstance(in_recipients, (list, tuple)):
            raise TypeError("Recipients must be a list or tuple, is {}".format(type(in_recipients)))

        self.recipients = in_recipients

    def add_recipient(self, in_recipient):
        """Adds a recipient to the back of the list

        :param in_recipient: Recipient email addresses
        """
        self.recipients.append(in_recipient)

    def connect(self):
        """
        Must be called before sending messages. Connects to SMTP server using the username and password.
        """
        if not self.use_SSL:
            self.smtpserver.starttls()
        self.smtpserver.login(self.username, self.password)
        self.connected = True
        print("Connected to {}".format(self.server_name))

    def disconnect(self):
        self.smtpserver.close()
        self.connected = False

    def send_all(self, close_connection=True):
        """Sends message to all specified recipients, one at a time. Optionally closes connection after sending. Close the connection after sending if you are not sending another batch of emails immediately after.

        :param close_connection: Should the connection to the server be closed after all emails have been sent (True) or not (False)
         """
        if not self.connected:
            raise ConnectionError("Not connected to any server. Try self.connect() first")

        print("Message: {}".format(self.msg.get_payload()))

        for recipient in self.recipients:
                self.msg.replace_header("To", recipient)
                print("Sending to {}".format(recipient))
                self.smtpserver.send_message(self.msg)

        print("All messages sent")

        if close_connection:
            self.disconnect()
            print("Connection closed")


def send_mail(To, subject, html):

    ourmailsender = MailSender(EMAIL_ACCOUNT, EMAIL_PASSWORD, ('smtp.gmail.com', 587))
    
    ourmailsender.set_message("edurell", subject, "EKEEL Annotations", html)

    ourmailsender.set_recipients([To])

    ourmailsender.connect()
    ourmailsender.send_all()


def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, app.config['SECURITY_PASSWORD_SALT'])


def confirm_token(token, expiration=5600):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=app.config['SECURITY_PASSWORD_SALT'],
            max_age=expiration
        )
    except:
        return False
    return email


def send_confirmation_mail_with_link(email):

    token = generate_confirmation_token(email)
    confirm_url = url_for('confirm_email', token=token, _external=True)
    html = render_template('user/user_activate_mail_with_link.html', confirm_url=confirm_url)
    subject = "Please confirm your email"

    send_mail(email, subject, html)


def send_confirmation_mail(email, code):

    html = render_template('user/user_activate_mail.html', code=code)
    subject = "Please confirm your email"

    send_mail(email, subject, html)

if __name__ == "__main__":
    # plaintext = "Welcome to edurell, \n" \
    #             "Prova.\n"
    #
    # html = "<h1> Ciao! </h1>"
    #
    # ourmailsender = MailSender('educationalRelationsLearning@gmail.com', 'qyzlabajrvwxlbfs', ('smtp.gmail.com', 587))
    # ourmailsender.set_message(plaintext, "This is a test", "EKEEL Annotations", html)
    #
    print(token)
