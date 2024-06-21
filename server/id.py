from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS #type: ignore
import pandas as pd #type: ignore
import random

import base64   
from Crypto.Cipher import AES #type: ignore
from Crypto.Util.Padding import unpad # type: ignore


# KEY = b'aaaaaaaaaaaaaaaa'

# def decrypt(encrypted_data, key=KEY):
#     encrypted_data = base64.b64decode(encrypted_data)

#     iv = encrypted_data[:AES.block_size]

#     cipher = AES.new(key, AES.MODE_CBC, iv)
    
#     decrypted_data = unpad(cipher.decrypt(encrypted_data[AES.block_size:]), AES.block_size)

#     return decrypted_data.decode('utf-8')

app = Flask(__name__)
CORS(app)

def decrypt(encrypted):
    secret_key = b"1234567890123456"
    iv = b"1234567890123456"
    encrypted_bytes = base64.b64decode(encrypted)
    cipher = AES.new(secret_key, AES.MODE_CBC, iv)
    decrypted_bytes = unpad(cipher.decrypt(encrypted_bytes), AES.block_size)

    decrypted = decrypted_bytes.decode('utf-8')
    return decrypted



@app.route('/generateID', methods=['POST'])
def generateID():
    flag = False
    userData = request.get_json()

    username = userData.get('UserName')
    password = decrypt(userData.get('Password'))

    df = pd.read_excel('database.xlsx')

    match = df[(df["Username"] == username) & (df['Password'] == password)]

    if match.empty:
        return jsonify({"result": "INVALID ENTRY"})
    else:
        l = 'QWERTYUIOPASDGHJKLZXCVBNM0123456789'
        accessID = ""
        for i in range(16):
            c = random.randint(0, len(l) - 1)
            accessID += l[c]

        new_data = {"Username": [username], "Access Token": [accessID]}
        df_new = pd.DataFrame(new_data)

        df_existing = pd.read_excel('./Access Token Database.xlsx')

        df_combined = pd.concat([df_existing, df_new], ignore_index=True)

        df_combined.to_excel("./Access Token Database.xlsx", index=False)

        return jsonify({'result': accessID})

@app.route('/validateID', methods=["POST"])
def validateID():
    idDetails = request.get_json()
    df = pd.read_excel('./Access Token Database.xlsx')
    match = df[(df["Username"] == idDetails.get('Username')) & (df['Access Token'] == idDetails.get('Access Token'))]
    if (match.empty):
        return jsonify({'result': 0})
    else:
        return jsonify({'result': 1})


@app.route('/logOut', methods=["POST"])
def deleteToken():
    tokenDetails = request.get_json()
    access_token = tokenDetails.get('Access Token')
    
    df = pd.read_excel('./Access Token Database.xlsx')
    initial_rows = len(df)
    
    df = df[df['Access Token'] != access_token]
    
    
    df.to_excel("./Access Token Database.xlsx", index=False)
    return jsonify({'result': 'Access Token Deleted'})
if __name__ == '__main__':
    app.run(debug=True, port=5001)   