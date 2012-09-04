all: ergosphere.js

ergosphere.js: ergosphere_src.js
	java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --jscomp_error checkTypes \
	--jscomp_error checkVars --jscomp_error unknownDefines --js $< --js_output_file $@ --externs jquery-1.7.externs.js

clean:
	rm ergosphere.js	
