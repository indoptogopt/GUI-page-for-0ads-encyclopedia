class SelectionPanel {
    constructor (page) {
        this.page = page;

        this.gui = Engine.GetGUIObjectByName("selectionPanel");
        this.title = Engine.GetGUIObjectByName("selectionTitle");
		this.warning = Engine.GetGUIObjectByName("selectionWarning");
		this.warning.hidden = true;
        this.selection = Engine.GetGUIObjectByName("selectionList");
    }

    setupList(targetdir){
		const files = Engine.ListDirectoryFiles(targetdir, "*.json", false);
		this.warning.hidden = !!files.length;
		if (!this.warning.hidden) {
			this.selection.list = [];
			return;
		}
		this.selection.list = files.map(file => {
			const json = Engine.ReadJSONFile(file);
			return json.title || Engine.ReadJSONFile("gui/encyclopedia/articles/parent articles/" + json.parent).title;
		});

		// a double-click opens the article
		let selected = this.selection.selected = -1;
		this.selection.onSelectionChange = () => {
			if (this.selection.selected == selected && selected != -1) {
				this.page.articlePanel.open(files[selected]);
			}
			selected = this.selection.selected;
		}
    }

	open(category, civ, subcategory, dontUpdateBrowsingHistory) {

		this.page.switchPanel("selection");
		this.title.caption = this.page.lastSubcategory = subcategory;
		this.setupList("gui/encyclopedia/articles/" + category + "/" + (civ? civ + "/" : "") + subcategory);
		if (!dontUpdateBrowsingHistory) {
			this.page.updateBrowsingHistory({"panel":"selection", "category":category, "civ":civ, "subcategory":subcategory});
		}
		this.page.pathPanel.update("selection");
	}
}
