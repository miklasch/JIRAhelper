// JIRAhelper, version 3.8
// (C) 2015-2017 Michael K. Schmidt

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
// select the target node
var target = document.querySelector('#jira');
 
// create an observer instance
var observer = new MutationObserver(function(mutations) {
	// DOM has been changed, check for existence of summary field
	var locbugFieldsExist = (((document.getElementById("customfield_10602") !== null) && (document.getElementById("customfield_10606") !== null) && (document.getElementById("customfield_10607") !== null)) || ((document.getElementById("customfield_11401") !== null) && (document.getElementById("customfield_11404") !== null) && (document.getElementById("customfield_11405") !== null)));
	var itf = document.querySelector('input[id="issuetype-field"]');
	if ((itf !== null) || locbugFieldsExist){
		try {
			var it = itf.value; 
		} catch(e) {
			it = '';
		}
		if ((it == 'Localization Bug') || (it == 'LQA-Bug') || (it == 'Bug - LQA') || (it == 'Loc Bug') || (it == 'Subtask - Loc') || locbugFieldsExist)  {
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
			// remove Prefill button for any other issue type
		    var b = document.querySelector('#my-fill-button');
			if (b !== null) {
				b.removeEventListener('click', fillSummaryClickHandler, true);
				b.parentNode.removeChild(b);
			}
		}
	}
});

function fillSummaryClickHandler(e) {
	// differentiate between GIE and GREE Melbourne Jira instances (hack!)
	var gree = document.getElementById("customfield_11401");
	var gmbn = document.getElementById("customfield_10602");
	var ji = 0;		//cannot uniquely identify Jira instance
	if ((gree !== null) && (gmbn === null)) {
		ji = 1;		// GIE Jira instance
	} else {
		if ((gmbn !== null) && (gree === null)) {
			ji = 2;		// GREE Melbourne Jira instance
		}
	}

	// get project code
	var pr = document.getElementById("description").getAttribute("data-projectkey");
	
	// get bug category
	var bc = '';
	if (ji > 0) {
		switch (ji) {
			case 1:		// GIE Jira instance
					e = document.getElementById("customfield_11403");
					break;
			case 2:		// GREE Melbourne Jira instance
					e = document.getElementById("customfield_10605");
		}
		var bc = e.options[e.selectedIndex].text.toUpperCase();
		if (bc == 'NONE') {
			switch (ji) {
				case 1:	// GIE Jira instance
				case 2:	// GREE Melbourne Jira instance
						bc = 'category';
			}
		}
		switch (bc) {
			case 'TEXT CHANGE (L10N)':
					bc = 'L10N'; 
					break;
			// GREE
			case 'ARTWORK CHANGE (ART)':
					bc = 'ART';
					break;
			case 'CODE CHANGE (I18N)':
					bc = 'I18N';
		}
	}

	// get language(s)
	var la = '';
	if (ji > 0) {
		switch (ji) {
			case 1:		// GIE Jira instance
					e = document.getElementById("customfield_11401");
					break;
			case 2:		// GREE Melbourne Jira instance
					e = document.getElementById("customfield_10602");
		}
		for (var i = 0; i < e.options.length; i++) {
			if (e.options[i].selected) {
				//var x = e.options[i].text.split(' - ')[0];
				var y = e.options[i].text.split(' - ')[0].split('-');
				if (y.length > 1) {
					var x = y[1];
				} else {
					var x = y[0];
				}
				if (x != '') {
					if (la != '') 
						la += ', ';
					la += x;
				}
			}
		}
		if (la == '') {
			switch (ji) {
				case 1:	// GIE Jira instance
				case 2:	// GREE Melbourne Jira instance
						la = 'language';
			}
		}
	}
	// get bug type
	var bt = '';
	if (ji > 0) {
		switch (ji) {
			case 1:		// GIE Jira instance
					e = document.getElementById("customfield_11404");
					break;
			case 2:		// GREE Melbourne Jira instance
					e = document.getElementById("customfield_10607");
		}
		var bt = e.options[e.selectedIndex].text;
		if (bt == 'None') {
			switch (ji) {
				case 1:	// GIE Jira instance
				case 2:	// GREE Melbourne Jira instance
						bt = 'type';
			}
		}
	}

	// get location
	var lo = '';
	if (ji > 0) {
		switch (ji) {
			case 1:		// GIE Jira instance
					e = document.getElementById("customfield_11405");
					break;
			case 2:		// GREE Melbourne Jira instance
					e = document.getElementById("customfield_10606");
		}
		var lo = e.options[e.selectedIndex].text;
		if (lo == 'None') {
			switch (ji) {
				case 1:	// GIE Jira instance
				case 2:	// GREE Melbourne Jira instance
						lo = 'location';
			}
		}
	}

	// get platform
	var gpr = 0; // GIE Jira project is undefined
	var pl = '';
	if (ji > 0) {
		switch (ji) {
			case 1:	// GIE Jira instance
					e = document.getElementById("customfield_11504"); // DS
					if (e == null) {
						e = document.getElementById("customfield_11304"); //KND; engineering owner ID is "customfield_10800"
						if (e != null)
							gpr = 2; // GREE Jira project is KND
					} else
						gpr = 1; // GREE Jira project is DS
					break;
			case 2:	// GREE Melbourne Jira instance
					e = document.getElementById("customfield_10608");
		}
		if (e !== null) {
			try {
				var pl = e.options[e.selectedIndex].text; 
			} catch(err) {
				for (var i = 0; i < e.options.length; i++) {
					if (e.options[i].selected) {
						var x = e.options[i].text;
						if (x != '') {
							if (pl != '') 
								pl += ', ';
							pl += x;
						}
					}
				}
			}
		}
		if ((pl == 'None') || (pl == '')) {
			switch (ji) {
				case 1:	// GIE Jira instance
				case 2:	// GREE Melbourne Jira instance
						pl = 'platform';
			}
		} else {
			if (pl.toUpperCase().indexOf('IOS') >= 0) {
				pl = 'iOS';
			} else {
				if (pl.toUpperCase().indexOf('ANDROID') >= 0) {
					pl = 'Android';
				} else {
					if (pl.toUpperCase().indexOf('ALL') >= 0) {
						pl = 'iOS+Android';
					}
				}
			}
		}
	}

	// get any existing summary text and try to separate and preserve any short description
	var su = document.querySelector('input[id="summary"]').value.trim();
	if (su != '') {
		su = su.replace(/([–—])/g, '-');
		var words = su.split((((ji > 0) && (ji < 3) && gpr != 2)? '] ' : ' -'));
		su = words[(words.length-1)].trim();
		if (su == '(Description)')
			su = '';
	}

	// get description but limit to first line or first 12 words
	var de = document.querySelector('textarea[id="description"]').value;
	if (de == '') {
		switch (ji) {
			case 1:	// GIE Jira instance
			case 2:	// GREE Melbourne Jira instance
					de = 'description';
		}
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
	if (ji > 0) {
		var prefill = '';
		switch (ji) {
			case 1:	// GIE Jira instance
					switch (gpr) {
						case 1:	// DS
								prefill = '[' + (la.indexOf('FR, IT, DE, ES, RU, TR, BR, NL, DA, SV, NB, JA, KO, CN, TW, ID') >= 0 ? 'GLOBAL' : la) + '][' + bt + '][' + lo + '] ' +  (su != '' ? su : de);
								break;
						case 2:	// KND
								prefill = '[' + (la.indexOf('FR, IT, DE, ES, RU, TR') >= 0 ? 'GLOBAL' : la) + ']' + ' - ' + pl + ' - ' + bt + ' - ' +  (su != '' ? su : de);
								break;
						default:	// undetermined
								prefill = (su != '' ? su : de);
					}
					break;
			case 2:	// GREE Melbourne Jira instance
					prefill = '[' + (la.indexOf('FR, IT, DE, ES, RU, TR, BR, NL, JA, KO, CN, TW, ID') >= 0 ? 'GLOBAL' : la) + '][' + bt + '] ' +  (su != '' ? su : de);
		}
		document.querySelector('input[id="summary"]').value = prefill;
	}
}
 
// configuration of the observer
var config = { attributes: false, childList: true, characterData: true, subtree: true };
 
// pass in the target node, as well as the observer options
observer.observe(target, config);
