module.exports = (function(){
  var _const =  {};

  _const.ENV_CONST = window.location.host && (/^[^\:]+\:[\d]+/.test(window.location.host))?'dev':'prod';
  _const.AJX_PATH = _const.ENV_CONST === 'dev'?'../../source/back/':'/ajax/';
  _const.IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
  return _const
})()
