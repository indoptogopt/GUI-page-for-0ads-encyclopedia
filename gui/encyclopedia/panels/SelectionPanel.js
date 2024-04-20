class SelectionPanel {
    constructor (page) {
        this.page = page;

        this.gui = Engine.GetGUIObjectByName("SelectionPanel");
        this.title = Engine.GetGUIObjectByName("SelectionTitle");
        this.selection = Engine.GetGUIObjectByName("SelectionList");
    }

    setupList(targetdir){
		let files = Engine.ListDirectoryFiles(targetdir, "*.json", false);
		this.selection.list = files.map(file => {
			return Engine.ReadJSONFile(file).Title;
		});
		let selected = -1;
		this.selection.onSelectionChange = () => {
			if (this.selection.selected == selected) {
				this.page.historyPanel.open(files[selected]);
			}
			selected = this.selection.selected;
		}
    }

	open(category, civ, subcategory, fromBack) {

		this.page.switchPanel("selection");
		this.page.lastSubcategory = subcategory;

		this.setupList("gui/encyclopedia/articles/" + category + "/" + civ + (civ? "/" : "") + subcategory);
		if (!fromBack) {
			this.page.updateBrowsingHistory({"panel":"selection", "category":category, "civ":civ, "subcategory":subcategory});
		}
		this.page.pathPanel.update("selection");
	}
}
