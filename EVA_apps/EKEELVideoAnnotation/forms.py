from flask_wtf import FlaskForm
from wtforms import Form, BooleanField, TextField, SubmitField, StringField, PasswordField, RadioField, SelectMultipleField, widgets, SelectField
from wtforms.validators import InputRequired, Email, EqualTo, ValidationError, Length
from sendmail import send_confirmation_mail_with_link
import bcrypt
import db_mongo


class addVideoForm(FlaskForm):
    url = TextField('Url', validators=[InputRequired()])
    submit = SubmitField('Start annotate')


class BurstForm(FlaskForm):
    url = TextField('Url', validators=[InputRequired()])
    type = RadioField('video', choices=[("semi","semi-automatic"), ("auto","automatic")])


class ForgotForm(FlaskForm):
    email = StringField('Email', validators=[InputRequired(), Email('Email not correct')])
    submit = SubmitField('Send mail')


class PasswordResetForm(FlaskForm):

    password = PasswordField('Password', validators=[InputRequired(), Length(min=8)])
    password2 = PasswordField('Confirm Password', validators=[InputRequired(), EqualTo('password', message = "Passwords must match")])
    submit = SubmitField('Reset password')


class ConfirmCodeForm(FlaskForm):
    code = StringField("Insert the code received by email", validators=[InputRequired()])
    submit = SubmitField('Reset password')

class RegisterForm(FlaskForm):
    name = StringField('First name', validators=[InputRequired()])
    surname = StringField('Last name', validators=[InputRequired()])
    email = StringField('Email', validators=[InputRequired(), Email('Email not correct')])
    password = PasswordField('Password', validators=[InputRequired(), Length(min=8)])
    password2 = PasswordField('Confirm Password', validators=[InputRequired(), EqualTo('password', message = "Passwords must match")])
    submit = SubmitField('Register')

    def validate_email(self, email):

        if db_mongo.unverified_users.find_one({"email":email.data}):
            raise ValidationError('There is an unverified account already registered under this email')
        elif db_mongo.users.find_one({"email":email.data}):
            raise ValidationError('There is already an account registered under this email')


class LoginForm(FlaskForm):

    email = StringField('Email', validators=[InputRequired()])
    password = PasswordField('Password', validators=[InputRequired()])
    remember_me = BooleanField('Remember Me')

    submit = SubmitField('Login')

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)

    def validate(self):
        initial_validation = super(LoginForm, self).validate()
        if not initial_validation:
            return False

        #users = db_mongo.users

        user = db_mongo.db.students.find_one({"email": self.email.data})

        if user:
            password = user["password_hash"]
            if bcrypt.checkpw(self.password.data.encode('utf-8'), password.encode('utf-8')):
                # if not user['email_confirmed']:
                #     send_confirmation_mail(self.email.data)
                #     self.email.errors.append("An email has been sent to your address in order to verify it")
                #     return False

                return True
            else:
                self.email.errors.append("Email or password incorrect")

        elif db_mongo.unverified_users.find_one({"email": self.email.data}):

            send_confirmation_mail_with_link(self.email.data)
            self.email.errors.append("An email has been sent to your address in order to verify it")
            return False

        else:
            self.email.errors.append("Email or password incorrect")

        return False


class analysisForm(FlaskForm):
    video = RadioField('video', choices = [])
    annotator = RadioField('annotators', choices = [])


class MultiCheckboxField(SelectMultipleField):
    widget = widgets.ListWidget(prefix_label=False)
    option_widget = widgets.CheckboxInput()


class NonValidatingSelectField(SelectField):
    """ Selection field that must not be validated """
    def pre_validate(self, form):
        pass

class GoldStandardForm(FlaskForm):
    """ Form for the selection of the annotations to use for the creation of the gold standard"""
    video = RadioField('Video', choices = [])
    annotators = MultiCheckboxField('Annotators', choices=[], validators=[InputRequired()])
    agreements = NonValidatingSelectField('Combination criteria', choices = [])
    name = StringField("Gold Name", validators=[InputRequired()])
    submit = SubmitField('Launch Creation')

