//TODO: remplacer l'insertion en bdd par des events et laisser le controlleur (seriesaddict) s'en occuper

enyo.kind({
	name: "theTvDbApi3",
	kind: "enyo.Component",
	published: {
		apiKey: "",
		language: "en",
		serieId: "",
		episodeId: "",
		updateMode: false
	},
	events: {
		onFinished: ""
	},
	components: [
		{name: "getShowDetails", kind: "enyo.WebService", onSuccess: "gotShowDetails", onFailure: "gotShowDetailsFailure"},
		{name: "getEpisodeDetails", kind: "enyo.WebService", onSuccess: "gotEpisodeDetails", onFailure: "gotEpisodeDetailsFailure"},
		{name: "getShowBanners", kind: "enyo.WebService", onSuccess: "gotShowBanners", onFailure: "gotShowBannersFailure"},
		{name: "imagesDownloader", kind: "SeriesAddict.ImagesDownloadService", onDownloadFinished: "downloadFinished"},
		{name: "seriesDb", kind: "onecrayon.Database", database: 'ext:com.moimael.seriesaddict', version: '1', debug: true}
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
	},
	
	getShowDetails: function() {
		// Get a list of shows matching serieId and user language
		var url = this.baseKeyUrl + "/series/" + this.serieId + "/all/" + this.language + ".xml";
		this.$.getShowDetails.setUrl(url);
		this.$.getShowDetails.call();
	},
	//TODO: getShowAndEpisodeDetails function to cleanly separate the roles
	/** @protected */
	gotShowDetails: function(inSender, inResponse, inRequest) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		var jsonSerieInfos = XML2jsobj(xmlDoc.documentElement);
		
		if (this.updateMode){
			this.updateSerie(jsonSerieInfos.Series);
		} else{
			this.insertSerie(jsonSerieInfos.Series);
			
			//Episodes details
			this.insertEpisodes(jsonSerieInfos.Episode);
		}
		
	},
	
	getEpisodeDetails: function() {
		// Get a list of shows matching episodeId and user language
		var url = this.baseKeyUrl + "/episodes/" + this.episodeId + "/" + this.language + ".xml";
		this.$.getEpisodeDetails.setUrl(url);
		this.$.getEpisodeDetails.call();
	},
	
	/** @protected */
	gotEpisodeDetails: function(inSender, inResponse, inRequest) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(inResponse, "text/xml");
		var jsonEpisodeInfos = XML2jsobj(xmlDoc.documentElement);
		
		//Episodes details
		if(this.updateMode) {
			this.updateEpisode(jsonEpisodeInfos.Episode);
		} else { //Not useful until i split up function to get episode and series details
			this.insertEpisode(jsonEpisodeInfos.Episode, 1);
		}
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
			"lastupdated": show.lastUpdated
		};
		
		//TODO: Update query
		var queryUpdateShow = this.$.seriesDb.getUpdate("series", serieObj, {"id": show.id});
		this.$.seriesDb.query(queryUpdateShow);
	},
	 
	//Insert all episodes as one sql transaction
	insertEpisodes: function(data) {
		var episodeObjs = [];
		for(i = 0; i < data.length; i++){
			var episode = new Episode(data[i]);
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
			episodeObjs.push(episodeObj);
		}
		
		//Add episodes details in database
		this.$.seriesDb.insertData({table: "episodes", data: episodeObjs}, {onSuccess: enyo.bind(this, this.dataInserted)});
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
		var queryUpdateEpisode = this.$.seriesDb.getUpdate("episodes", episodeObj, {"id": episode.id});
		this.$.seriesDb.query(queryUpdateEpisode);
	},
	
	dataInserted: function(){
		this.nb++;
		if(this.nb === 2){
			this.servicesFinished();
			this.nb = 0;
		}
		
	},
	
	downloadFinished: function() {
		this.nb2++;
		this.log(this.nb2 + " banners : " + this.nbBanners);
		if(this.nb2 === this.nbBanners + 1){
			this.servicesFinished();
			this.nbBanners = 0;
			this.nb2 = 0;
		}
		
	},
	
	servicesFinished: function() {
		this.log(this.nb3);
		this.nb3++;
		if(this.nb3 === 2){
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


