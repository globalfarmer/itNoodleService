var express = require('express');
var router = express.Router();
var itnoodle = require('../project_modules/itnoodle.js');
var pageSize = 20;
router.get('/', (req, res) => {
	console.log("call announce api");
	let page = parseInt(req.query.page) || 1;
	page = Math.max(1, page);
	let announces = {page: page};
	itnoodle
	.announceCol
	.find({})
	.skip(pageSize*(page-1))
	.limit(pageSize)
	.sort({uploadtime: -1})
	.toArray((err, ans) => {
		if(!err) {
			let d;
			for(idx = 0; idx < ans.length; idx++) {
				delete ans[idx]._id;
				if(ans[idx]['uploadtime']) {
					d = new Date(ans[idx]['uploadtime'].getTime() + 7*60*60*1000);
					ans[idx]['uploadtime'] = [("0"+d.getDate()).slice(-2), ("0"+(d.getMonth()+1)).slice(-2), d.getFullYear()].join('-');
				}
			}
			announces.content = ans;
			res.json(announces);
		}
	});
})
router.post('/star', (req, res) => {
	console.log("call announce API STAR");
	let session = req.body.session;
	let content = JSON.parse(req.body.content);
	let stars = {};
	if(content.url)
		stars[Buffer.from(content.url).toString('base64')] = content;
	itnoodle.favAnnounceCol.findOne({session: session}, (err, favAnnounce) => {
		if(err) {
			console.log("ERR " + err);
			res.sendStatus(400);
		}
		else
		{
			console.log("--- FAVORITE ANNOUNCE --- ");
			// console.log(favAnnounce);
			if(favAnnounce) {
				Object.keys(stars).forEach((a_url) => {
					favAnnounce.stars[a_url] = stars[a_url];
				});
				itnoodle.favAnnounceCol.updateOne({session: session}, {$set: {stars: favAnnounce.stars}}, (err, result) => {
					if(err) {
						console.log("INSERT ERR");
						console.log(err);
						res.sendStatus(400);
					}
					else {
						delete favAnnounce._id;
						res.json(favAnnounce);
					}
				})
			}
			else {
				itnoodle.favAnnounceCol.insert({session: session, stars: stars}, (err, result) => {
					if(err) {
						console.log("INSERT ERR");
						console.log(err);
						res.sendStatus(400);
					}
					else {
						res.json({session: session, stars: stars});
					}
				})
			}
		}
	})
})
router.delete('/unstar', (req, res) => {
	console.log("call announce API UNSTAR");
	let session = req.body.session;
	let content = JSON.parse(req.body.content);
	let stars = {};
	if(content.url)
		stars[Buffer.from(content.url).toString('base64')] = 1;
	itnoodle.favAnnounceCol.findOne({session: session}, (err, favAnce) => {
		if(err) {
			console.log("ERR");
			console.log(err);
			res.sendStatus(400);
		}
		else {
			if(favAnce) {
				Object.keys(stars).forEach((c_url) => {
					delete favAnce.stars[c_url];
				});
				itnoodle.favAnnounceCol.updateOne({session: session}, {$set: {stars: favAnce.stars}}, (err, result)=>{
					if(err) {
						console.log("ERR FAV ANNOUCE UPDATE");
						console.log(err);
						res.sendStatus(400);
					} else {
						delete favAnce._id;
						res.json(favAnce);
					}
				});
			}
			else {
				res.json({session: session, stars: {}});
			}
		}
	});
})
router.get('/favorite', (req, res) => {
	console.log("call announce API FAVORITE");
	// equal post('/star') with empty content
})

module.exports = router;