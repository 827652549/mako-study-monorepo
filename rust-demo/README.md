# @ctrip/swc-plugin-transform-import 备份

## Installation

```bash
npm install --save-dev @ctrip/swc-plugin-transform-import
```

## Usage


添加配置到下配置文件中 `.swcrc`，`webpack.config.js` or `next.config.js`

```json
{
  "jsc": {
    "experimental": {
      "plugins": [
        [
          "@ctrip/swc-plugin-transform-import",
          {
            "@ctrip/corpd-h5": {
              "transform": "@ctrip/corpd-h5/dist/components/${member}",
              "style": "@ctrip/corpd-h5/dist/components/${member}/index.css"
            }
          }
        ]
      ]
    }
  }
}
```

进行如下转换

```js
import { Button } from "@ctrip/corpd-h5";
```

到:

```js
import Button from "@ctrip/corpd-h5/dist/components/Button";
import Button from "@ctrip/corpd-h5/dist/components/Button/index.css";
```

