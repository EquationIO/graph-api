api
===

Equation IO API for the web

Draft API:

```js

var EquationIO = require('equation.io');

var Graph = EquationIO.Graph;
var Expression = EquationIO.Expression;


var div = document.createElement('div');
// It needs to be in the DOM hierarchy, but we can make it hidden to avoid artefacts before it finishes loading:
div.style.opacity = 0.0;
document.body.appendChild(div);

var graph = new Graph({width: 800, height: 600});

graph.init(div, function (err) {
  console.log('loaded');
  div.style.opacity = 1.0;
});

// To implement later:
// graph.context.c = 30;

// Change what is displayed by modifying the .equations array:

graph.equations = [
  {
    latex: 'y = \\sin x',
    color: 'red'
  },
  {
    latex: 'y = \\cos x',
    color: 'blue'
  }
];


// And then call .update()

graph.update(function (err) {
  if (err) alert(err.message);
  console.log('Graph should now have two curves');
});

```

