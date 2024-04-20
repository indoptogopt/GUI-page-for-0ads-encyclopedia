class PathPanel {
    constructor(page) {

        this.page = page;

        this.gui = Engine.GetGUIObjectByName("Path");
        this.upButton = Engine.GetGUIObjectByName("UpButton");
        this.filler1 = Engine.GetGUIObjectByName("PathFiller1");
        this.filler2 = Engine.GetGUIObjectByName("PathFiller2");
        this.categoryButton = Engine.GetGUIObjectByName("PathCategory");
        this.civButton = Engine.GetGUIObjectByName("PathCiv");
        this.subcategoryButton = Engine.GetGUIObjectByName("PathSubcategory");

        this.upButton.onPress = () => {this.page.toParentDirectory()};
    }

    update(panel) {
        this.page.lastPanel = panel;

        this.upButton.hidden = this.filler1.hidden = (panel == "overview" && this.page.lastCategory != "civilisations") || (this.page.lastCategory == "civilisations" && !this.page.lastCiv);
        this.categoryButton.caption = this.page.lastCategory;
        this.categoryButton.onPress = () => {
            if (this.page.lastCategory == "civilisations") {
                this.page.overviewPanel.civDropdown.selectNothing();
                this.page.lastCiv = null;
            }
            this.page.overviewPanel.open(this.page.lastCategory);
            
        }
        this.filler2.hidden = panel == "overview" || this.page.LastCategory != "civilisations"

        this.civButton.hidden = this.page.lastCategory != "civilisations" || !this.page.lastCiv;
        this.civButton.caption = this.page.lastCiv? this.page.civData[this.page.lastCiv].Name : "";
        this.civButton.onPress = () => {
            this.page.overviewPanel.open("civilisations", this.page.lastCiv);
        }

		let left = this.page.lastCategory == "civilisations" ? 350 : 200;
		let right = this.page.lastCategory == "civilisations" ? 450 : 300;
        this.subcategoryButton.size = new GUISize(left, 0, right, 0, 0, 0, 0, 100)
        this.subcategoryButton.hidden = panel == "overview";
        this.subcategoryButton.caption = this.page.lastSubcategory || "";
        this.subcategoryButton.onPress = () => {
            this.page.selectionPanel.open(this.page.lastCategory, this.page.lastCategory == "civilisations" ? this.page.lastCiv : "", this.page.lastSubcategory);
        }

        this.filler2.hidden = ["overview", "civOverview"].includes(panel) || this.page.lastCategory != "civilisations";

    }
}