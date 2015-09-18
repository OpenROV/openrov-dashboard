#!/bin/bash
set -ex
#Install Pre-req
gem install fpm

#Install dependencies
npm install

VERSION_NUMBER="`cat package.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'`"
GIT_COMMIT="`git rev-parse --short HEAD`"

if [ "x$GIT_BRANCH" = "x" ]
then
  GIT_BRANCH="`git for-each-ref --format='%(objectname) %(refname:short)' refs/heads | grep $GIT_COMMIT | awk '{print $2}'`"
fi

ARCH=`uname -m`
if [ ${ARCH} = "armv7l" ]
then
  ARCH="armhf"
fi

if [ "$GIT_BRANCH" = "master" ]
then
  PACKAGE_VERSION="$VERSION_NUMBER~~"
else
  PACKAGE_VERSION="$VERSION_NUMBER~~${GIT_BRANCH}."
fi

if [ "x${BUILD_NUMBER}" = "x" ]
then
  PACKAGE_VERSION="${PACKAGE_VERSION}${GIT_COMMIT}"
else
  PACKAGE_VERSION="${PACKAGE_VERSION}${BUILD_NUMBER}.$GIT_COMMIT"
fi

#package
fpm -f -m info@openrov.com -s dir -t deb -a $ARCH \
	-n openrov-dashboard \
	-v ${PACKAGE_VERSION} \
  --after-install=./install_lib/openrov-dashboard-afterinstall.sh \
  --before-remove=./install_lib/openrov-dashboard-beforeremove.sh \
  --before-install=./install_lib/openrov-dashboard-beforeinstall.sh \
	--description "OpenROV Dashboard" \
	.=/opt/openrov/dashboard
