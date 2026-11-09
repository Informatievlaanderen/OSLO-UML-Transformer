#!/bin/sh
# Entrypoint for the OSLO Swagger Validator Docker image.
# Runs openapi-generator-maven-plugin on the given spec and
# outputs a JSON result to stdout.

INPUT=""

for arg in "$@"; do
  case "$arg" in
    --input=*)
      INPUT="${arg#*=}"
      ;;
  esac
done

if [ -z "$INPUT" ]; then
  echo '{"passed":false,"message":"ERROR: --input is required"}' >&2
  exit 1
fi

# Run Maven's generate-sources phase (stderr goes to host stderr)
# If generation succeeds, output a passing report
if mvn generate-sources -q -Dspec.path="$INPUT" >&2; then
  echo '{"passed":true}'
else
  echo '{"passed":false,"message":"openapi-generator-maven-plugin failed to generate code from the spec"}'
fi
