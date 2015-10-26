module.exports = (function(){
  var _const =  {};

  _const.ENV_CONST = window.location.host && (/^[^\:]+\:[\d]+/.test(window.location.host))?'dev':'prod';
  _const.AJX_PATH = _const.ENV_CONST === 'dev'?'../../source/back/':'/ajax/';

  return _const
})()
