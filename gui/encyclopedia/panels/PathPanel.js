const wordSpacing = 0;
const textBuffer = 10;
const fadingExtrusion = 20;

class PathPanel
{
    constructor(page)
    {
        this.page = page;

        this.gui = Engine.GetGUIObjectByName("path");
        this.guiWidth = 0;
        this.fadingTop = Engine.GetGUIObjectByName("pathFadingTop");
        this.fadingBottom = Engine.GetGUIObjectByName("pathFadingBottom");
        this.upButton = Engine.GetGUIObjectByName("upButton");
        this.separator1 = Engine.GetGUIObjectByName("pathSeparator1");
        this.separator2 = Engine.GetGUIObjectByName("pathSeparator2");
        this.separator3 = Engine.GetGUIObjectByName("pathSeparator3");
        this.categoryButton = Engine.GetGUIObjectByName("pathCategory");
        this.civButton = Engine.GetGUIObjectByName("pathCiv");
        this.subcategoryButton = Engine.GetGUIObjectByName("pathSubcategory");
        this.articleButton = Engine.GetGUIObjectByName("pathArticle");
        this.movableElements = Engine.GetGUIObjectByName("pathMovableElements");
        this.elements = [this.categoryButton, this.separator1, this.civButton, this.separator2, this.subcategoryButton, this.separator3, this.articleButton];

        this.upButton.onPress = () => {this.page.toParentDirectory()};
    }

    update(panel)
    {
        this.page.lastPanel = panel;

        // if pressing the upButton would do nothing, it should also give no visual response when the player is hovering over it (i.e. setting the sprite_over to sprite)
        this.upButton.sprite_over = panel != "introduction" || (this.page.lastCategory == "civilizations" && this.page.lastCiv)? "LightBrownArrowUp" :  "BrownArrowUp";
        this.separator1.hidden = (panel == "introduction" && this.page.lastCategory != "civilizations") || (this.page.lastCategory == "civilizations" && !this.page.lastCiv);
        this.categoryButton.caption = g_EncyclopediaStructure[this.page.lastCategory].title;
        this.categoryButton.onPress = () => {
            if (this.page.lastCategory == "civilizations") {
                this.page.lastCiv = "";
            }
            this.page.introductionPanel.open(this.page.lastCategory);

        }

        this.separator2.hidden = panel == "introduction" || this.page.lastCategory != "civilizations" || !this.page.lastCiv;

        this.civButton.hidden = this.page.lastCategory != "civilizations" || !this.page.lastCiv;
        this.civButton.caption = this.page.lastCiv ? this.page.civData[this.page.lastCiv].Name : "";
        this.civButton.onPress = () => {
            this.page.introductionPanel.open("civilizations", this.page.lastCiv);
        }

        this.subcategoryButton.hidden = panel == "introduction";
        if (!this.subcategoryButton.hidden)
        {
            let data =
                this.page.lastCategory == "civilizations" ?
                    g_EncyclopediaStructure[this.page.lastCategory].subdirectories[this.page.lastCiv].subdirectories[this.page.lastSubcategory] :
                    g_EncyclopediaStructure[this.page.lastCategory].subdirectories[this.page.lastSubcategory];

            this.subcategoryButton.caption = data.shortenedTitle || data.title;
            this.subcategoryButton.onPress = () => {
                this.page.selectionPanel.open(this.page.lastCategory, this.page.lastCategory == "civilizations" ? this.page.lastCiv : "", this.page.lastSubcategory);
            }
        }

        this.separator3.hidden = panel != "article";
        this.articleButton.caption = this.page.lastArticle;
        this.articleButton.hidden = panel != "article";

        // aligning the buttons
        let offset = this.upButton.size.right + wordSpacing;
        const left = offset;
        for (let element of this.elements) {
            if (element.hidden)
            {
                continue;
            }
            const width = Engine.GetTextWidth(element.font, element.caption);
            element.size = new GUISize(offset, 0, offset + width + textBuffer, 0, 0, 0, 0, 100);
            offset += width + wordSpacing + textBuffer;
        }
        const right = this.guiWidth = offset;
        this.fadingTop.size = new GUISize(left - fadingExtrusion, 0, right + fadingExtrusion * 3, 1);
        this.fadingBottom.size = new GUISize(left - fadingExtrusion, -1, right + fadingExtrusion * 3, 0, 0, 100, 0, 100);
    }
}
