import React from 'react'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head/>
      <body>
      <script
        dangerouslySetInnerHTML={ {
          __html: `window.renderStartTime = Date.now();
              //手动计算fontSize不需要lib-flexible
              (function (doc) {
                var root = doc.querySelector('html');
                (resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'),
                (recalc = function () {
                var clientWidth = root.getBoundingClientRect().width;
                root.style.fontSize = Math.min(100, clientWidth / 10) + 'px';
              });
                window.addEventListener(resizeEvt, recalc, false);
                return recalc();
              })(document);`,
        } }
      ></script>
      <Main/>
      <NextScript/>
      </body>
    </Html>
  )
}