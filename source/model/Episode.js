enyo.kind({
	name: "Episode",
	id: 0,
	director: "",
	episodeName: "",
	episodeNumber: 0,
	firstAired: "",
	guestStars: "",
	overview: "",
	rating: 0.0,
	seasonNumber: 0,
	writer: "",
	fileName: "",
	lastUpdated: 0,
	seasonId: 0,
	seriesId: 0,
	
	constructor: function(json) {
		this.id = json.id;
		this.director = json.Director;
		this.episodeName = json.EpisodeName;
		this.episodeNumber = json.EpisodeNumber;
		this.firstAired = json.FirstAired;
		this.guestStars = json.GuestStars;
		this.overview = json.Overview;
		this.rating = json.Rating;
		this.seasonNumber = json.SeasonNumber;
		this.writer = json.Writer;
		this.fileName = json.filename;
		this.lastUpdated = json.lastupdated;
		this.seasonId = json.seasonid;
		this.seriesId = json.seriesid;
	}
//	toString: function() {
//		return this.x + ", " + this.y;
//	}
});
