# nico.drive.client

This web application is a client for the nico.drive WebDAV server.
It features a convenient yet visually appealing user interface to get the most of your Nico.Drive webDAV server.

# Features

- Browse you webDAV drive anywhere 
- Download files
- Displays image thumbnails thanks to the thumb REST API of nico.drive's server.
- Displays file meta-data from the nico.drive's server REST API
- more to come !

# How-to use

Nico's drive web client is meant to be embedded into the server. Just point your favorite browser on the 
web url of nico's drive server and you should be asked for your credentials.

However, if you want to use the latest version of the web interface you might want to serve nico's drive client
from a separated place. See intructions below.

# Developer info

## Getting started

- Get the code from github
- npm install
- npm run start

This will launch the development server for testing against you webdav server.

## Deployment

- npm run build

Then copy or embed the build directory on your production server.

