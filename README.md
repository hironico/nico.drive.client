# nico.drive.client

This web application is a client for the nico.drive WebDAV server.
It features a convenient yet visually appealing user interface to get the most of your Nico.Drive webDAV server.

# Features

- Compatible with any WebDAV compliant server.
- Browse you webDAV drive anywhere 
- Download files
- Basic file details 

# Exclusive nico's drive server features

When connected to a nico.drive webDAV server, the following additional features are available:
- Displays image thumbnails thanks to the thumb REST API of nico.drive's server.
- Enhanced file meta-data from the nico.drive's server REST API : image exif and xmp.
- Download a directory contents in a ZIP archive.

# How-to use

Nico's drive web client is meant to be embedded into the nico.drive's server. Just point your favorite browser on the 
web url of nico's drive server and you should be asked for your credentials.

However, if you want to use the latest version of the web interface you might want to serve nico's drive client
from a separated place. See deployment intructions below.

To use the nico's drive web client to connect to another WebDAV server, see deployment instructions below.

# Developer info

## Getting started

- Get the code from GitHub
- npm install
- npm run start

This will launch the development server for testing against you webdav server.

## Deployment

- Get the code from GitHub
- npm run build

Then copy or embed the build directory on your production server.

or

- sudo npm install -g serve
- serve -s dist

More info : https://cra.link/deployment

