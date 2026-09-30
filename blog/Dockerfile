# Build stage: compile the Spring Boot jar
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Download dependencies first so they're cached until pom.xml changes
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src/ src/
# Tests run in CI; the image build only packages
RUN ./mvnw -B -q -DskipTests package && cp target/*.jar app.jar

# Runtime stage: JRE only, non-root user
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --no-create-home --uid 10001 spring
COPY --from=build /app/app.jar app.jar
USER spring

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
