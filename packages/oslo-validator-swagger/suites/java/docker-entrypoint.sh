#!/bin/sh
# Entrypoint for the OSLO Swagger Validator Docker image.
# Runs openapi-generator-maven-plugin on the given spec and
# optionally performs round-trip validation with example JSON files.
# Outputs a JSON result to stdout.

INPUT=""
ROOT_MODEL=""
EXAMPLES=""

for arg in "$@"; do
  case "$arg" in
    --input=*)
      INPUT="${arg#*=}"
      ;;
    --root-model=*)
      ROOT_MODEL="${arg#*=}"
      ;;
    --examples=*)
      EXAMPLES="${arg#*=}"
      ;;
  esac
done

if [ -z "$INPUT" ]; then
  echo '{"passed":false,"message":"ERROR: --input is required"}' >&2
  exit 1
fi

# Step 1: Generate sources from the OpenAPI spec
if ! mvn generate-sources -q -Dspec.path="$INPUT" >&2; then
  echo '{"passed":false,"message":"openapi-generator-maven-plugin failed to generate code from the spec"}'
  exit 1
fi

# Step 2: Compile generated sources + RoundTripValidator
if ! mvn compile -q -Dspec.path="$INPUT" >&2; then
  echo '{"passed":false,"message":"Compilation of generated code and RoundTripValidator failed"}'
  exit 1
fi

# Step 3: If examples are provided, run round-trip validation
if [ -n "$ROOT_MODEL" ] && [ -n "$EXAMPLES" ]; then
  # Build classpath: target/classes + target/lib/*
  CP="target/classes"
  for jar in target/lib/*.jar; do
    CP="$CP:$jar"
  done

  java -cp "$CP" \
    be.vlaanderen.validator.RoundTripValidator \
    --root-model="$ROOT_MODEL" \
    --examples="$EXAMPLES"
else
  echo '{"passed":true}'
fi
