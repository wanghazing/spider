'use strict';
var http = require('http');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var opt = {
	hostname : 'movie.douban.com',
	port : 80
};
http.get(opt,function(res){
	var html = '';
	var movies = [];
	res.setEncoding('utf-8');
	res.on('data',function(chunk){
		html +=chunk;
	});
	res.on('end',function(){
		var $ = cheerio.load(html);
		var i = 0;
		$('[data-title]').each(function(){
			var picUrl = $(this).find('img').attr('src');
			var movie = {
				index : ++i,
				title:$(this).attr('data-title'),
				star:$(this).attr('data-star'),
				link:$(this).find('a').attr('href'),
				rate : $(this).attr('data-rate'),
				picUrl : /^http/.test(picUrl)?picUrl:'http://movie.douban.com/'+picUrl
			};
			movies.push(movie);
			downloadImg('./img/',movie.picUrl);
		});
		console.log(movies);
		saveData('./data/data.json',movies);
	});

}).on('error',function(err){
	console.log(err);
});
function saveData(path,movies){
	fs.writeFile(path,JSON.stringify(movies,null,4),function(err){
		if(err){
			return console.log(err);
		}
		console.log('Data saved');
	});
}

function downloadImg(imgDir,url){
	http.get(url,function(res){
		var data = '';
		res.setEncoding('binary');
		res.on('data',function(chunk){
			data +=chunk;
		});
		res.on('end',function(){
			fs.writeFile(imgDir + path.basename(url),data,'binary',function(err){
				if(err){
					return console.log(err);
				}
				console.log('Image downloaded: ',path.basename(url));
			});
		});
	}).on('error',function(err){
		console.log(err);
	});
}