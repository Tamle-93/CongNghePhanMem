from flask import request, jsonify

def login():
    data = request.json
    # TODO: Gọi Service để check password
    return jsonify({"message": "Login logic here", "token": "fake-jwt-token"}), 200

def register():
    data = request.json
    return jsonify({"message": "Register logic here"}), 201
