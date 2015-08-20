
# Sortable List


+ `data = {[string]: <T>}`
+ `onReordering` get a list of keys.
+ default ordering is the default insertion ordering of data.

```
<SortableList onReordering={this.handleReordering} items={data}>
  {(key) => ... }
</SortableList>
```

ya. i think this makes sense.

+ for now, assume that data item doesn't change. (we can detect changes later).


# sorting

+ placeholder are different sizes.
+ figure out where to put the placeholder depending pageY

+ trello's placeholder is the size of the draggable item

+ figure out which row cursor is at.
  + as mousedown is dragging, we need to keep changing the row orders.

# Dev Guide

`npm install` to install dependencies.

`make` or `make bundle` to build the project. Open index.html.

`make watch` to continuously build the project.

`make server` to launch a livereload server.