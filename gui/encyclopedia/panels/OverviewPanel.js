const overviewButtonHeight = 35;
const overviewButtonDist = 30;

class OverviewPanel {
	constructor(page) {

        this.page = page;
		
        this.gui = Engine.GetGUIObjectByName("overviewPanel");
        this.title = Engine.GetGUIObjectByName("overviewTitle");
        this.text = Engine.GetGUIObjectByName("overviewText");
        this.civEmblem = Engine.GetGUIObjectByName("civEmblem");
        this.learnMore = Engine.GetGUIObjectByName("learnMore");
		this.disclaimer = Engine.GetGUIObjectByName("disclaimer");
		this.disclaimer.caption = Engine.ReadFile("gui/encyclopedia/articles/About this Encyclopedia/disclaimer.txt");
		this.supriseMeButton = Engine.GetGUIObjectByName("supriseMeButton");
		this.buttons = Engine.GetGUIObjectByName("overviewButtons").children;

		// overviewButtons are horiontal, only three fit into a line (therefore the modulo)
		// their width is determined by screen resolution
		this.buttons.forEach((button, i) => {
			this.buttons = Engine.GetGUIObjectByName("overviewButtons").children;
			button.size = new GUISize(
				overviewButtonDist / 2, Math.floor(i / 3) * (overviewButtonHeight + overviewButtonDist / 2),
                -(overviewButtonDist / 2), Math.floor(i / 3) * (overviewButtonHeight + overviewButtonDist / 2) + overviewButtonHeight,
				(i % 3) * (100 / 3), 79, ((i % 3) + 1) * (100 / 3), 79
			);
		})

		
		this.supriseMeButton.font = "sans-bold-22";
		this.supriseMeButton.size = new GUISize(-overviewButtonDist, 0, overviewButtonDist, 2 * overviewButtonHeight, (100 / 3), 55, (100 / 3) * 2, 55);
		this.supriseMeButton.onPress = () => {
			this.page.randomArticle();
		}

        // initializing the CivDropdown
    	this.civDropdown = new CivSelectDropdown(this.page.civData);
		this.civDropdown.registerHandler(((civ) => 
			{
				this.open("0 A.D.'s Civilizations", this.page.civData[civ].Name);
			}).bind(this));
		this.civDropdown.civSelection.style = "BrownDropDown";

		// the heading is not necessary in this context
		this.civDropdown.civSelectionHeading.textcolor = "transparent";
    }

    setupButtons(items, category, civ){
		if (!items) {
			return;
		}
		if (category == "0 A.D.'s Civilizations" && !civ) {
			this.page.overviewPanel.civDropdown.selectNothing();

			// if no civilization is selected, all overviewButtons have to be disabled
			items = [];
		}

        this.buttons.forEach((button, i) => {
			const caption = items[i];
			button.hidden = !caption;
			if (button.hidden) {
				return;
			}
			button.caption = caption;
			button.onPress = () => {
            	this.page.selectionPanel.open(category, civ || "", caption);
            };
		});
		if (this.buttons.length < items.length) {
			error("GUI page has space for " + this.buttons.length + " overview buttons, but " + items.length + " items are provided!");
	    }
    }


    open(category, civ, dontUpdateBrowsingHistory) {
        this.page.lastCategory = category;
		this.page.switchPanel("overview");
		this.disclaimer.hidden = this.supriseMeButton.hidden = category != "About this Encyclopedia";

		if (!dontUpdateBrowsingHistory) {
		    this.page.updateBrowsingHistory({"panel":"overview", "category":category, "civ": civ && category == "0 A.D.'s Civilizations"? civ : ""});
		}

		this.civDropdown.hidden = category != "0 A.D.'s Civilizations";
		if (category == "0 A.D.'s Civilizations" && civ) {
			this.openCiv(civ);
			return;
		}

		this.learnMore.hidden = category == "0 A.D.'s Civilizations" || category == "About this Encyclopedia";
        this.civEmblem.hidden = true;

		const json = Engine.ReadJSONFile("gui/encyclopedia/articles/" + category + "/overview.json");
        this.title.caption = json.title || category;
        this.text.caption = json.content;

		this.learnMore.caption = json.learnMorePhrase || "Learn more about the …";

		this.setupButtons(Object.keys(g_EncyclopediaStructure[category]), category);
        this.page.relatedArticlesPanel.open("gui/encyclopedia/articles/" + category + "/overview.json");
		this.page.pathPanel.update("overview");
	}

    openCiv(civ) {
        this.page.lastCiv = civ;
		this.learnMore.hidden = this.civEmblem.hidden = false;
		
		this.page.relatedArticlesPanel.open("gui/encyclopedia/articles/0 A.D.'s Civilizations/" + civ + "/overview.json");

		this.civEmblem.children[1].sprite = "stretched:" + Object.values(this.page.civData).find(subObj => subObj.Name == civ).Emblem;
		this.title.caption = civ;

		//display the civ's overview text
		this.text.caption = Engine.ReadJSONFile("gui/encyclopedia/articles/0 A.D.'s Civilizations/" + civ + "/overview.json").content;
            
        this.setupButtons(Object.keys(g_EncyclopediaStructure["0 A.D.'s Civilizations"][civ]), "0 A.D.'s Civilizations", civ);
		this.page.pathPanel.update("overview");
    }
}