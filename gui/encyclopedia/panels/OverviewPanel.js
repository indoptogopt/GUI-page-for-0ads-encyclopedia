const overviewButtonHeight = 35;
const overviewButtonDist = 25;

const categoriesHidingLearnMore = ["About this Encyclopedia", "0 A.D.'s Civilizations"];

class OverviewPanel 
{
	constructor(page) 
	{
        this.page = page;

        this.gui = Engine.GetGUIObjectByName("overviewPanel");
        this.title = Engine.GetGUIObjectByName("overviewTitle");
        this.text = Engine.GetGUIObjectByName("overviewText");
        this.civEmblem = Engine.GetGUIObjectByName("civEmblem");
        this.learnMore = Engine.GetGUIObjectByName("learnMore");
		this.textAddition = Engine.GetGUIObjectByName("civilizationsTextAddition");
		this.disclaimer = Engine.GetGUIObjectByName("disclaimer");
		this.disclaimer.caption = Engine.TranslateLines(Engine.ReadFile("gui/encyclopedia/articles/About this Encyclopedia/disclaimer.txt"));
		this.supriseMeButton = Engine.GetGUIObjectByName("supriseMeButton");
		this.buttons = Engine.GetGUIObjectByName("overviewButtons").children;
		
		const panelSize = this.gui.getComputedSize();
		const panelWidth = panelSize.right - panelSize.left;
		const panelHeight = panelSize.bottom - panelSize.top;
		const civEmblemRadius = panelHeight * 0.12 - 34;
		this.civEmblem.size = new GUISize(- civEmblemRadius, 50 - civEmblemRadius * 2, civEmblemRadius, 50, 50, 0, 50, 0);
		// on smaller screen sizes we can only fit two buttons in the available horizontal space (otherwise they will be to narrow for their captions)
		const buttonsPerLine = panelWidth > 720 ? 3 : 2;
		// overviewButtons are horiontal, only three fit into a line (therefore the modulo)
		// their width is determined by screen resolution
		this.buttons.forEach((button, i) => {
			button.size = new GUISize(
				overviewButtonDist / 2, Math.floor(i / buttonsPerLine) * (overviewButtonHeight + overviewButtonDist / 2),
                -(overviewButtonDist / 2), Math.floor(i / buttonsPerLine) * (overviewButtonHeight + overviewButtonDist / 2) + overviewButtonHeight,
				(i % buttonsPerLine) * (100 / buttonsPerLine), 0, ((i % buttonsPerLine) + 1) * (100 / buttonsPerLine), 0
			);
		})

		
		this.supriseMeButton.font = "sans-bold-22";
		this.supriseMeButton.size = new GUISize(-overviewButtonDist, 230, overviewButtonDist, 300, (100 / 3), 25, (100 / 3) * 2, 25);
		this.supriseMeButton.onPress = () => {
			this.page.randomArticle();
		}

        // initializing the CivDropdown
    	this.civDropdown = new CivSelectDropdown(this.page.civData);
		this.civDropdown.registerHandler(((civ) => 
			{
				if (civ)
					this.open("0 A.D.'s Civilizations", this.page.civData[civ].Name);
			}).bind(this));
		this.civDropdown.civSelection.style = "BrownDropDown";
		this.civDropdown.civSelectionHeading.textcolor = "transparent";
		// this.civDropdown.civSelectionHeading.caption = "Choose a civilization:";
    }

    setupButtons(items, category, civ)
	{
		if (!items) {
			return;
		}
		if (category == "0 A.D.'s Civilizations" && !civ) {
			this.page.overviewPanel.civDropdown.civSelection.selected = -1;

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


    open(category, civ, dontUpdateNavigationHistory) 
	{
        this.page.lastCategory = category;
		this.page.switchPanel("overview");
		this.disclaimer.hidden = this.supriseMeButton.hidden = category != "About this Encyclopedia";
		this.textAddition.hidden = (category != "0 A.D.'s Civilizations" || !!civ);

		if (!dontUpdateNavigationHistory) {
		    this.page.updateNavigationHistory({"panel":"overview", "category":category, "civ": civ && category == "0 A.D.'s Civilizations"? civ : ""});
		}

		this.civDropdown.hidden = category != "0 A.D.'s Civilizations";
		if (category == "0 A.D.'s Civilizations" && civ) {
			this.openCiv(civ);
			return;
		}
		// this.civDropdown.civSelectionHeading.textcolor = "blackbrown";

		this.learnMore.hidden = categoriesHidingLearnMore.includes(category);
        this.civEmblem.hidden = true;

		const json = Engine.ReadJSONFile("gui/encyclopedia/articles/" + category + "/overview.json");
        this.title.caption = json.title || category;
        this.text.caption = json.content;

		this.learnMore.caption = json.learnMorePhrase || "Learn more about the …";

		this.setupButtons(Object.keys(g_EncyclopediaStructure[category]), category);
        this.page.relatedArticlesPanel.open("gui/encyclopedia/articles/" + category + "/overview.json");
		this.page.pathPanel.update("overview");
	}

    openCiv(civ) 
	{
        this.page.lastCiv = civ;
		this.learnMore.hidden = this.civEmblem.hidden = false;
		
		// this.civDropdown.civSelectionHeading.textcolor = "transparent";
		
		this.page.relatedArticlesPanel.open("gui/encyclopedia/articles/0 A.D.'s Civilizations/" + civ + "/overview.json");

		this.civEmblem.children[1].sprite = "stretched:" + Object.values(this.page.civData).find(subObj => subObj.Name == civ).Emblem;
		this.title.caption = civ;

		//display the civ's overview text
		this.text.caption = Engine.ReadJSONFile("gui/encyclopedia/articles/0 A.D.'s Civilizations/" + civ + "/overview.json").content;
            
        this.setupButtons(Object.keys(g_EncyclopediaStructure["0 A.D.'s Civilizations"][civ]), "0 A.D.'s Civilizations", civ);
		this.page.pathPanel.update("overview");
    }
}
