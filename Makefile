docs:
	@docco simple.js
	@mv docs/{simple,index}.html
	@scp docs/* kimjoar@simplejs.org:/www/kimjoar/simplejs.org/www
	@rm -rf docs

clean:
	@rm -rf docs

test:
	@buster test

lines:
	@cloc simple.js

min:
	@uglifyjs simple.js > simple.min.js

.PHONY: test docs lines
