self="${0#./}"
base=$(dirname "${self%/*}")
path=`pwd`
echo "self is::$self"
echo "path is::$path"

echo "script name: $0"
echo "dirname: `dirname $0`"
echo "basename: `basename $0`"

#removing everything other than 'res' directory
echo -e "\nRemoving everthing in fitters/ directory other than res/ directory ...\n"
rm -rf fitters/*
cp -a droid/res fitters/

#running callback android scripts
echo -e "\nRunning callback android scripts ...\n"
$PG_DROID_HOME/bin/create $path/fitters com.onboardservice.fitters Fitters

#preparing build for launch in a mobile device
echo -e "\nPreparing build for launching in mobile device ...\n"
rm -rf fitters/assets/www
cp -a www fitters/assets/
cp -a fitters/phonegap/_phonegap/android/phonegap-1.3.0.js fitters/assets/www/
