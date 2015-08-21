[Sortable List Demo](https://hayeah.github.io/react-motion-SortableList)

# Sortable List

(proof-of-concept!)

This is a generalization of the react-motion sortable list demo. It supports arbitrary number of items, and each item can have different heights.

# API

```
<SortableList items={data}>
  {(key) => ... }
</SortableList>
```

Where data is a map of string to data (i.e. `{[string]: any}`). The data items can be polymorphic.

Like react-motion, we use the insertion order of the keys to determine the items ordering.

# How it works

The sortable list tracks the height of its children, and lay them out vertically one after another.

Since we know the dimensions and locations of all children, it's easy to animate them using react-motion whenever the order of the children changes.

On drag, we look at the mouse position and iterates through the list to find an insertion point. Once we know the new ordering, the same code that does the layout animates everything into place.

Ditto with shuffling items.

# TODO

+ Can add and remove items.
+ Trello-esque scrolling for long list of items.
+ React-Native port.

# Dev Guide

`npm install` to install dependencies.

`make` or `make bundle` to build the project. Open index.html.

`make watch` to continuously build the project.

`make server` to launch a livereload server.
