enyo.kind({
	name: "SeriesAddict.seriesView",
	kind: "enyo.VFlexBox",
	events: {
		onItemClicked: "",
		onAddClicked: "",
		onGoBack: "",
		onUpdateDb: ""
	},
	showingMultiselect: false,
	components : [
		{kind: "enyo.PageHeader", className: "enyo-header-dark", layoutKind: "enyo.HFlexLayout", components: [
			{kind: "enyo.Spinner"},
			{kind: "enyo.Spacer"},
			{name: "searchShowsInput", kind: "enyo.RoundedSearchInput", oninput: "searchShow", onCancel: "searchShow"}
		]},
		{flex: 1, name: "home", kind: "enyo.Scroller", className: "enyo-bg", components: [
			{flex: 1, name: "seriesView", kind: "animatedGrid", cellClass:"image",
				onItemClick: "doItemClicked",
				onSelectionChanged: "setMultiSelectCount"
			}
		]},
		{kind: "enyo.Toolbar", components: [
			{icon: "images/menu-icon-sync.png", align: "left", onclick: "updateDb"},
			{kind: "enyo.Spacer"},
			{icon: "images/icn-edit.png", align: "left", onclick: "clickMultiselect"},
			{icon: "images/icn-add-album.png", align: "right", onclick: "doAddClicked"}
		]},
		{kind: 'Control',
			name: 'topMultiselectControls',
			className: 'MultiselectControls MultiselectTop MultiselectHideTop',
			components: [
				{kind: 'HFlexBox', pack:'Justify', style: 'margin-top:16px;', components: [
					{kind: 'Button', caption: $L('Cancel'), className: 'enyo-button-blue', style:'margin-left:10px;',onclick: 'clickMultiselect'},
					{flex: 1 },
					{name: 'multiselectCount', content: $L('0 Selected'),style:'padding:8px;'},
					{flex: 1 },
					{name: 'btnSelectAll', kind: 'Button', caption: $L('Select All'), className: 'enyo-button-blue', style:'margin-right:10px;',onclick: 'clickSelectAllOrNone'}
				]}
			]
		},
		{kind: "ModalDialog", name: "dialogNoneSelected", caption: $L("No item selected"), lazy: false, components: [
			{content: $L("No selected item to delete"), style: "margin-left: 16px, margin-bottom: 10px;"},
			{kind: "Button", caption: "Close", flex: 1, onclick: "close"}
		]},
		{kind: "ModalDialog", name: "dialogConfirmDelete", caption: $L("Delete"), lazy: false, components: [
			{content: $L("Are you sure you want to delete these files ?"), style: "margin-left: 16px, margin-bottom: 10px;"},
			{kind: "Button", caption: $L("Delete"), className: 'enyo-button-negative', flex: 1, onclick: "deleteSeries"},
			{kind: "Button", caption: $L("Cancel"), flex: 1, onclick: "close"}
		]},
		{kind: "SeriesAddict.MultiselectControls", name: "bottomMultiselectControls",
			onHideMultiselectControls: 'hideMultiselectControls',
			onDelete: "showConfirm"
		},
		{name: "seriesDb", kind: "onecrayon.Database", database: 'ext:com.moimael.seriesaddict', version: '1', debug: true}
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	addItem: function(item, handleClick) {
		this.$.seriesView.addItem(item, handleClick);
	},
	
	addItems: function(items) {
		this.$.seriesView.addItems(items);
	},
	
	getItems: function() {
		return this.$.seriesView.getItems();
	},
	
	removeItem: function(item) {
		this.$.seriesView.removeItem(item);
	},
	
	destroyItems: function() {
		this.$.seriesView.destroyComponents();
	},
	
	// Search for a show
	searchShow: function(inSender, inEvent) {
		var i;
		for (i = 0; i < this.getItems().length; i++){
			if (this.getItems()[i].getName().match(new RegExp(inSender.getValue(),"gi"))){
				this.getItems()[i].show();
			}
			else{
				this.getItems()[i].hide();
			}
		}
	},
	
	updateDb: function(inSender){
		inSender.setDisabled(true);
		this.$.spinner.show();
		this.doUpdateDb();
	},
	
	// Toggle whether or not we're in multiselect mode.  This involves
	// adding/removing the CSS classes that cause the controls to animate
	// into/off the screen.
	clickMultiselect: function() {
		this.showingMultiselect ? this.hideMultiselectControls() : this.showMultiselectControls();
	},
	
	setMultiSelectCount: function(inSender, inGridItem) {
		if(this.$.seriesView.areAllSelected()){
			this.$.btnSelectAll.setCaption($L('Select None'));
		} else {
			this.$.btnSelectAll.setCaption($L('Select All'));
		}
		this.$.multiselectCount.setContent(this.$.seriesView.getSelectedCount() + " Selected");
	},
	
	clickSelectAllOrNone: function() {
		this.$.seriesView.toggleAll();
		this.setMultiSelectCount();
	},
	
	showMultiselectControls: function() {
		if (this.showingMultiselect) return;  // already showing

		this.$.seriesView.setSelecting(this.showingMultiselect = true);
		this.$.seriesView.positionControls();
		this.$.topMultiselectControls.removeClass('MultiselectHideTop');
		this.$.bottomMultiselectControls.removeClass('MultiselectHideBottom');
		this.addClass('AlbumModeMultiselect');
	},
	
	hideMultiselectControls: function() {
		if (!this.showingMultiselect) return;  // already not showing
		this.$.seriesView.setSelecting(this.showingMultiselect = false);
		this.$.topMultiselectControls.addClass('MultiselectHideTop');
		this.$.bottomMultiselectControls.addClass('MultiselectHideBottom');
		this.removeClass('AlbumModeMultiselect');
		this.$.seriesView.resetStyle();
	},
	
	deleteSerie: function(item) {
		this.log(item);
		var query = {
			sql: 'DELETE FROM series WHERE id = ?',
			values: [item.seriesId]
		};
		var query2 = {
			sql: 'DELETE FROM episodes WHERE seriesid = ?',
			values: [item.seriesId]
		};
		var query3 = {
			sql: 'DELETE FROM banners WHERE serieID = ?',
			values: [item.seriesId]
		};
		this.$.seriesDb.queries([query, query2, query3]);
		this.$.seriesView.removeItem(item);
	},
	
	deleteSeries: function() {
		var selectedCount = this.$.seriesView.getSelectedCount();
		var selectedItems = this.$.seriesView.getSelectedItems();
		for(i = 0; i < selectedCount; i++){
			this.deleteSerie(selectedItems[i]);
		// Messagebox : are you sure you want to delete nb items ? Delete / Cancel
		// Delete items
		}
		this.hideMultiselectControls();
		this.$.dialogConfirmDelete.close();
	},
	
	showConfirm: function() {
		if(this.$.seriesView.getSelectedCount() === 0){
			this.$.dialogNoneSelected.openAtCenter();
		} else {
			this.$.dialogConfirmDelete.openAtCenter();
		}
	},
	
	close: function(inSender) {
		// close dialog
		inSender.container.close();
	}
});
