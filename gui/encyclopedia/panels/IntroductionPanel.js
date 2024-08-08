const subcategoryButtonHeight = 35;
const subcategoryButtonDist = 25;

const categoriesHidingLearnMore = ["about", "civilizations"];

class IntroductionPanel
{
	constructor(page)
	{
        this.page = page;

        this.gui = Engine.GetGUIObjectByName("introductionPanel");
        this.title = Engine.GetGUIObjectByName("introductionTitle");
        this.text = Engine.GetGUIObjectByName("introductionText");
        this.civEmblem = Engine.GetGUIObjectByName("civEmblem");
        this.learnMore = Engine.GetGUIObjectByName("learnMore");
		this.textAddition = Engine.GetGUIObjectByName("civilizationsTextAddition");
		this.disclaimer = Engine.GetGUIObjectByName("disclaimer");
		this.disclaimer.caption = Engine.TranslateLines(Engine.ReadFile(this.page.pathToArticles + "about/disclaimer.txt"));
		this.supriseMeButton = Engine.GetGUIObjectByName("supriseMeButton");
		this.buttons = Engine.GetGUIObjectByName("subcategoryButtons").children;

		const panelSize = this.gui.getComputedSize();
		const panelWidth = panelSize.right - panelSize.left;
		const panelHeight = panelSize.bottom - panelSize.top;
		const civEmblemRadius = panelHeight * 0.12 - 34;
		this.civEmblem.size = new GUISize(- civEmblemRadius, 50 - civEmblemRadius * 2, civEmblemRadius, 50, 50, 0, 50, 0);
		// on smaller screen sizes we can only fit two buttons in the available horizontal space (otherwise they will be to narrow for their captions)
		const buttonsPerLine = panelWidth > 720 ? 3 : 2;
		// subcategoryButtons are horiontal, only three fit into a line (therefore the modulo)
		// their width is determined by screen resolution
		this.buttons.forEach((button, i) => {
			button.size = new GUISize(
				subcategoryButtonDist / 2, Math.floor(i / buttonsPerLine) * (subcategoryButtonHeight + subcategoryButtonDist / 2),
                -(subcategoryButtonDist / 2), Math.floor(i / buttonsPerLine) * (subcategoryButtonHeight + subcategoryButtonDist / 2) + subcategoryButtonHeight,
				(i % buttonsPerLine) * (100 / buttonsPerLine), 0, ((i % buttonsPerLine) + 1) * (100 / buttonsPerLine), 0
			);
		})

		this.supriseMeButton.font = "sans-bold-22";
		this.supriseMeButton.size = new GUISize(-subcategoryButtonDist, 230, subcategoryButtonDist, 300, (100 / 3), 25, (100 / 3) * 2, 25);
		this.supriseMeButton.onPress = () => {
			this.page.randomArticle();
		}

        // initializing the CivDropdown
    	this.civDropdown = new CivSelectDropdown(this.page.civData);
		this.civDropdown.registerHandler(((civ) =>
			{
				if (civ)
					this.open("civilizations", civ);
			}).bind(this));
		this.civDropdown.civSelection.style = "BrownDropDown";
		this.civDropdown.civSelectionHeading.textcolor = "transparent";
		// this.civDropdown.civSelectionHeading.caption = "Choose a civilization:";
    }

    setupButtons(subcategoryData)
	{
		if (this.page.lastCategory == "civilizations" && !this.page.lastCiv) {
			this.page.introductionPanel.civDropdown.civSelection.selected = -1;

			// if no civilization is selected, all subcategoryButtons have to be hidden
			subcategoryData = {};
		}

		const subcategories = Object.keys(subcategoryData);

        this.buttons.forEach((button, i) => {
			const subcategory = subcategories[i];
			button.hidden = !subcategory;
			if (button.hidden) {
				return;
			}
			button.caption = subcategoryData[subcategory].title;
			button.onPress = () => {
            	this.page.selectionPanel.open(this.page.lastCategory, this.page.lastCiv || "", subcategory);
            };
		});
		if (this.buttons.length < subcategories.length) {
			error("GUI page has space for " + this.buttons.length + " subcategory buttons, but " + subcategories.length + " items are provided!");
	    }
    }


    open(category, civ, dontUpdateNavigationHistory)
	{
		this.page.switchPanel("introduction");
		this.page.lastCategory = category;
		this.page.lastCiv = civ;
		this.disclaimer.hidden = this.supriseMeButton.hidden = category != "about";
		this.textAddition.hidden = (category != "civilizations" || !!civ);

		if (!dontUpdateNavigationHistory) {
		    this.page.updateNavigationHistory({"panel":"introduction", "category":category, "civ": civ && category == "civilizations"? civ : ""});
		}

		this.civDropdown.civSelection.hidden = category != "civilizations";
		if (category == "civilizations" && civ) {
			this.openCiv(civ);
			return;
		}
		// this.civDropdown.civSelectionHeading.textcolor = "blackbrown";
		const targetDir = this.page.pathToArticles + category + "/";

		this.learnMore.hidden = categoriesHidingLearnMore.includes(category);
        this.civEmblem.hidden = true;

        this.title.caption = g_EncyclopediaStructure[category].title;
        this.text.caption = Engine.ReadFile(targetDir + "introduction.txt");

		this.learnMore.caption =
			Engine.FileExists(targetDir + "learnMorePhrase.txt") ?
				Engine.ReadFile(targetDir + "learnMorePhrase.txt") :
				this.defaultLearnMorePhrase;

		this.setupButtons(g_EncyclopediaStructure[category].subdirectories || {}, category);
		this.page.pathPanel.update("introduction");
	}

    openCiv(civ)
	{
		this.learnMore.hidden = this.civEmblem.hidden = false;

		// this.civDropdown.civSelectionHeading.textcolor = "transparent";


		this.civEmblem.children[1].sprite = "stretched:" + this.page.civData[civ].Emblem;

		this.title.caption = g_EncyclopediaStructure.civilizations.subdirectories[civ].title;
		this.text.caption = Engine.ReadFile(this.page.pathToArticles + "civilizations/" + civ + "/introduction.txt")

        this.setupButtons(g_EncyclopediaStructure.civilizations.subdirectories[civ].subdirectories, "civilizations", civ);
		this.page.pathPanel.update("introduction");
    }
}

IntroductionPanel.prototype.defaultLearnMorePhrase = "Learn more about the …";
