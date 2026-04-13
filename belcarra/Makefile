MD_FILES := $(wildcard *.md)
PDF_FILES := $(MD_FILES:.md=.pdf)
NPM ?= npm

.PHONY: all clean screenshots report

all: $(PDF_FILES)

%.pdf: %.md
	md-to-pdf $< --pdf-options '{"height": "80in", "format": "", "margin": "20mm"}'
	#md-to-pdf $< --pdf-options '{"fullPage": true, "margin": "20mm"}'

screenshots:
	cd .. && $(NPM) run screenshots:belcarra

report: screenshots $(PDF_FILES)

clean:
	rm -f $(PDF_FILES)
