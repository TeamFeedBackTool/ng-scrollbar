# ngScrollbar
I created ngScrollbar inspired by [asafdav's ngScrollbar](https://github.com/asafdav/ng-scrollbar) which did not work in all cases
and did not support horizontal scrollbars. I also added a few other improvements like rebuilding the scrollbars on width or height
change without declaring and observing scope properties.

ngScrollbar can be fully customized using css (a .less file is provided). Still no jQuery used.

### Installation
You have two way:

First: Clone the repository and install all dependencies. This required npm and gulp to be installed.
```sh
git clone https://github.com/benjaminsuch/ng-scrollbar.git
cd ng-scrollbar
npm install
bower install
gulp watch
```

Second: You download `ng-scrollbar.min.js`, add it into your HTML file and add `ngScrollbar` as dependency into your project.

### How to use
Add ng-scrollbar.min.js into your HTML file and add `ngScrollbar` as a dependency into your
project. After that you can theoretically add `ng-scrollbar` to every HTML DOM element.

You can see some use cases in the `index.html` file but I will add some more in depth examples later.

### Known Bugs
- x-Axis Track is not shown and it's not clear for me (at the moment), why the transcluded content's width is not inherited by it's content.
- Thumb offset does not reset, when the parent element's height is larger than the
  one of the transcluded content.

### Roadmap
- Add Touch support
- Add minimum length of scrollbars and adjust the scrollspeed based on it
- [Done] [Incomplete] Add $scrollbarProvider to set config parameters global
- Remove normalizeWheel and replace it with it's own module as dependency
- Add documentation