#!/usr/bin/env python

# If you want to log something, simply print it in the request handler!

# these four are set in main block
REDIS = None
DEBUG = False
SENDGRID_USERNAME = ''
SENDGRID_PASSWORD = ''

MAX_RIDES = 15

SALT="$JSFJF$J@NNSj4SFj2F@t5m5@5jfk@@SMSMCO"

DEFAULT_LAT = '36.9742';
DEFAULT_LON = '-122.0297';

RIDE_KEYS = ['uid', 'from_lat', 'to_lat', 'from_lon', 'to_lon', 'from_time', 'to_time', 'wantorhave']
RESPONSE_KEYS = ['uid2', 'rid2', 'confirmation', 'tip', 'comment']

import os, urlparse, sha, math, json, urllib
from datetime import datetime, date, time
from bottle import *
from beaker.middleware import SessionMiddleware
import redis
import sendmail

###########
# Bottle handler decorators

# one to protect debug functions
def debug_only(f):
    def g(*a, **k):
        if not DEBUG:
            return abort(401, "Unauthorized")
        else:
            return f(*a, **k)
    return g

# and one to let you return json
def json_result(f):
    def g(*a, **k):
        return json.dumps(f(*a, **k))
    return g

###########
# Email utils

class DummySender():
    def __init__(self, x, y):
        print "SENDER INITING"
    def send_mail(self, a, b, c, d):
        print "SENDER SENDING", a, b, c, d
    def close(self):
        print "SENDER CLOSING"

def get_sender():
    if len(SENDGRID_USERNAME) > 0 and len(SENDGRID_PASSWORD) > 0:
        return sendmail.EmailSender(SENDGRID_USERNAME, SENDGRID_PASSWORD)
    else:
        return DummySender(SENDGRID_USERNAME, SENDGRID_PASSWORD)

##########
# Data model junk

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
        else:
            REDIS.incr('global:uid_source')
        REDIS.set('email:%s' % uid, email)
        REDIS.set('email:%s:uid' % email, uid)
        REDIS.set('pwhash:%s' % uid, pwhash)
        REDIS.set('name:%s' % uid, name)
        return uid

def add_ride(ride_dict, rid=None):
    if rid is None:
        rid = REDIS.incr('global:rid_source')
    else:
        REDIS.incr('global:rid_source')
    for k in RIDE_KEYS:
        REDIS.set(k+":"+str(rid), str(ride_dict[k]))
    return rid

def add_response(response_dict, reid=None):
    if reid is None:
        reid = REDIS.incr('global:reid_source')
    else:
        REDIS.incr('global:reid_source')
    for k in RESPONSE_KEYS:
        REDIS.set(k+":"+str(reid), str(response_dict[k]))
    return reid

def get_name_by_uid(uid):
    return REDIS.get('name:%s' % uid)

def get_email_by_uid(uid):
    return REDIS.get('email:%s' % uid)

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
    #print today, event_time
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

def get_response(reid):
    d = {'reid':reid}
    for key in RESPONSE_KEYS:
        d[key] = REDIS.get('%s:%s' % (key, reid))
    return d

def get_all_responses_for(rid):
    responses = []
    for exkey in REDIS.keys('rid2:*'):
        reid = exkey.split(':')[-1]
        if REDIS.get(exkey) == rid:
            responses.append(get_response(reid))
    return responses

def get_all_responses():
    responses = []
    for exkey in REDIS.keys('from_lon:*'):
        rid = exkey.split(':')[-1]
        responses.extend(get_all_responses_for(rid))
    return responses

def format_response(response):
    response['name'] = get_name_by_uid(response['uid2'])
    ride = get_ride(response['rid2'])
    response['wantorhave'] = ride['wantorhave']
    return response

def get_ride_list(my_from_lat, my_from_lon):
    def key(d):
        da = int(d['days_away'])
        if da < 0:
            da = 8
        return 1000*da + float(d['start_dist'])
    ride_list = sorted([format_ride(ride, my_from_lat, my_from_lon) for ride in get_all_rides()],
                       key=key)
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
# Main pages

@route("/")
@view("flow")
def landing_page():
    lat, lon = get_lat_lon()
    ride_list = get_ride_list(lat, lon)[:MAX_RIDES]
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
        update_session(error = "We couldn't log you in with that.")
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

@route("/make/:wantorhave")
@view("make")
def make(wantorhave):
    return session_dict(wantorhave=wantorhave)

@route("/verify_make", method="POST")
def verify_make():
    serialized = None
    s = get_session()
    if 'serialized' in s:
        serialized = s['serialized']
    else:
        d = {}
        for key in RIDE_KEYS:
            if key != 'uid' and key != 'to_time':
                d[key] = request.forms.get(key)
                if d[key] is None or len(d[key]) == 0:
                    print key
                    update_session(error = "Fill in all the fields, thanks.")
                    wantorhave = "want"
                    if "wantorhave" in d: wantorhave = d["wantorhave"]
                    return redirect("/make/"+wantorhave)
        d['to_time'] = d['from_time']
        serialized = json.dumps(d)

    print "Make?", serialized

    if 'uid' in s:
        d = json.loads(serialized)
        d['uid'] = s['uid']
        print "Adding ride", d
        rid = add_ride(d)
        if 'serialized' in s:
            del s['serialized']
        update_session(success = "Thanks for adding a ride!")
        return redirect("/rides")
    else:
        update_session(info = "You gotta login to make a ride.", cont = "/verify_make", serialized = serialized)
        return redirect("/login")

@route("/verify_make", method="GET")
def verify_make_get():
    return verify_make()

@route("/rides")
@view("rides")
def rides():
    lat, lon = get_lat_lon()
    ride_list = get_ride_list(lat, lon)[:MAX_RIDES]
    return session_dict(ride_list=ride_list)

@route("/rides.json")
@json_result
def rides_json():
    lat, lon = get_lat_lon()
    return get_ride_list(lat, lon)[:MAX_RIDES]

@route("/rides.json/:rid")
@json_result
def ride_json(rid):
    lat, lon = get_lat_lon()
    ride = get_ride(rid)
    return [format_ride(ride, lat, lon)]

@route("/myrides.json/:uid")
@json_result
def myrides_json(uid):
    lat, lon = get_lat_lon()
    all_rides = get_ride_list(lat, lon)
    my_rides = [r for r in all_rides if r['uid'] == uid]
    rlids = [r['rid'] for r in my_rides]
    responded_ride_ids = [x['rid2'] for x in get_all_responses() if x['uid2'] == uid or x['rid2'] in rlids]
    my_responded_rides = [r for r in all_rides if r['uid'] in responded_ride_ids]
    return my_rides + my_responded_rides

@route("/about")
@view("about")
def about():
    return session_dict()

@route("/take/:rid")
@view("take")
def take(rid):
    if 'uid' not in get_session():
        update_session(info = "You gotta log in to take a ride.", cont="/take/"+str(rid))
        return redirect("/login")
    lat, lon = get_lat_lon()
    ride = format_ride(get_ride(rid), lat, lon)
    responses = map(format_response, get_all_responses_for(rid))
    return session_dict(ride=ride, responses=responses)

@route("/verify_take", method="POST")
def verify_take():
    s = get_session()
    rid = request.forms.get('rid')
    tip = request.forms.get('tip')
    comment = request.forms.get('comment')
    if rid is None or len(rid) == 0:
        update_session(error = "Couldn't find your ride.")
        return redirect("/rides")
    elif 'uid' not in s:
        abort(401, "Unauthorized")
    else:
        response_dict = {'uid2': s['uid'], 'rid2': rid, 'confirmation': '',
                         'tip': tip, 'comment': comment}
        print "Adding response", response_dict
        add_response(response_dict)
        update_session(success = "We told them that you wanted to ride along.")
        # TODO send email
        ride = get_ride(rid)
        givers_email = get_email_by_uid(ride['uid'])
        sender = get_sender()
        sender.send_mail("iwantaridenet@gmail.com", givers_email, s['name'] + " wants to join you", "More information @ http://iwantaride.herokuapp.com/take/%s" % str(rid))
        sender.close()
        return redirect("/take/"+str(rid))

@route("/shake/:reid")
def shake_on_it(reid):
    s = get_session()
    response = get_response(reid)
    ride = get_ride(response['rid2'])
    if 'uid' not in s or ride['uid'] != s['uid']:
        abort(401, "Unauthorized")
    REDIS.set("confirmation:%s" % reid, "true")

    # TODO Send email
    update_session(success = "Great! You're going to share a ride.")
    takers_email = get_email_by_uid(response['uid2'])
    sender = get_sender()
    sender.send_mail("iwantaridenet@gmail.com", takers_email, s['name'] + " has accepted your ride", "More information @ http://iwantaride.herokuapp.com/take/%s" % response['rid2'])
    sender.close()

    return redirect("/take/%s" % response['rid2'])

@route("/nope/:reid")
def nope(reid):
    s = get_session()
    response = get_response(reid)
    ride = get_ride(response['rid2'])
    if 'uid' not in s or (ride['uid'] != s['uid'] and response['uid2'] != s['uid']):
        abort(401, "Unauthorized")
    for key in RESPONSE_KEYS:
        REDIS.delete(key+":"+str(reid))

    # TODO Send email
    update_session(info = "Maybe next time you can share a ride.")
    sender = get_sender()
    if s['uid'] == ride['uid']:
        takers_email = get_email_by_uid(response['uid2'])
        sender.send_mail("iwantaridenet@gmail.com", takers_email, s['name'] + " has declined your ride", "More information @ http://iwantaride.herokuapp.com/take/%s" % response['rid2'])
    else:
        givers_email = get_email_by_uid(ride['uid'])
        sender.send_mail("iwantaridenet@gmail.com", givers_email, s['name'] + " has declined your ride", "More information @ http://iwantaride.herokuapp.com/take/%s" % response['rid2'])
    sender.close()


    return redirect("/take/%s" % response['rid2'])

@route("/mine")
def mine_default():
    s = get_session()
    if 'uid' not in s:
        update_session(cont = "/mine", warning="You gotta log in to see rides.")
        return redirect("/login")
    return redirect("/mine/"+str(s['uid']))

@route("/mine/:uid")
@view("mine")
def mine(uid):
    s = get_session()
    if 'uid' not in s:
        update_session(cont = "/mine/"+str(uid), warning="You gotta log in to see rides.")
        return redirect("/login")
    lat, lon = get_lat_lon()
    ride_list = [x for x in get_ride_list(lat, lon) if x['uid'] == uid]
    rlids = [x['rid'] for x in ride_list]
    responses = map(format_response, [x for x in get_all_responses() if x['uid2'] == uid or x['rid2'] in rlids])
    name = get_name_by_uid(uid)
    return session_dict(ride_list=ride_list, responses=responses, my_id=uid, my_name=name)

@route("/calendar")
@view("calendar")
def calendar():
    if 'uid' not in get_session():
        update_session(info = "You gotta login see your calendar.", cont="/calendar")
        return redirect("/login")
    return session_dict()

@route("/calendar_partial")
@view("calendar_partial")
def calendar_partial():
    guser_xml = request.params["guser_xml"]
    url = "http://iwantaride-locations.heroku.com/?guser_xml=%s" % guser_xml
    cal_entries = json.loads(urllib.urlopen(url).read())
    return session_dict(cal_entries=cal_entries,uid=get_session()["uid"])

@route("/calendar_make", method="POST")
def calendar_make():
    rides = json.loads(request.body.read())
    lat, lon = get_lat_lon()
    for ride in rides:
        ride["from_lat"] = lat
        ride["from_lon"] = lon
        ride["from_time"] = ride["to_time"]
        add_ride(ride)
    return '{ "success": "success" }'



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
@debug_only
def db_get(item):
    return render_row(REDIS.get(item))

@route("/db/set/:item/:value")
@debug_only
def db_set(item, value):
    return render_row(REDIS.set(item, value))

@route("/db/hash/:item")
@debug_only
def db_hash(item):
    return render_row(hash_password(item))

@route("/db/drop")
@debug_only
def db_drop():
    print "DROPPING DATABASE!"
    return render_row(REDIS.flushdb())

@route("/db/show")
@debug_only
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
@debug_only
def db_loadfixture(schema, filename):
    print "Loading schema "+schema
    print "Loading filename "+filename
    lines = []
    with open('./fixtures/'+filename, 'r') as f:
        lines = f.readlines()
    load_lines(schema, lines)

@route("/db/loadpost/:schema", method="POST")
@debug_only
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

    SENDGRID_USERNAME = os.environ.get('SENDGRID_USERNAME', '')
    SENDGRID_PASSWORD = os.environ.get('SENDGRID_PASSWORD', '')

    session_opts = {
        'session.type': 'file',
        'session.cookie_expires': 6000,
        'session.data_dir': './data',
        'session.auto': True
    }
    app = SessionMiddleware(default_app(), session_opts)

    port = int(os.environ.get("PORT", 5000))
    DEBUG = bool(os.environ.get("DEBUG", DEBUG))
    if DEBUG:
        debug(True)
    run(host='0.0.0.0', port=port, app=app)
