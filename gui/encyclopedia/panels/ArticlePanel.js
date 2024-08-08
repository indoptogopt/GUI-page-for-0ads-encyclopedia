// relative values storing the maximum size that larger images are clipped to
const maxRelativeImageWidth = 0.8;
const maxRelativeImageHeight = 0.45;

// smaller sizes would result in overlaps
const minTitleContainerWidth = 280;
const minTitleContainerHeight = 200;

// the image frame currently uses the NarrowOrnateFrame sprite which has a width of 5 pixels
const imageFrameWidth = 5;

// the distance between the imageFrame and the outerFrame (to the top and left)
const imageAreaMargin = 10;

// the following variables define a set of margins used to embed the text field into the panel
// ornamentMargin (obviously) applies to the ornament, textMargin to the text field, and textContainerMargin to both
const ornamentSideMargin = 2;
const textContainerMarginTop = 20;
const textContainerMarginBottom = 30;
const textMarginLeft = 40;
const textMarginRight = 20;

const iconPath = "session/portraits/";

class ArticlePanel
{
    constructor(page)
    {
        this.page = page;

        this.gui = Engine.GetGUIObjectByName("articlePanel");

        this.guiContent = Engine.GetGUIObjectByName("articlePanelContent");
        // this data is passed on the template viewer popup when opening it
        this.xmlTemplateData = {"templateName":"", "civ":""};
        this.templateViewerButtonArea = Engine.GetGUIObjectByName("templateViewerButtonArea");
        // Size values cannot be edited directly, they have to be copied to a new object, edited and then written back.
        // Since we only need to edit one value (in this case 'top'), we can create a copy of the size now,
        // so we later only need edit the single value before writing it back to the original object.
        this.templateViewerButtonAreaSize = this.templateViewerButtonArea.size;
        this.templateViewerButtonContainer = Engine.GetGUIObjectByName("templateViewerButtonContainer");
        this.templateViewerButton = Engine.GetGUIObjectByName("templateViewerButton");
        this.templateViewerButton.onPress = () => {Engine.PushGuiPage("page_viewer.xml", this.xmlTemplateData)};
        this.templateIcon = Engine.GetGUIObjectByName("templateIcon");

        // calculating the maximum (and minimum) image height and width
        const panelSize = this.guiContent.getComputedSize();
        this.panelHeight = panelSize.bottom  - panelSize.top;
        this.panelWidth = panelSize.right - panelSize.left;
        // the distance which is scaled by screen resolution (total distance minus fixed distances (borders, margins, frames))
        const scalingPanelWidth = this.panelWidth - imageAreaMargin - imageFrameWidth * 2 - minTitleContainerWidth;
        // larger images are clipped to these values to leave enough space for the heading elements on the right and the text content
        this.maxImageWidth = scalingPanelWidth * maxRelativeImageWidth;
        this.maxImageHeight = this.maxImageWidth / 2;

        // smaller images are clipped to this size to avoid overlapping of the heading elements on the right
        // there is no minimum value for the images' width
        this.minImageHeight = this.maxImageHeight * 2 / 3;

        const templateViewerButtonHeight = this.panelHeight * 0.0125 + 38;
        this.templateViewerButtonContainer.size = new GUISize(77, -templateViewerButtonHeight / 2, 77 + templateViewerButtonHeight, templateViewerButtonHeight / 2, 0, 50, 0, 50);

        // only used to to include the file names in warning and error messages
        this.lastFile = "";

        // an explanation for copying the size to a new object is given already for templateViewerButtonAreaSize
        this.articleContent = Engine.GetGUIObjectByName("articleContent");
        this.articleContentSize = this.articleContent.size;

        // the imageArea is anchored at the top right and contains the image itself as well as the imageFrame
        this.imageArea = Engine.GetGUIObjectByName("articleImageArea");
        this.imageArea.size =
            new GUISize
            (
                - (imageAreaMargin + this.maxImageWidth + imageFrameWidth*2),
                imageAreaMargin,
                -imageAreaMargin,
                imageAreaMargin + this.maxImageHeight + imageFrameWidth*2,
                100, 0, 100, 0
            );

        // the imageContainer is scaled to the maximum size an image can have (inside the imageFrame)
        this.imageContainer = Engine.GetGUIObjectByName("articleImageContainer");
        this.imageContainer.size = new GUISize(imageFrameWidth, imageFrameWidth, -imageFrameWidth, -imageFrameWidth, 0, 0, 100, 100);
        this.image = Engine.GetGUIObjectByName("articleImage");
        this.imageFrame = Engine.GetGUIObjectByName("articleImageFrame");

        this.central = {};
        this.central.heading = Engine.GetGUIObjectByName("articleHeadingCenter");
        this.central.soleTitle = Engine.GetGUIObjectByName("articleSoleTitleCenter");
        this.central.expandedHeading = Engine.GetGUIObjectByName("articleExpandedTitleCenter");
        this.central.expandedHeadingTitle = Engine.GetGUIObjectByName("articleTitleCenter");
        this.central.expandedHeadingSubitle = Engine.GetGUIObjectByName("articleSubtitleCenter");
        this.central.expandedHeadingSeparator = Engine.GetGUIObjectByName("articleTitleSeparatorCenter");

        this.left = {};
        this.left.heading = Engine.GetGUIObjectByName("articleHeadingLeft");
        this.left.soleTitle = Engine.GetGUIObjectByName("articleSoleTitleLeft");
        this.left.expandedHeading = Engine.GetGUIObjectByName("articleExpandedTitleLeft");
        this.left.expandedHeadingTitle = Engine.GetGUIObjectByName("articleTitleLeft");
        this.left.expandedHeadingSubitle = Engine.GetGUIObjectByName("articleSubtitleLeft");
        this.left.expandedHeadingSeparator = Engine.GetGUIObjectByName("articleTitleSeparatorLeft");

        // the titleContainer's main purpose is to limit the titles to the right (and avoid overlapping with the image)
        // an explanation for copying the size to a new object is given already for templateViewerButtonAreaSize
        this.left.titleContainer = Engine.GetGUIObjectByName("articleTitleContainerLeft");
        this.left.titleContainerSize = this.left.titleContainer.size =
            new GUISize(0, 0, 0, this.imageArea.size.bottom, 0, 0, 100, 0);

            this.textField = Engine.GetGUIObjectByName("articleText");
        this.textField.size = new GUISize(textMarginLeft, textContainerMarginTop, -textMarginRight, -textContainerMarginBottom, 0, 0, 100, 100);
        this.textOrnament = Engine.GetGUIObjectByName("articleOrnament");
        this.textOrnament.size = new GUISize(ornamentSideMargin, textContainerMarginTop, -ornamentSideMargin, -textContainerMarginBottom, 0, 0, 100, 100);
        this.nextArticleButtonLeft = Engine.GetGUIObjectByName("nextArticleButtonLeft");
        this.nextArticleButtonLeft.onPress = () => {this.open(this.fileData.nextFile)};
        this.nextArticleButtonRight = Engine.GetGUIObjectByName("nextArticleButtonRight");
        this.nextArticleButtonRight.onPress = () => {this.open(this.fileData.nextFile)};
        this.nextArtButParent = Engine.GetGUIObjectByName("nextArtButParent");
        this.previousArticleButton = Engine.GetGUIObjectByName("previousArticleButton");
        this.previousArticleButton.onPress = () => {this.open(this.fileData.previousFile)};
        this.fileData = {"hasNextFile":false, "nextFile":"", "hasPreviousFile":false, "previousFile":""};

    }

    open (file, dontUpdateNavigationHistory)
    {
        this.lastFile = file;
        this.page.switchPanel("article");

        const json =  Engine.ReadJSONFile(file);
        if (json.parent && !Engine.FileExists(this.page.pathToArticles + "parent_articles/" + json.parent))
            error("invalid parent " + json.parent + " in article " + file);

        const parent = json.parent? Engine.ReadJSONFile(this.page.pathToArticles + "parent_articles/" + json.parent) : {};

        const title = json.title || parent.title;
        const subtitle = json.subtitle || parent.subtitle;

        const xmlTemplate = json.xmlTemplate || parent.xmlTemplate || {};
        this.page.lastArticle = title;

        // the left heading is only used, if there's an image to show, and the central heading only, if not
        const image = json.image || parent.image;
        this.left.heading.hidden = !image;
        this.central.heading.hidden = !this.left.heading.hidden;
        this.fileData = this.page.selectionPanel.getFileData(file);
        if (this.left.heading.hidden)
        {
            this.writeTitle("central", title, subtitle);
            this.updateButtons("central", subtitle != null, xmlTemplate);
        }
        else
        {
            this.updateImage(image);
            this.writeTitle("left", title, subtitle);
            this.updateButtons("left", subtitle != null, xmlTemplate);
        }

        // the text contents container's 'top' border is aligned with the bottom of the heading
        this.articleContentSize.top =
            this.left.heading.hidden ?
                // we can extend it further towards the top, if there is not subtitle
                subtitle ?
                    130 : 100
            : this.left.titleContainer.size.bottom;
            this.articleContent.size = this.articleContentSize;

            // the empty lines are added for aesthetic reasons
            this.textField.caption = "\n" + (json.content || parent.content) + "\n ";

        if (!dontUpdateNavigationHistory) {
            this.page.updateNavigationHistory({"panel":"article", "category":this.page.lastCategory, "civ":this.page.lastCiv, "subcategory":this.page.lastSubcategory, "file":file});
        }
        this.page.pathPanel.update("article");
        this.page.relatedArticlesPanel.open(file);
    }

    updateButtons (centralOrLeft, hasSubtitle, xmlTemplate)
    {
        // the central heading's nextArticleButton is placed on the right
        this.nextArticleButtonRight.hidden = centralOrLeft != "central" || !this.fileData.hasNextFile;
        this.nextArticleButtonLeft.hidden = centralOrLeft != "left" || !this.fileData.hasNextFile;
        this.previousArticleButton.hidden = !this.fileData.hasPreviousFile;

        // some articles have not automatically been assigned an icon, so we disabled the templateViewerButton for those as well (the button aesthestically needs an icon)
        this.templateViewerButtonContainer.hidden = Object.keys(xmlTemplate).length == 0 || centralOrLeft == "central" || !xmlTemplate.icon;
        if (!this.templateViewerButtonContainer.hidden)
        {
            const titleContainerName = hasSubtitle ? "expandedHeading" : "soleTitle";
            this.templateViewerButtonAreaSize.top = this.left[titleContainerName].size.bottom;
            this.templateViewerButtonAreaSize.rtop = this.left[titleContainerName].size.rbottom;
            this.templateViewerButtonArea.size = this.templateViewerButtonAreaSize;
            this.xmlTemplateData = xmlTemplate.data;
            this.templateIcon.sprite = "stretched:" + iconPath + xmlTemplate.icon;
        }
    }

    writeTitle(centralOrLeft, title, subtitle)
    {
        // centralOrLeft is used to dynamically handle whatever heading is enabled (not hidden)
        const useExpandedHeading = subtitle != null;
        this[centralOrLeft].expandedHeading.hidden = !useExpandedHeading;
        this[centralOrLeft].soleTitle.hidden = useExpandedHeading;

        if (useExpandedHeading)
        {
            this[centralOrLeft].expandedHeadingTitle.caption = title;
            this[centralOrLeft].expandedHeadingSubitle.caption = subtitle;

            const titleWidth = Engine.GetTextWidth(this[centralOrLeft].expandedHeadingTitle.font, this[centralOrLeft].expandedHeadingTitle.caption);
            const subtitleWidth = Engine.GetTextWidth(this[centralOrLeft].expandedHeadingSubitle.font, this[centralOrLeft].expandedHeadingSubitle.caption);

            // the separator is scaled to the mean of the title's and subtitle's widths
            const separatorWidth = (titleWidth + subtitleWidth) / 2;
            switch (centralOrLeft)
            {
                // texts of the central titled and subtitle are anchored to the center
                // the separator does, too, and is therefore scaled to the right and left
                case "central":
                    this[centralOrLeft].expandedHeadingSeparator.size = new GUISize(-(separatorWidth / 2), 40, separatorWidth / 2, 41, 50, 0, 50, 0);
                    break;

                // texts of the left title and subtitle are anchored to the left
                // the separator does, too, and is therefore scaled only scaled to the right
                case "left":
                // the subtitle can sometimes continue in the next line which is not taken account for when calculating subtitleWidth
                // we therefore need a safeguard to prevent the separator from extending into the image
                    const finalSeparatorWidth = Math.min(this.panelWidth + this.left.titleContainer.size.right - 80, separatorWidth);
                    this[centralOrLeft].expandedHeadingSeparator.size = new GUISize(5, 0, finalSeparatorWidth, 1, 0, 44, 0, 44);
                    break;
            }
        }
        else
        {
            this[centralOrLeft].soleTitle.caption = title;
        }
    }

    updateImage(image)
    {
        /* The engine can only read image files with width and height of powers of two, which drastically limits the number of aspect ratios.
         * To circumvent this, images (of any aspect ratio) are extended (by adding transparent pixels) outwards to width and height of the next larger power of two.
         * the 'cropped' property stores the original image's resolution and 'full' stores the final resolution after extending it.
         * the latter is used to to calculate the actual size of the image while the former is used to align it (to the top right) and determine around what area to place the border.
         */
        this.image.sprite = "stretched:encyclopedia/images/" + image.file;
        const fullImageHeight = image.resolution.full.height;
        const fullImageWidth = image.resolution.full.width;
        const croppedImageHeight =  image.resolution.cropped && image.resolution.cropped.height ? image.resolution.cropped.height : fullImageHeight;
        const croppedImageWidth = image.resolution.cropped && image.resolution.cropped.width ? image.resolution.cropped.width : fullImageWidth;

        if (croppedImageHeight > fullImageHeight)
        {
            warn ("The cropped height of a heading image musn't be larger than its full height, but found " + croppedImageHeight + "px vs " + fullImageHeight + "px in " + this.lastFile);
            croppedImageHeight = fullImageHeight;
        }

        if (croppedImageWidth > fullImageWidth)
        {
            warn ("The cropped width of a heading image musn't be larger than its full width, but found " + croppedImageWidth + "px vs " + fullImageWidth + "px in " + this.lastFile);
            croppedImageWidth = fullImageWidth;
        }

        if (croppedImageWidth / croppedImageHeight > this.maxImageWidth / this.minImageHeight)
            throw error("too large aspect ratio of heading image in " + this.lastFile + " (maximum is " + Math.round(this.maxImageWidth) + "x" + Math.round(this.minImageHeight) + ", but found " + croppedImageWidth + "x" + croppedImageHeight + ")");

        // images are ever only scaled down to avoid the pixelated look, except when it falls below the minimum height
        const heightQuotient = croppedImageHeight > this.maxImageHeight ? Math.max(this.maxImageHeight, minTitleContainerHeight - imageAreaMargin - imageFrameWidth * 2) / croppedImageHeight : 1;
        const widthQuotient = croppedImageWidth > this.maxImageWidth ? this.maxImageWidth / croppedImageWidth : 1;
        const multiplier =
            croppedImageHeight < this.minImageHeight ?
                this.minImageHeight / croppedImageHeight :
                Math.min(heightQuotient, widthQuotient);

        const calculatedFullImageWidth = fullImageWidth * multiplier;
        const calculatedFullImageHeight = fullImageHeight * multiplier;
        let calculatedCroppedImageWidth = croppedImageWidth * multiplier;
        let calculatedCroppedImageHeight = croppedImageHeight * multiplier;

        this.imageFrame.size = new GUISize(- (calculatedCroppedImageWidth + imageFrameWidth*2), 0, 0, calculatedCroppedImageHeight + imageFrameWidth*2, 100, 0, 100, 0);
        const widthDiff = calculatedFullImageWidth - calculatedCroppedImageWidth;
        const heightDiff = calculatedFullImageHeight - calculatedCroppedImageHeight;
        // half the difference is added to all sides to center the image on the frame (the "cropping" is done equally on all sides, "towards" the center)
        this.image.size = new GUISize(-calculatedCroppedImageWidth - widthDiff / 2, - heightDiff / 2, widthDiff / 2, calculatedCroppedImageHeight + heightDiff / 2, 100, 0, 100, 0);

        // scaling the titleContainer to fill the free space to the left of the image
        this.left.titleContainerSize.right = this.imageFrame.size.left - imageAreaMargin;
        this.left.titleContainerSize.bottom = Math.max(imageAreaMargin + imageFrameWidth + this.imageFrame.size.bottom, minTitleContainerHeight);
        this.left.titleContainer.size = this.left.titleContainerSize;
    }
}
