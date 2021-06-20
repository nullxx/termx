/* eslint-disable @typescript-eslint/no-var-requires */

require('dotenv').config();
const path = require('path');

module.exports = {

    packagerConfig: {
        icon: 'public/icons/icon.icns',
        osxNotarize: {
            appleId: process.env.APPLE_ID_EMAIL,
            appleIdPassword: process.env.APPLE_ID_PASSWORD,
            appBundleId: process.env.BUNDLEID
        },
        osxSign: {
            identity: process.env.OS_SIGN_IDENTITY,
            'hardened-runtime': true,
            entitlements: path.join(__dirname, 'needs/mac/entitlements.mac.plist'),
            'entitlements-inherit': path.join(__dirname, 'needs/mac/entitlements.mac.plist'),
            'gatekeeper-assess': false
        },
        asar: true,
        ignore: [
            '^.env$',
            '^.eslintrc$',
            '^babel.config.js$',
            '^tsconfig.json$',
            '^README.MD$',
            '^.vscode$',
            '^.github$',
            '^.gitignore$',
            '^src$',
            '^electron$',
            '^needs$',
            '^.travis.yml$',
            '^forge.config.js$',
            '^assets$',
            '^out$',
            '^postinstall$',
            '^patches$',
            '^.gitmodules$',
            '^yarn.lock$'
        ],
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'termx',
                loadingGif: path.join(__dirname, 'needs/assets/squirrel-setup.gif'),
                setupIcon: path.join(__dirname, 'public/icons/icon.ico')
            }
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                background: path.join(__dirname, 'needs/assets/dmg-background.png'),
                format: 'ULFO',
                icon: path.join(__dirname, 'public/icons/icon.icns'),
                overwrite: true
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: [
                'darwin'
            ]
        },
        {
            name: '@electron-forge/maker-deb',
            config: {}
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {}
        }
    ],
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'nullxx',
                    name: 'termx'
                },
                prerelease: true,
                draft: true,
                authToken: process.env.GITHUB_AUTHTOKEN
            }
        }
    ]

}