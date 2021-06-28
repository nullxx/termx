import { Anchor, Div, Dropdown, Text } from "atomize";
import React, { FC } from "react";
import { getData, saveData } from "../../lib/localStorage";

import { Configs } from "../../configs";
import themes from 'xterm-theme';

const ColorSettings: FC = () => {
    const [selectedTheme, setSelectedTheme] = React.useState<string>(getData<string>(Configs.CONFIG_THEME) || 'Select one');
    const [showDropdown, setShowDropdown] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (selectedTheme) {
            console.log(selectedTheme)
            setShowDropdown(false);
            saveData(Configs.CONFIG_THEME, selectedTheme);
        }
    }, [selectedTheme]);

    const menuList = (
        <Div p={{ x: "1rem", y: "0.5rem" }}>
            {Object.keys(themes).map((name) => (
                <Anchor key={name} d="block" p={{ y: "0.25rem" }} onClick={() => setSelectedTheme(name)}>
                    {name}
                </Anchor>
            ))}
        </Div>
    );

    return (<>
        <Text tag="h3" textSize="display2">
            Theme
        </Text>
        <Dropdown w="fit-content" menu={menuList} isOpen={showDropdown} onClick={() => setShowDropdown((prev) => !prev)}>
            {selectedTheme}
        </Dropdown>
    </>)
}

export default ColorSettings;
