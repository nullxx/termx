import * as React from 'react';

import PropTypes from 'prop-types';

const VSeparator = ({ height = 10 }) => (
    <div style={{ height }} />
);

VSeparator.propTypes = {
    height: PropTypes.number
};

export { VSeparator };