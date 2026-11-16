FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace

COPY api/.mvn api/.mvn
COPY api/mvnw api/mvnw
COPY pom.xml pom.xml
COPY api/pom.xml api/pom.xml
COPY agents/pom.xml agents/pom.xml
RUN chmod +x api/mvnw && ./api/mvnw -f pom.xml -pl api -am -P${MAVEN_PROFILE:-beta} dependency:go-offline -q

COPY api/src api/src
COPY agents/src agents/src
RUN ./api/mvnw -f pom.xml -pl api -am -P${MAVEN_PROFILE:-beta} package -DskipTests -q

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/api/target/grade-ops-api-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:TieredStopAtLevel=1", "-Dspring.jmx.enabled=false", "-Dspring.backgroundpreinitializer.ignore=true", "-jar", "app.jar"]
