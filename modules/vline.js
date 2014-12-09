
module.exports = function(serviceId, apiSecret,jwt){

// vline functions
  var createAuthToken = function(serviceId, userId, expiry, apiSecret) {
    var subject = serviceId + ':' + userId;
    var payload = {'iss': serviceId, 'sub': subject, 'exp': expiry};
    var apiSecretKey = base64urlDecode(apiSecret);
    return jwt.encode(payload, apiSecretKey);
  };

  var base64urlDecode = function(str) {
    return new Buffer(base64urlUnescape(str), 'base64');
  };

  var base64urlUnescape = function(str) {
    str += Array(5 - str.length % 4).join('=');
    return str.replace(/\-/g, '+').replace(/_/g, '/');
  };

  var createToken = function(userId) {
    var exp = new Date().getTime() + (48 * 60 * 60);     // 2 days in seconds

    return createAuthToken(serviceId, userId, exp, apiSecret);
  }


  return{
    createToken: createToken
  }
}