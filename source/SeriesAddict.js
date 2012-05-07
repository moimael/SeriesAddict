enyo.kind({
	name: "SeriesAddict",
	kind: enyo.VFlexBox,
	components: [
		{flex: 1, kind: "enyo.Pane", transitionKind: "enyo.transitions.Fade", components: [
			{flex: 1, name: "home", kind: "SeriesAddict.seriesView", 
				onItemClicked: "showSeasons", 
				onAddClicked: "addShow",
				onUpdateDb: "getUpdatedShows"
			},
			{flex: 1, name: "details", kind: "SeriesAddict.seasonsView", 
				onItemClicked: "showDetails", 
				onGoBack: "goBack"
			},
			{flex: 1, name: "details2", kind: "detailsView"}
		]},
		{name: "addShowDialog", kind: "SeriesAddict.addShowDialog", onItemClicked: "getShowDetails"},
		
		// We need to re-render the home when the serie poster finished downloading to actually display the poster
		{name: "theTvDbApi3", kind: "theTvDbApi3", apiKey: "FAD75AF31E1B1577", 
			onFinished: "gotShowDetails"
		},
		{name: "seriesDb", kind: "onecrayon.Database", database: 'ext:com.moimael.seriesaddict', version: '1', debug: true},
		{name: "updateService", kind: "TheTVDBUpdate", apiKey: "FAD75AF31E1B1577", 
			onResponse: "gotUpdates"
		}
	],
	
	create: function() {
		this.inherited(arguments);
		
		//If app is run for the first time, create database
		if (!localStorage["SeriesAddict.firstRun"]){
			this.populateDatabase();
		} else {
			this.populateDatabase();
			this.populateView(); //We fill the view with database content
		}
		
		// Retrieve user's locale
		var currentLocale = new enyo.g11n.currentLocale();
		this.localeLanguage = currentLocale.getLanguage();
		
	},
	
	populateDatabase: function() {
		this.$.seriesDb.setSchemaFromURL('source/model/dbschema.json', {
			onSuccess: enyo.bind(this, this.finishFirstRun)
		});
	},
	
	finishFirstRun: function() {
		localStorage["SeriesAddict.firstRun"] = true;
	},
	
	// Retrieve database shows
	populateView: function(){
		var sql = 'SELECT id, SeriesName, poster FROM series';
		this.$.seriesDb.query(sql, {
			onSuccess: enyo.bind(this, this.populate)
		});
	},
	
	// Add database shows to the home  
	populate: function(inResponse){
		for(i = 0; i < inResponse.length; i++){
			var thumbnail = "/var/luna/data/extractfs" + "/media/internal/.seriesaddict/banners/" + inResponse[i].poster + ":0:0:255:375:3";
			var item = {
				name: inResponse[i].SeriesName,
				kind: "enyo.Image",
				src: thumbnail,
				seriesId: inResponse[i].id,
				selected: false
			};
			this.$.home.addItem(item, true);
		}
	},
	
	getUpdatedShows: function() {
		this.$.updateService.getUpdatedShows(1335801138, 1225801138);
	},
	
	gotUpdates: function() {
		var sql = 'SELECT id FROM series';
		this.$.seriesDb.query(sql, {
			onSuccess: enyo.bind(this, this.updateSeries)
		});
	},
	
	updateSeries: function(inResponse) {
		for(i = 0; i < inResponse.length; i++){
			var index = this.$.updateService.hasUpdatedSeriesList().indexOf(inResponse[i].id);
			if(index !== -1){
				this.log(index);
//				this.$.theTvDbApi3.setSerieId(this.$.updateService.hasUpdatedSeriesList()[i]);
//				this.$.theTvDbApi3.getShowDetails(true);
			}
		}
		this.$.home.$.spinner.hide();
//		for(i = 0; i < this.$.updateService.hasUpdatedEpisodesList().length; i++){
//			if(inResponse.indexOf(this.$.updateService.hasUpdatedEpisodesList()[i] != -1)){
//				this.$.theTvDbApi3.setEpisodeId(this.$.updateService.hasUpdatedEpisodesList()[i].id);
//				this.$.theTvDbApi3.getEpisodeDetails();
//			}
//		}
	},
	
	updateDb: function() {
		var sql = 'SELECT id, SeriesName, poster FROM series';
		this.$.seriesDb.query(sql, {
			onSuccess: enyo.bind(this, this.populate)
		});
	},
	
	gotShowDetails: function(){
//		var query = {
//			sql: 'SELECT id, poster FROM series WHERE id = ?',
//			values: [this.$.addShowDialog.hasShowId()]
//		};
//		this.$.seriesDb.query(query, {
//			onSuccess: enyo.bind(this, this.addSeries)
//		});
		this.populateView();
	},
	
	// Add serie to the series view
//	addSeries: function(inResponse) {
//		this.log(inResponse)
//		if (inResponse != null) {
//			this.response = inResponse;
//		} else {
//			this.response = null;
//		}
//		this.render();
////		this.addItem(this.$.addShowDialog.hasShowName(), "/media/internal/.seriesaddict/banners/" + inResponse[0].poster, inResponse[0].id);
//	},
	
	// Show seasons view
	showSeasons: function(inSender, inGridItem) {
		this.log(inGridItem);
		var query = {
			sql: 'SELECT DISTINCT seasonid, SeasonNumber, BannerPath FROM episodes, banners WHERE episodes.seriesid = ? AND banners.SerieID = ? AND banners.Season = episodes.SeasonNumber ORDER BY SeasonNumber',
			values: [inGridItem.seriesId, inGridItem.seriesId]
		};
		this.$.details.destroyItems();
		this.$.seriesDb.query(query, {
			onSuccess: enyo.bind(this, this.pope)
		});
		this.$.pane.selectViewByName("details");
	},
	
	// Show episodes view
	showDetails: function(inSender, inGridItem) {
		this.$.pane.selectViewByName("details2");
		this.$.details2.setupView(inGridItem.seasonId);
	},
	
	pope: function(inResponse) {
		this.log(inResponse);
		items = [];
		for(i = 0; i < inResponse.length; i++){
			var thumbnail = "/var/luna/data/extractfs" + "/media/internal/.seriesaddict/banners/" + inResponse[i].BannerPath + ":0:0:255:375:3";
			items.push({kind: "enyo.Image", src: thumbnail, seasonId: inResponse[i].seasonid});
		}
		this.$.details.addItems(items);
	},
	
	// Open the dialog to search for a show
	addShow: function() {
		this.$.addShowDialog.setLanguage(this.localeLanguage);
		this.$.addShowDialog.showDialog();
	},
	
	getShowDetails: function() {
		var item = {
			name: "scrim",
			kind: "enyo.Scrim",
			layoutKind: "VFlexLayout",
			style: "position:static;",
			align: "center",
			pack: "center",
			showing: true,
			seriesId: this.$.addShowDialog.hasShowId(),
			components:[
				{kind: "enyo.Spinner", name: "spinner", showing: true}
			]
		};
		this.$.home.addItem(item, false);
		this.$.theTvDbApi3.setSerieId(this.$.addShowDialog.hasShowId());
		this.$.theTvDbApi3.setLanguage(this.localeLanguage);
		this.$.theTvDbApi3.getShowDetails();
		this.$.theTvDbApi3.getShowBanners();
	},
	
//	render: function() {
//		this.log("test" + this.response);
//		
//		//Workaround !!! Sometimes, db return onsuccess with no data, so we refresh the entire view to add item.
//		if(this.response != null){
//			var thumbnail = "/var/luna/data/extractfs" + "/media/internal/.seriesaddict/banners/" + this.response[0].poster + ":0:0:255:375:3";
//			var item = {
//				name: this.$.addShowDialog.hasShowName(),
//				kind: "enyo.Image",
//				src: thumbnail,
//				seriesId: this.response[0].id
//		
//			};
//			var i;
//			for(i = 0; i < this.$.home.getItems().length; i++){
//				if(this.$.home.getItems()[i].seriesId == this.response[0].id){
//					this.$.home.removeItem(this.$.home.getItems()[i]);
//					break;
//				}
//			}
//			this.$.home.addItem(item, true);
//		}else {
//			this.populateView();
//		}
//	},
	
	// Go back to the previous view
	goBack: function(inSender, inEvent) {
		this.$.pane.back(inEvent);
	}
});
