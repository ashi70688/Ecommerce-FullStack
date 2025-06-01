FROM openjdk:25-oraclelinux9
COPY . .
RUN ./mvnw clean package -DskipTests
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "target/krishiai.jar"]
