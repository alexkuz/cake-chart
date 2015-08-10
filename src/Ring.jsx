import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import getSliceRadius from './getSliceRadius';
import Slice from './Slice';
import getColor from './getColor';
import jss from 'jss';
import classNames from 'classnames';

const sheet = jss.createStyleSheet({
  slice: {

  },
  sliceActive: {
    cursor: 'pointer'
  }
}).attach();

export default class Ring extends Component {
  static propTypes = {
    stroke: Slice.propTypes.stroke,
    strokeWidth: Slice.propTypes.strokeWidth,
    sliceRadius: Slice.propTypes.sliceRadius,
    onClick: Slice.propTypes.onClick,

    level: PropTypes.number.isRequired,
    hole: PropTypes.number.isRequired,
    radius: PropTypes.number.isRequired,
    radiusFactor: PropTypes.number.isRequired,
    center: PropTypes.number.isRequired,
    className: PropTypes.string.isRequired,
    getSliceComponent: PropTypes.func.isRequired,
    slices: PropTypes.array.isRequired
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  render() {
    const { slices, level, hole, radius, center, stroke, strokeWidth,
            radiusFactor, onClick, className, getSliceComponent } = this.props;
    const sliceRadius = getSliceRadius(hole, radius, level, radiusFactor);
    const rectSize = sliceRadius.end + 20;
    const hasChildren = s => s.data.children && s.data.children.length > 0;

    return (
      <g className={className}>
        <rect x={center - rectSize} y={center - rectSize}
              width={rectSize * 2} height={rectSize * 2}
              fill='transparent' style={{visibility: 'none', pointerEvents: 'none'}} />
        {slices.map((slice, idx) =>
            getSliceComponent(slice, idx, Slice, {
              key: idx,
              data: slice.data,
              startAngle: slice.start,
              angle: slice.end - slice.start,
              percentValue: slice.percentValue.toFixed(1),
              fill: getColor(level, idx),
              className: classNames({
                [sheet.classes.sliceActive]: hasChildren(slice),
                [sheet.classes.slice]: true
              }),
              stroke, strokeWidth, sliceRadius, onClick, level
            })
        )}
      </g>
    );
  }
}
