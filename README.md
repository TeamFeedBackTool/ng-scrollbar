# ngScrollbar
I created ngScrollbar inspired by [asafdav's ngScrollbar](https://github.com/asafdav/ng-scrollbar) which did not work in all cases
and did not support horizontal scrollbars. I also added a few other improvements like rebuilding the scrollbars on width or height
change without declaring and observing scope properties.

ngScrollbar can be fully customized using css (a .less file is provided). Still no jQuery used.

#### Compatibility

### Installation

### How to use

### Known Bugs

- x-Axis Track is not shown although the transcluded element's width is far beyond.
- The mouseover event does not work when leaving the scrollbar track

### Roadmap

- Add Touch support
- Add minimum length of scrollbars and adjust the scrollspeed base on it
- Add $scrollbarProvider to set config parameters global
- Add styling offset properties in the config for the scrollbars
- Remove normalizeWheel and replace it with it's own module as dependency
- Add documentation