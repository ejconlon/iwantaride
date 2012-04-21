#!/usr/bin/env python

# If you want to log something, simply print it in the request handler!

# API KEY for iwantaridenet@gmail.com
GMAPS_API_KEY = "AIzaSyBj3Cz1ShYUnODXeZH8IDll6rNq_GTFH6E"
GMAPS_SRC="http://maps.googleapis.com/maps/api/js?key=%s&sensor=true" % GMAPS_API_KEY
# TODO follow along https://developers.google.com/maps/documentation/javascript/tutorial

SALT="$JSFJF$J@NNSj4SFj2F@t5m5@5jfk@@SMSMCO"

import os, urlparse, sha
from bottle import *
import redis

# set in main block
REDIS = None

def hash_password(s):
    return sha.sha(s+SALT).hexdigest()

def user_exists(email):
    uid = REDIS.get('email:%s:uid' % email)
    return uid is not None

def find_user(email, pwhash):
    uid = REDIS.get('email:%s:uid' % email)
    if uid:
        stored_hash = REDIS.get('pwhash:%s' % uid)
        if stored_hash == pwhash:
            return uid
    return None

def add_user(email, pwhash):
    if user_exists(email):
        return None
    else:
        uid = REDIS.incr('global:uid_source')
        REDIS.set('email:%s:uid' % email, uid)
        REDIS.set('pwhash:%s' % uid, pwhash)
        return uid

############
# Static resource handlers
# put things in /js /img /css and reference them in view templates

@route('/js/<filename>')
def js_static(filename):
     return static_file(filename, root='./js')

@route('/img/<filename>')
def img_static(filename):
    return static_file(filename, root='./img')

@route('/favicon.ico')
def favicon_static():
    return static_file('favicon.ico', root='./img')


@route('/css/<filename>')
def img_static(filename):
    return static_file(filename, root='./css')

###########
# Main page

@route("/")
@view("main")
def landing_page():
    return dict(text = "Where are you headed?")

@route("/login")
@view("login")
def login():
    return dict()

@route("/verify_login", method="POST")
def verify_login():
    email = request.forms.get('email')
    password = request.forms.get('password')
    pwhash = hash_password(password)

    if len(email) == 0 or len(password) == 0:
        return template("login", {"error": "Fill in all the fields, thanks." })

    uid = find_user(email, pwhash)
    if uid is None:
        return template("login", {"error": "We couldn't log you in with those credentials."})
    else:
        return template("main", {"success": "Thanks for logging in.", "text": "Where are you headed?"})

@route("/signup")
@view("signup")
def signup():
    return dict()

@route("/verify_signup", method="POST")
def verify_signup():
    email = request.forms.get('email')
    password = request.forms.get('password')
    password_again = request.forms.get('password_again')

    if len(email) == 0 or len(password) == 0 or len(password_again) == 0:
        return template("signup", {"error": "Fill in all the fields, thanks." })
    elif password != password_again:
        return template("signup", {"error": "Your passwords don't match."})
    
    pwhash = hash_password(password)
    uid = add_user(email, pwhash)
    if uid:
        return template("main", {"success": "Thanks for signing up.", "text": "Where are you headed?"})
    else:
        return template("signup", {"error": "That email is already registered."})
    

###########
# Dump db info

def render_row(row):
    if row:
        return template('dump', row=row)
    return HTTPError(404, "Page not found")    

@route("/db/get/:item")
def db_get(item):
    return render_row(REDIS.get(item))

@route("/db/set/:item/:value")
def db_set(item, value):
    return render_row(REDIS.set(item, value))

@route("/db/hash/:item")
def db_hash(item):
    return render_row(hash_password(item))

if __name__ == "__main__":
    if os.environ.has_key('REDISTOGO_URL'):
        urlparse.uses_netloc.append('redis')
        url = urlparse.urlparse(os.environ['REDISTOGO_URL'])
        REDIS = redis.Redis(host=url.hostname, port=url.port, db=0, password=url.password)
    else:
        redis_host = os.environ.get("REDIS_HOST", "localhost")
        REDIS = redis.Redis(host=redis_host)

    port = int(os.environ.get("PORT", 5000))
    run(host='0.0.0.0', port=port)
