enyo.kind({
	name: "SeriesAddict.seasonsView",
	kind: "enyo.VFlexBox",
	events: {
		onItemClicked: "",
		onGoBack: ""
	},
	components : [
		{kind: "enyo.PageHeader", className: "enyo-header-dark", layoutKind: "enyo.HFlexLayout", components: [
		]},
		{flex: 1, name: "details", kind: "enyo.Scroller", className: "enyo-bg", components: [
			{flex: 1, name: "seasonsView", kind: "animatedGrid", cellClass:"image", onItemClick: "doItemClicked"}
		]},
		{kind: "enyo.Toolbar", components: [
			{caption: $L("Back"), align: "left", onclick: "doGoBack"},
			{kind: "enyo.Spacer"}
		]}
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	addItem: function(item, handleClick) {
		this.$.seasonsView.addItem(item, handleClick);
	},
	
	addItems: function(items) {
		this.$.seasonsView.addItems(items);
	},
	
	getItems: function() {
		return this.$.seasonsView.getItems();
	},
	
	destroyItems: function() {
		this.$.seasonsView.destroyComponents();
	}
});
