# cake-chart

Interactive multi-layer pie chart

![](cake.png)

### Demo

[Webpack Chart](http://alexkuz.github.io/webpack-chart/)

### Install
```
> npm i -S cake-chart
```

### Simple Example

```
import CakeChart from 'cake-chart';

const data = {
  value: 100,
  label: 'SUM = 100',
  children: [{
    value: 50,
    children: [{
      value: 10
    },
    {
      value: 20
    }]
  }, {
    value: 30
  }, {
    value: 20
  }]
};

...

render () {
  return (
    <CakeChart data={data} />
  );
}
```

### Advanced Example

[TBD]
