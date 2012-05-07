//TODO: remplacer l'insertion en bdd par des events et laisser le controlleur (seriesaddict) s'en occuper

enyo.kind({
	name: "theTvDbApi3",
	kind: "enyo.Component",
	published: {
		apiKey: "",
		language: "en",
		serieId: "",
		episodeId: ""
	},
	events: {
		onFinished: ""
	},
	components: [
		{name: "getShowDetails", kind: "enyo.WebService", onSuccess: "gotShowDetails", onFailure: "gotShowDetailsFailure"},
		{name: "getShowBanners", kind: "enyo.WebService", onSuccess: "gotShowBanners", onFailure: "gotShowBannersFailure"},
		{name: "imagesDownloader", kind: "SeriesAddict.ImagesDownloadService", onDownloadFinished: "downloadFinished"},
		{name: "seriesDb", kind: "onecrayon.Database", database: 'ext:com.moimael.seriesaddict', version: '1', debug: false}
	],
	
	create: function() {
		this.inherited(arguments);
		this.mirrorUrl = "http://www.thetvdb.com";
		this.baseUrl = this.mirrorUrl + "/api/";
		this.baseKeyUrl = this.baseUrl + this.apiKey;
		this.nb = 0;
		this.nb2 = 0;
		this.nb3 = 0;
		this.nbBanners = 0;
		this.updateMode = false;
	},
	
	getShowDetails: function() {
		// Get a list of shows matching serieId and user language
		var url = this.baseKeyUrl + "/series/" + this.serieId + "/all/" + this.language + ".xml";
		this.$.getShowDetails.setUrl(url);
		this.$.getShowDetails.call();
	},
	
	/** @protected */
	gotShowDetails: function(inSender, inResponse, inRequest) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		var jsonSerieInfos = XML2jsobj(xmlDoc.documentElement);
		
		if (this.updateMode){
			this.updateSerie(jsonSerieInfos.Series);
		} else{
			this.insertSerie(jsonSerieInfos.Series);
		}
		
//		//Episodes details
//		for(i = 0; i < jsonSerieInfos.Episode.length; i++){
//			if (this.updateMode){
//				if(jsonSerieInfos.Episode[i].id === this.episodeId) {
//					this.updateEpisode(jsonSerieInfos.Episode[i]);
//				}
//			}
//			//else
//			this.insertEpisode(jsonSerieInfos.Episode[i], jsonSerieInfos.Episode.length);
//		}
		
	},
	
	getEpisodeDetails: function() {
		// Get a list of shows matching serieId and user language
		var url = this.baseKeyUrl + "/episodes/" + this.episodeId + this.language + ".xml";
		this.$.getShowDetails.setUrl(url);
		this.$.getShowDetails.call();
	},
	
	/** @protected */
	gotEpisodeDetails: function(inSender, inResponse, inRequest) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		var jsonSerieInfos = XML2jsobj(xmlDoc.documentElement);
		
		//Episodes details
		if(jsonSerieInfos.Episode[i].id === this.episodeId) {
			this.updateEpisode(jsonSerieInfos.Episode[0]);
		}
		//else
		this.insertEpisode(jsonSerieInfos.Episode[0], 1);
	},
	
	insertSerie: function(data) {
		var show = new Show(data);
		
		var serieObj = {
			"id": show.id,
			"Actors": show.actors,
			"Airs_DayOfWeek": show.airDayOfWeek,
			"FirstAired": show.firstAired,
			"Genre": show.genre,
			"Overview": show.overview,
			"Rating": show.rating,
			"SeriesName": show.seriesName,
			"Status": show.status,
			"lastupdated": show.lastUpdated,
			"poster": show.poster
		};
		
		//Add serie details in database
		this.$.seriesDb.insertData({table: "series", data: serieObj}, {onSuccess: enyo.bind(this, this.dataInserted)});
		
		//Download serie poster on external storage
		this.$.imagesDownloader.setTarget(this.mirrorUrl + "/banners/" + show.poster);
		this.$.imagesDownloader.setTargetDir("/media/internal/.seriesaddict/banners/posters/");
		this.$.imagesDownloader.downloadFile();
	},
	
	updateSerie: function(data) {
		var show = new Show(data);
		
		var serieObj = {
			"id": show.id,
			"Actors": show.actors,
			"Airs_DayOfWeek": show.airDayOfWeek,
			"FirstAired": show.firstAired,
			"Genre": show.genre,
			"Overview": show.overview,
			"Rating": show.rating,
			"SeriesName": show.seriesName,
			"Status": show.status,
			"lastupdated": show.lastUpdated,
			"poster": show.poster
		};
		
		//TODO: Update query
		var queryUpdateShow = this.$.seriesDb.getUpdate("series", serieObj, {"id": id});
		this.$.seriesDb.query(queryUpdateShow);
		//Download serie poster on external storage
		this.$.imagesDownloader.setTarget(this.mirrorUrl + "/banners/" + poster);
		this.$.imagesDownloader.setTargetDir("/media/internal/.seriesaddict/banners/posters/");
		this.$.imagesDownloader.downloadFile();
	},
	
	insertEpisode: function(data, length) {
		var episode = new Episode(data);
		var episodeObj = {
			"id": episode.id,
			"Director": episode.director,
			"EpisodeName": episode.episodeName,
			"EpisodeNumber": episode.episodeNumber,
			"FirstAired": episode.firstAired,
			"GuestStars": episode.guestStars,
			"Overview": episode.overview,
			"Rating": episode.rating,
			"SeasonNumber": episode.seasonNumber,
			"Writer": episode.writer,
			"filename": episode.fileName,
			"lastupdated": episode.lastUpdated,
			"seasonid": episode.seasonId,
			"seriesid": episode.seriesId,
			"watched": 0
		};
		
			//Add episodes details in database
			this.$.seriesDb.insertData({table: "episodes", data: episodeObj}, {onSuccess: enyo.bind(this, this.dataInserted(length))});
	},
	
	updateEpisode: function(data) {
		var episode = new Episode(data);
		var episodeObj = {
			"id": episode.id,
			"Director": episode.director,
			"EpisodeName": episode.episodeName,
			"EpisodeNumber": episode.episodeNumber,
			"FirstAired": episode.firstAired,
			"GuestStars": episode.guestStars,
			"Overview": episode.overview,
			"Rating": episode.rating,
			"SeasonNumber": episode.seasonNumber,
			"Writer": episode.writer,
			"filename": episode.fileName,
			"lastupdated": episode.lastUpdated,
			"seasonid": episode.seasonId,
			"seriesid": episode.seriesId
		};
		//TODO Update Episode
		var queryUpdateEpisode = this.$.seriesDb.getUpdate("episodes", serieObj, {"id": id});
		this.$.seriesDb.query(queryUpdateEpisode);
	},
	
	dataInserted: function(length){
		this.nb++;
		if(this.nb == length){
			this.log(this.nb);
			this.servicesFinished();
			this.nb = 0;
		}
		
	},
	
	downloadFinished: function() {
		this.nb2++;
		this.log(this.nb2 + " banners : " + this.nbBanners);
		if(this.nb2 == this.nbBanners + 1){
			this.servicesFinished();
			this.nbBanners = 0;
			this.nb2 = 0;
		}
		
	},
	
	servicesFinished: function() {
		this.log(this.nb3);
		this.nb3++;
		if(this.nb3 == 2){
			this.doFinished();
			this.nb3 = 0;
		}
	},
	
	
	getShowBanners: function() {
		// Get a list of shows matching showName.
		var url = this.baseKeyUrl + "/series/" + this.serieId + "/banners.xml";
		this.$.getShowBanners.setUrl(url);
		this.$.getShowBanners.call();
	},
	
	/** @protected */
	gotShowBanners: function(inSender, inResponse, inRequest) {
	
		// Parse XML
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		
		//Convert XML to JSON
		var jsonSerieBanners = XML2jsobj(xmlDoc.documentElement);
		
		var seasonList = [];
		for(i = 0; i < jsonSerieBanners.Banner.length; i++){
			if(jsonSerieBanners.Banner[i].BannerType == "season"){
				var season = jsonSerieBanners.Banner[i].Season;
				if(seasonList.indexOf(season) == -1){
					this.nbBanners++;
					var id = jsonSerieBanners.Banner[i].id;
					var bannerPath = jsonSerieBanners.Banner[i].BannerPath;
					seasonList.push(season);
					
					// Insert seasons in database
					this.$.seriesDb.insertData({table: "banners", data: [{"id": id, "BannerPath": bannerPath, "Season": season, "SerieID": this.serieId}]});
					
					// Download seasons banners on external storage
					this.$.imagesDownloader.setTarget(this.mirrorUrl + "/banners/" + bannerPath);
					this.$.imagesDownloader.setTargetDir("/media/internal/.seriesaddict/banners/seasons/");
					this.$.imagesDownloader.downloadFile();
				}
			}
		}
	}
});


