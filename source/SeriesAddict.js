enyo.kind({
	name: "SeriesAddict",
	kind: enyo.VFlexBox,
	components: [
		{kind: "enyo.PageHeader", className: "enyo-header-dark", layoutKind: "enyo.HFlexLayout", components: [
			{kind: "enyo.Spacer"},
			{name: "searchShowsInput", kind: "enyo.RoundedSearchInput", oninput: "searchShow", onCancel: "searchShow"}
		]},
		{flex: 1, kind: "enyo.Pane", components: [
			{flex: 1, name: "home", kind: "enyo.Scroller", className: "enyo-bg", components: [
				{name: "gridView", kind: "animatedGrid", cellClass:"image", onItemClick: "showDetails", components: [
				]}
			]},
			{flex: 1, name: "details", kind: "enyo.Scroller", className: "enyo-bg", components: [
				{name: "seasonsView", kind: "animatedGrid", cellClass:"image", components: [
				]}
			]}
		]},
		{kind: "enyo.Toolbar", components: [
			{caption: $L("Back"), align: "left", onclick: "goBack"},
			{kind: "enyo.Spacer"},
			{caption: $L("Add"), align: "right", onclick: "addShow"}
		]},
		{name: "addShowDialog", kind: "AddShowDialog", onClose: "getShowDetails"},
		{name: "theTvDbApi3", kind: "theTvDbApi3", apiKey: "FAD75AF31E1B1577", onFinished: "gotShowDetails"},
		{name: "seriesDb", kind: "onecrayon.Database", database: 'ext:com.moimael.seriesaddict', version: '1', debug: true}
	],
	
	create: function() {
		this.inherited(arguments);
		var currentLocale = new enyo.g11n.currentLocale();
		this.localeLanguage = currentLocale.getLanguage();
		this.$.seriesDb.setSchemaFromURL('source/model/dbschema.json');
		this.populateView();
	},
	
	populateView: function(){
		this.$.seriesDb.query({sql: 'SELECT id, SeriesName, poster FROM series'}, {onSuccess: enyo.bind(this, this.populate)});
	},
	
	populate: function(inResponse){
		for(i = 0; i < inResponse.length; i++){
			this.addItem(inResponse[i].SeriesName, "http://www.thetvdb.com/banners/" + inResponse[i].poster, inResponse[i].id);
		}
	},
	
	gotShowDetails: function(){
		this.$.seriesDb.query({sql: 'SELECT poster FROM series WHERE id = ?', values: [this.$.addShowDialog.hasShowId()]}, {onSuccess: enyo.bind(this, this.addSeries)});
	},
	
	addSeries: function(inResponse) {
		this.addItem(this.$.addShowDialog.hasShowName(), this.$.theTvDbApi3.bannerUrl, "http://www.thetvdb.com/banners/" + inResponse[0].poster);
	},
	
	addItem: function(name, src, id){
		this.$.gridView.addItem({name: name, kind: "enyo.Image", src: src, seriesId: id}, 'animated bounceInDown');
	},
	
	showDetails: function(inSender, inGridItem) {
//		var c = this.$.gridView.getControls();
//		for(i = 0; i < c.length; i++){
//			c[i].addClass('animated bounceOutUp');
//		}
		this.log(inGridItem);
		this.$.seriesDb.query({sql: 'SELECT DISTINCT seasonid, SeasonNumber, BannerPath FROM episodes, banners WHERE episodes.seriesid = ? AND banners.SerieID = ? AND banners.Season = episodes.SeasonNumber ORDER BY SeasonNumber', values: [73739, 73739]}, {onSuccess: enyo.bind(this, this.pope)});//inGridItem.getId()
		this.$.gridView.destroyComponents();
		this.$.pane.selectViewByName("details");

	},
	
	pope: function(inResponse) {
		this.log(inResponse);
		for(i = 0; i < inResponse.length; i++){
			this.$.seasonsView.addItem({kind: "enyo.Image", src: "http://www.thetvdb.com/banners/" + inResponse[i].BannerPath, published: {seasonId: inResponse[i].seasonid}});
		}
	},
	
	addShow: function() {
		this.$.addShowDialog.setLanguage(this.localeLanguage);
		this.$.addShowDialog.showDialog();
	},
	
	getShowDetails: function() {
		this.$.theTvDbApi3.setSerieId(this.$.addShowDialog.hasShowId());
		this.$.theTvDbApi3.setLanguage(this.localeLanguage);
		this.$.theTvDbApi3.getShowDetails();
		this.$.theTvDbApi3.getShowBanners();
	},
	
	searchShow: function(inSender, inEvent) {
		for (i = 0; i < this.$.gridView.getControls().length; i++){
			this.$.gridView.getControls()[i].removeClass('animated bounceInDown');
			this.$.gridView.getControls()[i].removeClass('animated fadeOut');
			if (this.$.gridView.getControls()[i].getName().match(new RegExp(inSender.getValue(),"gi"))){
				this.$.gridView.getControls()[i].show();
			}
			else{
				this.$.gridView.getControls()[i].removeClass('animated bounceInDown');
//				this.$.gridView.getControls()[i].addClass('animated fadeOut');
//				this.$.gridView.getControls()[i].hide(); // creer un event perso avec un dofinished apres le addclass
				
			}
		}
	},
	
	goBack: function(inSender, inEvent) {
		this.$.seasonsView.destroyComponents();
		this.$.pane.back(inEvent);
		this.populateView();
	},
	
	arrayMax: function(array) {
		var maximum = array[0];
		var len = array.length;
		for (var i = 1; i < len; i++) {
			if (array[i] > maximum) {
				maximum = array[i];
			}
		}
		return maximum;
	}

});
