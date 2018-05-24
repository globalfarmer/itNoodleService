var express = require('express');
var router = express.Router();
var itnoodle = require('../project_modules/itnoodle.js');
var copy_value_by_fields = function(fields, src, dst) {
	fields.forEach((f) => {
		dst[f[1]] = src[f[0]];
	});
}
router.get('/', (req, res) => {
	console.log("call student api");
	let code = req.query.code;
	let term = req.query.term;
	let year = req.query.year;
	itnoodle
	.studentCol
	.findOne({code: code, year: year, term: term}).then((std) => {
		if(std) {
			let d = new Date(std.birthday.getTime() + 7*60*60*1000);
			std.birthday = [('0'+d.getDate()).slice(-2), ("0"+(d.getMonth()+1)).slice(-2), d.getFullYear()].join('-');
			delete std._id;
			let course_codes = Object.keys(std.slots);
			// console.log(course_codes);
			// TODO validate term, year
			if(!std.hasOwnProperty("finaltests"))
				std.finaltests = {};
			let _day, _room, _milliseconds, _tmp;
			course_codes.forEach((cc) => {
				_tmp = std.slots[cc].code.toUpperCase();
				if(_tmp.length>7)
					std.slots[cc].code = [_tmp.slice(0, 7), _tmp.slice(7)].join("-");
				else
					std.slots[cc].code = _tmp.slice(0, 7);
				if(std.finaltests.hasOwnProperty(cc)) {
					_day = std.finaltests[cc].time.split(":");
					_tmp = std.finaltests[cc].day;
					_milliseconds = _tmp.getTime() + ((parseInt(_day[0])*60)+parseInt(_day[1]))*60000 + 7*60*60000;
					_day = [std.finaltests[cc].time, [("0"+(_tmp.getDate()+1)).slice(-2), ("0"+(_tmp.getMonth()+1)).slice(-2), _tmp.getFullYear()].join("-")].join(" ");
					_room = [std.finaltests[cc].room, std.finaltests[cc].building].join(" - ");
					std.slots[cc].day = _day;
					std.slots[cc].time = _milliseconds;
					std.slots[cc].room = _room;
					std.slots[cc].type = std.finaltests[cc].type;
				}
				else
					std.slots[cc].time = 0;
			})
			course_codes.sort((a, b) => std.slots[a].time > std.slots[b].time);
			std.course_codes = course_codes;
			std.sbs = {};
			itnoodle
			.scoreboardCol
			.find({term: term, year: year, "course.code": {$in: course_codes}}).toArray((err, sbs) => {
				if(sbs)
					sbs.forEach((sb) => {
						// console.log("scoreboard");
						// console.log(sb.course);
						std.sbs[sb.course.code] = {};
						copy_value_by_fields(
							[["src", "public_link"], ["uploadtime", "uploadtime"]],
							sb.course,
							std.slots[sb.course.code]
						)
					})
				else
					console.log("--- NO SCOREBOARD----")
				res.json(std);
			});
		}
	});
})

module.exports = router;