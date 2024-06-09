const navigationButtons = 
[
    {
		caption:"Structure Tree", 
		onPress:() => 
		{
			// pageLoop() requires https://code.wildfiregames.com/D5261 and therefore doesn't work with the latest release candidate
			// pageLoop.bind(null, "page_structree.xml");

			let callback = data => {
				if (data.nextPage)
					Engine.PushGuiPage(data.nextPage, { "civ": data.civ }, callback);
			};
			Engine.PushGuiPage("page_structree.xml", {}, callback);
		},
	},
    {
		caption:"Civilisation Overview", 
		onPress:() => 
		{
			// pageLoop() requires https://code.wildfiregames.com/D5261 and therefore doesn't work with the latest release candidate
			// pageLoop.bind(null, "page_civinfo.xml");

			let callback = data => {
				if (data.nextPage)
					Engine.PushGuiPage(data.nextPage, { "civ": data.civ }, callback);
			};
			Engine.PushGuiPage("page_civinfo.xml", {}, callback);
		},
	},
    {
		caption:"Main Menu", 
		onPress:() => {Engine.SwitchGuiPage("page_pregame.xml")},
	}
];

const categoryButtonHeight = 35;
const categoryButtonDist = 5;
const categoryButtonPadding = categoryButtonDist * 4;

const navigationButtonHeight = 30;
const navigationButtonDist = 5;
const navigationButtonPadding = 17;


class NavigationPanel {
	constructor(page) {
        this.page = page;

        this.categoryButtons = Engine.GetGUIObjectByName("categoryButtons").children;
		this.navigationButtons = Engine.GetGUIObjectByName("navigationButtons").children;
		this.heading = Engine.GetGUIObjectByName("categoryButtonHeading");
		this.buttonPanel = Engine.GetGUIObjectByName("categorySelection");
		this.mainMenuButton = Engine.GetGUIObjectByName("mainMenuButton");
		this.aboutButton = Engine.GetGUIObjectByName("aboutButton");

        this.setupCategoryButtons(Object.keys(g_EncyclopediaStructure).filter(category => ["About"]));
		this.setupNavigationButtons(navigationButtons);
    }

    setupCategoryButtons(items)
	{
		if (!items.length)
			return;
		
		// the heading is placed above the buttons and outside of the buttonPanel 
		this.heading.size = new GUISize(0, -(categoryButtonHeight + categoryButtonDist), 0, -categoryButtonDist, 0, 0, 100, 0);
		this.buttonPanel.size = new GUISize(40, 0, -40, items.length * categoryButtonHeight + (items.length - 1) * categoryButtonDist + 2 * categoryButtonPadding, 0, 25, 100, 25);

		this.categoryButtons.forEach((button, i) => {
			const item = items[i];
			button.hidden = !item;
			if (button.hidden)
				return;
			button.caption = item;
            button.size = new GUISize(
				categoryButtonPadding, i * (categoryButtonHeight + categoryButtonDist) + categoryButtonPadding,
                -categoryButtonPadding, i * (categoryButtonHeight + categoryButtonDist) + categoryButtonHeight + categoryButtonPadding,
				0, 0, 100, 0);
			button.onPress = () => {
				if (item == "0 A.D.'s Civilizations")
					this.page.lastCiv = "";
            	this.page.overviewPanel.open(item, this.page.lastCiv, false);
				this.selectCategoryButton(item);
            };
		});

		if (this.categoryButtons.length < items.length)
			error("GUI page has space for " + this.categoryButtons.length + " category buttons, but " + items.length + " items are provided!");
	}

	setupNavigationButtons(items)
	{
		if (!items.length)
			return;
		
		// the navigationButtons are anchored to the bottom, and are drawn from the bottom up for simplicity
		// we therefore need to loop throught the items from back to front (since the first item is supposed to be at the top)
		this.navigationButtons.forEach((button, i) => {
			const item = items[items.length - i - 1];
			button.hidden = !item;
			if (button.hidden)
				return;
			button.caption = item.caption;
			button.onPress = item.onPress.bind(this);

            button.size = new GUISize(
				navigationButtonPadding, 
				-(i * (navigationButtonHeight + navigationButtonDist) + navigationButtonHeight + navigationButtonPadding),
                -navigationButtonPadding, 
				-(i * (navigationButtonHeight + navigationButtonDist) + navigationButtonPadding),
				0, 100, 100, 100);
		});

		if (this.categoryButtons.length < items.length)
			error("GUI page has space for " + this.categoryButtons.length + " category buttons, but " + items.length + " items are provided!");
	}

    selectCategoryButton(category)
    {
        for (const button of this.categoryButtons) {
            button.sprite = button.caption == category? "StoneButtonOver" : "StoneButton";
        }
    }
}