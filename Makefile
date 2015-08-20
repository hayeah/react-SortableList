
.PHONY: js bundle clean server
.DEFAULT_GOAL := bundle

BUILD=babel --optional runtime --stage 2 src --out-dir build
BUILD_CSS=postcss --use autoprefixer css/* -d build

BUNDLE_ARGS=./build/app.js -t babelify -o build/bundle.js --verbose --debug

css: build/app.css

js: build/app.js

bundle: build/bundle.js

watch: build
	($(BUILD) --watch & watchify $(BUNDLE_ARGS) & $(BUILD_CSS) --watch & wait)

clean:
	rm -r build

server:
	browser-sync start --server --files="build/bundle.js, build/app.css"

# ts:
# 	tsc --watch --experimentalAsyncFunctions --target ES6 --jsx react app.tsx --outDir build


build:
	mkdir -p build

build/app.js: build
	$(BUILD)

build/bundle.js: build/app.js
	browserify $(BUNDLE_ARGS)

build/app.css: build
	$(BUILD_CSS)