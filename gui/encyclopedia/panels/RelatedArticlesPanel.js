
const relatedArticlesButtonHeight = 30;
const relatedArticlesButtonDist = 5;


class RelatedArticlesPanel {
    constructor(page) {

        this.page = page;

        this.gui = Engine.GetGUIObjectByName("relatedArticlesPanel");
        this.heading = Engine.GetGUIObjectByName("relatedArticlesPanel");
        this.warning = Engine.GetGUIObjectByName("relatedArticlesWarning");
        this.buttons = Engine.GetGUIObjectByName("relatedArticlesButtons").children;
        this.buttons.forEach((button, i) => {
            button.size = new GUISize(
				8, i * (relatedArticlesButtonHeight + relatedArticlesButtonDist) + relatedArticlesButtonDist / 2,
                -8, i * (relatedArticlesButtonHeight + relatedArticlesButtonDist) + relatedArticlesButtonDist / 2 + relatedArticlesButtonHeight,
				0, 12, 100, 12);
        })
    }

    setupButtons(items) {
        this.buttons.forEach((button, i) => {
            const item = items[i];
			button.hidden = !item;
			if (button.hidden)
				return;
			button.caption = item.title;
			button.onPress = () => {
            	this.page.articlePanel.open("gui/encyclopedia/articles/" + item.path);
            };
		});

		if (this.buttons.length < items.length) {
			error("GUI page has space for " + this.buttons.length + " relatedArticles buttons, but " + items.length + " items are provided!");
	    }
    }

    open(file) {

        const list = Engine.ReadJSONFile(file).relatedArticles;
        this.warning.hidden = !!list;
        if (!this.warning.hidden) {
            this.buttons.forEach(button => button.hidden = true);
            return;
        }

        // getting the articles' titles
        const data = list.map(path => {
            if (!Engine.FileExists("gui/encyclopedia/articles/" + path)) {
                warn("invalid relatedArticle in " + file);
                return;
            }
            const json = Engine.ReadJSONFile("gui/encyclopedia/articles/" + path);
            const title = json.title || Engine.ReadJSONFile("gui/encyclopedia/articles/parent articles/" + json.parent).title;
            return {"path":path, "title": title};
        })
        this.setupButtons(data);
    }

}