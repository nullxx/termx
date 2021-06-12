import { animations } from 'react-animation';
const TEXT_COLOR = 'white';

const textStyles = {
    color: TEXT_COLOR,
}

export default {
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        padding: 10
    },

    form: {
        margin: 15,
        marginBottom: 10,
        animation: animations.fadeInUp,
    },
    container: {
        backgroundColor: 'rgb(32, 33, 36)',
        // height: '100%',
        overflow: 'scroll',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        marginBottom: 30
    },
    historyContainer: {
        marginTop: 15,
        display: 'flex',
        overflowX: 'scroll',
        overflowY: 'hidden',
        animation: animations.bounceIn,
    },
    imageIcon: {
        alignSelf: 'center'
    },

    sshLabel: {
        ...textStyles
    },
    actionsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: animations.popIn,
    }

}