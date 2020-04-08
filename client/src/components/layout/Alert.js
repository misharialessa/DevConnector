import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

//The ({alerts}) is basically destructering the 'props' argument the function accepts into a variable called alerts instead of calling props.alerts everytime we want to get 'alerts'
const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = { alerts: PropTypes.array.isRequired };

const mapStateToProps = (state) => ({ alerts: state.alert });

export default connect(mapStateToProps)(Alert);
