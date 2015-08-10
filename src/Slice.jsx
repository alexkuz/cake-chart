// http://codepen.io/maydie/details/OVmxZZ

import React, { Component, PropTypes } from 'react';
import getAnglePoint from './getAnglePoint';

export default class Slice extends Component {
  static propTypes = {
    startAngle: PropTypes.number.isRequired,
    angle: PropTypes.number.isRequired,
    sliceRadius: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired
    }),
    stroke: PropTypes.string,
    fill: PropTypes.string,
    strokeWidth: PropTypes.number,
    factor: PropTypes.number,
    className: PropTypes.string,
    onClick: PropTypes.func
  }

  static defaultProps = {
    factor: 0.7,
    strokeWidth: 3
  }

  drawPath () {
    const p = this.props;

    const angle = Math.min(p.angle, 359.9999);
    const startRadius = p.sliceRadius.start;
    const endRadius = p.sliceRadius.end;

    // Get angle points
    const a = getAnglePoint(p.startAngle, p.startAngle + angle, endRadius, 0, 0);
    const b = getAnglePoint(p.startAngle, p.startAngle + angle, startRadius, 0, 0);

    return [
      `M${a.x1},${a.y1}`,
      `A${endRadius},${endRadius} 0 ${(angle > 180 ? 1 : 0)},1 ${a.x2},${a.y2}`,
      (p.angle < 360) ? `L${b.x2},${b.y2}` : `M${b.x2},${b.y2}`,
      (startRadius > 0) ?
        `A${startRadius},${startRadius} 0 ${(angle > 180 ? 1 : 0)},0 ${b.x1},${b.y1}` :
        '',
      'Z'
    ].join(' ');
  }

  render () {
    const { fill, stroke, strokeWidth, className } = this.props;
    return (
      <path d={this.drawPath()}
            onClick={this.handleClick}
            {...{ fill, stroke, strokeWidth, className }} />
    );
  }

  handleClick = () => {
    this.props.onClick && this.props.onClick(this.props.data);
  }
}
