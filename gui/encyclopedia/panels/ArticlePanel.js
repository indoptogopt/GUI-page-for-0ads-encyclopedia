class ArticlePanel {
    constructor(page) {

        this.page = page;

        this.gui = Engine.GetGUIObjectByName("articlePanel");
        this.title = Engine.GetGUIObjectByName("articleTitle");
        this.text = Engine.GetGUIObjectByName("articleText");
        // this.image =  Engine.GetGUIObjectByName("articleImage");
    }

    open (file, dontUpdateBrowsingHistory) {
        this.page.switchPanel("article");
        
        const json =  Engine.ReadJSONFile(file);
        if (json.parent && !Engine.FileExists("gui/encyclopedia/articles/parent articles/" + json.parent))
            error("invalid parent " + json.parent + " in article " + file);
        
        const parent = json.parent? Engine.ReadJSONFile("gui/encyclopedia/articles/parent articles/" + json.parent) : {};

        this.page.lastArticle = this.title.caption = json.title || parent.title;
        this.text.caption = json.content || parent.content;
        // this.image.hidden = !(json.image || parent.image);
        // if (!this.image.hidden)
        //     this.image.sprite = "stretched:" + json.image || parent.image;

        if (!dontUpdateBrowsingHistory) {
            this.page.updateBrowsingHistory({"panel":"article", "category":this.page.lastCategory, "civ":this.page.lastCiv, "subcategory":this.page.lastSubcategory, "file":file});
        }
        this.page.pathPanel.update("article");
        this.page.relatedArticlesPanel.open(file);
    }
}