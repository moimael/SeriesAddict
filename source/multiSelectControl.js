enyo.kind({ 
	name: 'SeriesAddict.MultiselectControls',
	kind: 'enyo.Toolbar',
	events: {
		onHideMultiselectControls: '',
		onDelete: ""
	},
	className: 'MultiselectControls MultiselectBottom MultiselectHideBottom',
	components: [
		{icon: "images/icn-delete.png", onclick: "doDelete"}
	],
	
	create: function(){
		this.inherited(arguments);
	}
});
