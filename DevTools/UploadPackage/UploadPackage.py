#!/usr/bin/python
# -*- coding: UTF-8 -*- 
import os
import sys
from selenium import webdriver
import time
import json
import math
curFileParentPath = os.path.abspath(os.path.dirname(__file__))
devToolsPath = os.path.dirname(curFileParentPath)
commonFunctionPath = os.path.dirname(devToolsPath)
modulesPath = os.path.dirname(commonFunctionPath)
projectPath = os.path.dirname(modulesPath)
buildMpkg = os.path.join(projectPath, 'build/publish.mpkg')
packageJsonPath = os.path.join(projectPath, 'package.json')
def getMiProjectId():
  with open(packageJsonPath, 'r') as load_f:
    jsonData = json.load(load_f)
    if 'miProjectId' in jsonData:
      return jsonData['miProjectId']
  return []
miProjectId = getMiProjectId()
# 读取当前版本号
def getVersion():
  pluginConfigPath = os.path.join(projectPath, 'Main/PluginConfig/index.js')
  print pluginConfigPath
  version = ''
  if os.path.exists(pluginConfigPath):
    pluginConfig = open(pluginConfigPath)
    line = pluginConfig.readline()
    while line:
      if 'static PluginVersion' in line:
        version = line.split("=", 1)[1].strip()
        if "'" in version:
          version = version.split("'", 2)[1]
        elif '"' in version:
          version = version.split('"', 2)[1]
      line = pluginConfig.readline()
    pluginConfig.close()
  return str(version)
if len(miProjectId) > 0:
  print "总共需要上传" + str(len(miProjectId)) + "个插件"
  miProjectBaseUrl = "https://iot.mi.com/fe-op/appCenter/extension/detail/"
  # driver = webdriver.Chrome()
  chrome_capabilities ={
    "browserName": "firefox",
    "platform": "ANY",
    "javascriptEnabled": True
  }
  driver = webdriver.Remote("http://192.168.1.125:32768/wd/hub", desired_capabilities=chrome_capabilities)
  def login():
    # 随便打开一个需要登陆的页面，会自动跳转登陆页面
    loginUrl = miProjectBaseUrl + "1000790"
    driver.get(loginUrl)
    driver.find_element_by_id('username').send_keys('840907289')
    driver.find_element_by_id('pwd').send_keys('D()#j4ty4{O$jhi')
    driver.find_element_by_id('login-button').click()
  print "开始登陆开发平台"
  login()
  time.sleep(5)
  print "登陆开发平台完成"
  for index in range(len(miProjectId)):
    driver.get(miProjectBaseUrl + str(miProjectId[index]))
    # 检测新建版本是否已经渲染出来
    def checkVersionManage():
      try:
        driver.find_element_by_xpath('//div[@class="extension-detail"]/div[3]')
        time.sleep(1)
      except:
        time.sleep(2)
        checkVersionManage()
    checkVersionManage()
    driver.find_element_by_xpath('//div[@class="extension-detail"]/div[3]').find_element_by_css_selector(".tinyTitle").find_element_by_css_selector('.ant-btn-background-ghost').click()
    print "开始上传第" + str(index + 1) + "个插件，插件id：" + str(miProjectId[index])
    driver.find_element_by_id('sources').send_keys(buildMpkg)
    # 处理插件更新日志，读取git提交日志
    changeLog = ''
    if len(sys.argv) > 1:
      changeLog = sys.argv[1]
      # git提交的时候没有填日志
      if changeLog == 'no message':
        changeLog = ''
      logs = changeLog.split("\n")
      changeLog = logs[0]
      log = changeLog.split(":", 1)
      if (len(log) > 1):
        changeLog = log[1]
    if len(changeLog) == 0:
      changeLog = '优化体验'
    driver.find_element_by_id('changeLog').send_keys(unicode('v' + getVersion() + ' ' + changeLog, 'utf-8'))
    # 检测包是否上传成功
    def checkUploadSucc():
      try:
        driver.find_element_by_css_selector('.ant-upload-list-item-done')
        time.sleep(1)
      except:
        # 输出上传进度
        try:
          containerWidth = driver.find_element_by_css_selector('.ant-upload-list-item-progress').find_element_by_css_selector('.ant-progress-inner').size['width']
          progressBarWidth = driver.find_element_by_css_selector('.ant-upload-list-item-progress').find_element_by_css_selector('.ant-progress-bg').size['width']
          progress = math.floor(float(progressBarWidth) / containerWidth * 100)
          print "正在上传第" + str(index + 1) + "个插件，插件id：" + str(miProjectId[index]) + "，进度：" + str(progress) + "%"
        except:
          pass
        time.sleep(1)
        checkUploadSucc()
    checkUploadSucc()
    driver.find_element_by_css_selector('.ant-modal-content').find_element_by_css_selector(".ant-btn-primary").click()
    print "成功上传第" + str(index + 1) + "个插件，插件id：" + str(miProjectId[index])
    time.sleep(3)
  driver.quit()
