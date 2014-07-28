'use strict';

var request = require('request');

// setting 'jar' to true allows our lib to remember cookies. We need this to
// access parts of the site that need loging in.
request = request.defaults({jar: true});

var Filebit_API = (function() {

  // URL where we login
  var loginUrl = 'http://filebit.pl/panel/login';
  // URL with FileBit api.
  var finalUrl = 'http://filebit.pl/includes/ajax.php';

  var login = function(login, password, callback) {
    request({
        url: loginUrl,
        method:'POST',
        form: {login: login, password: password}
    },

    function(error,response,body) {
      if (
        error ||
        response.body.indexOf('Podane hasło jest') > -1 ||
        response.body.indexOf('Podany użytkownik nie istnieje') > -1
      ) {
        error = error || new Error('Login error!');
        callback(error);
        return;
      }

      callback(null, true);
    });
  };

  var getLinks = function(link, callback) {
    console.log('Intermediate link:', link);
    request({
        url: finalUrl,
        method:'POST',
        form: {
          a: 'serverNewFile',
          url: link,
          t: +(new Date())
        }
    },

    function(error,response,body) {
      if (error){
        callback(error);
        return;
      }

      callback(null, JSON.parse(body)[0].array.downloadStream);
    });

  };

  return {
    login: login,
    getLinks: getLinks
  };
})();

module.exports = Filebit_API;


var credentials = require('./passwords.json');
Filebit_API.login(
  credentials.login,
  credentials.password,
  function(error, status) {
    if (error){
      throw error;
    }
    Filebit_API.getLinks(
      'http://bitshare.com/files/b4dctnwu/Suits.S04E06.HDTV.XviD-AFG.avi.html',
      function(error, result){
        console.log('LINK: ', result);
      }
    );
  }
);
