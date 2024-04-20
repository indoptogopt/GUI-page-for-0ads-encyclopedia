/**
 * Initialize the page.
 *
 * @param {Object} data - Parameters passed from the code that calls this page into existence.
 */
function init (data) 
{
	var g_Encyclopedia = new EncyclopediaPage;
	if (data && data.article) {
		g_Encyclopedia.openArticle(data.article);
	} else {
		g_Encyclopedia.overviewPanel.open("about");
	}
}