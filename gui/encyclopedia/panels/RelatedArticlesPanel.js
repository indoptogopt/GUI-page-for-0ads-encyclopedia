
const relatedArticlesButtonHeight = 35;
const relatedArticlesButtonDist = 5;


class RelatedArticlesPanel {
    constructor(page) {

        this.page = page;

        this.gui = Engine.GetGUIObjectByName("relatedArticlesPanel");
        this.heading = Engine.GetGUIObjectByName("relatedArticlesPanel");
        this.buttons = Engine.GetGUIObjectByName("relatedArticlesButtons");
    }

    setupButtons(buttons, items) {
        buttons.forEach((button, i) => {
			let item = items[i];
			button.hidden = !item;
			if (button.hidden)
				return;
            button.size = new GUISize(
				0, i * (relatedArticlesButtonHeight + relatedArticlesButtonDist) + relatedArticlesButtonDist / 2,
                0, i * (relatedArticlesButtonHeight + relatedArticlesButtonDist) + relatedArticlesButtonDist / 2 + relatedArticlesButtonHeight, overviewButtonHeight,
				0, 20, 0, 20);
			button.caption = item.name;
			button.tooltip = item.tooltip? item.tooltip : "";
			button.onPress = () => {
            	this.page.selectionPanel.open(categoryIndex, i, civIndex? Object.keys(this.civData)[civIndex] :"");
            };
		});

		if (buttons.length < items.length) {
			error("GUI page has space for " + buttons.length + " relatedArticles buttons, but " + items.length + " items are provided!");
	    }
    }

    open(file) {

        let list = Engine.ReadJSONFile(file).relatedArticles;
        this.gui.hidden = !list;
        if (!this.gui.hidden) {
            this.setupButtons(this.buttons.children, list);
        }
    }

}