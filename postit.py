#!/usr/bin/env python

import urllib, urllib2, httplib

def post(url, schema, key, value):
    headers = {"Content-type": "application/x-www-form-urlencoded",
               "Accept": "text/plain"}
    req = urllib2.Request(url+"/"+schema)
    connection = httplib.HTTPConnection(req.get_host())
    params = urllib.urlencode({key: value})
    print params
    connection.request('POST', req.get_selector(),
                       params, headers)
    response = connection.getresponse()
    print response.status, response.reason
    data = response.read()
    connection.close()

def splitline(line):
    return [x for x in (y.strip() for y in line.split(',')) if len(x)]

if __name__ == "__main__":
    import sys
    url = sys.argv[1]
    schema = sys.argv[2]
    filename = sys.argv[3]
    lines = None
    with open(filename, 'r') as f:
        lines = f.read()
    post(url, schema, 'payload', lines)
    
