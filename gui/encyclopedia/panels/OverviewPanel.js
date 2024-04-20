//OverviewButtons are horiontal
const overviewButtonHeight = 35;
const overviewButtonWidth = 150;
const overviewButtonDist = 20;

class OverviewPanel {
	constructor(page) {

        this.page = page;

        this.gui = Engine.GetGUIObjectByName("overviewPanel");
        this.title = Engine.GetGUIObjectByName("overviewTitle");
        this.text = Engine.GetGUIObjectByName("overview");
        this.civEmblem = Engine.GetGUIObjectByName("CivEmblem");
        this.learnMore = Engine.GetGUIObjectByName("learnMore");
        this.buttons = Engine.GetGUIObjectByName("OverviewButtons");

        // initializing the CivDropdown
    	this.civDropdown = new CivSelectDropdown(this.page.civData);
		this.civDropdown.registerHandler(((civ) => {this.open('civilisations', civ)}).bind(this));
    }

    setupButtons(names, category, civ){

		if (!names) {

			return;
		}

		if (category == "civilisations" && !civ) {
			names = [];
		}

        for (let i in this.buttons.children) {
			let button = this.buttons.children[i];
			let name = names[i];
			button.hidden = !name;
			if (button.hidden) {
				continue;
			}
            button.size = new GUISize(
				i * (overviewButtonWidth + overviewButtonDist) + overviewButtonDist / 2, 0,
                i * (overviewButtonWidth + overviewButtonDist) + overviewButtonDist / 2 + overviewButtonWidth, overviewButtonHeight,
				20, 79, 20, 79);
			button.caption = name;
			button.onPress = () => {
            	this.page.selectionPanel.open(category, civ || "", name);
            };
		};
		if (this.buttons.children.length < names.length) {
			error("GUI page has space for " + this.buttons.children.length + " overview buttons, but " + names.length + " items are provided!");
	    }

    }


    open(category, civ, fromBack) {
        this.page.lastCategory = category;
		this.page.switchPanel("overview");
		this.page.categoryPanel.selectButton(category);

		if (!fromBack) {
		    this.page.updateBrowsingHistory({"panel":"overview", "category":category, "civ":civ});
		}

		this.civDropdown.hidden = category != "civilisations";
		if (category == "civilisations" && !!civ) {
			this.openCiv(civ, fromBack);
			return;
		}

        this.learnMore.hidden = Object.keys(this.page.folders[category]).length == 0;
        this.civEmblem.hidden = true;
        this.title.caption = category;
        this.text.caption = Engine.ReadJSONFile("gui/encyclopedia/articles/" + category + "/overview.json").Content;
        
		this.setupButtons(Object.keys(this.page.folders[category]), category);
        this.page.relatedArticlesPanel.open("gui/encyclopedia/articles/" + category + "/overview.json");
		this.page.pathPanel.update("overview");
	}

    openCiv(civ) {
        this.page.lastCiv = civ;
		this.learnMore.hidden = this.civEmblem.hidden = false;
		
		this.page.relatedArticlesPanel.open("gui/encyclopedia/articles/civilisations/" + civ + "/overview.json");

		this.civEmblem.sprite = "stretched:" + this.page.civData[civ].Emblem;
		this.title.caption = this.page.civData[civ].Name;

		//display the civ's overview text
		this.text.caption = Engine.ReadJSONFile("gui/encyclopedia/articles/civilisations/" + civ + "/overview.json").Content;
            
        this.setupButtons(Object.keys(this.page.folders["civilisations"][civ]), "civilisations", civ);
		this.page.pathPanel.update('overview');
    }
}