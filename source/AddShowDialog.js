enyo.kind({
	name: "SeriesAddict.addShowDialog",
	kind: "enyo.ModalDialog",
	caption: $L("Add a show"),
	events: {
		onItemClicked: ""
	},
	published: {
		selectedRow: "",
		language: "en"
	},
	components: [
		{name: "searchShowInput", kind: "enyo.RoundedSearchInput",
			spellcheck: false,
			autocorrect: false,
			autoWordComplete: false,
			onkeypress: "searchInputKeypress",
			onkeyup: "keyup"
		},
		{kind: "RowGroup", components: [
			{kind: "Scroller", flex: 1, height: "300px", components: [
				{name: "showList", kind: "enyo.VirtualRepeater", onSetupRow: "setupRow", components: [
					{name: "seriesName", kind: "enyo.Item", layoutKind: "HFlexLayout", tapHighlight: true, components: [
						{name: "caption", flex: 1, onclick: "addShow"}
					]}
				]}
			]}
		]},

		{kind: "Button", caption: $L("Cancel"), onclick: "cancelClick"},

		{name: "tvdbapi", kind: "TheTVDBSearch", apiKey: "FAD75AF31E1B1577", onFinished: "finished"}
	],

	setupRow: function(inSender, inIndex) {
		if(this.$.tvdbapi.hasShowsList() != []){
			if (inIndex < this.$.tvdbapi.hasShowsList().length) {
				if (inIndex === 0) {
					this.$.seriesName.addClass("enyo-first");
				} else if (inIndex == this.$.tvdbapi.hasShowsList().length - 1) {
					this.$.seriesName.addClass("enyo-last");
				}
				this.$.caption.setContent(this.$.tvdbapi.hasShowsList()[inIndex]);
				return true;
			}
		}
	},
	
	searchInputKeypress: function(inSender, inEvent) {
		if (inEvent.keyCode == 13) {
			this.searchShow();
		}
	},
	
	//Workaround to make the enter key work on webos phones
	keyup: function(inSender, inEvent) {
		deviceInfo = JSON.parse(PalmSystem.deviceInfo);
		majorVersion = deviceInfo.platformVersionMajor;
		if (majorVersion < 3 && inEvent.keyCode == 13) {
			this.searchShow();
			return;
		}
	},
	
	searchShow: function(inSender, inEvent) {
		this.$.tvdbapi.resetLists();
		this.$.tvdbapi.setLanguage(this.language);
		this.$.tvdbapi.getMatchingShows(this.$.searchShowInput.getValue());
	},
	
	finished: function(){
		this.$.showList.render();
	},
	
	hasShowId: function(){
		return this.$.tvdbapi.hasShowsIdList()[this.selectedRow];
	},
	
	hasShowName: function(){
		return this.$.tvdbapi.hasShowsList()[this.selectedRow];
	},
	
	addShow: function(inSender, inEvent) {
		this.selectedRow = inEvent.rowIndex;
		this.doItemClicked();
		this.close();
	},
	
	showDialog: function() {
		this.openAtCenter();
		this.$.searchShowInput.setValue("");
		this.$.tvdbapi.resetLists();
		this.$.showList.render();
	},
	
	cancelClick: function() {
		this.close();
	}
});

