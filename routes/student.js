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
	let student = {};
	itnoodle
	.studentCol
	.findOne({code: code, year: year, term: term}).then((std) => {
		if(std) {
			copy_value_by_fields(
				["code", "fullname", "birthday", "klass", "year", "term"],
				std,
				student
			);
			student.courses = std.slots;
			Object.keys(std.slots).forEach((c_code) => {
				let src = {};
				if(std.finaltests) {
					if(std.finaltests[c_code])
						src = std.finaltests[c_code];
					copy_value_by_fields(
						["seat_no", "day", "time", "shift", "room", "building", "type"],
						src,
						student.courses[c_code]
					)
				}
			});
			let course_codes = Object.keys(std.slots);
			// console.log(course_codes);
			itnoodle
			.scoreboardCol
			.find({term: term, year: year, "course.code": {$in: course_codes}}).toArray((err, sbs) => {
				if(sbs)
					sbs.forEach((sb) => {
						// console.log("scoreboard");
						// console.log(sb.course);
						copy_value_by_fields(
							["public_link", "uploadtime"],
							sb.course,
							student.courses[sb.course.code]
						)
					})
				else
					console.log("--- NO SCOREBOARD----")
				res.json(student);
			});
		}
	});
})

module.exports = router;