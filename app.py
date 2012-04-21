#!/usr/bin/env python

import os
from bottle import *
import redis
from bottle.ext import redis as redis_plugin

############
# Static resource handlers
# put things in /js /img /css and reference them in view templates

@route('/js/<filename>')
def js_static(filename):
     return static_file(filename, root='./js')

@route('/img/<filename>')
def img_static(filename):
    return static_file(filename, root='./img')

@route('/css/<filename>')
def img_static(filename):
    return static_file(filename, root='./css')

###########
# Main page

@route("/")
@view("main")
def main():
    return dict(title = "I Want A Ride!", content = "Where are you headed?")

###########
# Dump db info

def render_row(row):
    if row:
        return template('dump', row=row)
    return HTTPError(404, "Page not found")    

@route("/db/get/:item")
def db_get(item, rdb):
    return render_row(rdb.get(item))

@route("/db/set/:item/:value")
def db_set(item, value, rdb):
    return render_row(rdb.set(item, value))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    #redis_port = int(os.environ.get("REDIS_PORT", 6379))
    redis_host = os.environ.get("REDIS_HOST", "localhost")

    app = default_app()
    plugin = redis_plugin.RedisPlugin(host=redis_host)
    app.install(plugin)
    run(host='0.0.0.0', port=port)
