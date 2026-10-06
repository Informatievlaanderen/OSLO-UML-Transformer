# The Dockerfile's COPY paths (package.json, packages/, pipeline/scripts/) are
# relative to the repository root, so the build context must be the repo root,
# not this pipeline/ directory.
ROOT_DIR := $(abspath $(CURDIR)/..)
VERSION := $(file < $(CURDIR)/VERSION)

# ── Build ────────────────────────────────────────────────────────────────────

build:
	./docker-build.sh --tag oslo-pipeline

build-linux:
	./docker-build.sh --platform linux/amd64 --tag oslo-pipeline

build-no-cache:
	./docker-build.sh --no-cache --tag oslo-pipeline

test: build
	chmod +x test/run.sh
	./test/run.sh all $(OUTPUT_DIR)

publish:
	./docker-build.sh \
		--platform linux/amd64,linux/arm64 \
		--tag informatievlaanderen/oslo-pipeline:$(VERSION) \
		--tag informatievlaanderen/oslo-pipeline:latest \
		--push
