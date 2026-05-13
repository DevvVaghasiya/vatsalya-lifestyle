FROM eclipse-temurin:17

WORKDIR /app

# Copy Maven wrapper files and pom.xml first for dependency resolution caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Grant execution rights to the wrapper
RUN chmod +x mvnw

# Copy the actual application source code
COPY src src

# Package the Spring Boot application standalone JAR without executing tests
RUN ./mvnw clean package -DskipTests

# Expose standard web traffic port
EXPOSE 8080

# Execute the built runtime artifact
CMD ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]
