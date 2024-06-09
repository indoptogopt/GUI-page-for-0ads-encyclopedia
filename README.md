  

# GUI page for 0ad's coming encyclopedia by Vantha/indoptogopt

## Customizing the articles:
The articles are stored in JSON files inside a directory structure (equal to the categorization structure on the GUI page). The categories' introductory overview texts are saved in the overview.json in the respective directory and are treated the same as all other articles. 
 
 
**Editing the JSON files**
 - the **`content`** property (obviously) contains the text contents  
 - the **`title`** property (obviously) contains the title shown above the text.  
 - the **`relatedArticles`** property specifies the articles linked to in the right page section. It has to be written as a list (enclosed in square brackets and seperated by commas) of strings storing the path to the target articles' json from the `articles/` folder onwards. (meaning it has to start with "About/", "Nature and Environment/", "The Ancients World/", "0 A.D.'s civilizations/", or "Wars and Battles/")  
 - the **`parent`** property can specify a json file, from which all missing properties are inherited - essentially like template parents or mixins. The value has to be a string containing the target file's name (not the path to the file; only files inside `gui/encyclopedia/articles/parents/` can be set as parents)  
 - ~~the `image` property points to an image (via its path) that will get displayed to the left of the article's title~~ — code for this feature is currently commented out because I couldn't find a good place on he page to put the image)  
  
**Formatting**  
Tags can be added into the plain text to change how it is rendered like explained on the wiki [here](https://trac.wildfiregames.com/wiki/GUI_-_Text_Renderer).  
In the case of JSON files the quotation marks need to be escaped with a backslash.  
Considering the default text size of articles is 18 pixels, a text passage can be set to bold with `font=\"sans-bold-18\"` and to italic with `font=\"sans-italic-18\"`. Also, beware that the overview texts are of size 20 (not 18).  
The best way to embed images into the text is by using the icon tag in between two line breaks: `text above the image\n [icon=\"____\"]\ntext below the image` (this places in between two lines of texts and works regardless of the image's size). Using 'displace' is a good way to move the image more towards the center. Beware that too high values can lead to the icon being cut off on smaller screen resolutions.  
Also, the icon has to be defined in `gui/encyclopedia/setup.js` like shown [here](https://trac.wildfiregames.com/wiki/GUI_-_Text_Renderer). The `size` of the icon should never be higher than the resolution of the image file. (By the way, the engine requires images to be PNGs and their height and width in pixels to be a power of two).

