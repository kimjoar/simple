docs:
	@node_modules/.bin/docco simple.js
	@mv docs/{simple,index}.html
	@scp -r docs/* kimjoar@simplejs.org:/www/kimjoar/simplejs.org/www
	@rm -rf docs

clean:
	@rm -rf docs

test:
	@node_modules/.bin/buster test

lines:
	@cloc simple.js

min:
	@node_modules/.bin/uglifyjs simple.js > simple.min.js

.PHONY: test docs lines
