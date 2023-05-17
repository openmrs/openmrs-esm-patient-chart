#!/bin/bash

#Receive the entry parameter as an argument
entry_param=$1

#Install yarn packages
yarn build

#Remove the old directory
rm -rf $entry_param/

#Copy the new directory
cp -r dist $entry_param

#Copy the directory to the docker container
docker cp $entry_param package_openmrs-proxy_1:/var/nginx/html/frontend/ui

echo "Done copying files to container!"
