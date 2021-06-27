import * as React from 'react';

interface VSeparatorProps {
    height?: number;
}
const VSeparator: React.FC<VSeparatorProps> = ({ height = 10 }) => (
    <div style={{ height }} />
);

export { VSeparator };