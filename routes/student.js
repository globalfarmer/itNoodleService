var express = require('express');
var router = express.Router();
var itnoodle = require('../project_modules/itnoodle.js');
var copy_value_by_fields = function(fields, src, dst) {
	fields.forEach((f) => {
		dst[f] = src[f];
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
							["public_link", "uploadtime"],
							sb.course,
							std.sbs[sb.course.code]
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