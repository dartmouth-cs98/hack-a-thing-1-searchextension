// source: https://developer.chrome.com/extensions/getstarted
function getCurrentTabUrl(callback) {
	var queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, (tabs) => {
		var tab = tabs[0];
		var url = tab.url;
		console.assert(typeof url == 'string', 'tab.url should be a string');
		callback(url);
	});
}

function highlightAppearances(term, synonyms) {
	var str = '["' + synonyms[0];
	for (var i = 1; i < synonyms.length; i++) {
		str += '", "' + synonyms[i];
	}
	str += '"];';
	chrome.tabs.executeScript({
		code: 'var term = "' + term + '"; var synonyms = ' + str
	}, function() {
		chrome.tabs.executeScript({file: 'highlight.js'});
	});
}

function getSavedSearchTerm(url, callback) {
	chrome.storage.sync.get(url, (items) => {
		callback(chrome.runtime.lastError ? null : items[url]);
	});
}

function saveSearchTerm(url, term) {
	var items = {};
	items[url] = term;
	chrome.storage.sync.set(items);
}

function httpGetRequest(url) {
	var req = new XMLHttpRequest();
	req.open("GET", url, false);
	req.setRequestHeader('app_id', 'xxxxxxxx');
	req.setRequestHeader('app_key', 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
	req.send(null);
	return req.responseText;
}

function parseSynonyms(res) {
	var arr = JSON.parse(res).results[0].lexicalEntries[0].entries[0].senses[0].subsenses[0].synonyms;
	var synonyms = [];
	for (var i = 0; i < arr.length; i++) {
		synonyms.push(arr[i].id);
	}
	return synonyms;
}

function generateSynonymHtml(synonyms) {
	var synonymsHtml = "<p style='margin-top: 10px; white-space: normal;'>Synonyms: " + synonyms[0];
	for (var i = 1; i < synonyms.length; i++) {
		synonymsHtml += ", " + synonyms[i];
	}
	synonymsHtml += "</p>";
	return synonymsHtml;
}

document.addEventListener('DOMContentLoaded', () => {
	getCurrentTabUrl((url) => {
		var searchTerm = document.getElementById('searchTerm');
		var submitButton = document.getElementById('submitButton');

		getSavedSearchTerm(url, (savedTerm) => {
			if (savedTerm) {
				searchTerm.value = savedTerm;
			}
		});

		submitButton.addEventListener('click', () => {
			var res = httpGetRequest('https://od-api.oxforddictionaries.com:443/api/v1/entries/en/' + searchTerm.value + '/synonyms');
			var synonyms = parseSynonyms(res);
			// var synonyms = ['group', 'members', 'customer', 'required', 'alliance', 'posse'];
			$("body").children("p").remove();
			$("body").append(generateSynonymHtml(synonyms));
			highlightAppearances(searchTerm.value, synonyms);
			saveSearchTerm(url, searchTerm.value);
		});
	});
});
