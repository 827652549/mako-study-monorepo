/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: [
        [
            'postcss-pxtorem',
            {
                rootValue: 75,
                unitPrecision: 5,
                propList: ['*'],
                mediaQuery: false, // 是否转换 @media 条件中的px（只影响条件，不影响代码块）
                // 小于 2px 的像素不会被转化为 rem
                minPixelValue: 2,
            },
        ],
        ['tailwindcss', {}],
    ],
};

export default config;
