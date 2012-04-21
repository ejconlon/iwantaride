#!/usr/bin/env python

# If you want to log something, simply print it in the request handler!

# API KEY for iwantaridenet@gmail.com
GMAPS_API_KEY = "AIzaSyBj3Cz1ShYUnODXeZH8IDll6rNq_GTFH6E"
GMAPS_SRC="http://maps.googleapis.com/maps/api/js?key=%s&sensor=true" % GMAPS_API_KEY
# TODO follow along https://developers.google.com/maps/documentation/javascript/tutorial

SALT="$JSFJF$J@NNSj4SFj2F@t5m5@5jfk@@SMSMCO"

DEFAULT_LAT = '36.9742';
DEFAULT_LON = '-122.0297';


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

def add_login_to_session(email, uid):
    s = get_session()
    s['email'] = email
    s['uid'] = uid
    s.save()
    return s

def add_lat_lon_to_session():
    lat = request.forms.get('lat')
    lon = request.forms.get('lon')
    if lat is None or lon is None or len(lat) == 0 or len(lon) == 0:
        print "Missing lat/lon - setting default"
	lat = DEFAULT_LAT
	lon = DEFAULT_LON
    else:
        print "Setting lat/lon (%s, %s)" % (lat, lon)
    s = get_session()
    s['lat'] = lat
    s['lon'] = lon
    s.save()
    return s

def update_session(**kwargs):
    s = get_session()
    s.update(kwargs)
    s.save()
    return s

def session_dict(**kwargs):
    s = get_session()
    for x in ["error", "warning", "info", "success"]:
        if x in kwargs:
            s[x] = kwargs[x]
            del kwargs[x]
    d = { "session" : s }
    d.update(kwargs)
    return d

def get_lat_lon():
    s = get_session()
    if 'lat' in s and 'lon' in s:
        return s['lat'], s['lon']
    else:
        return DEFAULT_LAT, DEFAULT_LON

def get_ride_list(lat, lon):
    return ["ride 1", "ride 2"]

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
@view("flow")
def landing_page():
    return session_dict()

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
        update_session(error = "Fill in all the fields, thanks.")
        return redirect("/login")

    uid = find_user(email, pwhash)
    if uid is None:
        update_session(error = "We couldn't log you in with those credentials.")
        return redirect("/login")
    else:
        add_login_to_session(email, uid)
        add_lat_lon_to_session()
        update_session(success = "Thanks for logging in.")
        return redirect("/")

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
        update_session(error = "Fill in all the fields, thanks.")
        return redirect("/signup")
    elif password != password_again:
        update_session(error = "Your passwords don't match.")
        return redirect("/signup")
    
    pwhash = hash_password(password)
    uid = add_user(email, pwhash)
    if uid:
        add_login_to_session(email, uid)
        add_lat_lon_to_session()
        update_session(success = "Thanks for signing up.")
        return redirect("/")
    else:
        update_session(error = "That email is already registered.")
        return redirect("/signup")

@route("/logout", method="GET")
def logout():
    clear_session()
    update_session(info = "Come back soon.")
    return redirect("/")

@route("/make/:haveorwant")
@view("make")
def make(haveorwant):
    return session_dict(haveorwant=haveorwant)

@route("/verify_make", method="POST")
def verify_make():
    abort(404, "NOT IMPLEMENTED")

@route("/rides")
@view("rides")
def rides():
    lat, lon = get_lat_lon()
    ride_list = get_ride_list(lat, lon)
    return session_dict(ride_list=ride_list)

@route("/about")
@view("about")
def about():
    return session_dict()

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
    debug_flag = bool(os.environ.get("DEBUG", False))
    if debug_flag:
        debug(True)
    run(host='0.0.0.0', port=port, app=app)
