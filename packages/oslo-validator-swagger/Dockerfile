# Build the Java validation suite and cache Maven dependencies
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /java-suite
COPY packages/oslo-validator-swagger/suites/java/pom.xml .
COPY packages/oslo-validator-swagger/suites/java/src ./src
COPY packages/oslo-validator-swagger/suites/java/docker-entrypoint.sh .
RUN apk add --no-cache maven && mvn dependency:go-offline -q

# Runtime: need JDK (not JRE) because Maven compiles generated code
FROM eclipse-temurin:21-jdk-alpine

RUN apk add --no-cache maven

WORKDIR /suite
COPY --from=build /root/.m2 /root/.m2
COPY --from=build /java-suite /suite

ENTRYPOINT ["/bin/sh", "/suite/docker-entrypoint.sh"]
