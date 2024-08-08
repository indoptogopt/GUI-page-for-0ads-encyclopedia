class EncyclopediaPage
{
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

		this.gui = Engine.GetGUIObjectByName("encyclopedia");
		const panelSize = this.gui.getComputedSize();
		// this.gui covers the entire screen (therfore panelSize.top = 0)
		const panelHeight = panelSize.bottom;
		const letteringHeight = panelHeight * 0.088;
		const letteringVerticalOffset = panelHeight * 0.024;
		this.lettering = Engine.GetGUIObjectByName("lettering");
		// the lettering image file has an aspect ration of 8:1
		// its size is relative to the screen height to prevent it from taking up too much space on lower screen resolutions
		// we have to set its size in here to avoid distortion between different screen aspect ratios
		this.lettering.size = new GUISize(-(letteringHeight * 4), letteringVerticalOffset, letteringHeight * 4, letteringVerticalOffset + letteringHeight, 50, 0, 50, 0);

		this.relatedArticlesPanel = new RelatedArticlesPanel(this);
		this.navigationPanel = new NavigationPanel(this);
		this.introductionPanel = new IntroductionPanel(this);
		this.selectionPanel = new SelectionPanel(this);
		this.articlePanel = new ArticlePanel(this);
		this.pathPanel = new PathPanel(this);

		// the navigation history is saved as a list of objects, each storing a unique state of the page in its properties
		// an index is used to point out the object (i.e. the state) the page is currently on
		this.navigationHistory = [];
        this.navigationHistoryPointer = -1;

		this.backButton = Engine.GetGUIObjectByName("backButton");
        this.backButton.onPress = () => {this.back()}
		this.forwardButton = Engine.GetGUIObjectByName("forwardButton");
        this.forwardButton.onPress = () => {this.forward();}

		this.contributeButton = Engine.GetGUIObjectByName("contributeButton");
		const contributeMessage = Engine.TranslateLines(Engine.ReadFile("gui/encyclopedia/contributeMessage.txt"));
		this.contributeButton.onPress = () =>
			{
				messageBox(
					550, 250,
					contributeMessage,
					translate("Contributing"),
					[translate("Back"), translate("Open thread ")],
					[null, () => {openURL("https://wildfiregames.com/forum/topic/107400-0-ads-built-in-encyclopedia/")}]
				);
			}

	}

	// the introductionPanel, the selectionPanel, and the articlePanel lie above each other
	// this method is responsible for showing one and hiding the others
	switchPanel(panel)
	{
		this.panel = panel;
		this.introductionPanel.gui.hidden = panel != "introduction";
		this.selectionPanel.gui.hidden = panel != "selection";
		this.articlePanel.gui.hidden = panel != "article";

	}

	// articles are always read in batches (when listing articles in a chosen subcategory or when listing the related articles)
	pullArticleData(articleList)
	{
		return articleList.map(article =>
			Engine.ReadJSONFile(article)
		)
	}

	// this method is called from virtually every click on the page
	updateNavigationHistory (data)
	{
		const lastEntry = this.navigationHistory[this.navigationHistoryPointer];

	    //check if it's the same as the last entry
		const isSame = !lastEntry ? false : Object.keys(data).every(key => data[key] === lastEntry[key]) && data.length == lastEntry.length;

		//check if the pointer is at the end
		const atTheEnd = !lastEntry ? false : this.navigationHistoryPointer == this.navigationHistory.length -1;

		if (!isSame) {
			if (!atTheEnd) {
				this.navigationHistory = this.navigationHistory.slice(0, this.navigationHistoryPointer + 1)
			}
			this.navigationHistory.push(data);
			this.navigationHistoryPointer += 1;
			this.forwardButton.hidden = true;
			this.backButton.hidden = this.navigationHistory.length == 1;
		}
	}

	// this method is called by the upButton of the PathPanel
	toParentDirectory()
	{
		switch (this.panel)
		{

			case "introduction":
				if (this.lastCategory == "civilizations" && this.lastCiv)
				{
					this.lastCiv = "";
					this.introductionPanel.open("civilizations");
				}
				break;

			case "selection":
				this.introductionPanel.open(this.lastCategory, this.lastCiv);
				break;

			case "article":
				this.selectionPanel.open(this.lastCategory, this.lastCategory == "civilizations" ? this.lastCiv : null , this.lastSubcategory);
				break;
		}
	}

	back()
	{
		this.forwardButton.hidden = false;
		this.navigationHistoryPointer -= 1;

		const entry = this.navigationHistory[this.navigationHistoryPointer];

		this.navigationPanel.selectCategoryButton(entry.category);
		switch(entry.panel) {
			case "introduction":
				this.introductionPanel.open(entry.category, entry.civ, true);
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

		//if there's no more Element in the NavigationHistory to go to, deactivate the backButton
		this.backButton.hidden = this.navigationHistoryPointer == 0;
	}

	forward()
	{
		this.backButton.hidden = false;
		this.navigationHistoryPointer += 1;

		const entry = this.navigationHistory[this.navigationHistoryPointer];
		this.navigationPanel.selectCategoryButton(entry.category);

		switch(entry.panel) {
			case "introduction":
				this.introductionPanel.open(entry.category, entry.civ, true);
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

		//if there's no more Element in the NavigationHistory to go to, deactivate the forwardButton
		this.forwardButton.hidden = this.navigationHistoryPointer == this.navigationHistory.length-1;
	}


	// this method is called by the "Suprise Me"-button on the about page
	randomArticle()
	{

		// currently many directories are still empty (without any articles);
		// a new one is chosen until one containing articles is found
		let empty = true;
		let list = [];
		while (empty) {
			this.lastCategory = pickRandom(Object.keys(g_EncyclopediaStructure).filter(category => category != "about"));
			const hasCiv = this.lastCategory == "civilizations";

			if (hasCiv) {
				this.lastCiv = pickRandom(Object.keys(this.civData));
				this.lastSubcategory = pickRandom(Object.keys(g_EncyclopediaStructure.civilizations.subdirectories[this.lastCiv]));
			} else {
				this.lastSubcategory = pickRandom(Object.keys(g_EncyclopediaStructure[this.lastCategory].subdirectories));

			}
			const targetdir = this.pathToArticles + this.lastCategory + "/" + (hasCiv? this.lastCiv + "/" : "") + this.lastSubcategory + "/";
			list = Engine.ListDirectoryFiles(targetdir, "*.json", false);

			empty = list.length == 0;
		}
		// this.openArticle() requires the relative path (from pathToArticles onwards)
		const pickedArticle = pickRandom(list).slice(this.pathToArticles.length);
		this.openArticle(pickedArticle);
	}

	// this method is used to jump between (or just open) distant articles, not only switching to a parent or child directory or file.
	openArticle (relativePath)
	{
		const fullPath = this.pathToArticles + relativePath;
		const pathToFile = fullPath.slice(0, fullPath.lastIndexOf("/"));

		if (!Engine.FileExists(fullPath)) {
			error("couldn't find article at " + fullPath)
			return;
		}

		const containsCiv = Object.keys(this.civData).map(civ => this.civData[civ].Name).some(civ => relativePath.includes(`/${civ}/`));

		// figuring out what panel and file to open
		const splitPath = relativePath.split("/");
		this.lastCategory = splitPath[0];
		this.navigationPanel.selectCategoryButton(this.lastCategory);

		// this method can also open category introductions which might be useful in specific scenarios
		const panel = relativePath.endsWith("introduction.txt") ? "introduction" : "article";

		switch(panel) {
			case "introduction":
			this.introductionPanel.open(splitPath[0], containsCiv ? splitPath[1] : ""); break;

			case "article":
			if (containsCiv) {
				this.lastCiv = splitPath[1];
				this.lastSubcategory = splitPath[2];
			} else {
				this.lastSubcategory = splitPath[1];
			}
				// Note that the second parameter (dontRenderList) of setupList() is set to true in order to load the list in without displaying the selection
				this.selectionPanel.setupList(pathToFile, true);
				this.articlePanel.open(fullPath);
				break;
		}
	}
}

EncyclopediaPage.prototype.pathToArticles = "gui/encyclopedia/articles/";
