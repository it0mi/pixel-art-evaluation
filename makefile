SCRIPT = python pairGenerator.py
FILE_FOLDER = configs/
FILES = naive.json allMethods.json colorReduction.json

ifeq ($(OS),Windows_NT)
    RM = del
	SEP = \\
else
    RM = rm -f
	SEP = /
endif

PAIRS_FOLDER = web$(SEP)pairs$(SEP)


pairs: $(FILES:%=run-%)

run-%:
	$(SCRIPT) $(FILE_FOLDER)$*

clean:
	$(RM) $(PAIRS_FOLDER)*.json