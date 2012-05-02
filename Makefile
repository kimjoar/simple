docs:
	docco simple.js
	git checkout gh-pages
	mv docs/simple.html index.html
	mv docs/docco.css .
	rm -rf docs
	git add .
	git commit -am "Updating docs" && git push origin gh-pages
	git checkout master

test:
	@buster test

.PHONY: test docs
