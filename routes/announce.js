var express = require('express');
var router = express.Router();
var itnoodle = require('../project_modules/itnoodle.js');
var pageSize = 8;
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
			for(idx = 0; idx < ans.length; idx++)
				delete ans[idx]._id;
			announces.content = ans;
			res.json(announces);
		}
	});
})

module.exports = router;