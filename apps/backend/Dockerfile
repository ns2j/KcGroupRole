FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Ensure gradlew has execution permissions
RUN chmod +x ./gradlew

# Resolve dependencies (caching layer)
RUN ./gradlew dependencies --no-daemon || true

COPY src src

# Build the application jar file (skipping tests for faster production builds)
RUN ./gradlew build -x test --no-daemon

# Spring Boot generates an executable jar and a '-plain.jar'.
# We remove the plain jar so we can uniquely copy the executable one.
RUN rm -f build/libs/*-plain.jar && mv build/libs/*.jar build/libs/app.jar

# --- Production Stage ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the generated jar from the builder stage
COPY --from=builder /workspace/build/libs/app.jar .

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
