#!/usr/bin/env python

# If you want to log something, simply print it in the request handler!

# API KEY for iwantaridenet@gmail.com
GMAPS_API_KEY = "AIzaSyBj3Cz1ShYUnODXeZH8IDll6rNq_GTFH6E"
GMAPS_SRC="http://maps.googleapis.com/maps/api/js?key=%s&sensor=true" % GMAPS_API_KEY
# TODO follow along https://developers.google.com/maps/documentation/javascript/tutorial

SALT="$JSFJF$J@NNSj4SFj2F@t5m5@5jfk@@SMSMCO"

import os, urlparse, sha
from bottle import *
from beaker.middleware import SessionMiddleware
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

def get_session():
    return request.environ.get('beaker.session')

def clear_session():
    s = get_session()
    del s['email']
    del s['uid']
    s.save()
    return s

def update_session(email, uid):
    s = get_session()
    s['email'] = email
    s['uid'] = uid
    s.save()
    return s

def session_dict(**kwargs):
    d = { "session": get_session() }
    d.update(kwargs)
    return d

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
    return session_dict(text = "Where are you headed?")

@route("/login")
@view("login")
def login():
    return session_dict()

@route("/verify_login", method="POST")
def verify_login():
    email = request.forms.get('email')
    password = request.forms.get('password')
    pwhash = hash_password(password)

    if len(email) == 0 or len(password) == 0:
        return template("login", session_dict(error = "Fill in all the fields, thanks."))

    uid = find_user(email, pwhash)
    if uid is None:
        return template("login", session_dict(error = "We couldn't log you in with those credentials."))
    else:
        update_session(email, uid)
        return template("main", session_dict(success = "Thanks for logging in.", text = "Where are you headed?"))

@route("/signup")
@view("signup")
def signup():
    return session_dict()

@route("/verify_signup", method="POST")
def verify_signup():
    email = request.forms.get('email')
    password = request.forms.get('password')
    password_again = request.forms.get('password_again')

    if len(email) == 0 or len(password) == 0 or len(password_again) == 0:
        return template("signup", session_dict(error = "Fill in all the fields, thanks."))
    elif password != password_again:
        return template("signup", session_dict(error ="Your passwords don't match."))
    
    pwhash = hash_password(password)
    uid = add_user(email, pwhash)
    if uid:
        update_session(email, uid)
        return template("main", session_dict(success = "Thanks for signing up.", text = "Where are you headed?"))
    else:
        return template("signup", session_dict(error = "That email is already registered."))

@route("/logout", method="GET")
def logout():
    clear_session()
    return template("main", session_dict(info = "Come back soon.", text = "Where are you headed?"))

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

    session_opts = {
        'session.type': 'file',
        'session.cookie_expires': 300,
        'session.data_dir': './data',
        'session.auto': True
    }
    app = SessionMiddleware(default_app(), session_opts)

    port = int(os.environ.get("PORT", 5000))
    run(host='0.0.0.0', port=port, app=app)
