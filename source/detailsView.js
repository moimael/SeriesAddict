enyo.kind({
	name: "detailsView",
	kind: "enyo.HFlexBox",
	published: {
		selectedRow: ""
	},
	components: [
		{kind: "SlidingPane", flex: 1, components: [
			{name: "left", width: "400px", components: [
				{kind: "enyo.PageHeader", className: "enyo-header-dark", layoutKind: "enyo.HFlexLayout", components: [
				]},
				{flex: 1, kind: "enyo.Scroller", className: "enyo-bg", components: [
					{name: "showList2", kind: "enyo.VirtualRepeater", onSetupRow: "setupRow", components: [
						{name: "episodeItem", kind: "enyo.Item", layoutKind: "enyo.HFlexLayout", className: "enyo-text-ellipsis", tapHighlight: true, components: [
							{name: "chkBox", kind: "enyo.CheckBox", onChange: "checkboxClicked"},
							{kind: "Spacer", flex: 1}, //TODO: Replace with css
							{kind: "enyo.VFlexBox", flex: 10, onclick: "episodeDetails", components: [
								{name: "title", flex: 1},
								{kind: "Spacer", style: "margin: 4px;", flex: 1},
								{name: "airDate", flex: 1},
								{name: "id", flex: 1, showing: false}
							]}
						]}
					]}
				]},
				{kind: "enyo.Toolbar", components: [
					{caption: $L("Back"), align: "left", onclick: "goBack"},
					{kind: "enyo.Spacer"},
					{caption: $L("Mark as Watched"), align: "left", onclick: "checkAll"}
				]}
			]},
			{name: "middle", components : [
				{kind: "enyo.PageHeader", className: "enyo-header-dark", layoutKind: "enyo.HFlexLayout", components: [
				]},
				{flex: 1, kind: "enyo.Scroller", className: "enyo-bg", components: [
					{kind: "enyo.VFlexBox", components: [
						{name: "episodeTitle", style: "font-weight:bold; padding: 6px;"},
						{name: "episodeOverview", style: "padding-left: 6px; padding-top: 12px; padding-bottom: 12px;"},
						{name: "originalAirDate", style: "padding-left: 6px; padding-top: 6px;"},
						{name: "director", style: "padding-left: 6px;"},
						{name: "writer", style: "padding-left: 6px;"},
						{name: "guestStars", style: "padding-left: 6px;"},
						{name: "ratings", style: "padding-left: 6px;"}
					]}
				]},
				{kind: "enyo.Toolbar", components: [
					{name: "dragHandle", kind: "enyo.GrabButton"}
				]}
			]}
		]},
		{name: "seriesDb", kind: "onecrayon.Database", database: 'ext:com.moimael.seriesaddict', version: '1', debug: true}
	],
	
	create: function() {
		this.inherited(arguments);
		this.activeItem = null;
		this.episodesList = [];
	},
	
	setupRow: function(inSender, inIndex) {
	
		var selectedClassName = "enyo-item-selected";
		this.log(inSender + inIndex);
		if(this.episodesList != [] && inIndex !== null){
			if (inIndex < this.episodesList.length) {
				this.$.chkBox.setChecked(this.episodesList[inIndex].watched);
				this.$.title.setContent("Ep. " + this.episodesList[inIndex].EpisodeNumber + "x" + this.episodesList[inIndex].SeasonNumber + ": " + this.episodesList[inIndex].EpisodeName);
				
				var date = new enyo.g11n.DateFmt({
					date: "dd MMMM yyyy"
				}).format(new Date(this.episodesList[inIndex].FirstAired));
				this.$.airDate.setContent(date);
				this.$.id.setContent(this.episodesList[inIndex].id);
				
				// if selected item is the same as the one being rendered, highlight it
				if(inIndex == this.activeItem) {
					this.$.episodeItem.addClass(selectedClassName);
				}
				else if(this.$.episodeItem.hasClass(selectedClassName)) {
					this.$.episodeItem.removeClass(selectedClassName);
				}

				return true;
			}
		}
	},
	
	setupView: function(seasonId) {
		var query = {
			sql: 'SELECT id, EpisodeName, EpisodeNumber, FirstAired, SeasonNumber, seasonid, watched FROM episodes WHERE episodes.seasonid = ? ORDER BY EpisodeNumber',
			values: [seasonId]
		};
		this.$.seriesDb.query(query, {
			onSuccess: enyo.bind(this, this.refreshList)
		});
		
	},
	
	refreshList: function(inResponse){
		this.episodesList = inResponse;
		this.$.showList2.render();
	},
	
	episodeDetails: function(inSender, inEvent, inIndex) {
		
		// Render only the new selected item and the old one
		var oldActiveItem = this.activeItem; 
		this.activeItem = inEvent.rowIndex;
		this.$.showList2.renderRow(this.activeItem);
		this.$.showList2.renderRow(oldActiveItem);
		
		var query = {
			sql: 'SELECT Overview, EpisodeName, FirstAired, Director, Writer, GuestStars, Rating FROM episodes WHERE episodes.id = ?',
			values: [this.episodesList[inEvent.rowIndex].id]
		};
		this.$.seriesDb.query(query, {
			onSuccess: enyo.bind(this, this.setupDetailsPane)
		});
	},
	
	setupDetailsPane: function(inResponse) {
		this.log(inResponse);
		this.$.episodeTitle.setContent(inResponse[0].EpisodeName);
		this.$.episodeOverview.setContent(inResponse[0].Overview);
		var date = new enyo.g11n.DateFmt({
					date: "dd MMMM yyyy"
				}).format(new Date(inResponse[0].FirstAired));
		this.$.originalAirDate.setContent($L("Air Date: ") + date);
		this.$.director.setContent($L("Director: ") + inResponse[0].Director);
		this.$.writer.setContent($L("Writer: ") + inResponse[0].Writer);
		this.$.guestStars.setContent($L("Guest Stars: ") + inResponse[0].GuestStars);
		this.$.ratings.setContent($L("Rating: ") + inResponse[0].Rating);
	},
	
	checkboxClicked: function(inSender, inEvent) {
		var query = {
			sql: 'UPDATE episodes SET watched = ? WHERE episodes.id = ?',
			values: [inSender.getChecked() ? 1 : 0, inSender.owner.$.id.getContent()]
		};
		this.$.seriesDb.query(query);
	},
	
	//Mark entire season as read, by checking all checkboxes
	checkAll: function() {
		var i;
		var query = {
			sql: 'UPDATE episodes SET watched = ? WHERE episodes.seasonid = ?',
			values: [1, this.episodesList[0].seasonid]
		};
		this.$.seriesDb.query(query, {
			onSuccess: enyo.bind(this, this.setupView, this.episodesList[0].seasonid)
		});
	},
	
	goBack: function(inSender, inEvent) {
		this.owner.$.pane.back(inEvent);
	}

});
