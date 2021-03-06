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
      // This is ugly but I have no idea how to solve it in smart way
      // on 6:30AM after 14 hours of working
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

  var getLink = function(link, callback) {
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

      try {
        body = JSON.parse(body)[0];
        if ('error' in body && parseInt(body.error, 10) !== 0) {
          callback(new Error('Server error'));
        } else {
          callback(null, body.array.downloadStream);
        }
      } catch (e) {
        callback(new Error('Cannot parse server answer'));
      }
    });

  };

  return {
    login: login,
    getLink: getLink
  };
})();

module.exports = Filebit_API;
