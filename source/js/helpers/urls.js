var DEF_CONST = require('./constants');

module.exports = function(o) {
  return function addUrl (name, urls) {
      o[name] = DEF_CONST.AJX_PATH + urls[DEF_CONST.ENV_CONST == 'dev'?0:1];
  }
}
