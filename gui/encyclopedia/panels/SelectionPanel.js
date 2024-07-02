class SelectionPanel 
{
    constructor (page) 
	{
        this.page = page;

        this.gui = Engine.GetGUIObjectByName("selectionPanel");
        this.title = Engine.GetGUIObjectByName("selectionTitle");
		this.warning = Engine.GetGUIObjectByName("selectionWarning");
		this.warning.hidden = true;
        this.selection = Engine.GetGUIObjectByName("selectionList");
		this.list = [];
    }

    setupList(targetdir, dontRenderList)
	{
		this.list = Engine.ListDirectoryFiles(targetdir, "*.json", false);

		// When an article is opened directly (and not from this selection menu), the directory files still need to be listed
		// in order to be able to pass on the fileData (information about the previous and next files), but without actually rendering this selection menu
		if (dontRenderList)
			return;
		this.warning.hidden = this.list != null;
		if (!this.warning.hidden) {
			this.selection.list = [];
			return;
		}
		this.selection.list = this.list.map(file => {
			const json = Engine.ReadJSONFile(file);
			return json.title || 
			Engine.ReadJSONFile("gui/encyclopedia/articles/parent articles/" + json.parent).title;
		});

		// a double-click opens the article
		let selected = this.selection.selected = -1;
		this.selection.onSelectionChange = () => {
			if (this.selection.selected == selected && selected != -1) {
				this.page.articlePanel.open(this.list[selected]);
			}
			selected = this.selection.selected;
		}
    }

	open(category, civ, subcategory, dontUpdateNavigationHistory) 
	{
		this.page.switchPanel("selection");
		this.title.caption = this.page.lastSubcategory = subcategory;
		this.setupList("gui/encyclopedia/articles/" + category + "/" + (civ? civ + "/" : "") + subcategory);
		if (!dontUpdateNavigationHistory) {
			this.page.updateNavigationHistory({"panel":"selection", "category":category, "civ":civ, "subcategory":subcategory});
		}
		this.page.pathPanel.update("selection");
	}

	getFileData (file)
	{
		const index = this.list.indexOf(file);
		return {
			"hasNextFile": index != this.list.length - 1,
			"nextFile": this.list[index + 1] || "",
			"hasPreviousFile": index != 0,
			"previousFile": this.list[index - 1] || ""
		};
	}
}
