import ContextMenu from 'react-context-menu';
import React from 'react';

const HistoryBoxContextMenu = () => {
    return (
        <ContextMenu
            contextId={'clickable-area'}
            items={[
                {
                    label: 'Configure',
                    onClick: () => console.log("haha"),
                    icon: 'path/to/icon.svg'
                },
                {
                    label: 'Delete',
                    onClick: console.log("haha")
                }
            ]} />
    );
}
export default HistoryBoxContextMenu;