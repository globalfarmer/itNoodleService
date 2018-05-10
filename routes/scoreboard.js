var express = require('express');
var router = express.Router();
var itnoodle = require('../project_modules/itnoodle.js');
var pageSize = 8;
router.get('/', (req, res) => {
	console.log("call scoreboard api");
	let page = parseInt(req.query.page) || 1;
	let term = req.body.term || 1;
	let year = req.body.year;
	let type_edu = parseInt(req.body.type_edu) || 0;
	page = Math.max(1, page);
	let scoreboards = {page: page};
	itnoodle
	.scoreboardCol
	.find({term: term, year: year, type_edu: type_edu})
	.skip(pageSize*(page-1))
	.limit(pageSize)
	.sort({"course.uploadtime": -1})
	.toArray((err, sbs) => {
		if(!err) {
			scoreboards.content = [];
			sbs.forEach((sb) => {
				scoreboards.content.push({
					term: term,
					year: year,
					type_edu: type_edu,
					code: sb.course.code,
					name: sb.course.name,
					public_src: sb.course.src,
					uploadtime: sb.course.uploadtime
				});
			})
			res.json(scoreboards);
		}
	});
})
router.post('/star', (req, res) => {
	console.log("call scoreboard api STAR");
	// TODO validate session
	let session = req.body.session;
	let content = JSON.parse(req.body.content);
	console.log(content);
	let stars = {};
	content.forEach((con) => {
		if(con.public_src)
			stars[Buffer.from(con.public_src).toString("base64")] = con.public_src;
	})
	// console.log(stars);
	itnoodle.favScoreboardCol.findOne({session: session}).then((favScore) => {
		// console.log(favScore);
		if(favScore) {
			Object.keys(stars).forEach((p_src) => {
				favScore.stars[p_src] = stars[p_src];
			})
			itnoodle.favScoreboardCol.updateOne({session: session}, {$set: {stars: favScore.stars}}, (err, result) => {
				if(!err) {
					delete favScore._id;
					res.json(favScore);
				}		
				else {
					console.log(err);
					res.sendStatus(400);
				}
			});
		}
		else
			itnoodle.favScoreboardCol.insert({session: session, stars: stars}, (err, result) => {
				if(!err) {
					res.json({session: session, stars: stars});
				}
				else {
					console.log(err);
					res.sendStatus(400);
				}
			})
	});
})
router.delete('/unstar', (req, res) => {
	console.log("call scoreboard api UNSTAR");
	// TODO validate session
	let session = req.body.session;
	let content = JSON.parse(req.body.content);
	console.log(content);
	let stars = {};
	content.forEach((con) => {
		if(con.public_src)
			stars[Buffer.from(con.public_src).toString("base64")] = con.public_src;
	})
	itnoodle.favScoreboardCol.findOne({session: session}).then((favScore) => {
		if(favScore) {
			Object.keys(stars).forEach((p_src) => {
				delete favScore.stars[p_src];
			})
			itnoodle.favScoreboardCol.updateOne({session: session}, {$set: {stars: favScore.stars}}, (err, result) => {
				if(!err) {
					delete favScore._id;
					res.json(favScore);	
				}
				else {
					console.log(err);
					res.sendStatus(400);
				}
			});
		}
	});
})
router.get('/favorite', (req, res) => {
	console.log("call scoreboard api FAVORITE");
	let session = req.query.session;
	itnoodle.favScoreboardCol.findOne({session: session}).then((favScore) => {
		if(favScore) {
			delete favScore._id;
			res.json(favScore);	
		}
		else
			res.json({session: session, stars: {}});	
	}).catch((e) => {
		console.log(e);
	})
})
module.exports = router;