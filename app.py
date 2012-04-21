#!/usr/bin/env python

# If you want to log something, simply print it in the request handler!

# API KEY for iwantaridenet@gmail.com
GMAPS_API_KEY = "AIzaSyBj3Cz1ShYUnODXeZH8IDll6rNq_GTFH6E"
GMAPS_SRC="http://maps.googleapis.com/maps/api/js?key=%s&sensor=true" % GMAPS_API_KEY
# TODO follow along https://developers.google.com/maps/documentation/javascript/tutorial

import os, urlparse
from bottle import *
import redis

# set in main block
REDIS = None

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
    return dict(title = "I Want A Ride!", content = "Where are you headed?", show_map=True)

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
