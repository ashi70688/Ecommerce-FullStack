FROM openjdk:25-oraclelinux9

# RUN apt install maven -y

WORKDIR /target

COPY . .

EXPOSE 8080

CMD ["java", "-jar", "target/ecommerce-api-1.0.0.jar"]