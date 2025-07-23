from flask import Blueprint, render_template, request, jsonify
from flask_login import current_user
from .models import User, Time
from . import db

views = Blueprint("views", __name__)


@views.route("/")
@views.route("/timer")
def timer():
    return render_template("timer.html", user=current_user)


@views.route("/times", methods=["POST", "GET", "DELETE"])
def times():
    if request.method == "POST":
        data = request.get_json()
        new_time = Time(
            timestamp=data["timestamp"], value=data["value"], user_id=current_user.id)
        db.session.add(new_time)
        db.session.commit()
        print("added new time")
        return "", 204
    elif request.method == "DELETE":
        data = request.get_json()
        print(data)
        time_entry = Time.query.filter_by(timestamp=data["timestamp"]).first()
        if time_entry:
            db.session.delete(time_entry)
            db.session.commit()
            print("deleted time")
            return "", 204
    else:
        times_list = []
        if current_user.is_authenticated:
            for time in current_user.times:
                times_list.append(
                    {"timestamp": time.timestamp, "value": time.value})
            return jsonify(times_list), 200
        else:
            return jsonify({"error": "User not found"}), 404


@views.route("/check-auth")
def check_auth():
    if current_user.is_authenticated:
        return jsonify({"authenticated": True}), 200
    return jsonify({"authenticated": False}), 200
