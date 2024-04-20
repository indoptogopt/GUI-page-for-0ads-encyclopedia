class EncyclopediaButton 
{
    constructor (parentPage)
    {
        this.parentPage = parentPage;
        this.encyclopediaButton = Engine.GetGUIObjectByName("encyclopediaButton");
        this.encyclopediaButton.caption = this.Caption;
        this.encyclopediaButton.onPress =  this.onPress.bind(this);
        this.data = {};
    }

    update ()
    {
        this.encyclopediaButton.hidden = !this.parentPage.encyclopediaArticle;
        this.data = {"article": this.parentPage.encyclopediaArticle};
    }

    onPress ()
    {
        Engine.SwitchGuiPage("page_encyclopedia.xml", this.data);
    }
}

EncyclopediaButton.prototype.Caption = "open encyclopedia article";