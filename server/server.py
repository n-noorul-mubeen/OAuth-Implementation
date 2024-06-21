from flask import Flask, request, jsonify, send_from_directory, redirect, url_for
from flask_cors import CORS
import requests
# import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def GetAccessToken(username, password):
    userData = {"UserName":username,"Password": password}
    response = requests.post('http://localhost:5001/generateID', json=userData)
    if response.status_code==200:
        return response.json()
    else:
        return "Error: Unable to get response from ID Server", 500

def validate(username, accessToken):
    tokenInfo = {"Username": username, "Access Token": accessToken}
    response = requests.post('http://localhost:5001/validateID', json=tokenInfo)
    if response.status_code == 200:
        return response.json()
    else:
        return "Error: Unable to get response from ID Server", 500
    
def remove(AccessToken):
    token = {"Access Token": AccessToken}
    response = requests.post('http://localhost:5001/logOut', json=token)
    if response.status_code == 200:
        return response.json()
    else:
        return "Error: Unable to get response from ID Server", 500

@app.route('/generate', methods=["POST"])
def generate():
    data = request.get_json()
    UserName = data.get('Username')
    Password = data.get('Password')
    return GetAccessToken(UserName, Password)

@app.route('/valid', methods=["POST"])
def valid():
    data2 = request.get_json()
    UserName = data2.get('Username')
    AccessToken = request.headers.get('Accesstoken')
    return validate(UserName, AccessToken)


@app.route('/log-out', methods=["POST"])
def logOut():
    AccessToken = request.headers.get('Accesstoken')
    return remove(AccessToken)
# @app.route('/registration.html')
# def registration():
#     token = request.headers.get('Access Token')
#     if token and validate(request.args.get('username'), token)['result'] == 'Access Token Verified':
#         return send_from_directory('templates', 'registration.html')
#     return redirect(url_for('index'))

# @app.route('/')
# def index():
#     return send_from_directory('public', 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)