#!/bin/sh

if [ -f "/etc/init.d/cloud9" ]; then
  /etc/init.d/cloud9 start
else
  systemctl cloud9.socket start
fi

export RESULT=$?
if [ $RESULT = 0 ]; then #running
	exit 0

elif [ $RESULT = 1 ]; then
	exit 1
fi
exit 99
