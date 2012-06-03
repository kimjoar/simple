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
	@cat simple.js | grep -v "//" | grep -v ^\$$ | wc -l

.PHONY: test docs lines
