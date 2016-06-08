// JIRAhelper, version 2.3
// (C) 2015 Michael K. Schmidt

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
// select the target node
var target = document.querySelector('#jira');
 
// create an observer instance
var observer = new MutationObserver(function(mutations) {
	// DOM has been changed, check for existence of summary field
	var locbugFieldsExist = (((document.getElementById("customfield_12908") !== null) && (document.getElementById("customfield_12910") !== null) && (document.getElementById("customfield_12911") !== null)) || ((document.getElementById("customfield_11401") !== null) && (document.getElementById("customfield_11404") !== null) && (document.getElementById("customfield_11405") !== null)) || ((document.getElementById("customfield_10100") !== null) && (document.getElementById("customfield_10103") !== null) && (document.getElementById("customfield_10104") !== null)));
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
	// differentiate between Aeria, MunkyFun JIRA and GREE JIRA instances (hack!)
	var gree = document.getElementById("customfield_11401");
	var mfun = document.getElementById("customfield_10100");
	var aeria = document.getElementById("customfield_12908");
	var ji = 0;		//cannot uniquely identify jira instance
	if ((gree !== null) && (mfun === null) && (aeria === null)) {
		ji = 1;		// GREE JIRA instance
	} else {
		if ((mfun !== null) && (gree === null) && (aeria === null)) {
			ji = 2;		// MunkyFun JIRA instance
		} else {
			if ((aeria !== null) && (gree === null) && (mfun === null)) {
				ji = 3;		// Aeria JIRA instance
			}
		}
	}

	// get project code
	var pr = document.getElementById("description").getAttribute("data-projectkey");
	
	// get bug category
	var bc = '';
	if (ji > 0) {
		switch (ji) {
			case 1:		// GREE JIRA instance
					e = document.getElementById("customfield_11403");
					break;
			case 2:		// MunkyFun JIRA instance
					e = document.getElementById("customfield_10102");
					break;
			case 3:		// Aeria JIRA instance
					e = document.getElementById("customfield_12909");
		}
		var bc = e.options[e.selectedIndex].text.toUpperCase();
		if (bc == 'NONE') {
			switch (ji) {
				case 1:	// GREE JIRA instance
				case 2:	// MunkyFun JIRA instance
						bc = 'category';
						break;
				case 3:	// Aeria JIRA instance
						bc = '(Class)';
			}
		}
		switch (bc) {
			case 'TEXT CHANGE (L10N)':
					bc = 'L10N'; 
					break;
			// Aeria
			case 'GFX CHANGE (ARTWORK)':
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
			case 1:		// GREE JIRA instance
					e = document.getElementById("customfield_11401");
					break;
			case 2:		// MunkyFun JIRA instance
					e = document.getElementById("customfield_10100");
					break;
			case 3:		// Aeria JIRA instance
					e = document.getElementById("customfield_12908");
		}
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
		if (la == '') {
			switch (ji) {
				case 1:	// GREE JIRA instance
				case 2:	// MunkyFun JIRA instance
						la = 'language';
						break;
				case 3:	// Aeria JIRA instance
						la = '(Language)';
			}
		}
	}
	// get bug type
	var bt = '';
	if (ji > 0) {
		switch (ji) {
			case 1:		// GREE JIRA instance
					e = document.getElementById("customfield_11404");
					break;
			case 2:		// MunkyFun JIRA instance
					e = document.getElementById("customfield_10103");
					break;
			case 3:		// Aeria JIRA instance
					e = document.getElementById("customfield_12910");
		}
		var bt = e.options[e.selectedIndex].text;
		if (bt == 'None') {
			switch (ji) {
				case 1:	// GREE JIRA instance
				case 2:	// MunkyFun JIRA instance
						bt = 'type';
						break;
				case 3:	// Aeria JIRA instance
						bt = '(Type)';
			}
		}
	}

	// get location
	var lo = '';
	if (ji > 0) {
		switch (ji) {
			case 1:		// GREE JIRA instance
					e = document.getElementById("customfield_11405");
					break;
			case 2:		// MunkyFun JIRA instance
					e = document.getElementById("customfield_10104");
					break;
			case 3:		// Aeria JIRA instance
					e = document.getElementById("customfield_12911");
		}
		var lo = e.options[e.selectedIndex].text;
		if (lo == 'None') {
			switch (ji) {
				case 1:	// GREE JIRA instance
				case 2:	// MunkyFun JIRA instance
						lo = 'location';
						break;
				case 3:	// Aeria JIRA instance
						lo = '(Location)';
			}
		}
	}

	// get platform
	var pl = '';
	if (ji > 0) {
		switch (ji) {
			case 1:		// GREE JIRA instance
					e = document.getElementById("customfield_11504");
					break;
			case 2:		// MunkyFun JIRA instance
					e = document.getElementById("customfield_10000");
					break;
			case 3:		// Aeria JIRA instance
					e = document.getElementById("customfield_12907");
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
				case 1:	// GREE JIRA instance
				case 2:	// MunkyFun JIRA instance
						pl = 'platform';
						break;
				case 3:	// Aeria JIRA instance
						pl = '(Platform)';
			}
		} else {
			if (pl.toUpperCase().indexOf('IOS') >= 0) {
				pl = 'iOS';
			} else {
				if (pl.toUpperCase().indexOf('ANDROID') >= 0) {
					pl = 'Android';
				} else {
					if (pl.toUpperCase().indexOf('ALL') >= 0) {
						pl = 'iOS+And';
					}
				}
			}
		}
	}

	// get any existing summary text and try to separate and preserve any short description
	var su = document.querySelector('input[id="summary"]').value.trim();
	if (su != '') {
		su = su.replace(/([–—])/g, '-');
		var words = su.split((((ji > 0) && (ji < 3)) ? '] ' : ' -'));
		su = words[(words.length-1)].trim();
		if (su == '(Description)')
			su = '';
	}

	// get description but limit to first line or first 12 words
	var de = document.querySelector('textarea[id="description"]').value;
	if (de == '') {
		switch (ji) {
			case 1:	// GREE JIRA instance
			case 2:	// MunkyFun JIRA instance
					de = 'description';
					break;
			case 3:	// Aeria JIRA instance
					de = '(Description)';
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
			case 1:		// GREE JIRA instance
					prefill = '[' + pl + '][' + la + '][' + bc + '][' + bt + '][' + lo + '] ' +  (su != '' ? su : de);
					break;
			case 2:		// MunkyFun JIRA instance
					prefill = '[' + (la.indexOf('FR, IT, DE, ES, RU, TR') >= 0 ? 'GLOBAL' : la) + '] ' +  (su != '' ? su : de);
					break;
			case 3:		// Aeria JIRA instance
					prefill = '[' + pr + '] ' + bc + ' - ' + la + ' - ' + bt + ' - ' +  (su != '' ? su : de);
		}
		document.querySelector('input[id="summary"]').value = prefill;
	}
}
 
// configuration of the observer
var config = { attributes: false, childList: true, characterData: true, subtree: true };
 
// pass in the target node, as well as the observer options
observer.observe(target, config);
