docs:
	@docco simple.js
	@git checkout gh-pages
	@mv docs/simple.html index.html
	@mv docs/docco.css .
	@rm -rf docs
	@git add index.html
	git commit -am "Updating docs" && git push origin gh-pages
	@git checkout master

test:
	@buster test

lines:
	cat simple.js | grep -v "//" | grep -v ^\$$ | wc -l

.PHONY: test docs lines
