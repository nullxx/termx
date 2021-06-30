const { Titlebar } = window.require('custom-electron-titlebar');

const initializeTitleBar = (): void => {
    const customTitlebar = new Titlebar();
    customTitlebar.setHorizontalAlignment = 'center';
    return customTitlebar;
}


export { initializeTitleBar };