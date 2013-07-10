"use strict";

function messageArray() {
	var messages = [];
	
	function find (time, start, end) {
		var pos;
		
		if (typeof start === 'undefined') {
			return find(time, 0, messages.length);
		}
		
		if (start >= end) return start;
		pos = ((start + end)/2) | 0;
		
		if (messages[pos] && messages[pos].time < time) {
			return find(time, pos+1, end);
		} else if (messages[pos-1] && messages[pos-1].time >= time) {
			return find(time, start, pos-1);
		} else {
			return pos;
		}
	}
	
	function merge (data) {
		if (!data.length) return;		
		var startTime = data[0].time, endTime = data[data.length-1].time,
			start = find(startTime),
			end = find(endTime);
		
		while (messages[start-1] && messages[start-1].time == startTime) {
			start--;
		}
		
		while (messages[end] && messages[end].time == endTime) {
			end++;
		}
		
		if (messages[start-1] && messages[start-1].type != 'result-end' && data[0].type == 'result-start') {
			data.shift();
		}
		
		if (messages[end] && messages[end].type != 'result-start' && data[data.length-1].type == 'result-end') {
			data.pop();
		}
		
		[].splice.apply(messages, [start, end - start].concat(data));
	}
	
	function extract(time, before, after, missing) {
		var res = [], mid, i, l, m, start = null;
		
		mid = find(time);
		i = Math.max(0, mid-before);
		l = Math.min(messages.length, mid+after+1);
		
		for (; i<l; i++) {
			m = messages[i];
			switch (m.type) {
				case 'result-start':
					if (missing) {
						res.push(missing(start, m.time));
					}
					break;
				case 'result-end':
					start = m.time;
					break;
				case 'text':
					res.push(m);
			}
		}
		if (m && m.type == 'result-end' && missing) {
			res.push(missing(m.time, null));
		}
		
		return res;
	}
	
	messages.merge = merge;
	messages.find = find;
	messages.extract = extract;
	
	return messages;
}

//// --- for testing in node.
//if (module && module.exports) {
//	module.exports = messageArray;
//}
//
