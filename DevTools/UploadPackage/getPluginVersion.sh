#!/bin/bash
version=""
getVersion() {
	project_path="$PWD"
	pluginConfigFile="${project_path}/Main/PluginConfig/index.js"
	if [ -f "$pluginConfigFile" ]; then
		IFS_old=$IFS
		IFS=$'\n'
	  for line in `cat $pluginConfigFile`
			do
				if [[ $line =~ "static PluginVersion" ]]; then
				  right=${line#*\'}
				  right=${right#*\"}
				  version=${right%%\'*}
				  version=${version%%\"*}
				fi
			done
		IFS=$IFS_old
	fi
}
getVersion
echo $version