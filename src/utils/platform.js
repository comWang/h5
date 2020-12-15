const titleDOM = Array.prototype.filter.call(
  document.head.children,
  dom => dom.nodeName.toUpperCase() === 'TITLE'
)[0]

const isIOS = Boolean(navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/))
const isAndroid =
  navigator.userAgent.indexOf('Android') > -1 ||
  navigator.userAgent.indexOf('Adr') > -1 ||
  navigator.userAgent.indexOf('Linux') > -1

const isIOSPrepared =
  window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.AppModel
const isAndroidPrepared = window.android && window.android.postMessage

export const sendMessageToApp = (code, data) => {
  const config = {
    funcNO: code.toString(),
    object: data,
  }
  if (isIOS && isIOSPrepared) {
    window.webkit.messageHandlers.AppModel.postMessage(config)
  } else if (isAndroid && isAndroidPrepared) {
    window.android.postMessage(JSON.stringify(config))
  }
}
export const isAppEnvironment = isIOSPrepared || isAndroidPrepared
/**
 * 50003 分享APP
 * 50004 设置导航栏
 * 50005 返回至App
 */
