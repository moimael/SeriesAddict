enyo.kind({
	name : "SeriesAddict.ImagesDownloadService",
	kind : enyo.Component,
	events: {
		onDownloadFinished: "",
		onDownloadFailed: ""
	},
	published: {
		target: "",
		targetDir: ""
	},
	components : [
	{
		name : "fileDownload",
		kind : "PalmService",
		service : "palm://com.palm.downloadmanager/",
		method : "download",
		onSuccess : "downloadFinished",
		onFailure : "downloadFail",
		onResponse : "gotResponse",
		subscribe : true
	}],

	downloadFinished : function(inSender, inResponse) {
		if(inResponse.completed){
			this.doDownloadFinished();
		}
	},
	
	downloadFail : function(inSender, inResponse) {
		this.doDownloadFailed();
	},

	downloadFile : function(inSender, inResponse) {
		this.$.fileDownload.call({
			target: this.target,
			mime: "image/jpg",
			targetDir : this.targetDir,
			keepFilenameOnRedirect: false,
			canHandlePause: false,
			subscribe: true });
	}
});
