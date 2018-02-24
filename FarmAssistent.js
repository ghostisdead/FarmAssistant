function toggleRD(){require(["TW2A/ResourceDepositBot/Interface"],function(DRInterface){DRInterface.isEnabled()})}window.loadPageSection=function(url,selector,callback){if("string"!=typeof url)throw new Error("Invalid URL: ",url);if("string"!=typeof selector)throw new Error("Invalid selector selector: ",selector);if("function"!=typeof callback)throw new Error("Callback provided is not a function: ",callback);var xhr=new XMLHttpRequest,finished=!1;xhr.onabort=xhr.onerror=function(){finished=!0,callback(null,xhr.statusText)},xhr.onreadystatechange=function(){if(4===xhr.readyState&&!finished){var section;finished=!0;try{section=xhr.responseXML.querySelector(selector),callback(section)}catch(e){callback(null,e)}}},xhr.open("GET",url),xhr.responseType="document",xhr.send()},define("TW2/Services",function(){return{rootScope:angular.element(document).scope(),modelDataService:injector.get("modelDataService"),socketService:injector.get("socketService"),routeProvider:injector.get("routeProvider"),eventTypeProvider:injector.get("eventTypeProvider"),windowDisplayService:injector.get("windowDisplayService"),windowManagerService:injector.get("windowManagerService"),angularHotkeys:injector.get("hotkeys"),armyService:injector.get("armyService"),villageService:injector.get("villageService"),depositService:injector.get("resourceDepositService"),presetService:injector.get("presetService"),groupService:injector.get("groupService"),reportService:injector.get("reportService"),iconGeneratorService:injector.get("iconGeneratorService"),$filter:injector.get("$filter")}}),define("TW2A/ResourceDepositBot",["TW2/Services","helper/time"],function(services,time){var ResourceDepositInfo,JobRerolledListener,JobCollectedListener,updateJobsInfoListener,depositManagerListener,collectJobListener,managerStoped=!0,depositManager=function(){managerStoped=!1,isJobRunning()?analyzeRunningJob():isJobCollectible()?collectJob():isJobAvaliable()?startJob():managerStoped=!0},isJobRunning=function(){return null!=ResourceDepositInfo.getCurrentJob()},isJobCollectible=function(){return null!=ResourceDepositInfo.getCollectibleJobs()},isJobAvaliable=function(){return null!=ResourceDepositInfo.getReadyJobs()},updateJobsInfo=function(){services.socketService.emit(services.routeProvider.RESOURCE_DEPOSIT_GET_INFO,{},function(data){services.depositService.updateJobData(data.jobs);var nextReset=1e3*data.time_next_reset-time.gameTime();updateJobsInfoListener=setTimeout(updateJobsInfo,nextReset+5e3),managerStoped&&(depositManagerListener=setTimeout(depositManager,5e3))})},analyzeRunningJob=function(){var currentJob=ResourceDepositInfo.getCurrentJob();if(!currentJob)return 0;var completedTime=currentJob.time_completed;completedTime*=1e3;var currentTime=time.gameTime();collectJobListener=setTimeout(collectJob,completedTime-currentTime+5e3)},collectJob=function(){var collectibleJob=ResourceDepositInfo.getCollectibleJobs();if(!collectibleJob)return 0;services.socketService.emit(services.routeProvider.RESOURCE_DEPOSIT_COLLECT,{job_id:collectibleJob[0].id,village_id:services.modelDataService.getSelectedVillage().getId()})},startJob=function(){var avaliableJobs=ResourceDepositInfo.getReadyJobs();if(avaliableJobs){var selectedJobID=avaliableJobs[0].id;services.socketService.emit(services.routeProvider.RESOURCE_DEPOSIT_START_JOB,{job_id:selectedJobID},analyzeRunningJob)}else managerStoped=!0};return{init:function(){ResourceDepositInfo=services.modelDataService.getSelectedCharacter().getResourceDeposit(),JobRerolledListener=services.rootScope.$on(services.eventTypeProvider.RESOURCE_DEPOSIT_JOBS_REROLLED,depositManager),JobCollectedListener=services.rootScope.$on(services.eventTypeProvider.RESOURCE_DEPOSIT_JOB_COLLECTED,startJob),updateJobsInfo(),console.log("AutoDeposit activated")},deactivate:function(){JobRerolledListener(),JobCollectedListener(),clearTimeout(updateJobsInfoListener),clearTimeout(depositManagerListener),clearTimeout(collectJobListener),managerStoped=!0,console.log("AutoDeposit deactivated")}}}),define("TW2A/ResourceDepositBot/Interface",["TW2A/ResourceDepositBot"],function(DRBot){return{isEnabled:function(){var DRcheckBox=$("#TW2A-DR-CheckBox"),value=DRcheckBox.val();1==value&&(DRBot.init(),DRcheckBox.addClass("icon-26x26-checkbox-checked")),0==value&&(DRBot.deactivate(),DRcheckBox.removeClass("icon-26x26-checkbox-checked"))}}});var htmlSource="https://ghostisdead.github.io/FarmAssistant/FarmAssistantTemplate.html";function createInterface(html){var sectionDiv=document.createElement("SECTION");sectionDiv.id="TW2A-section",sectionDiv.className="screen-setting twx-window screen left",sectionDiv.innerHTML=html.outerHTML,document.getElementById("wrapper").append(sectionDiv),jsScrollbar("#TW2A-MainContainer",{disableTweening:!1,fixedThumb:!1,horizontalScrolling:!1,scrollDistance:10,scrollSpeed:30,template:'<div class="jssb"><div class="jssb-track"><div class="jssb-thumb"><div class="scrollbar-top"></div><div class="scrollbar-middle"></div><div class="scrollbar-bottom"></div></div></div></div>',tweenFn:function(pos){return 1-Math.pow(pos-1,4)},tweenDuration:500,verticalScrolling:!0,wheelDistance:40}),$("#TW2A-section").hide()}function createLeftBarButtom(html){var buttomDiv=document.createElement("div");buttomDiv.id="TW2A-interface",buttomDiv.innerHTML=html.outerHTML,buttomDiv.style.position="relative",buttomDiv.style.top="0px",document.getElementById("toolbar-left").prepend(buttomDiv)}function showInterface(){var interface=$("#TW2A-section"),wrapper=document.getElementById("wrapper");interface.isVisible()?(interface.hide(),wrapper.className="",document.getElementById("TW2A-interface").style.left="0px"):(interface.show(),wrapper.className="window-open",document.getElementById("TW2A-interface").style.left="720px")}function showContent(id){var content=$(".content-"+id),contentButtom=$("#contentbtn-"+id);content.isVisible()?(content.css("display","none"),contentButtom.removeClass("icon-26x26-minus"),contentButtom.addClass("icon-26x26-plus")):(content.css("display","block"),content.css("display",""),contentButtom.removeClass("icon-26x26-plus"),contentButtom.addClass("icon-26x26-minus"))}function toggleSelect(id){var selectFieldDOM=document.getElementById("TW2A-select-field-"+id),actionList=document.getElementsByClassName("action-list select-handler action-list-bottom  TW2A-List-"+id)[0],selectField=$("#TW2A-select-field-"+id);selectFieldDOM.classList.contains("active-field")?(selectFieldDOM.style.height="0",actionList.style.height="0",selectFieldDOM.style.visibility="hidden",selectField.removeClass("active-field")):(selectFieldDOM.style.height="auto",actionList.style.height="auto",selectFieldDOM.style.visibility="visible",selectField.addClass("active-field"))}function createPresetSelectionList(){require(["TW2A/Preset/Interface","TW2A/PresetData"],function(presetInterface,presetData){presetData.updatePresetList(),setTimeout(presetInterface.createPresetSelectionList,1e4)})}function createGroupSelectionList(){require(["TW2A/Group/Interface"],function(groupInterface){setTimeout(groupInterface.createGroupSelectionList,1e4)})}function initReportDataManager(){require(["TW2A/ReportData"],function(reportData){reportData.begin()})}window.loadPageSection(htmlSource,"#TW2A-container",function(html,error){null!=html&&createInterface(html)}),window.loadPageSection(htmlSource,"#TW2A-buttom",function(html,error){null!=html&&createLeftBarButtom(html)}),createPresetSelectionList(),createGroupSelectionList(),initReportDataManager(),define("TW2A/PresetData",["TW2/Services"],function(services){var presetList=[];return{getPresetList:function(){var presetListData=services.modelDataService.getPresetList().presets;for(var propName in presetListData)presetListData.hasOwnProperty(propName)&&(preset=presetListData[propName],presetList.push({name:preset.name,id:preset.id,icon:preset.icon}));return presetList},updatePresetList:function(){services.socketService.emit(services.routeProvider.GET_PRESETS,{})},sendPreset:function(startVillageID,targetVillageId,presetId,type){services.socketService.emit(services.routeProvider.SEND_PRESET,{start_village:startVillageID,target_village:targetVillageId,army_preset_id:presetId,type:type})}}}),define("TW2A/Preset/Interface",["TW2A/PresetData","TW2/Services"],function(presetData,services){var presetList;return{createPresetSelectionList:function(){presetList=presetData.getPresetList();var listLength=Object.keys(presetList).length,presetField=document.getElementById("TW2A-Preset-Field");for(presetField.innerHTML="",index=0;index<listLength;index++){var elementLI=document.createElement("li");elementLI.className="action clearfix",elementLI.setAttribute("style","min-height: 50px; height: 50px; margin: 0px"),elementLI.id=presetList[index].id;var elementSPAN1=document.createElement("span");elementSPAN1.className="action-name overflow-ellipsis",elementSPAN1.setAttribute("style","margin: 10px 0px 10px 50px"),elementSPAN1.innerHTML=presetList[index].name;var icon=services.iconGeneratorService.generate(presetList[index].icon,"preset",null,50,50);elementLI.prepend(icon),presetField.append(elementLI),elementLI.append(elementSPAN1)}},sendPreset:function(presetId){}}}),define("TW2A/GroupData",["TW2/Services"],function(services){var groupList=[];return getGroupList=function(){var groupListData=services.groupService.getGroups();for(var propName in groupListData)groupListData.hasOwnProperty(propName)&&(group=groupListData[propName],groupList.push({name:group.name,id:group.id,icon:group.icon}));return groupList},getVillagesByGroup=function(group){return services.modelDataService.getGroupList().getGroupVillageIds(group)},{getGroupList:getGroupList,getVillagesByGroup:getVillagesByGroup}}),define("TW2A/Group/Interface",["TW2A/GroupData","TW2/Services"],function(groupData,services){var groupList;return{createGroupSelectionList:function(){groupList=groupData.getGroupList();var listLength=Object.keys(groupList).length,groupField=document.getElementById("TW2A-Group-Field");for(groupField.innerHTML="",index=0;index<listLength;index++){var elementLI=document.createElement("li");elementLI.className="action clearfix",elementLI.setAttribute("style","min-height: 50px; height: 50px; margin: 0px"),elementLI.id=groupList[index].id;var elementSPAN1=document.createElement("span");elementSPAN1.className="action-name overflow-ellipsis",elementSPAN1.setAttribute("style","margin: 10px 0px 10px 50px"),elementSPAN1.innerHTML=groupList[index].name;var icon=services.iconGeneratorService.generate(groupList[index].icon,"group",null,50,50);elementLI.prepend(icon),groupField.append(elementLI),elementLI.append(elementSPAN1)}}}}),define("TW2A/ReportData",["TW2/Services"],function(services){var isFull=function(data){data.haul},updateInterface=function(data){var resourcesPlundered=data.ReportAttack.haul;WoodPlunderedElement=document.getElementById("WoodPlundered"),ClayPlunderedElement=document.getElementById("ClayPlundered"),IronPlunderedElement=document.getElementById("IronPlundered"),WoodPlunderedElement.innerHTML=Number(WoodPlunderedElement.outerHTML)+resourcesPlundered.wood,ClayPlunderedElement.innerHTML=Number(ClayPlunderedElement.outerHTML)+resourcesPlundered.clay,IronPlunderedElement.innerHTML=Number(IronPlunderedElement.outerHTML)+resourcesPlundered.iron};return{begin:function(){services.rootScope.$on(services.eventTypeProvider.REPORT_NEW,function(event,data){"attack"==data.type&&(isFull(data),services.reportService.getReport(data.id,updateInterface))})}}});
