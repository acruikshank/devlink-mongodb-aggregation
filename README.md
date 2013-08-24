# DevLink MongoDB Aggregation Talk

The slides for this talk are in HTML5. You can view them at https://acruikshank.github.io/devlink-mongodb-aggregation/presentation.html. The arrow keys switch between slides unless the slide contains an editor in which case you must use ctrl-right or ctrl-left. The slides are only tested in Chrome on OS X. The presentation contains some live demonstrations that require access to a server.

## Installation

The full functonality of this presentation requires node.js 0.6 or greater and mongodb 2.4 or higher:

1. Install [Node.js](http://nodejs.org).
2. Install [MongoDB](http://www.mongodb.org/downloads).
3. From the installation directory:
<pre>
npm install
mongo dma_talk db/init_dmatalk.js
npm start
</pre>

The installation assume you are running mongo on your local machine.

## Using

Open the page at http://localhost:8081/presentation.html. From there you should be able to move back and forth between slides using the right and left arrow keys.  Once you get to the live demos, you will need to use ctrl-right and ctrl-left to move between slides.

From within a live demo, you can write any JavaScript you like. The only requirement is that you pass an array of aggregate stage specifications to db.customers.aggregate() at some point within the script. No other types of statements or collecitons are supported.

To run a query: Ctrl-Option-Enter or Ctrl-Alt-Enter
To toggle into step-by-step mode: Ctrl-Option-Space or Ctrl-Alt-Space.
Step-by-step mode is only available once a query has been run. You may also click the circle in the top right to switch between step-by-step and the editor. Once in step-by-step mode, clicking on a stage specification will run all of the stages up to and including the one you clicked.

