var tripwire = new function() {
    this.timer, this.xhr;
	this.version = version;
	this.client = {signatures: {}, wormholes: {}};
	this.server = {signatures: {}, wormholes: {}};
	this.signatures = {list: {}, undo: JSON.parse(sessionStorage.getItem("tripwire_undo")) || {}, redo: JSON.parse(sessionStorage.getItem("tripwire_redo")) || {}};
	this.serverSignatureCount = 0;
	this.activity = {};
	this.data = {tracking: {}, esi: {}};
	this.refreshRate = 5000;
	this.connected = true;
	this.ageFormat = "HM";
	this.instance = window.name ? window.name : (new Date().getTime() / 1000, window.name = new Date().getTime() / 1000);

	// Reference to `this` that can be used inside of functions
	var _this = this

    // Command to start/stop tripwire updates
	// ToDo: Include API and Server timers
	this.stop = function() {
		clearTimeout(this.timer);
		return this.timer;
	};

	this.start = function() {
		return this.sync();
	}

    // Command to change Age format
	// ToDo: Cookie change to keep
	this.setAgeFormat = function(format) {
		var format = typeof(format) !== 'undefined' ? format : this.ageFormat;

		$("span[data-age]").each(function() {
			$(this).countdown("option", {format: format});
		});

		return true;
	}

    this.serverTime = function() {
		this.time;

		this.serverTime.getTime = function() {
			return tripwire.serverTime.time;
		}
	}
    this.serverTime();

    // Handles putting chain together
	this.chainMap = function() {
		this.chainMap.parse = function(data) {
			chain.draw(data);
		}
	}
    this.chainMap();

    this.pastEOL = function() {
		var options = {since: $(this).countdown('option', 'until'), format: "HM", layout: "-{hnn}{sep}{mnn}&nbsp;"};
		$(this).countdown("option", options);
	}

    // Handles WH Type hover-over tooltip
	// ToDo: Use native JS
	this.whTooltip = function(sig) {
		if (viewingSystemID == sig.systemID) {
			if ($.inArray(sig.type, $.map(tripwire.wormholes, function(item, index) { return index;})) >= 0) {
				var type = sig.type;
				var tooltip = '';
			} else {
				var type = sig.sig2Type;
				var tooltip = "<b>Type:</b> "+(type || 'Unknown')+"<br/>";
			}
		} else {
			if ($.inArray(sig.sig2Type, $.map(tripwire.wormholes, function(item, index) { return index;})) >= 0) {
				var type = sig.sig2Type;
				var tooltip = '';
			} else {
				var type = sig.type;
				var tooltip = "<b>Type:</b> "+(type || 'Unknown')+"<br/>";
			}
		}

		if ($.inArray(type, $.map(tripwire.wormholes, function(item, index) { return index;})) >= 0) {
			var whType = true;
		} else {
			var whType = false;
		}


		if (whType) {
			tooltip += "<b>Life:</b> "+(tripwire.wormholes[type].life)+"<br/>";
			switch (tripwire.wormholes[type].leadsTo.split(" ")[0]) {
				case 'High-Sec':
					tooltip += "<b>Leads To:</b> <span class='hisec'>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
					break;
				case 'Low-Sec':
					tooltip += "<b>Leads To:</b> <span class='lowsec'>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
					break;
				case 'Null-Sec':
					tooltip += "<b>Leads To:</b> <span class='nullsec'>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
					break;
				case 'Class':
					tooltip += "<b>Leads To:</b> <span class='wh'>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
					break;
				default:
					tooltip += "<b>Leads To:</b> <span>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
			}

			tooltip += "<b>Max Mass</b>: "+(Intl.NumberFormat().format(tripwire.wormholes[type].mass))+" Kg<br/>";

			tooltip += "<b>Max Jumpable</b>: "+(Intl.NumberFormat().format(tripwire.wormholes[type].jump))+" Kg<br/>";
		}

		return tooltip;
	}

	// Handles Age hover-over tooltip
	// ToDo: Use native JS
	this.ageTooltip = function(sig) {
		// var date = new Date(sig.lifeTime);
		// var localOffset = date.getTimezoneOffset() * 60000;
		// date = new Date(date.getTime() + localOffset);
        var date = new Date(sig.lifeTime);

		var tooltip = "<table class=\"age-tooltip-table\"><tr>"
        + "<th>Created:</th><td>"+(date.getMonth()+1)+"/"+date.getDate()+" "+(date.getHours() < 10?'0':'')+date.getHours()+":"+(date.getMinutes() < 10?'0':'')+date.getMinutes()+"</td>"
        + "<td>"+sig.createdByName.replace(/'/g, '&#39;').replace(/"/g, '&#34;')+"</td>"
        + "</tr>";

		if (sig.lifeTime != sig.modifiedTime) {
			date = new Date(sig.modifiedTime);
			// localOffset = date.getTimezoneOffset() * 60000;
			// date = new Date(date.getTime() + localOffset);
      
			tooltip += "<tr><th>Last Modified:</th><td>"+(date.getMonth()+1)+"/"+date.getDate()+" "+(date.getHours() < 10?'0':'')+date.getHours()+":"+(date.getMinutes() < 10?'0':'')+date.getMinutes()+"</td>"
          + "<td>"+sig.modifiedByName.replace(/'/g, '&#39;').replace(/"/g, '&#34;')+"</td>"
          + "</tr>";
		}

		tooltip += "</table>";

		return tooltip;
	}

    this.refresh = function(mode, data, successCallback, alwaysCallback) {
		var mode = mode || 'refresh';

		this.sync(mode, data, successCallback, alwaysCallback);
	}

	// getSystemIDsByNames performs a case-insensitive search of the internal
	// list of systems looking for matches on each system name in the given
	// comma-separated list of names. A comma-separated list of system IDs is
	// returned if all systems are found, otherwise the empty string is returned.
	this.getSystemIDsByNames = function(systemNames) {
		if (!_this.systems) {
			return "";
		}
		const values = systemNames.split(",");
		const systems = [];
		for(var i = 0; i < values.length; i++) {
			for (systemID in _this.systems) {
				const system = _this.systems[systemID];
				if (system.name.toLowerCase() == values[i].toLowerCase()) {
					systems.push(systemID);
					break;
				}
			}
		}
		if (values.length != systems.length) {
			return "";
		}
		return systems.join(",");
	}
}
