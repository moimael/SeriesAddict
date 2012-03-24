enyo.kind({
	name: "theTvDbApi3",
	kind: "enyo.Component",
	published: {
		apiKey: "",
		language: "en",
		serieId: ""
	},
	events: {
		onFinished: ""
	},
	components: [
		{name: "getShowDetails", kind: "enyo.WebService", onSuccess: "gotShowDetails", onFailure: "gotShowDetailsFailure"},
		{name: "getShowBanners", kind: "enyo.WebService", onSuccess: "gotShowBanners", onFailure: "gotShowBannersFailure"},
		{name: "seriesDb", kind: "onecrayon.Database", database: 'ext:com.moimael.seriesaddict', version: '1', debug: true}
	],
	
	create: function() {
		this.inherited(arguments);
		this.mirrorUrl = "http://www.thetvdb.com";
		this.baseUrl = this.mirrorUrl + "/api/";
		this.baseKeyUrl = this.baseUrl + this.apiKey;
	},
	
	getShowDetails: function() {
		// Get a list of shows matching showName.
		var url = this.baseKeyUrl + "/series/" + this.serieId + "/all/" + this.language + ".xml";
		this.$.getShowDetails.setUrl(url);
		this.$.getShowDetails.call();
	},
	
	gotShowDetails: function(inSender, inResponse, inRequest) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		var jsonSerieInfos = XML2jsobj(xmlDoc.documentElement);
		
		//Serie details
		var id = jsonSerieInfos.Series.id;
		var actors = jsonSerieInfos.Series.Actors;
		var airDayOfWeek = jsonSerieInfos.Series.Airs_DayOfWeek;
		var firstAired = jsonSerieInfos.Series.FirstAired;
		var genre = jsonSerieInfos.Series.Genre;
		var overview = jsonSerieInfos.Series.Overview;
		var rating = jsonSerieInfos.Series.Rating;
		var seriesName = jsonSerieInfos.Series.SeriesName;
		var status = jsonSerieInfos.Series.Status;
		var lastUpdated = jsonSerieInfos.Series.lastupdated;
		var poster = jsonSerieInfos.Series.poster;
		
		var serieObj = {
			"id": id,
			"Actors": actors,
			"Airs_DayOfWeek": airDayOfWeek,
			"FirstAired": firstAired,
			"Genre": genre,
			"Overview": overview,
			"Rating": rating,
			"SeriesName": seriesName,
			"Status": status,
			"lastupdated": lastUpdated,
			"poster": poster
		}
		
		//Add serie details in database
		this.$.seriesDb.insertData({table: "series", data: serieObj});
		this.doFinished();
		
		//Episodes details
		for(i = 0; i < jsonSerieInfos.Episode.length; i++){
			var id = jsonSerieInfos.Episode[i].id;
			var director = jsonSerieInfos.Episode[i].Director;
			var episodeName = jsonSerieInfos.Episode[i].EpisodeName;
			var episodeNumber = jsonSerieInfos.Episode[i].EpisodeNumber;
			var firstAired = jsonSerieInfos.Episode[i].FirstAired;
			var guestStars = jsonSerieInfos.Episode[i].GuestStars;
			var overview = jsonSerieInfos.Episode[i].Overview;
			var rating = jsonSerieInfos.Episode[i].Rating;
			var seasonNumber = jsonSerieInfos.Episode[i].SeasonNumber;
			var writer = jsonSerieInfos.Episode[i].Writer;
			var fileName = jsonSerieInfos.Episode[i].filename;
			var lastUpdated = jsonSerieInfos.Episode[i].lastupdated;
			var seasonId = jsonSerieInfos.Episode[i].seasonid;
			var seriesId = jsonSerieInfos.Episode[i].seriesid;
		
			var episodeObj = {
				"id": id,
				"Director": director,
				"EpisodeName": episodeName,
				"EpisodeNumber": episodeNumber,
				"FirstAired": firstAired,
				"GuestStars": guestStars,
				"Overview": overview,
				"Rating": rating,
				"SeasonNumber": seasonNumber,
				"Writer": writer,
				"filename": fileName,
				"lastupdated": lastUpdated,
				"seasonid": seasonId,
				"seriesid": seriesId
			}
		
			//Add episodes details in database
			this.$.seriesDb.insertData({table: "episodes", data: episodeObj});
		}
	},
	
	getShowBanners: function() {
		// Get a list of shows matching showName.
		var url = this.baseKeyUrl + "/series/" + this.serieId + "/banners.xml";
		this.$.getShowBanners.setUrl(url);
		this.$.getShowBanners.call();
	},
	
	gotShowBanners: function(inSender, inResponse, inRequest) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		var jsonSerieBanners = XML2jsobj(xmlDoc.documentElement);
		enyo.windows.addBannerMessage(jsonSerieBanners, '{}');
		var seasonList = [];
		for(i = 0; i < jsonSerieBanners.Banner.length; i++){
			if(jsonSerieBanners.Banner[i].BannerType == "season"){
				var season = jsonSerieBanners.Banner[i].Season;
				if(seasonList.indexOf(season) == -1){
					var id = jsonSerieBanners.Banner[i].id;
					var bannerPath = jsonSerieBanners.Banner[i].BannerPath;
					seasonList.push(season);
					this.$.seriesDb.insertData({table: "banners", data: [{"id": id, "BannerPath": bannerPath, "Season": season, "SerieID": this.serieId}]});
				}
			}
		}
	}
});


