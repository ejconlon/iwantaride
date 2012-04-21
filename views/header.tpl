<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>I Want A Ride! {{ extra_title }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="/css/bootstrap.css" rel="stylesheet">
    <link href="/css/app.css" rel="stylesheet">
    <style>
      body {
        padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
      }
    </style>
    <link href="/css/bootstrap-responsive.css" rel="stylesheet">

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="//html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le fav and touch icons -->
    <!--<link rel="shortcut icon" href="/images/favicon.ico">
    <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/images/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/images/apple-touch-icon-114x114.png">-->
  </head>

  <body>

    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          <a class="brand" href="#">I Want A Ride!</a>
          <div class="nav-collapse">
            <ul class="nav">
              <li><a href="/">Home</a></li>
	      %if defined('session') and 'email' in session:
	      <li><a href="/logout">Logout {{ session['email'] }}</a></li>
	      %else:
	      <li><a href="/login">Login</a></li>
	      <li><a href="/signup">Signup</a></li>
	      %end
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>
    </div>

    %if defined('error') and len(error):
    <div class="error">{{ error }}</div>
    %end

    %if defined('warning') and len(warning):
    <div class="warning">{{ warning }}</div>
    %end

    %if defined('success') and len(success):
    <div class="success">{{ success }}</div>
    %end

    %if defined('info') and len(info):
    <div class="info">{{ info }}</div>
    %end

    <div class="container">
