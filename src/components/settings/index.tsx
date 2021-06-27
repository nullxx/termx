import { Div } from "atomize";
import { FC } from 'react';
import ThemeSettings from "./ThemeSettings";
import styles from '../../styles/Settings';

const Settings: FC = () => {
    return (
        <Div style={styles.container}>
            <ThemeSettings />
        </Div>
    );
}

export default Settings;