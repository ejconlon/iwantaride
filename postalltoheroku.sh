#!/bin/bash
./postit.py http://iwantaride.herokuapp.com/db/loadpost users fixtures/users.txt
./postit.py http://iwantaride.herokuapp.com/db/loadpost rides fixtures/rides.txt
./postit.py http://iwantaride.herokuapp.com/db/loadpost responses fixtures/responses.txt
