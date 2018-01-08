// source: https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
function highlightTextNodes(node, term, color) {
	var all = [];
	for (node = node.firstChild; node; node = node.nextSibling) {
		if (node.nodeType == 3) {
			if (node.data.indexOf(term) !== -1) {
				node.parentNode.innerHTML = node.parentNode.innerHTML.replace(new RegExp(term, 'g'), "<span style='background: " + color + ";'>" + term + "</span>");
			}
			all.push(node);
		}
		else all = all.concat(highlightTextNodes(node, term, color));
	}
	return all;
}

highlightTextNodes(document.body, term, 'yellow');
for (var i = 0; i < synonyms.length; i++) {
	highlightTextNodes(document.body, synonyms[i], 'lightgreen');
}
