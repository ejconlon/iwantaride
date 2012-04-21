iwantaride
==========
To run, open a terminal, cd to this directory and type
python app.py

Then go to http://localhost:5000 in your browser.


Heroku push instructions:
Instructions cribbed from
http://blog.heroku.com/archives/2011/9/28/python_and_django/

$ # First you need ruby + rubygems...
$ # sudo aptitude install ruby rubygems
$ gem install heroku
$ # put heroku on your path
$ heroku create --stack cedar
$ git push heroku master
