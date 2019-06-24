const proxy = require('http-proxy-middleware');
var fs = require('fs');

module.exports = function(app) {
  app.use(proxy('/api', { target: 'http://mcr.caths.cam.ac.uk:1337/',
	changeOrigin: true,
	onProxyReq : function(proxyReq, req, res){
		var contents = fs.readFileSync('/tmp/cookie', 'utf8');
		proxyReq.setHeader('cookie',contents.trim());
	} }));
};
