import * as React from 'react';

import { animations } from 'react-animation';

const TEXT_COLOR = 'white';

const textStyles = {
    color: TEXT_COLOR,
}

const iconContainer: React.CSSProperties = {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    padding: 10
};

const form: React.CSSProperties = {
    margin: 15,
    marginBottom: 10,
    animation: animations.fadeIn,
};

const container: React.CSSProperties = {
    backgroundColor: 'rgb(32, 33, 36)',
    // height: '100%',
    overflow: 'scroll',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    marginBottom: 45
};
const historyContainer: React.CSSProperties = {
    marginTop: 15,
    display: 'flex',
    overflowX: 'scroll',
    overflowY: 'hidden',
    animation: animations.fadeIn,
};

const imageIcon: React.CSSProperties = {
    alignSelf: 'center'
};

const sshLabel: React.CSSProperties = {
    ...textStyles
};

const actionsContainer: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: animations.popIn,
}

const styles = {
    iconContainer,
    form,
    container,
    historyContainer,
    imageIcon,
    sshLabel,
    actionsContainer
}

export default styles;