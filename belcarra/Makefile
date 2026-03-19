
MD_FILES := $(wildcard *.md)
PDF_FILES := $(MD_FILES:.md=.pdf)


all: $(PDF_FILES)

%.pdf: %.md
	md-to-pdf $< --pdf-options '{"height": "80in", "format": "", "margin": "20mm"}'
	#md-to-pdf $< --pdf-options '{"fullPage": true, "margin": "20mm"}'


clean:
	rm -f $(PDF_FILES)
