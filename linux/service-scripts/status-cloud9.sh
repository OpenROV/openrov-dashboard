#!/bin/bash

if [ -f "/etc/init.d/cloud9" ]; then
  /etc/init.d/cloud9 status
else
  systemctl status cloud9.socket
fi

export RESULT=$?
if [ $RESULT = 0 ]; then #running
	exit 0
else
	exit 1
fi
