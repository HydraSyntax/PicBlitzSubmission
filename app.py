import base64
import random
import flask
from flask import Flask, jsonify, session
import openai

# Inits
app = Flask(__name__)
app.secret_key = "secret"
secret = "API_Key"

# Setting up API
openai.api_key = secret
openai.Model.list()


# Keywords for user to guess

@app.route('/')
def main():
    # Show game
    return flask.render_template("main.html")


# Returns image based on keywords
@app.route("/get-image")
def get_image():
    keywords = []
    prompt = "clear picture of "
    # Get keywords from file
    oneFile = open("words/one.txt").read().splitlines()
    one = random.choice(oneFile)
    twoFile = open("words/two.txt").read().splitlines()
    two = random.choice(twoFile)
    threeFile = open("words/three.txt").read().splitlines()
    three = random.choice(threeFile)

    keywords.append(one)
    keywords.append(two)
    keywords.append(three)
    session["keywords"] = keywords
    prompt += f"{two} {three} in {one}"
    print(prompt)

    # Create image
    res = openai.Image.create(
        prompt=prompt,
        n=1,
        size="256x256",
        response_format="b64_json"
    )
    # Get image itself
    for i in range(0, len(res["data"])):
        b64 = res["data"][i]["b64_json"]
        filename = f'image.png'
        with open(filename, "wb") as f:
            f.write(base64.urlsafe_b64decode(b64))
    # Return image to JS
    return flask.send_file(filename, mimetype="image")


@app.route("/get-keywords")
def get_keywords():
    keywords = session.get("keywords")
    kw = jsonify(keywords)
    session["keywords"] = []
    return kw


if __name__ == '__main__':
    app.run(host="0.0.0.0")
