enyo.kind({
	name: "Show",
	id: 0,
	actors: "",
	airDayOfWeek: "",
	firstAired: "",
	genre: "",
	overview: "",
	rating: 0.0,
	seriesName: "",
	status: "",
	lastUpdated: "",
	poster: "",
	
	constructor: function(json) {
		this.id = json.id;
		this.actors = json.Actors;
		this.airDayOfWeek = json.Airs_DayOfWeek;
		this.firstAired = json.FirstAired;
		this.genre = json.Genre;
		this.overview = json.Overview;
		this.rating = json.Rating;
		this.seriesName = json.SeriesName;
		this.status = json.Status;
		this.lastUpdated = json.lastupdated;
		this.poster = json.poster;
	}
	
//	translate: function(dx, dy) {
//		this.x += dx;
//		this.y += dy;
//	},
//	
//	toString: function() {
//		return this.x + ", " + this.y;
//	}
});
