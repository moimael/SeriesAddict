enyo.kind({
	name:"animatedGrid",
	kind:"enyo.Grid",
	published:{
		cellHeight: 187.5,
		cellWidth: 127.5,
		selecting: false
	},
	components: [
//		{kind: "ApplicationEvents", onWindowRotated: "handleRotate"}
	],
	events: {
		onItemClick: "",
		onSelectionChanged: ""
	},
	
	/** @protected */
	create:function() {
		this.inherited(arguments);
		this.resizeHandler();
		this.showing = false;
	},
	
	/** @protected */
	rendered:function() {
		this.inherited(arguments);
		if(!this.dim) {
			this.resizeHandler();
		}
		this.positionControls();
	},
	
	/** @protected */
	// iterates children and repositions them
	positionControls:function() {
		var c = this.getControls();
		if(c.length === 0) return;
		
		var colsPerRow = Math.floor(this.dim.width/this.cellWidth);
		

		for(var i=0;i<c.length;i++) {
			this.positionControl(c[i], i, colsPerRow);
		}

		var h = Math.floor(c.length/colsPerRow)*this.cellHeight;
		this.applyStyle("height", h + "px");
	},
	
	/** @protected */
	// does the position calculation for a control and applies the style
	positionControl:function(control, index, colsPerRow) {
		
		var top = Math.floor(index/colsPerRow) * this.cellHeight;
		var left = (index%colsPerRow) * this.cellWidth;
		var margin = ((this.dim.width - ((colsPerRow - 1) * (this.cellWidth + 2))) / colsPerRow) / 2;

		this.log(this.dim.width + " " + margin + " " + this.cellWidth + " " + colsPerRow);
		control.applyStyle("top", top + "px");
		control.applyStyle("left", left + "px");
		control.applyStyle("height", this.cellHeight + "px");
		control.applyStyle("width", this.cellWidth + "px");
		control.applyStyle("border", null);
		control.applyStyle("margin", margin + "px");
		if(this.selecting){
			control.applyStyle("border", "1px solid gray");
			control.applyStyle("margin", "14px");
			control.applyStyle("opacity", "0.4");
		}
	},
	
	/** @protected */
	itemClicked: function(inSender, inGridItem){
		if(this.selecting){
			this.toggleSelection(inSender, inGridItem);
			this.doSelectionChanged();
		} else{
			this.doItemClick(inSender, inGridItem);
		}
	},
	
//	handleRotate: function(sender, event) {
//		this.render();
//	},
	
	/** @protected */
	cellWidthChanged:function() {
		this.positionControls();
	},
	
	/** @protected */
	cellHeightChanged:function() {
		this.positionControls();
	},
	
	/** @protected */
	// reflows controls when window.resize event fires (e.g. device rotation)
	resizeHandler:function() {
		var n = this.hasNode();
		if(!n) return;

		var s = enyo.dom.getComputedStyle(n);
		this.log(s.width + " " + s.height + " " + window.innerHeight + " " + window.innerWidth);
		this.dim = {width:window.innerWidth,height:parseInt(s.height)}; //HACK, not working if grid control is not full width
	},
	
	/*
	* Add the control passed in parameter to the gridView
	*
	* Parameter:
	* - component (kind)
	*
	*/
	addItem: function(component, handleClick){
		var item;
		if(handleClick){
			item = this.createComponent(component, {onclick: "itemClicked"});
		}
		else {
			item = this.createComponent(component);
		}
		this.render();
		return item;
	},
	
	/*
	* Add controls passed in parameter to the gridView
	*
	* Parameter:
	* - components (array)
	*
	*/
	addItems: function(components){
		this.createComponents(components, {onclick: "itemClicked"});
		this.render();
	},
	
	/*
	* Return a list of all items in the gridView
	*
	* Return:
	* - (array)
	*
	*/
	getItems: function() {
		return this.getControls();
	},
	
	/**
	* Remove an item from the gridView
	*
	*/
	removeItem: function(component){
		component.destroy();
		this.render();
	},
	
	/******************
	* Multi-Selection *
	*******************/
	
	toggleSelection: function(inSender, inGridItem) {
		var gridItem;
		if(typeof(inGridItem) == 'undefined'){
			gridItem = this.items[inSender];
		}
		else{
			gridItem = inGridItem.dispatchTarget;
		}
		gridItem.selected = !gridItem.selected;
		if (gridItem.selected) {
			gridItem.applyStyle("border", null);
			gridItem.applyStyle("margin", null);
			gridItem.removeClass('enyo-grid-div');
			gridItem.addClass('MultiselectHighlight');
			gridItem.applyStyle("float", "left");
			gridItem.applyStyle("opacity", "1.0");
		}
		else {
			gridItem.applyStyle("border", "1px solid gray");
			gridItem.applyStyle("margin", "14px");
			gridItem.removeClass('MultiselectHighlight');
			gridItem.addClass('enyo-grid-div');
			gridItem.applyStyle("opacity", "0.4");
		}
	},

	toggleAll: function(){
		this.items = this.getItems();
		var allSelected = this.areAllSelected();
		var i;
		for(i = 0; i < this.items.length; i++){
			if(!this.items[i].selected || allSelected){
				this.toggleSelection(i);
			}
		}
	},
	
	// Return true if all items are selected
	areAllSelected: function() {
		var i;
		var count = 0;
		this.items = this.getItems();
		for(i = 0; i < this.items.length; i++){
			if(this.items[i].selected){
				count++;
			}
		}
		if(count !== this.items.length){
			return false;
		}
		return true;
	},
	
	// Return the number of selected items
	getSelectedCount: function() {
		var i;
		var count = 0;
		var items = this.getItems();
		for(i = 0; i < items.length; i++){
		
			//We only want selected and non hidden items (used when search is active)
			if(items[i].selected && items[i].showing){
				count++;
			}
		}
		return count;
	},
	
	// Return the number of selected items
	getSelectedItems: function() {
		var i;
		var selectedItems = [];
		var items = this.getItems();
		for(i = 0; i < items.length; i++){

			//We only want selected items
			if(items[i].selected){
				selectedItems.push(items[i]);
			}
		}
		return selectedItems;
	},
	
	// Edit mode terminated, set styles back to normal
	resetStyle: function(){
		var c = this.getItems();
		for(var i=0;i<c.length;i++) {
			c[i].applyStyle("opacity", null);
			c[i].applyStyle("margin", null);
			c[i].addClass('enyo-grid-div');
			c[i].selected = false;
			this.positionControls();
		}
	}
});
