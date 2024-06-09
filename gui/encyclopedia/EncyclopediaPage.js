const contributeMessage = Engine.TranslateLines(Engine.ReadFile("gui/encyclopedia/contributeMessage.txt"));
class EncyclopediaPage {
	constructor() 
	{
		// this.last… store various data about the last state of the page
		// the data is read directly by all classes and doesn't need to be passed between functions
		this.panel = "";
		this.lastCategory = "";
		this.lastCiv = "";
		this.lastSubcategory = "";
		this.lastArticle = "";

		this.civData = loadCivData(true, false);

		this.navigationPanel = new NavigationPanel(this);
		this.overviewPanel = new OverviewPanel(this);
		this.selectionPanel = new SelectionPanel(this);
		this.pathPanel = new PathPanel(this);
		this.articlePanel = new ArticlePanel(this);
		this.relatedArticlesPanel = new RelatedArticlesPanel(this); 

		// the browsing history is saved as a list of objects, each storing a unique state of the page in its properties
		// an index is used to point out the object (i.e. the state) the page is currently on
		this.BrowsingHistory = [];
        this.BrowsingHistoryPointer = -1;

		this.backButton = Engine.GetGUIObjectByName("backButton");
        this.backButton.onPress = () => {this.back()}
		this.forwardButton = Engine.GetGUIObjectByName("forwardButton");
        this.forwardButton.onPress = () => {this.forward();}
		this.contributeButton = Engine.GetGUIObjectByName("contributeButton");
		this.contributeButton.onPress = () => 
			{
				messageBox(
					550, 250,
					contributeMessage,
					translate("Contributing"),
					[translate("Back"), translate("Open thread")],
					[null, () => {openURL("https://wildfiregames.com/forum/topic/107400-0-ads-built-in-encyclopedia/")}]	
				);
			}

	}

	// the overviewPanel, the selectionPanel, and the articlePanel lie above each other
	// this method is responsible for showing or hiding them
		switchPanel(panel) 
	{
		this.panel = panel;
		this.overviewPanel.gui.hidden = panel != "overview";
		this.overviewPanel.civDropdown.civSelection.hidden = this.lastCategory != "0 A.D.'s Civilizations";
		this.overviewPanel.civDropdown.civSelectionHeading.hidden = this.lastCategory != "0 A.D.'s Civilizations";
		this.selectionPanel.gui.hidden = panel != "selection";
		this.articlePanel.gui.hidden = panel != "article";

	}

	// this method is called from virtually every click on the page
	updateBrowsingHistory (data) 
	{
		const lastEntry = this.BrowsingHistory[this.BrowsingHistoryPointer];

	    //check if it's the same as the last entry
		const isSame = !lastEntry ? false : Object.keys(data).every(key => data[key] === lastEntry[key]) && data.length == lastEntry.length;

		//check if the pointer is at the end
		const atTheEnd = !lastEntry ? false : this.BrowsingHistoryPointer == this.BrowsingHistory.length -1;

		if (!isSame) {
			if (!atTheEnd) {
				this.BrowsingHistory = this.BrowsingHistory.slice(0, this.BrowsingHistoryPointer + 1)
			}
			this.BrowsingHistory.push(data);
			this.BrowsingHistoryPointer += 1;
			this.forwardButton.hidden = true;
			this.backButton.hidden = this.BrowsingHistory.length == 1;
		}


	}

	// this method is called by the upButton of the PathPanel
	toParentDirectory() 
	{
		switch (this.panel) 
		{

			case "overview":
				if (this.lastCategory == "0 A.D.'s Civilizations" && this.lastCiv)
				{
					this.lastCiv = "";
					this.overviewPanel.open("0 A.D.'s Civilizations");
				}
				break;

			case "selection":
				this.overviewPanel.open(this.lastCategory, this.lastCiv);
				break;

			case "article":
				this.selectionPanel.open(this.lastCategory, this.lastCategory == "0 A.D.'s Civilizations" ? this.lastCiv : null , this.lastSubcategory);
				break;
		}
	}

	back() 
	{

		this.forwardButton.hidden = false;
		this.BrowsingHistoryPointer -= 1;

		const entry = this.BrowsingHistory[this.BrowsingHistoryPointer];

		switch(entry.panel) {
			case "overview": 
				this.overviewPanel.open(entry.category, entry.civ, true); 
				break;
			case "selection": 
				this.lastCategory = entry.category;
				if (entry.civ)
					this.lastCiv = entry.civ;
				this.lastSubcategory = entry.subcategory;
				this.selectionPanel.open(entry.category, entry.civ, entry.subcategory, true); 
				break;
			case "article": 
				this.lastCategory = entry.category;
				if (entry.civ)
					this.lastCiv = entry.civ;
				this.lastSubcategory = entry.subcategory;
				this.articlePanel.open(entry.file, true); 
				break;
			default: 
				break;
		}

		//if there's no more Element in the BrowsingHistory to go to, deactivate the backButton
		this.backButton.hidden = this.BrowsingHistoryPointer == 0;
	}

	forward() 
	{
		this.backButton.hidden = false;
		this.BrowsingHistoryPointer += 1;

		const entry = this.BrowsingHistory[this.BrowsingHistoryPointer];

		switch(entry.panel) {
			case "overview": 
				this.overviewPanel.open(entry.category, entry.civ, true); 
				break;
			case "selection": 
				this.lastCategory = entry.category;
				if (entry.civ)
					this.lastCiv = entry.civ;
				this.lastSubcategory = entry.subcategory;
				this.selectionPanel.open(entry.category, entry.civ, entry.subcategory, true); 
				break;
			case "article": 
				this.lastCategory = entry.category;
				if (entry.civ)
					this.lastCiv = entry.civ;
				this.lastSubcategory = entry.subcategory;
				this.articlePanel.open(entry.file, true); 
				break;
			default: 
				break;
		}

		//if there's no more Element in the BrowsingHistory to go to, deactivate the forwardButton
		this.forwardButton.hidden = this.BrowsingHistoryPointer == this.BrowsingHistory.length-1;
	}


	// this method is called by the "Suprise Me"-button on the about page
	randomArticle() 
	{

		// currently many directories are still empty (without any articles); 
		// a new one is chosen until one containing articles is found
		let empty = true;
		let list = [];
		while (empty) {
			this.lastCategory = pickRandom(Object.keys(g_EncyclopediaStructure));
			const hasCiv = this.lastCategory == "0 A.D.'s Civilizations";

			if (this.lastCategory == "0 A.D.'s Civilizations") {
				this.lastCiv = pickRandom(Object.keys(this.civData).map(civ => this.civData[civ].Name));
				this.lastSubcategory = pickRandom(Object.keys(g_EncyclopediaStructure["0 A.D.'s Civilizations"][this.lastCiv]));
			} else {
				this.lastSubcategory = pickRandom(Object.keys(g_EncyclopediaStructure[this.lastCategory]));

			}
			const targetdir = "gui/encyclopedia/articles/" + this.lastCategory + "/" + (hasCiv? this.lastCiv + "/" : "") + this.lastSubcategory + "/";
			list = Engine.ListDirectoryFiles(targetdir, "*.json", false);
			
			if (list.length) {
				empty = false;
			}
		}
		this.openArticle(pickRandom(list));
	}

	// this method is used to jump between (or just open) distant articles, not only switching to a parent or child directory or file.
	openArticle (path) 
	{
		
		//works with both paths with and without "gui/encyclopedia/articles/"
		const relativePath = path.startsWith("gui/encyclopedia/articles/") ? path.substring(26) : path;
        
		const fullPath = "gui/encyclopedia/articles/" + relativePath;
		
		if (!Engine.FileExists(fullPath)) {
			error("couldn't find article at " + fullPath)
			return;
		}

		
		
		const containsCiv = Object.keys(this.civData).map(civ => this.civData[civ].Name).some(civ => relativePath.includes(`/${civ}/`));
		
		// figuring out what panel and file to open
		const splitPath = relativePath.split("/");
		this.lastCategory = splitPath[0];
		this.navigationPanel.selectCategoryButton(this.lastCategory);
		const panel = path.includes("overview.json") ? "overview" : "article";
		
		switch(panel) {
			case "overview": 
			this.overviewPanel.open(splitPath[0], containsCiv ? splitPath[1] : ""); break;
			
			case "article": 
				if (containsCiv) {
					this.lastCiv = splitPath[1];
					this.lastSubcategory = splitPath[2];
				} else {
					this.lastSubcategory = splitPath[1];
				}
				this.articlePanel.open(fullPath);

			default: break; 
		}
	}
}