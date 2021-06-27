import { Icon, Notification } from "atomize";
import React, { FC } from "react";

import { AlertComponentPropsWithStyle } from "react-alert";

const notification = {
    success: {
        icon: <Icon
            name="Success"
            color="white"
            size="18px"
            m={{ r: "0.5rem" }}
        />,
        bg: 'success700'
    },
    error: {
        icon: <Icon
            name="CloseSolid"
            color="white"
            size="18px"
            m={{ r: "0.5rem" }}
        />,
        bg: 'danger700'
    },
    info: {
        icon: <Icon
            name="InfoSolid"
            color="white"
            size="18px"
            m={{ r: "0.5rem" }}
        />,
        bg: 'info700'
    }
}

const hoverStyle: React.CSSProperties = {
    cursor: 'pointer'
}

const AlertTemplateAtomize: FC<AlertComponentPropsWithStyle> = ({ close, style, message, options: { type, onClose, onOpen, timeout } }) => {
    const [open, setOpen] = React.useState(true);

    React.useEffect(() => {
        if (open) {
            if (onOpen) onOpen();
            return;
        }

        if (onClose) onClose();

        close();
    }, [close, onClose, onOpen, open]);

    if (timeout) setTimeout(() => setOpen(false), timeout);

    return (
        <div style={{ ...style, ...hoverStyle }} onClick={() => setOpen(false)}>
            <Notification
                bg={type ? notification[type].bg : notification['info'].bg}
                isOpen={open}
                onClose={() => setOpen(false)}
                prefix={
                    type ? notification[type].icon : notification['info'].icon
                }
                iconSize={null}
            >
                {message}
            </Notification>
        </div>
    )
};

export default AlertTemplateAtomize;