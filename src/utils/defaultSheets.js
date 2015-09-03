import jss from 'jss';

export const sheet = {
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
    position: 'relative'
  }
};

export function createDefaultSheets(props) {
  const depth = props.limit;

  const ringSheet = jss.createStyleSheet({
    ...Array.apply(null, Array(depth + 1)).map((v, k) => k)
      .reduce((rules, idx) => ({
        ...rules,
        ['ring-' + idx]: { },
        ['labels-' + idx]: { }
      }), {})
  });

  const rings = ringSheet.classes;

  const trName = props.transitionName;
  const labelTrName = props.labelTransitionName;

  const ringTransitionSheet = jss.createStyleSheet({
    ...Array.apply(null, Array(depth + 1)).map((v, k) => k)
      .reduce((rules, idx) => ({
        ...rules,
        [`.${trName}-appear.${rings['ring-' + idx]}`]: {
          transform: 'scale(0.5)'
        },
        [`.${trName}-appear.${trName}-appear-active.${rings['ring-' + idx]}`]: {
          transform: 'scale(1)',
          transition: `transform 0.5s ease-out ${(idx / 5)}s`
        },
        [`.${trName}-enter.${rings['ring-' + idx]}`]: {
          transform: 'scale(0.5)'
        },
        [`.${trName}-enter.${trName}-enter-active.${rings['ring-' + idx]}`]: {
          transform: 'scale(1)',
          transition: `transform 0.5s ease-out ${(idx / 5)}s`
        },
        [`.${trName}-leave.${rings['ring-' + idx]}`]: {
          transform: 'scale(1)'
        },
        [`.${trName}-leave.${trName}-leave-active.${rings['ring-' + idx]}`]: {
          transform: 'scale(0.5)',
          transition: 'transform 0.1s ease-in'
        },

        [`.${labelTrName}-appear.${rings['labels-' + idx]}`]: {
          opacity: 0
        },
        [`.${labelTrName}-appear.${labelTrName}-appear-active.${rings['labels-' + idx]}`]: {
          opacity: 1,
          transition: `opacity 0.5s ease-out ${(idx / 5) + 0.2}s`
        },
        [`.${labelTrName}-enter.${rings['labels-' + idx]}`]: {
          opacity: 0
        },
        [`.${labelTrName}-enter.${labelTrName}-enter-active.${rings['labels-' + idx]}`]: {
          opacity: 1,
          transition: `opacity 0.5s ease-out ${(idx / 5) + 0.2}s`
        },
        [`.${labelTrName}-leave.${rings['labels-' + idx]}`]: {
          opacity: 1
        },
        [`.${labelTrName}-leave.${labelTrName}-leave-active.${rings['labels-' + idx]}`]: {
          opacity: 0,
          transition: 'opacity 0.1s ease-in'
        }
      }), {})
  }, { named: false });

  return [ringSheet, ringTransitionSheet];
}
