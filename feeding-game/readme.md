# Phaser Project Template

This template is forked from https://github.com/gamecook/phaser-project-template. It provides a starting point for creating games with Phaser.

### Getting Started

#### Install NodeJS and Grunt

1. You can download NodeJS from its site: http://nodejs.org
2. After installing it, you can install grunt from the command line with: `npm install -g grunt-cli`

#### Setup Your Project

1. Fork this repository and clone it into your development environment
2. From your project's root directory, install dependencies from the command line with: `npm install`. This will download all the dependencies in the package.json file and install them locally for you to use.
3. Afterwards, from the command line, run: `grunt`. This will both package up your project into a `deploy/` folder, and open up a new browser window that will run the game.

#### Development

This project is setup to use Phaser 2.3.0. This can be changed by adjusting the Phaser script loaded in [index.html](https://github.com/DoSomethingGames/phaser-project-template/blob/master/src/index.html#L8).

All development should be able to take place within the **src/** folder. The Grunt steps will handle packaging it up to export to the **deploy/** folder.

If the order in which your Javascript files load matters, then one possible solution is to specify their order in the Grunt concat step.

ex:
```
...
concat: {
  dist: {
    src: [
      'src/game/main.js',
      'src/script1.js',
      'src/script2.js',
      'src/script3.js'
    ],
    dest: 'deploy/js/<%= pkg.name %>.js'
  }
},
```