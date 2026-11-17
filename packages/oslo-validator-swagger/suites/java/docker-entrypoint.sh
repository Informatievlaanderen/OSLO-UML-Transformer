#!/bin/sh
# Entrypoint for the OSLO Swagger Validator Docker image.
# Runs openapi-generator-maven-plugin on the given spec and
# optionally performs round-trip validation with example JSON files.
# Outputs a JSON result to stdout.

INPUT=""
ROOT_MODEL=""
EXAMPLES=""
GENERATOR_CONFIG="/spec/generator-config.yaml"

# Parse command-line arguments
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
        --generator-option=*)
            val="${arg#*=}"
            key="${val%%=*}"
            value="${val#*=}"
            
            # Append to YAML configOptions section if no explicit config given
            if [ ! -f "$GENERATOR_CONFIG" ]; thens
                echo "configOptions:" > "$GENERATOR_CONFIG"
                echo "  useSpringBoot3: \"true\"" >> "$GENERATOR_CONFIG"
                echo "  interfaceOnly: \"true\"" >> "$GENERATOR_CONFIG"
                echo "  useTags: \"true\"" >> "$GENERATOR_CONFIG"
                echo "  useJakartaEe: \"true\"" >> "$GENERATOR_CONFIG"
                echo "  openApiNullable: \"true\"" >> "$GENERATOR_CONFIG"
                echo "  useOneOfInterfaces: \"true\"" >> "$GENERATOR_CONFIG"
                echo "  containerDefaultToNull: \"true\"" >> "$GENERATOR_CONFIG"
            fi
            echo "  ${key}: \"${value}\"" >> "$GENERATOR_CONFIG"
        ;;
    esac
done

if [ -z "$INPUT" ]; then
    echo '{"passed":false,"message":"ERROR: --input is required"}' >&2
    exit 1
fi

# If no generator options were provided, create default config file
if [ ! -f "$GENERATOR_CONFIG" ]; then
  cat > "$GENERATOR_CONFIG" <<EOF
configOptions:
  useSpringBoot3: "true"
  interfaceOnly: "true"
  useTags: "true"
  useJakartaEe: "true"
  openApiNullable: "true"
  useOneOfInterfaces: "true"
  containerDefaultToNull: "true"
EOF
fi

# Step 1: Generate sources from the OpenAPI spec
if ! mvn generate-sources -q -Dspec.path="$INPUT" -Dgenerator.configFile="$GENERATOR_CONFIG" >&2; then
    echo '{"passed":false,"message":"openapi-generator-maven-plugin failed to generate code from the spec"}'
    exit 1
fi

# Step 2: Compile generated sources + RoundTripValidator
if ! mvn compile -q -Dspec.path="$INPUT" -Dgenerator.configFile="$GENERATOR_CONFIG" >&2; then
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
