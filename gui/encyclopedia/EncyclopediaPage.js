class EncyclopediaPage {
	constructor() {

		this.panel = "";
		this.lastCategory = "";
		this.lastCiv = "";
		this.lastSubcategory = "";
		this.lastArticle = "";

		this.folders = Engine.ReadJSONFile("gui/encyclopedia/folders.json");

		this.civData = loadCivData(true, false);

		this.categoryPanel = new CategoryPanel(this);
		this.overviewPanel = new OverviewPanel(this);
		this.selectionPanel = new SelectionPanel(this);
		this.pathPanel = new PathPanel(this);
		this.historyPanel = new HistoryPanel(this);
		this.relatedArticlesPanel = new RelatedArticlesPanel(this); 

		this.BrowsingHistory = [];
        this.BrowsingHistoryPointer = -1;

		this.backButton = Engine.GetGUIObjectByName("BackButton");
        this.backButton.onPress = () => {this.Back()}
		this.forwardButton = Engine.GetGUIObjectByName("ForwardButton");
        this.forwardButton.onPress = () => {this.Forward();}

	}

	switchPanel(panel) 
	{
		this.panel = panel;
		this.overviewPanel.gui.hidden = panel != "overview";
		this.overviewPanel.civDropdown.civSelection.hidden = this.lastCategory != "civilisations";
		this.overviewPanel.civDropdown.civSelectionHeading.hidden = this.lastCategory != "civilisations";
		this.selectionPanel.gui.hidden = panel != "selection";
		this.historyPanel.gui.hidden = panel != "history";

	}

	updateBrowsingHistory (data) {
		let lastEntry = this.BrowsingHistory[this.BrowsingHistoryPointer];
	    //check if it's the same as the last entry
		let isSame = !lastEntry ? false :Object.keys(data).every(key => data[key] === lastEntry[key]) && data.length == lastEntry.length;

		//check if the pointer is at the end
		let isEnd = !lastEntry ? false : this.BrowsingHistoryPointer == this.BrowsingHistory.length -1;


		if (!isSame) {
			if (!isEnd) {
				this.BrowsingHistory = this.BrowsingHistory.slice(0, this.BrowsingHistoryPointer + 1)
			}
			this.BrowsingHistory.push(data);
			this.BrowsingHistoryPointer += 1;
			this.forwardButton.hidden = true;
			this.backButton.hidden = this.BrowsingHistory.length == 1;
		}


	}

	toParentDirectory() {
		if (this.panel == "history") {
			this.selectionPanel.open(this.lastCategory, this.lastCiv, this.lastSubcategory);
		} else  {
			if (this.lastCategory == "civilisations") {
			    this.lastCiv = "";
			}
			this.overviewPanel.open(this.lastCategory, this.lastCiv);
		}
	}

	Back() {

		this.forwardButton.hidden = false;
		this.BrowsingHistoryPointer -= 1;

		let entry = this.BrowsingHistory[this.BrowsingHistoryPointer];

		switch(entry.panel) {
			case "overview": this.overviewPanel.open(entry.category, entry.civ, true); break;
			case "selection": this.selectionPanel.open(entry.category, entry.civ, entry.subcategory, true); break;
			case "history": this.historyPanel.open(entry.file, true); break;
            default: break;
		}

		//if there's no more Element in the BrowsingHistory to go to, deactivate the BackButton
		this.backButton.hidden = this.BrowsingHistoryPointer == 0;
	}

	Forward() {

		this.backButton.hidden = false;
		this.BrowsingHistoryPointer += 1;

		let entry = this.BrowsingHistory[this.BrowsingHistoryPointer];

		switch(entry.panel) {
			case "overview": this.overviewPanel.open(entry.category, entry.civ, true); break;
			case "selection": this.selectionPanel.open(entry.category, entry.civ, entry.subcategory, true); break;
			case "history": this.historyPanel.open(entry.file, true); break;
			default: break;
		}

		//if there's no more Element in the BrowsingHistory to go to, deactivate the ForwardButton
		this.forwardButton.hidden = this.BrowsingHistoryPointer == this.BrowsingHistory.length-1;
	}


	randomArticle() {

		// currently many folders are still empty (without any articles)
		let empty = true;
		while (empty) {
			this.lastCategory = pickRandom(Object.keys(this.folders));
			let civ = this.lastCategory == "civilisations";

			if (this.lastCategory == "civilisations") {
				this.lastCiv = pickRandom(Object.keys(this.civData));
				this.lastSubcategory = pickRandom(Object.keys(this.folders["civilisations"][this.lastCiv]));
			} else {
				this.lastSubcategory = pickRandom(Object.keys(this.folders[this.lastCategory]));

			}
			let targetdir = "gui/encyclopedia/articles/" + this.lastCategory + "/" + (civ? this.lastCiv + "/" : "") + this.lastSubcategory + "/";
			let list = Engine.ListDirectoryFiles(targetdir, "*.json", false);
			
			if (list.length) {
				this.openArticle(pickRandom(list));
				empty = false;
			}
		}
	}

	//this method is used to jump between (or just open) distant articles, not only switching to a parent or child directory or file. More has to be reloaded.
	//it works with both paths with and without "gui/encyclopedia/articles/"
	openArticle (path) {
		let encyclopediaPath = path.startsWith("gui/encyclopedia/articles/") ? path.substring(26) : path;
        let folders = encyclopediaPath.split("/");
		let fullPath = "gui/encyclopedia/articles/" + encyclopediaPath;

		if (!Engine.FileExists(fullPath)) {
			error("couldn't find article at " + fullPath)
			return;
		}

		let containsCiv = Object.keys(this.civData).some(civ => encyclopediaPath.includes(`/${civ}/`));
		// figuring out what panel and file to open
		this.lastCategory = folders[0];
		this.categoryPanel.selectButton(this.lastCategory);
		let panel = path.includes("overview.json") ? "overview" : "history";

		switch(panel) {
			case "overview": 
				this.overviewPanel.open(folders[0], containsCiv ? folders[1] : ""); break;

			case "history": 
				if (containsCiv) {
					this.lastCiv = folders[1];
					this.lastSubcategory = folders[2];
				} else {
					this.lastSubcategory = folders[1];
				}
				this.historyPanel.open(fullPath);

			default: break; 
		}
	
	}


}