#!/usr/bin/python
# -*- coding: UTF-8 -*- 

import re
import os

pattern = re.compile('[a-zA-Z]+')
importStr = "import"
fromStr = "from"
LHCommonUIStr = "LHCommonUI"

def matchJSFile(filePatch):
    file = open(filePatch)
    line = file.readline()
    isNeedRegular = False
    moduleList = []     #匹配成功的组件数组
    isMatched = False

    while line:
        if importStr in line:
            isNeedRegular = True
            moduleList = []

        hasFrom = False
        isNeedBreak = False

        if isNeedRegular:
            line = line.replace(importStr, "")
            if fromStr in line:
                hasFrom = True
                line = line.replace(fromStr, "")
            if LHCommonUIStr in line:
                if "*" not in line and "/*" not in line and "//" not in line:     # 防止注释误判
                    isNeedBreak = True
                    line = line.replace(LHCommonUIStr, "")

            module = pattern.findall(line)
            if module:
                moduleList.extend(module)

        if hasFrom:
            # 如果匹配到 LHCommonUI 就代表当前匹配结束
            if isNeedBreak:
                isMatched = True
                break
            else:
                moduleList = []

        line = file.readline()

    file.close()

    if isMatched:
        return moduleList
    else:
        return []

def all_path(dirname, fileType, matchFileNames = []):
    result = []#所有的文件

    for maindir, subdir, file_name_list in os.walk(dirname):
        for filename in file_name_list:
            apath = os.path.join(maindir, filename)#合并成一个完整路径
            if fileType in apath:
                if matchFileNames:
                    for matchFileName in matchFileNames:
                        if matchFileName in apath:
                            result.append(apath)
                            break
                else:
                    result.append(apath)

    return result

def matchUsedModules(paths):
    allModules = []

    # 根据文件的地址 匹配出该文件内使用到的 LHCommonUI 组件名称数组
    for path in paths:
        modules = matchJSFile(path)
        for module in modules:
            if module not in allModules:
                allModules.append(module)
    return allModules

def writeIndexFile(modules= []):
    if len(modules) == 0:
        print("*** 出错, 终止操作 ***")
        return
    
    print("使用到的组件：")
    print(modules)

    f = open("commonUIConfig.json", "w+")  # 当前目录下创建 index.js
    f.write("[" + "\n")

    for index in range(len(modules)):
        module = modules[index]
        if index + 1 == len(modules):
            f.write("  " + "\"" + module + "\"" + "\n") 
        else: 
            f.write("  " + "\"" + module + "\"" + "," + "\n") 

    f.write("]")
    f.close()

    print("*** commonUIConfig.json 文件创建完成 ***")

def getMainPath():
    mainPath = "Main"
    for file_name in os.listdir("./"):
        if file_name == "App":
            mainPath = file_name
            break
    return "./" + mainPath

if __name__ == "__main__":
    plugPath = getMainPath()

    # 匹配插件使用到的组件
    plugAllPath = all_path(plugPath, ".js")
    plugAllUsedModules = matchUsedModules(plugAllPath)

    writeIndexFile(plugAllUsedModules)
    