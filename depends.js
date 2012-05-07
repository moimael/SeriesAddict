enyo.depends(
	// Main window
	"source/SeriesAddict.js", 
	
	// All views which take place in main window
	"source/seriesView.js",
	"source/detailsView.js",
	"source/seasonsView.js",
	
	// The dialog to add series
	"source/AddShowDialog.js",
	
	//Custom controls
	"source/animatedGrid.js",
	"source/multiSelectControl.js",
	
	"css/seriesView.css",
	
	// DataAdapters
	"source/xml2jsobj.js",
	"source/model/"
);
