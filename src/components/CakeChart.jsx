// http://codepen.io/maydie/details/OVmxZZ

import React, { Component, PropTypes } from 'react';
import dft from '../utils/treeUtils.js';
import getTextCoordinates from '../utils/getTextCoordinates';
import createSliceTree from '../utils/createSliceTree';
import Ring from './Ring';
import jss from 'jss';
import JssVendorPrefixer from 'jss-vendor-prefixer';
import CSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import getSliceRadiusRange from '../utils/getSliceRadiusRange';
import getDefaultColor from '../utils/getDefaultColor';
import classNames from 'classnames';
import { sheet, createDefaultSheets } from '../utils/defaultSheets';
import useSheet from 'react-jss';
import throttle from 'lodash.throttle';

jss.use(JssVendorPrefixer);

let ringSheet = null;
let ringTransitionSheet = null;

function detachRingSheets() {
  if (ringSheet) {
    ringSheet.detach();
  }

  if (ringTransitionSheet) {
    ringTransitionSheet.detach();
  }
}

function attachRingSheets(props) {
  detachRingSheets();
  const { sheet: { classes } } = props;
  const {
    transitionName = classes.pieChart,
    labelTransitionName = classes.labelsBox,
    className = classes.wrapper
  } = props;

  [ ringSheet, ringTransitionSheet ] = createDefaultSheets({
    ...props,
    transitionName, labelTransitionName, className
  });

  ringSheet.attach();
  ringTransitionSheet.attach();
}

function getDefaultLabel(slice) {
  return (slice.end - slice.start > 15) && (slice.node.label || slice.node.value);
}

function getDefaultLabelProps(slice, idx, center, props, classes) {
  const { coreRadius, ringWidth, ringWidthFactor } = props;
  const pos = getTextCoordinates(slice, coreRadius, ringWidth, center, ringWidthFactor);
  const hasChildren = slice.node.children && slice.node.children.length;
  const className = classNames({
    [classes.label]: true,
    [classes.labelActive]: hasChildren
  });
  const label = getDefaultLabel(slice);

  return {
    className,
    style: {
      left: pos.x + '%',
      top: pos.y + '%',
      background: getDefaultColor(slice.level, idx),
      display: label ? 'block' : 'none'
    },
    key: slice.level + '-' + idx,
    onClick: props.onClick.bind(null, slice.node)
  }
}

function getDefaultKey(node) {
  return node.key || (node.label + '-' + node.value);
}

@useSheet(sheet, { link: true })
export default class CakeChart extends Component {
  static propTypes = {
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    onClick: PropTypes.func,

    data: PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.any,
      color: PropTypes.string,
      children: PropTypes.array
    }).isRequired,

    coreRadius: PropTypes.number,
    ringWidth: PropTypes.number,
    ringWidthFactor: PropTypes.number,
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
    ringWidthFactor: 0.7,
    getRingProps: (block, props) => props,
    getSliceProps: (slice, idx, props) => props,
    getLabelProps: (slice, idx, props) => props,
    getLabel: (slice, label) => label,
    getTitle: (slice, title) => title,
    getKey: (node, key) => key
  }

  constructor(props) {
    super(props);
    this.initProps(props);
  }

  initProps = (props) => {
    Array.from(dft(props.data, x => x.children)).forEach(node => node.title = node.title === undefined ? node.label : node.title);
  }

  componentWillReceiveProps(props) {
    this.initProps(props);
  }

  componentWillMount() {
    attachRingSheets(this.props);
  }

  componentDidMount() {
    window.addEventListener('resize', this.debouncedWindowResize);
    this.updateLabelsSize();
  }

  componentWillUpdate(nextProps) {
    if (nextProps.limit !== this.props.limit) {
      attachRingSheets(nextProps);
    }
    this.updateLabelsSize();
  }

  componentWillUnount() {
    detachRingSheets();
    window.removeEventListener('resize', this.debouncedWindowResize);
  }

  handleWindowResize = () => {
    window.requestAnimationFrame(this.updateLabelsSize);
  }

  debouncedWindowResize = throttle(this.handleWindowResize, 50)

  updateLabelsSize = () => {
    const labelsEl = React.findDOMNode(this.refs.labels);
    const containerEl = React.findDOMNode(this.refs.container);
    const size = Math.min(containerEl.offsetHeight, containerEl.offsetWidth);
    labelsEl.style.height = size + 'px';
    labelsEl.style.width = size + 'px';
  }

  render() {
    const { sheet: { classes } } = this.props;
    const { coreRadius, ringWidth, onClick, getRingProps, getSliceProps,
            style, data, getKey, stroke, strokeWidth, limit, ringWidthFactor, getTitle,
            transitionName = classes.pieChart,
            labelTransitionName = classes.labelsBox,
            className = classes.wrapper } = this.props;
    const center = getSliceRadiusRange(coreRadius, ringWidth, limit, ringWidthFactor).end;
    const diameter = center * 2;
    const sliceTree = createSliceTree(data, limit);
    const centerRule = jss.createRule({
      transform: `translate(${center}px, ${center}px)`
    });
    const key = getKey(data, getDefaultKey(data));

    return (
      <div className={className}
           style={style}
           ref='container'>
        <div className={classes.labels}>
          <CSSTransitionGroup component='div'
                              className={classes.labelsTransition}
                              transitionName={labelTransitionName}
                              transitionAppear={true}
                              ref='labels'>
            {sliceTree.map((block, idx) =>
              this.renderTexts(block, center, `${idx}-${key}`)
            )}
          </CSSTransitionGroup>
        </div>
        <svg width='100%'
             height='100%'
             viewBox={`0 0 ${diameter} ${diameter}`}
             xmlns='http://www.w3.org/2000/svg'
             version='1.1'
             className={classes.svg}>
          <g style={centerRule.style}>
            <CSSTransitionGroup component={'g'}
                                transitionName={transitionName}
                                transitionAppear={true}>
              {sliceTree.map((block, idx) =>
                <Ring {...getRingProps(block, {
                  key: `${idx}-${key}`,
                  className: ringSheet.classes['ring-' + block.level],
                  slices: block.slices,
                  level: block.level,
                  sliceRadiusRange: getSliceRadiusRange(
                    coreRadius,
                    ringWidth,
                    block.level,
                    ringWidthFactor
                  ),
                  center, getSliceProps,
                  stroke, strokeWidth, onClick, getTitle
                })} />
              )}
            </CSSTransitionGroup>
          </g>
        </svg>
      </div>
    );
  }

  renderTexts(block, center, key) {
    const { getLabelProps, getLabel, sheet: { classes } } = this.props;

    return (
      <div key={key}
           className={ringSheet.classes['labels-' + block.level]}>{[
        for (slice of block.slices)
          <div {...getLabelProps(
            slice, block.slices.indexOf(slice),
            getDefaultLabelProps(
              slice,
              block.slices.indexOf(slice),
              center,
              this.props,
              classes
            ),
          )}>
            {getLabel(slice, getDefaultLabel(slice))}
          </div>
      ]}
      </div>
    );
  }
}
