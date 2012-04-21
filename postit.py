#!/usr/bin/env python

# ./postit.py http://localhost:5000/db/loadpost users fixtures/users.txt

# alternately, if you are running locally, visit
# http://localhost:5000/db/loadfixture/users/users.txt

# to drop the db go to
# http://localhost:5000/db/drop

# to show the db go to
# http://localhost:5000/db/show

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
    
