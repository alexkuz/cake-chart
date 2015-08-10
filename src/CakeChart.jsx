// http://codepen.io/maydie/details/OVmxZZ

import React, { Component, PropTypes } from 'react';
import getTextCoordinates from './getTextCoordinates';
import createSliceTree from './createSliceTree';
import Ring from './Ring';
import jss from 'jss';
import JssVendorPrefixer from 'jss-vendor-prefixer';
import CSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import getSliceRadius from './getSliceRadius';
import getColor from './getColor';
import classNames from 'classnames';

jss.use(JssVendorPrefixer);

const sheet = jss.createStyleSheet({
  wrapper: {
    position: 'relative'
  },

  svg: {
    width: '100%',
    height: '100%'
  },

  pieChart: {
    'animation-fill-mode': 'both'
  },

  activeSlice: {
    cursor: 'pointer'
  },

  labels: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    'pointer-events': 'none',
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center'
  },

  labelsBox: { },
  label: {
    border: '2px solid #FFFFFF',
    position: 'absolute',
    'pointer-events': 'all',
    color: '#FFF',
    'z-index': 1,
    'white-space': 'nowrap',
    transform: 'translate(-50%, -50%)',
    padding: '2px 8px',
    'border-radius': '100px',
    'box-shadow': '0 2px 4px rgba(66, 66, 66, 0.3)'
  },

  labelActive: {
    cursor: 'pointer'
  },

  labelsTransition: {
    width: '100vmin',
    height: '100vmin',
    position: 'relative'
  }
}, { link: true }).attach();

jss.createStyleSheet({
}, { named: false }).attach();

let ringSheet = null;
let ringTransitionSheet = null;

function detachRingClasses() {
  if (ringSheet) {
    ringSheet.detach();
  }

  if (ringTransitionSheet) {
    ringTransitionSheet.detach();
  }
}

function createRingClasses(props) {
  const depth = props.limit;

  detachRingClasses();

  ringSheet = jss.createStyleSheet({
    ...Array.apply(null, Array(depth + 1)).map((v, k) => k)
      .reduce((rules, idx) => ({
        ...rules,
        ['ring-' + idx]: { },
        ['labels-' + idx]: { }
      }), {})
  }).attach();

  const rings = ringSheet.classes;

  ringTransitionSheet = jss.createStyleSheet({
    ...Array.apply(null, Array(depth + 1)).map((v, k) => k)
      .reduce((rules, idx) => ({
        ...rules,
        [`.${props.transitionName}-appear.${rings['ring-' + idx]}`]: {
          transform: 'scale(0.5)'
        },
        [`.${props.transitionName}-appear-active.${rings['ring-' + idx]}`]: {
          transform: 'scale(1)',
          transition: `transform 0.5s ease-out ${(idx / 5)}s`
        },
        [`.${props.transitionName}-enter.${rings['ring-' + idx]}`]: {
          transform: 'scale(0.5)'
        },
        [`.${props.transitionName}-enter-active.${rings['ring-' + idx]}`]: {
          transform: 'scale(1)',
          transition: `transform 0.5s ease-out ${(idx / 5)}s`
        },
        [`.${props.transitionName}-leave.${rings['ring-' + idx]}`]: {
          transform: 'scale(1)'
        },
        [`.${props.transitionName}-leave-active.${rings['ring-' + idx]}`]: {
          transform: 'scale(0.5)',
          transition: 'transform 0.1s ease-in'
        },

        [`.${props.labelTransitionName}-appear.${rings['labels-' + idx]}`]: {
          opacity: 0
        },
        [`.${props.labelTransitionName}-appear-active.${rings['labels-' + idx]}`]: {
          opacity: 1,
          transition: `opacity 0.5s ease-out ${(idx / 5) + 0.2}s`
        },
        [`.${props.labelTransitionName}-enter.${rings['labels-' + idx]}`]: {
          opacity: 0
        },
        [`.${props.labelTransitionName}-enter-active.${rings['labels-' + idx]}`]: {
          opacity: 1,
          transition: `opacity 0.5s ease-out ${(idx / 5) + 0.2}s`
        },
        [`.${props.labelTransitionName}-leave.${rings['labels-' + idx]}`]: {
          opacity: 1
        },
        [`.${props.labelTransitionName}-leave-active.${rings['labels-' + idx]}`]: {
          opacity: 0,
          transition: 'opacity 0.1s ease-in'
        }
      }), {})
  }, { named: false }).attach();
}

function getLabelProps(slice, idx, pos, props) {
  const hasChildren = slice.data.children && slice.data.children.length;
  const className = classNames({
    [sheet.classes.label]: true,
    [sheet.classes.labelActive]: hasChildren
  });

  return {
    className,
    style: {
      left: pos.x + '%',
      top: pos.y + '%',
      background: getColor(slice.level, idx)
    },
    key: slice.level + '-' + idx,
    onClick: props.onClick.bind(null, slice.data)
  }
}

function getKey(data) {
  return data.key || (data.label + '-' + data.value);
}

function getLabel(slice) {
  return (slice.end - slice.start > 15) && (slice.data.label || slice.data.value);
}

export default class CakeChart extends Component {
  static propTypes = {
    hole: Ring.propTypes.hole,
    radius: Ring.propTypes.radius,
    radiusFactor: Ring.propTypes.radiusFactor,
    stroke: Ring.propTypes.stroke,
    strokeWidth: Ring.propTypes.strokeWidth,
    onClick: Ring.propTypes.onClick,

    data: PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.any,
      color: PropTypes.string,
      children: PropTypes.array
    }).isRequired,

    limit: PropTypes.number,
    transitionName: PropTypes.string,
    labelTransitionName: PropTypes.string,
    className: PropTypes.string,
    getLabelComponent: PropTypes.func
  }

  static defaultProps = {
    limit: 5,
    strokeWidth: 3,
    stroke: '#FFFFFF',
    radiusFactor: 0.7,
    transitionName: sheet.classes.pieChart,
    labelTransitionName: sheet.classes.labelsBox,
    getRingComponent: (block, ...args) => React.createElement(...args),
    getSliceComponent: (slice, idx, ...args) => React.createElement(...args),
    className: sheet.classes.wrapper,
    getLabelComponent: (slice, idx, ...args) => React.createElement(...args)
  }

  componentWillMount() {
    createRingClasses(this.props);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.limit !== this.props.limit) {
      createRingClasses(nextProps);
    }
  }

  componentWillUnount() {
    detachRingClasses();
  }

  render() {
    const { hole, radius, onClick, getRingComponent, getSliceComponent,
            style, data, transitionName, labelTransitionName,
            stroke, strokeWidth, className, limit, radiusFactor } = this.props;
    const center = getSliceRadius(hole, radius, limit, radiusFactor).end;
    const diameter = center * 2;
    const sliceTree = createSliceTree(data, limit);
    const centerRule = jss.createRule({
      transform: `translate(${center}px, ${center}px)`
    });

    return (
      <div className={className}
           style={style}>
        <div className={sheet.classes.labels}>
          <CSSTransitionGroup component='div'
                              className={sheet.classes.labelsTransition}
                              transitionName={labelTransitionName}
                              transitionAppear={true}>
            {sliceTree.map((block, idx) =>
              this.renderTexts(block, center, idx + '-' + getKey(data))
            )}
          </CSSTransitionGroup>
        </div>
        <svg width='100%'
             height='100%'
             viewBox={'0 0 ' + diameter + ' ' + diameter}
             xmlns="http://www.w3.org/2000/svg"
             version="1.1"
             className={sheet.classes.svg}>
          <g style={centerRule.style}>
            <CSSTransitionGroup component={'g'}
                                transitionName={transitionName}
                                transitionAppear={true}>
              {sliceTree.map((block, idx) =>
                  getRingComponent(block, Ring, {
                    key: idx + '-' + (getKey(data)),
                    className: ringSheet.classes['ring-' + block.level],
                    slices: block.slices,
                    level: block.level,
                    hole, radius, center,
                    radiusFactor, getSliceComponent,
                    stroke, strokeWidth, onClick
                  })
              )}
            </CSSTransitionGroup>
          </g>
        </svg>
      </div>
    );
  }

  renderTexts(block, center, key) {
    const { getLabelComponent, hole, radius, radiusFactor } = this.props;

    return (
      <div key={key}
           className={ringSheet.classes['labels-' + block.level]}>{[
        for (slice of block.slices)
          getLabelComponent(
            slice,
            block.slices.indexOf(slice),
            'div',
            getLabelProps(slice, block.slices.indexOf(slice),
              getTextCoordinates(slice, hole, radius, center, radiusFactor),
              this.props),
            getLabel(slice)
          )
      ]}
      </div>
    );
  }
}
