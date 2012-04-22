#!/usr/bin/env python

# If you want to log something, simply print it in the request handler!

# API KEY for iwantaridenet@gmail.com
GMAPS_API_KEY = "AIzaSyBj3Cz1ShYUnODXeZH8IDll6rNq_GTFH6E"
GMAPS_SRC="http://maps.googleapis.com/maps/api/js?key=%s&sensor=true" % GMAPS_API_KEY
# TODO follow along https://developers.google.com/maps/documentation/javascript/tutorial

SALT="$JSFJF$J@NNSj4SFj2F@t5m5@5jfk@@SMSMCO"

DEFAULT_LAT = '36.9742';
DEFAULT_LON = '-122.0297';

RIDE_KEYS = ['uid', 'from_lat', 'to_lat', 'from_lon', 'to_lon', 'from_time', 'to_time', 'wantorhave']
RESPONSE_KEYS = ['uid', 'rid', 'confirmation', 'tip', 'comment']

import os, urlparse, sha, math, urllib, json
from datetime import datetime, date, time
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

def find_user_and_name(email, pwhash):
    uid = REDIS.get('email:%s:uid' % email)
    if uid:
        stored_hash = REDIS.get('pwhash:%s' % uid)
        if stored_hash == pwhash:
            name = REDIS.get('name:%s' % uid)
            return uid, name
    return None, None

def add_user(name, email, pwhash, uid=None):
    if user_exists(email):
        return None
    else:
        if uid is None:
            uid = REDIS.incr('global:uid_source')
        REDIS.set('email:%s:uid' % email, uid)
        REDIS.set('pwhash:%s' % uid, pwhash)
        REDIS.set('name:%s' % uid, name)
        return uid

def add_ride(ride_dict, rid=None):
    if rid is None:
        rid = REDIS.incr('global:rid_source')
    for k in RIDE_KEYS:
        REDIS.set(k+":"+rid, ride_dict[k])
    return rid

def add_response(response_dict, reid=None):
    if reid is None:
        reid = REDIS.incr('global:reid_source')
    for k in RESPONSE_KEYS:
        REDIS.set(k+":"+reid, response_dict[k])
    return reid

def get_name_by_uid(uid):
    return REDIS.get('name:%s' % uid)

def rad(x):
    return 0.0174532925*float(x)

def distance(lat1, lon1, lat2, lon2):
    lat1 = rad(lat1)
    lon1 = rad(lon1)
    lat2 = rad(lat2)
    lon2 = rad(lon2)
    R = 3963.1676 # in miles
    x = (lon2-lon1) * math.cos((lat1+lat2)/2);
    y = (lat2-lat1);
    d = math.sqrt(x*x + y*y) * R;
    #print lat1, lon1, lat2, lon2, d
    return d

def days_away(t):
    ymd_string = t.split(" ")[0]
    event_time = datetime.strptime(ymd_string, "%Y-%m-%d").date()
    today = date.today()
    print today, event_time
    if today > event_time:
        return -1
    delta = event_time - today
    if delta.days < 7:
        return delta.days
    else:
        return 8

def format_time(t):
    d = days_away(t)
    if d < 0:
        return "in the past"
    if d == 0:
        return "today"
    elif d == 1:
        return "tomorrow"
    elif d < 7:
        return "%d days from now" % d
    else:
        return "in the future"

def format_ride(ride, my_from_lat, my_from_lon):
    ride['name'] = get_name_by_uid(ride['uid'])
    ride['start_dist'] = distance(ride['from_lat'], ride['from_lon'], my_from_lat, my_from_lon)
    ride['end_dist'] = distance(ride['to_lat'], ride['to_lon'], my_from_lat, my_from_lon)
    ride['formatted_from_time'] = format_time(ride['from_time'])
    ride['days_away'] = days_away(ride['from_time'])
    #ride['formatted_to_time'] = format_time(ride['to_time'])
    return ride

def get_session():
    return request.environ.get('beaker.session')

def clear_session():
    s = get_session()
    s.delete()
    s.save()
    return s

def add_login_to_session(name, email, uid):
    s = get_session()
    s['name'] = name
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

def continue_or_redirect(dest):
    s = get_session()
    if 'cont' in s:
        c = s['cont']
        del s['cont']
        s.save()
        return redirect(c)
    else:
        return redirect(dest)

def get_lat_lon():
    s = get_session()
    if 'lat' in s and 'lon' in s:
        return s['lat'], s['lon']
    else:
        return DEFAULT_LAT, DEFAULT_LON

def get_ride(rid):
    d = {'rid':rid}
    for key in RIDE_KEYS:
        d[key] = REDIS.get('%s:%s' % (key, rid))
    return d

def get_all_rides():
    rides = []
    for exkey in REDIS.keys('from_lon:*'):
        rid = exkey.split(':')[-1]
        rides.append(get_ride(rid))
    return rides

def get_ride_list(my_from_lat, my_from_lon):
    ride_list = sorted([format_ride(ride, my_from_lat, my_from_lon) for ride in get_all_rides()],
                       key=lambda d: 1000*float(d['start_dist']))[:10]
    print "Fount n rides", len(ride_list)
    return ride_list


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
def css_static(filename):
    return static_file(filename, root='./css')


###########
# Main page

@route("/")
@view("flow")
def landing_page():
    lat, lon = get_lat_lon()
    ride_list = get_ride_list(lat, lon)
    return session_dict(ride_list=ride_list)

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

    uid, name = find_user_and_name(email, pwhash)
    if uid is None:
        update_session(error = "We couldn't log you in with those credentials.")
        return redirect("/login")
    else:
        add_login_to_session(name, email, uid)
        add_lat_lon_to_session()
        update_session(success = "Thanks for logging in.")
        return continue_or_redirect("/")

@route("/signup")
@view("signup")
def signup():
    return session_dict()

@route("/verify_signup", method="POST")
def verify_signup():
    name = request.forms.get('name')
    email = request.forms.get('email')
    password = request.forms.get('password')
    password_again = request.forms.get('password_again')

    if len(email) == 0 or len(password) == 0 or len(password_again) == 0 or len(name) == 0:
        update_session(error = "Fill in all the fields, thanks.")
        return redirect("/signup")
    elif password != password_again:
        update_session(error = "Your passwords don't match.")
        return redirect("/signup")
    
    pwhash = hash_password(password)
    uid = add_user(name, email, pwhash)
    if uid:
        add_login_to_session(name, email, uid)
        add_lat_lon_to_session()
        update_session(success = "Thanks for signing up, "+name)
        return continue_or_redirect("/")
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

@route("/take/:rid")
@view("take")
def take(rid):
    if 'uid' not in get_session():
        update_session(error = "Please login to take a ride.", cont="/take/"+rid)
        return redirect("/login")
    lat, lon = get_lat_lon()
    ride = format_ride(get_ride(rid), lat, lon)
    return session_dict(ride=ride)

@route("/calendar")
@view("calendar")
def calendar():
    if 'uid' not in get_session():
        update_session(error = "Please login see your calendar.", cont="/calendar")
        return redirect("/login")
    # TODO: Fix Hardcoded URL, should come from user
    url = "http://iwantaride-locations.heroku.com/?guser_xml=https%3A%2F%2Fwww.google.com%2Fcalendar%2Ffeeds%2Fb67n04sb5i8jb6ecgagpncve7s%2540group.calendar.google.com%2Fprivate-fa13a64934ab5732e00750e6b799bee7%2Fbasic"
    cal_entries = json.loads(urllib.urlopen(url).read())
    return session_dict(cal_entries=cal_entries)


###########
# Dump db info

def render_row(row):
    if row:
        return template('dump', row=row)
    return HTTPError(404, "Page not found")    

def render_dict(d):
    if d:
        row = ""
        for k in d:
            row += k + " => "+d[k]+", \n"
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

@route("/db/drop")
def db_drop():
    print "DROPPING DATABASE!"
    return render_row(REDIS.flushdb())

@route("/db/show")
def db_show():
    keys = REDIS.keys("*")
    d = {}
    for k in keys:
        d[k] = REDIS.get(k)
    return render_dict(d)

def splitline(line):
    return [y.strip() for y in line.split(',')]

def load_lines(schema, lines):
    lines = [line.strip() for line in lines if len(line.strip())]
    field_names = splitline(lines[0])
    field_values = map(splitline, lines[1:])    
    field_dicts = [dict(zip(field_names, x)) for x in field_values]
    print field_names
    if schema == 'users':
        for user in field_dicts:
            print 'Adding user', user
            add_user(user['name'], user['email'], hash_password(user['password']), user['uid'])
    elif schema == 'rides':
        for ride in field_dicts:
            print 'Adding ride', ride
            add_ride(ride, ride['rid'])
    elif schema == 'responses':
        for response in field_dicts:
            print 'Adding response', response
            add_response(response, response['reid'])
    else:
        abort(404, "Unkown schema: "+schema)

@route("/db/loadfixture/:schema/:filename")
def db_loadfixture(schema, filename):
    print "Loading schema "+schema
    print "Loading filename "+filename
    lines = []
    with open('./fixtures/'+filename, 'r') as f:
        lines = f.readlines()
    load_lines(schema, lines)

@route("/db/loadpost/:schema", method="POST")
def db_loadpost(schema):
    print "Loading schema "+schema
    rows = request.forms.get('payload')
    print rows
    load_lines(schema, rows.split('\n'))

#########
# Main block - starts the server

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
