enyo.kind({
	name: "AddShowDialog",
	kind: "enyo.ModalDialog",
	caption: $L("Add a show"),
	published: {
		selectedRow: "",
		language: "en"
	},
	components: [
		{name: "searchShowInput", kind: "RoundedSearchInput", oninput: "searchShow"}, //oninput: "searchShow"
		{kind: "Scroller", flex: 1, height: "300px", components: [
		{name: "showList", kind: "VirtualRepeater", onSetupRow: "setupRow", components: [
			{name: "seriesName", kind: "Item", layoutKind: "HFlexLayout", tapHighlight: true, components: [
				{name: "caption", flex: 1, onclick: "addShow"}
			]}
		]}]},
		{kind: "Button", caption: $L("Close"), onclick: "cancelClick"},

		{name: "tvdbapi", kind: "theTvDbApi", apiKey: "FAD75AF31E1B1577", onFinished: "finished"}
	],

	setupRow: function(inSender, inIndex) {
		if(this.$.tvdbapi.hasShowsList() != []){
			if (inIndex < this.$.tvdbapi.hasShowsList().length) {
				this.$.caption.setContent(this.$.tvdbapi.hasShowsList()[inIndex]);
				return true;
			}
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

