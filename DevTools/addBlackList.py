#!/usr/bin/python
# -*- coding: UTF-8 -*- 

import os
import sys

runBlackListJSPath = '../../node_modules/metro/src/blacklist.js'
runTempBlackListJSPath = '../../node_modules/metro/src/blacklist_temp.js'

buildBlackListJSPath = './Modules/Mijia-CommonFunction-Modules/DevTools/buildProject/metro/src/blacklist.js'
buildTempBlackListJSPath = './Modules/Mijia-CommonFunction-Modules/DevTools/buildProject/metro/src/blacklist_temp.js'

def writeBlackList(blackList, file):
	print('**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==')
	if len(blackList) == 0:
		print('没有需要加入到运行黑名单的项目')
		return
	print('检测到即将要加入到运行黑名单的项目，添加到黑名单的项目，运行时不会被检索：')
	print(blackList)
	print('**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==**==')
	for singleBlackProject in blackList:
		# /com.lumi.linuxHub\/.*/,
		writeString = '/' + singleBlackProject + '\/.*/,' + '\n'
		file.write(writeString)

def addProjectToBlackList(blackList, blackListJSPath, tempBlackListJSPath):

	if os.path.exists(blackListJSPath) == False:
		sys.exit(0) # 退出项目

	hasLumiProject = False
	lumiStringList = []
	lineNum = 1
	insertLine = -1

	originFile = open(blackListJSPath)
	targetFile = open(tempBlackListJSPath, 'w+')

	line = originFile.readline()

	while line:
		if 'com.lumi.' not in line and 'com.xiaomi.' not in line:
			targetFile.write(line) 

		if 'var sharedBlacklist' in line:
			writeBlackList(blackList, targetFile)

		line = originFile.readline()

	originFile.close()
	targetFile.close()

	os.remove(blackListJSPath)
	os.rename(tempBlackListJSPath, blackListJSPath)

def getProjectBlackList():
	projectBlackList = []
	for name in os.listdir("../"):
		fullPath = os.path.dirname(os.getcwd()) + '/' + name
		if fullPath != os.getcwd() and 'gitignore' not in name and 'DS_Store' not in name:
			projectBlackList.append(name)
	return projectBlackList

if __name__ == "__main__":
	
	inputList = sys.argv
	if len(inputList) == 2:
		blackList = getProjectBlackList();

		inputString = inputList[1]
		if inputString == 'run':
			addProjectToBlackList(blackList, runBlackListJSPath, runTempBlackListJSPath)
		if inputString == 'build':
			addProjectToBlackList(blackList, buildBlackListJSPath, buildTempBlackListJSPath)










