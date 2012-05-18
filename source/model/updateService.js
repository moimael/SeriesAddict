enyo.kind({
	name: "TheTVDBUpdate",
	kind: "enyo.Component",
	published: {
		apiKey: ""
	},
	events: {
		onResponse: "",
		onCurrentTimeResponse: ""
	},
	components: [
		{name: "getUpdatedShows", kind: "enyo.WebService",
			onSuccess: "gotUpdatedShows",
			onFailure: "gotUpdatedShowsFailure"
		},
		{name: "getCurrentTime", kind: "enyo.WebService",
			onSuccess: "gotCurrentTime",
			onFailure: "gotCurrentTimeFailure"
		}
	],
	
	create: function() {
		this.inherited(arguments);
		this.mirrorUrl = "http://www.thetvdb.com";
		this.baseUrl = this.mirrorUrl + "/api/";
		this.baseKeyUrl = this.baseUrl + this.apiKey;
		this.updatedSeriesList = [];
		this.updatedEpisodesList = [];
		this.currentTime = 0;
	},
	
	hasUpdatedSeriesList: function() {
		return this.updatedSeriesList;
	},
	
	hasUpdatedEpisodesList: function() {
		return this.updatedEpisodesList;
	},
	
	resetLists: function() {
		this.updatedSeriesList = [];
		this.updatedEpisodesList = [];
	},
	
	getUpdatedShows: function(actualTime, lastUpdated) {
	
		var elapsedTime = this.getElapsedTime(actualTime, lastUpdated);
		// Get a list of shows matching showName.
		if(elapsedTime === "all") {
		
		}
		else {
			var url = this.baseKeyUrl + "/updates/updates_" + elapsedTime + ".xml";
			this.$.getUpdatedShows.setUrl(url);
			this.$.getUpdatedShows.call();
		}
	},
	
	gotUpdatedShows: function(inSender, inResponse, inRequest) {
		this.updatedSeriesList = [];
		this.updatedEpisodesList = [];
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		for(i = 0; i < xmlDoc.getElementsByTagName('Series').length; i++){
			//Sometimes we get undefined xml
			if(typeof xmlDoc.getElementsByTagName('Series')[i].getElementsByTagName('id')[0] !== 'undefined'){
				this.updatedSeriesList.push(xmlDoc.getElementsByTagName('Series')[i].getElementsByTagName('id')[0].childNodes[0].nodeValue);
			}
		}
		for(i = 0; i < xmlDoc.getElementsByTagName('Episode').length; i++){
			if(typeof xmlDoc.getElementsByTagName('Episode')[i].getElementsByTagName('id')[0] !== 'undefined'){
				this.updatedEpisodesList.push(xmlDoc.getElementsByTagName('Episode')[i].getElementsByTagName('id')[0].childNodes[0].nodeValue);
			}
		}
		//parcourir series = à serieid et episodes = à episodeid
		this.doResponse();
	},
	
	//TODO split in 2 functions
	getElapsedTime: function(actualTime, lastUpdated) {
		var xmlFileType;
		var elapsedTime = actualTime - lastUpdated;
		if (elapsedTime < 86400){
			//update show with day.xml
			xmlFileType = "day";
		} else if (elapsedTime > 86400 && elapsedTime < 604800 ) { // 259200 3 days, 1 day = 86400 seconds, 1 week 604800 seconds
			//update show with week.xml
			xmlFileType = "week";
		} else if (elapsedTime > 604800) {
			//update show with month.xml
			xmlFileType = "month";
		}
		else {
			//update all
			xmlFileType = "all";
		}
		return xmlFileType;
	},
	
	getCurrentTime: function() {
		var url = this.baseUrl + "Updates.php?type=none";
		this.$.getCurrentTime.setUrl(url);
		this.$.getCurrentTime.call();
	},
	
	gotCurrentTime: function(inResponse) {
		this.doCurrentTimeResponse();
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		this.currentTime = xmlDoc.getElementsByTagName('Items')[0].getElementsByTagName('Time')[0].childNodes[0].nodeValue;
		this.doCurrentTimeResponse();
	},
	
	hasCurrentTime: function() {
		return this.currentTime();
	}
});


