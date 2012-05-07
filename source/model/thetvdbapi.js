enyo.kind({
	name: "TheTVDBSearch",
	kind: "enyo.Component",
	published: {
		apiKey: "",
		language: "en"
	},
	events: {
		onFinished: ""
	},
	components: [
		{name: "getMatchingShows", kind: "enyo.WebService",
			onSuccess: "gotMatchingShows",
			onFailure: "gotMatchingShowsFailure"
		}
	],
	
	create: function() {
		this.inherited(arguments);
		this.mirrorUrl = "http://www.thetvdb.com";
		this.baseUrl = this.mirrorUrl + "/api/";
		this.baseKeyUrl = this.baseUrl + this.apiKey;
		this.showsNameList = [];
		this.showsIdList = [];
	},
	
	hasShowsList: function() {
		return this.showsNameList;
	},
	
	hasShowsIdList: function() {
		return this.showsIdList;
	},
	
	resetLists: function() {
		this.showsNameList = [];
		this.showsIdList = [];
	},
	
	getMatchingShows: function(showName) {
		// Get a list of shows matching showName.
		var url = this.baseUrl + "GetSeries.php?" + "seriesname=" + showName + "&language=" + this.language;
		this.$.getMatchingShows.setUrl(url);
		this.$.getMatchingShows.call();
	},
	
	gotMatchingShows: function(inSender, inResponse, inRequest) {
		this.showsNameList = [];
		this.showsIdList = [];
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		for(i = 0; i < xmlDoc.getElementsByTagName('Series').length; i++){
			this.showsNameList.push(xmlDoc.getElementsByTagName('Series')[i].getElementsByTagName('SeriesName')[0].childNodes[0].nodeValue);
			this.showsIdList.push(xmlDoc.getElementsByTagName('Series')[i].getElementsByTagName('seriesid')[0].childNodes[0].nodeValue);
		}
		this.doFinished();
	}
});


