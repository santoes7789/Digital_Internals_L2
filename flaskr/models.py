from . import db
from flask_login import UserMixin


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    username = db.Column(db.String(150))
    password = db.Column(db.String(150))
    times = db.relationship('Time')


class Time(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Integer)
    value = db.Column(db.Integer)
    session = db.Column(db.String(150))
    modifiers = db.Column(db.String(150))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
