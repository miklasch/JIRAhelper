// JIRAhelper, version 0.4
// (C) 2015 Michael K. Schmidt

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
// select the target node
var target = document.querySelector('#jira');
 
// create an observer instance
var observer = new MutationObserver(function(mutations) {
	// DOM has been changed, check for existence of summary field
	var locbugFieldsExist = ((document.getElementById("customfield_12908") !== null) && (document.getElementById("customfield_12910") !== null) && (document.getElementById("customfield_12911") !== null));
	var itf = document.querySelector('input[id="issuetype-field"]');
	if ((itf !== null) || locbugFieldsExist){
		try {
			var it = itf.value; 
		} catch(e) {
			it = '';
		}
		if ((it == 'Loc Bug') || (it == 'Subtask - Loc') || locbugFieldsExist)  {
			var s = document.querySelector('input[id="summary"]');
			if (s !== null) {
			   // check if Prefill button is already present and add it if not
			   var b = document.querySelector('#my-fill-button');
				if (b === null) {
					b = document.createElement('a');
					b.setAttribute('href', "#");
					b.innerHTML = '<span>Fill</span>';
					b.className = 'button aui-button.aui-button-primary';
					//b.dataset.name = 'my-fill-button';
					b.id = 'my-fill-button';
					s.insertAdjacentElement('afterEnd',b);
					b.addEventListener('click', fillSummaryClickHandler, true);
				}  
			} 
		} else {
		    var b = document.querySelector('#my-fill-button');
			if (b !== null) {
				b.removeEventListener('click', fillSummaryClickHandler, true);
				b.parentNode.removeChild(b);
			}
		}
	}
});

function fillSummaryClickHandler(e) {
	// get project code
	var pr = document.getElementById("description").getAttribute("data-projectkey");
	
	// get bug class
	var e = document.getElementById("customfield_12909");
	var bc = e.options[e.selectedIndex].text;
	if (bc == 'None')
		bc = '(Class)';
	switch (bc) {
		case 'Text change (L10N)': bc = 'L10N';
				 break;
		case 'Gfc change (Artwork)': bc = 'ART';
				 break;
		case 'Code change (I18N)': bc = 'I18N';
	}

	// get language(s)
	var e = document.getElementById("customfield_12908");
	var la = '';
	for (var i = 0; i < e.options.length; i++) {
		if (e.options[i].selected) {
			var x = e.options[i].text.split(' - ')[0].split('-')[0];
			if (x != '') {
				if (la != '') 
					la += ', ';
				la += x;
			}
		}
	}
	if (la == '')
		la = '(Language)';
	
	// get bug type
	var e = document.getElementById("customfield_12910");
	var bt = e.options[e.selectedIndex].text;
	if (bt == 'None')
		bt = '(Type)';

	// get location
	var e = document.getElementById("customfield_12911");
	var lo = e.options[e.selectedIndex].text;
	if (lo == 'None')
		lo = '(Location)';
	
	// get any existing summary text and try to separate and preserve any short description
	var su = document.querySelector('input[id="summary"]').value.trim();
	if (su != '') {
		var words = su.split(' -');
		su = words[(words.length-1)].trim();
		if (su == '(Description)')
			su = '';
	}
	
	// get description but limit to first line or first 12 words
	var de = document.querySelector('textarea[id="description"]').value;
	if (de == '') {
		de = '(Description)';
	} else {
		de = de.trim().split('\n')[0];
		var words = de.split(' ');
		de = words[0];
		for (var i=1; (i<12) && (i<words.length); i++) {
			if (words[i] != '')
				de = de + ' ' + words[i];
		}
	}

	// stitch together the summary string
	document.querySelector('input[id="summary"]').value = '[' + pr + '] ' + bc + ' - ' + la + ' - ' + bt + ' - ' + lo + ' - ' + (su != '' ? su : de);
}
 
// configuration of the observer:
var config = { attributes: false, childList: true, characterData: true, subtree: true };
 
// pass in the target node, as well as the observer options
observer.observe(target, config);

