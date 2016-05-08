#!/bin/bash
set -x
set -e
# set the openrov dashboard startup
ln -s /opt/openrov/dashboard/linux/dashboard.service /etc/init.d/dashboard
update-rc.d dashboard defaults 21

chown -R rov /opt/openrov/dashboard
chgrp -R admin /opt/openrov/dashboard

mkdir -p /etc/nginx/locations-enabled
ln -s /opt/openrov/dashboard/linux/nginx.location /etc/nginx/locations-enabled/dashboard.conf
