const categoryButtonHeight = 35;
const categoryButtonDist = 5;

class CategoryPanel {
	constructor(page) {

        this.page = page;

        this.randomArticleButton = Engine.GetGUIObjectByName("randomArticleButton");
        this.buttons = Engine.GetGUIObjectByName("categoryButtons");

        this.setupCategoryButtons(Object.keys(this.page.folders));
        this.randomArticleButton.onPress = () => {
			this.page.randomArticle();
		}
    }

    setupCategoryButtons(names)
	{
		this.buttons.children.forEach((button, i) => {
			let name = names[i];
			button.hidden = !name;
			if (button.hidden)
				return;
			button.caption = name;
            button.size = new GUISize(
				0, i * (categoryButtonHeight + categoryButtonDist) + categoryButtonDist / 2,
                0, i * (categoryButtonHeight + categoryButtonDist) + categoryButtonDist / 2 + categoryButtonHeight,
				10, 20, 90, 20);
			button.onPress = () => {
            	this.page.overviewPanel.open(name, this.page.lastCiv, false);
            };
		});

		if (this.buttons.children.length < names.length)
			error("GUI page has space for " + this.buttons.children.length + " category buttons, but " + names.length + " items are provided!");
	}

    selectButton(category)
    {
		const categoryIndex = Object.keys(this.page.folders).indexOf(category);
        for (let i = 0, button = {}; button =  this.buttons.children[i]; i++) {
            button.sprite = i == categoryIndex ? "StoneButtonOver" : "StoneButton";
        }
    }
}