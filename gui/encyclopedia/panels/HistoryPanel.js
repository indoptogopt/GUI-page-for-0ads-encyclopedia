class HistoryPanel {
    constructor(page) {

        this.page = page;

        this.gui = Engine.GetGUIObjectByName("historyPanel");
        this.title = Engine.GetGUIObjectByName("historyTitle");
        this.text = Engine.GetGUIObjectByName("history");
    }

    open (file, fromBack) {
        this.page.switchPanel("history");
        
        let json =  Engine.ReadJSONFile(file);
        this.page.lastArticle = this.title.caption = json.Title;
        this.text.caption = json.Content;

        if (!fromBack) {
            this.page.updateBrowsingHistory({"panel":"history", "category":this.page.lastCategory, "civ":this.page.lastCiv, "subcategory":this.page.lastSubcategory, "file":file});
        }
        this.page.pathPanel.update("history");
        this.page.relatedArticlesPanel.open(file);
    }
}