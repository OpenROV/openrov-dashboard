#!/bin/sh

if [ -f "/etc/init.d/cloud9" ]; then
  /etc/init.d/cloud9 stop
else
  systemctl stop cloud9.service
	systemctl stop cloud9.socket
fi

export RESULT=$?
if [ $RESULT = 0 ]; then #running
	exit 0

elif [ $RESULT = 1 ]; then
	exit 1
fi
exit 99
