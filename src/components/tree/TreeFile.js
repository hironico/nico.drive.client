import React from 'react';

import { Text } from 'evergreen-ui';

const styles = {
    fileLabel: {
        paddingLeft: '20px',
        display: 'flex',
        alignItems: 'center',
        span: {
            marginLeft: '5px'
        }
    }
}

const TreeFile = ({ name }) => {
    return (
      <div style={styles.fileLabel}>
        <i className="fa fa-file"></i>
        <Text style={styles.fileLabel.span}>{name}</Text>
      </div>
    );
  };

export default TreeFile;